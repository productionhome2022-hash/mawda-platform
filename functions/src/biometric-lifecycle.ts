import { createHash, randomUUID } from "node:crypto";
import { FieldValue, Timestamp, getFirestore, type DocumentSnapshot, type Transaction } from "firebase-admin/firestore";
import { mediaBucket } from "./media";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";
import { hasPlatformOwnerSession } from "./owner-access";
import { isMemberAccountInGoodStanding } from "./member-access";
import { calculateOwnerAuditHash } from "./owner-audit-chain";
import { createInitialBiometricReview, decideBiometricReview, startBiometricRetry } from "./biometric-review-state";
import { assertBiometricAudioFileAllowed, assertBiometricVideoFileAllowed } from "./biometric-media";
import { detectMediaSignature } from "./media-security";
import { addCalendarMonthsUtc, isBiometricVerificationDue } from "./verification-calendar";
import {
  BIOMETRIC_SPOKEN_PHRASE, BIOMETRIC_SPOKEN_PHRASE_VERSION,
  BIOMETRIC_AUDIO_MAX_BYTES, BIOMETRIC_VIDEO_MAX_BYTES,
  BIOMETRIC_EVIDENCE_UPLOAD_TTL_MS, BIOMETRIC_EVIDENCE_REVIEW_TTL_MS,
  BIOMETRIC_REWARD_COINS, validateBiometricMemberIdentity,
  biometricRewardLedgerId,
} from "./biometric-evidence";

const BIOMETRIC_CONSENT_VERSION = "2026-11-20-owner-review-v1";
const db = () => getFirestore();
const requests = () => db().collection("biometricVerificationRequests");
const auditHead = () => db().collection("adminAuditChainHeads").doc("ownerReview");

type AuthRequest = {
  auth?: { uid: string; token: Record<string, unknown> } | null;
  data?: Record<string, unknown>;
};

function requireUid(uid?: string): string {
  if (!uid) throw new HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً.");
  return uid;
}

async function appendAuditInTransaction(
  transaction: Transaction,
  event: Record<string, unknown>,
  headSnapshot: DocumentSnapshot,
): Promise<string> {
  const auditRef = db().collection("adminAuditLogs").doc();
  const headRef = auditHead();
  const head = headSnapshot.data() ?? {};
  const sequence = headSnapshot.exists ? head.sequence : 0;
  const previousHash = headSnapshot.exists ? head.eventHash : "GENESIS";
  if (!Number.isSafeInteger(sequence) || sequence < 0 ||
      !(previousHash === "GENESIS" || (typeof previousHash === "string" && /^[a-f0-9]{64}$/.test(previousHash)))) {
    throw new HttpsError("failed-precondition", "سلسلة تدقيق المالك غير صالحة؛ أوقفنا القرار.");
  }
  const nextSequence = sequence + 1;
  const eventHash = calculateOwnerAuditHash(event, nextSequence, previousHash);
  transaction.create(auditRef, {
    ...event, auditEvent: event, auditChainId: "owner-review-v1",
    auditSequence: nextSequence, previousAuditHash: previousHash, auditHash: eventHash,
    createdAt: FieldValue.serverTimestamp(),
  });
  transaction.set(headRef, { sequence: nextSequence, eventHash, updatedAt: FieldValue.serverTimestamp() });
  return auditRef.id;
}

async function appendAudit(event: Record<string, unknown>): Promise<void> {
  await db().runTransaction(async transaction => {
    const headSnapshot = await transaction.get(auditHead());
    await appendAuditInTransaction(transaction, event, headSnapshot);
  });
}

async function requireOwnerForReview(request: AuthRequest, action: string): Promise<string> {
  const uid = request.auth?.uid;
  try {
    const actorUid = requireUid(uid);
    const token = request.auth?.token ?? {};
    if (token.platformOwner !== true || !hasPlatformOwnerSession(token, undefined, actorUid)) {
      throw new HttpsError("permission-denied", "هذه العملية مخصصة للمالك الوحيد مع جلسة MFA حديثة.");
    }
    return actorUid;
  } catch (error) {
    if (uid) {
      try {
        await appendAudit({
          actorUid: uid, action, outcome: "denied",
          failureCode: error instanceof HttpsError ? error.code : "permission-denied",
          ownerAuthTime: request.auth?.token.auth_time ?? null,
        });
      } catch (auditError) {
        logger.error("Biometric owner denial audit failed", { uid, action, auditError });
        throw new HttpsError("internal", "تعذر تسجيل محاولة الوصول؛ تم رفض العملية.");
      }
    }
    throw error;
  }
}

function stateFromRequest(data: Record<string, any>) {
  return {
    requestId: data.requestId, uid: data.uid,
    status: data.reviewState?.status ?? data.status,
    attemptNumber: data.attemptNumber,
    submittedAtMs: data.reviewState?.submittedAtMs ?? data.submittedAtMs,
    decidedAtMs: data.reviewState?.decidedAtMs ?? null,
    decidedByUid: data.reviewState?.decidedByUid ?? null,
    nextEligibleAtMs: data.reviewState?.nextEligibleAtMs ?? null,
    finalRejection: data.reviewState?.finalRejection ?? false,
  };
}

async function signedUrl(path: string, action: "write" | "read", contentType: string, ttlMs: number): Promise<string> {
  const emulatorHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST?.replace(/^https?:\/\//, "");
  if (emulatorHost) {
    // Emulator integration tests write/read through the Admin SDK directly;
    // the Storage emulator cannot mint GCS V4 signatures without a real key.
    // Never return this test-only URL in deployed Functions.
    const bucketName = mediaBucket().name;
    return "http://" + emulatorHost + "/v0/b/" + encodeURIComponent(bucketName) +
      "/o/" + encodeURIComponent(path) + "?mawddaEmulatorOnly=1&action=" + action;
  }
  const [url] = await mediaBucket().file(path).getSignedUrl({
    version: "v4", action, expires: Date.now() + ttlMs,
    ...(action === "write" ? { contentType } : {}),
  });
  return url;
}

async function deleteEvidence(requestId: string): Promise<void> {
  const ref = requests().doc(requestId);
  const snapshot = await ref.get();
  if (!snapshot.exists) return;
  const data = snapshot.data() ?? {};
  if (!["accepted", "rejected", "closed", "upload_rejected"].includes(String(data.status))) return;
  const mediaIds = [data.audioMediaId, data.videoMediaId].filter((id): id is string =>
    typeof id === "string" && /^[0-9a-f-]{36}$/i.test(id));
  try {
    for (const mediaId of mediaIds) {
      const assetRef = db().collection("mediaAssets").doc(mediaId);
      const assetSnapshot = await assetRef.get();
      if (!assetSnapshot.exists) throw new Error("BIOMETRIC_MEDIA_ASSET_MISSING");
      const asset = assetSnapshot.data() ?? {};
      if (asset.ownerUid !== data.uid || asset.mediaPurpose !== "biometric" ||
          asset.biometricRequestId !== requestId) throw new Error("BIOMETRIC_MEDIA_ASSET_BINDING_MISMATCH");
      if (asset.legalHoldStatus === "active") throw new Error("BIOMETRIC_MEDIA_LEGAL_HOLD_ACTIVE");
      const expectedOriginal = "quarantine/" + data.uid + "/" + mediaId;
      if (asset.objectPath && asset.objectPath !== expectedOriginal) throw new Error("BIOMETRIC_MEDIA_OBJECT_PATH_MISMATCH");
      const expectedAudio = "processed/" + data.uid + "/" + mediaId + "/audio.mp3";
      const expectedVideo = "processed/" + data.uid + "/" + mediaId + "/video.mp4";
      if (asset.safeAudioPath && asset.safeAudioPath !== expectedAudio) throw new Error("BIOMETRIC_AUDIO_DERIVATIVE_PATH_MISMATCH");
      if (asset.safeVideoPath && asset.safeVideoPath !== expectedVideo) throw new Error("BIOMETRIC_VIDEO_DERIVATIVE_PATH_MISMATCH");
      const paths = [asset.objectPath, asset.safeAudioPath, asset.safeVideoPath].filter((path): path is string =>
        typeof path === "string" && (path === expectedOriginal || path === expectedAudio || path === expectedVideo));
      for (const objectPath of paths) {
        await mediaBucket().file(objectPath).delete({ ignoreNotFound: true });
      }
      await assetRef.update({
        status: "manually_deleted", deletedAt: FieldValue.serverTimestamp(),
        objectPath: FieldValue.delete(), safeAudioPath: FieldValue.delete(), safeVideoPath: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
    await ref.update({
      evidenceDeletionStatus: "deleted", evidenceDeletedAt: FieldValue.serverTimestamp(),
      evidenceDeletionLastError: FieldValue.delete(), updatedAt: FieldValue.serverTimestamp(),
    });
    await db().collection("verificationAuditLogs").doc("biometric_evidence_deleted_" + requestId).set({
      uid: data.uid, requestId, action: "biometric_evidence_deleted",
      mediaIds, createdAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    await ref.update({
      evidenceDeletionStatus: "pending",
      evidenceDeletionRetryAt: Timestamp.fromMillis(Date.now() + 15 * 60 * 1000),
      evidenceDeletionLastError: error instanceof Error ? error.name : "unknown",
      updatedAt: FieldValue.serverTimestamp(),
    }).catch(() => undefined);
    throw error;
  }
}

export const getMyBiometricVerificationStatus = onCall(async request => {
  const uid = requireUid(request.auth?.uid);
  const userSnapshot = await db().collection("users").doc(uid).get();
  if (!userSnapshot.exists) throw new HttpsError("not-found", "حساب العضو غير موجود.");
  const user = userSnapshot.data() ?? {};
  const requestId = typeof user.biometricVerificationLastRequestId === "string"
    ? user.biometricVerificationLastRequestId : null;
  let latest: Record<string, any> = {};
  if (requestId) {
    const requestSnapshot = await requests().doc(requestId).get();
    if (requestSnapshot.exists && requestSnapshot.data()?.uid === uid) latest = requestSnapshot.data() ?? {};
  }
  const [audioAsset, videoAsset] = await Promise.all([
    typeof latest.audioMediaId === "string" ? db().collection("mediaAssets").doc(latest.audioMediaId).get() : Promise.resolve(null),
    typeof latest.videoMediaId === "string" ? db().collection("mediaAssets").doc(latest.videoMediaId).get() : Promise.resolve(null),
  ]);
  const reusableMediaId = (snapshot: DocumentSnapshot | null): string | null => {
    if (!snapshot?.exists) return null;
    const status = String(snapshot.data()?.status ?? "");
    return ["rejected", "expired", "manually_deleted", "self_destructed"].includes(status) ? null : snapshot.id;
  };
  const verification = user.biometricVerification && typeof user.biometricVerification === "object"
    ? user.biometricVerification as Record<string, any> : {};
  const millis = (value: unknown): number | null => value instanceof Timestamp
    ? value.toMillis() : null;
  return {
    status: verification.status === "verified" && verification.revokedAt == null
      ? (verification.expiresAt instanceof Timestamp && verification.expiresAt.toMillis() > Date.now() ? "verified" : "expired")
      : String(latest.status ?? "not_submitted"),
    attemptNumber: Number.isSafeInteger(latest.attemptNumber) ? latest.attemptNumber : 0,
    nextEligibleAtMs: millis(latest.nextEligibleAt),
    expiresAtMs: millis(verification.expiresAt),
    permanentlyClosed: user.biometricVerificationPermanentlyClosed === true,
    requestId,
    phrase: BIOMETRIC_SPOKEN_PHRASE,
    audioMediaId: reusableMediaId(audioAsset),
    videoMediaId: reusableMediaId(videoAsset),
    rewardCoins: latest.decision === "accepted" ? BIOMETRIC_REWARD_COINS : 0,
  };
});

export const getBiometricVerificationPhrase = onCall(async (request) => {
  requireUid(request.auth?.uid);
  return {
    phrase: BIOMETRIC_SPOKEN_PHRASE, phraseVersion: BIOMETRIC_SPOKEN_PHRASE_VERSION,
    audioMaxBytes: BIOMETRIC_AUDIO_MAX_BYTES, audioMaxDurationSeconds: 60,
    videoMaxBytes: BIOMETRIC_VIDEO_MAX_BYTES, videoMinDurationSeconds: 3, videoMaxDurationSeconds: 5,
  };
});

export const startBiometricVerificationRequest = onCall(async (request) => {
  const uid = requireUid(request.auth?.uid);
  if (request.data?.consentAccepted !== true || request.data?.consentVersion !== BIOMETRIC_CONSENT_VERSION) {
    throw new HttpsError("failed-precondition", "يجب الاطلاع على إشعار الخصوصية والموافقة عليه قبل إنشاء طلب التوثيق.");
  }
  const requestId = randomUUID();
  const nowMs = Date.now();
  const userRef = db().collection("users").doc(uid);
  const requestRef = requests().doc(requestId);
  const attemptNumber = await db().runTransaction(async transaction => {
    const userSnapshot = await transaction.get(userRef);
    if (!userSnapshot.exists) throw new HttpsError("not-found", "حساب العضو غير موجود.");
    const user = userSnapshot.data() ?? {};
    if (!isMemberAccountInGoodStanding(user)) throw new HttpsError("permission-denied", "الحساب غير مؤهل لطلب التوثيق حالياً.");
    let identity;
    try { identity = validateBiometricMemberIdentity(user, uid); }
    catch { throw new HttpsError("failed-precondition", "بيانات الاسم أو اسم المستخدم أو الجنس المسجلة غير مكتملة؛ لا يمكن تغييرها من نموذج التوثيق."); }
    if (user.biometricVerificationPermanentlyClosed === true) {
      throw new HttpsError("failed-precondition", "أُغلق ملف التوثيق نهائياً بعد الرفض الثالث ولا توجد محاولة رابعة.");
    }
    let attempt = 1;
    const previousId = user.biometricVerificationLastRequestId;
    if (typeof previousId === "string") {
      const previousRef = requests().doc(previousId);
      const previousSnapshot = await transaction.get(previousRef);
      if (!previousSnapshot.exists) throw new HttpsError("failed-precondition", "سجل محاولة التوثيق السابقة غير موجود.");
      const previous = previousSnapshot.data() ?? {};
      if (previous.status === "uploading") {
        const previousCreatedAtMs = previous.createdAt instanceof Timestamp ? previous.createdAt.toMillis() : 0;
        if (!previous.audioMediaId && !previous.videoMediaId &&
            previousCreatedAtMs > 0 && nowMs - previousCreatedAtMs >= BIOMETRIC_EVIDENCE_UPLOAD_TTL_MS) {
          transaction.update(previousRef, {
            status: "upload_rejected", uploadFailureCode: "NO_BIOMETRIC_MEDIA_UPLOAD_INTENT",
            evidenceDeletionStatus: "deleted", updatedAt: FieldValue.serverTimestamp(),
          });
          transaction.create(db().collection("verificationAuditLogs").doc("biometric_upload_intent_expired_" + previousId), {
            uid, requestId: previousId, action: "biometric_upload_intent_expired",
            reason: "NO_BIOMETRIC_MEDIA_UPLOAD_INTENT", createdAt: Timestamp.fromMillis(nowMs),
          });
          previous.status = "upload_rejected";
          previous.evidenceDeletionStatus = "deleted";
        } else {
          throw new HttpsError("failed-precondition", "يوجد طلب توثيق مفتوح بالفعل.");
        }
      }
      if (["accepted", "rejected", "upload_rejected"].includes(String(previous.status)) &&
          previous.evidenceDeletionStatus !== "deleted") {
        throw new HttpsError("failed-precondition", "لا يمكن بدء دورة جديدة قبل اكتمال حذف أدلة الطلب السابق.");
      }
      if (previous.status === "pending") {
        throw new HttpsError("failed-precondition", "يوجد طلب توثيق مفتوح بالفعل.");
      }
      if (previous.status === "closed" || previous.reviewState?.status === "closed") {
        throw new HttpsError("failed-precondition", "أُغلق ملف التوثيق نهائياً بعد الرفض الثالث.");
      }
      if (previous.status === "upload_rejected") {
        attempt = Number.isSafeInteger(previous.attemptNumber) ? previous.attemptNumber : 1;
      } else if (previous.status === "rejected") {
        try {
          attempt = startBiometricRetry({
            state: stateFromRequest(previous), nextRequestId: requestId, submittedAtMs: nowMs,
          }).attemptNumber;
        } catch {
          throw new HttpsError("failed-precondition", "لم يحِن موعد المحاولة التالية أو اكتمل عدد المحاولات.");
        }
      } else if (previous.status === "accepted") {
        const acceptedAt = previous.acceptedAt instanceof Timestamp ? previous.acceptedAt.toMillis() : Number(previous.acceptedAtMs);
        if (!Number.isSafeInteger(acceptedAt) || !isBiometricVerificationDue(acceptedAt, nowMs)) {
          throw new HttpsError("failed-precondition", "التجديد متاح بعد شهر تقويمي من القبول.");
        }
      } else {
        throw new HttpsError("failed-precondition", "حالة طلب التوثيق السابق غير صالحة.");
      }
    } else if (user.biometricVerification?.status === "verified") {
      const acceptedAt = user.biometricVerification.acceptedAt instanceof Timestamp
        ? user.biometricVerification.acceptedAt.toMillis() : null;
      if (acceptedAt === null || !isBiometricVerificationDue(acceptedAt, nowMs)) {
        throw new HttpsError("failed-precondition", "التجديد متاح بعد شهر تقويمي من القبول.");
      }
    }
    const state = { ...createInitialBiometricReview({ requestId, uid, submittedAtMs: nowMs }), attemptNumber: attempt };
    transaction.create(requestRef, {
      requestId, uid, ...identity, status: "uploading", attemptNumber: attempt,
      reviewState: state, phraseVersion: BIOMETRIC_SPOKEN_PHRASE_VERSION,
      phraseHash: createHash("sha256").update(BIOMETRIC_SPOKEN_PHRASE).digest("hex"),
      consentAccepted: true, consentVersion: BIOMETRIC_CONSENT_VERSION,
      consentAcceptedAt: Timestamp.fromMillis(nowMs),
      audioMediaId: null, videoMediaId: null,
      createdAt: Timestamp.fromMillis(nowMs), submittedAtMs: nowMs,
      evidenceDeletionStatus: "not_due", updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.update(userRef, {
      biometricVerificationLastRequestId: requestId,
      biometricVerificationAttemptNumber: attempt,
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.create(db().collection("verificationAuditLogs").doc("biometric_request_created_" + requestId), {
      uid, requestId, action: "biometric_request_created",
      attemptNumber: attempt, phraseVersion: BIOMETRIC_SPOKEN_PHRASE_VERSION,
      createdAt: Timestamp.fromMillis(nowMs),
    });
    return attempt;
  });
  return {
    requestId, attemptNumber, phrase: BIOMETRIC_SPOKEN_PHRASE,
    phraseVersion: BIOMETRIC_SPOKEN_PHRASE_VERSION,
    uploadPurpose: "biometric",
    audio: { contentType: "audio/mp4", maxBytes: BIOMETRIC_AUDIO_MAX_BYTES, maxDurationSeconds: 60 },
    video: { contentType: "video/mp4", maxBytes: BIOMETRIC_VIDEO_MAX_BYTES, minDurationSeconds: 3, maxDurationSeconds: 5 },
    uploadInstructions: "Create each upload through createMediaUploadIntent with purpose=biometric and biometricRequestId=requestId, then finalize it and wait for scanner approval before submitting.",
  };
});

export const submitBiometricVerificationRequest = onCall(async (request) => {
  const uid = requireUid(request.auth?.uid);
  const requestId = typeof request.data?.requestId === "string" ? request.data.requestId : "";
  if (!/^[A-Za-z0-9_-]{16,128}$/.test(requestId)) throw new HttpsError("invalid-argument", "معرف طلب التوثيق غير صالح.");
  const ref = requests().doc(requestId);
  const snapshot = await ref.get();
  if (!snapshot.exists || snapshot.data()?.uid !== uid) throw new HttpsError("not-found", "طلب التوثيق غير موجود.");
  const data = snapshot.data() ?? {};
  if (data.status !== "uploading" || data.phraseVersion !== BIOMETRIC_SPOKEN_PHRASE_VERSION ||
      data.phraseHash !== createHash("sha256").update(BIOMETRIC_SPOKEN_PHRASE).digest("hex")) {
    throw new HttpsError("failed-precondition", "طلب التوثيق غير قابل للإرسال أو أن إصدار العبارة غير صالح.");
  }
  const audioMediaId = typeof data.audioMediaId === "string" ? data.audioMediaId : "";
  const videoMediaId = typeof data.videoMediaId === "string" ? data.videoMediaId : "";
  if (!/^[0-9a-f-]{36}$/i.test(audioMediaId) || !/^[0-9a-f-]{36}$/i.test(videoMediaId) ||
      audioMediaId === videoMediaId) {
    throw new HttpsError("failed-precondition", "ارفع ملف الصوت والفيديو عبر مسار الوسائط المعتمد أولاً.");
  }
  const [audioAssetSnapshot, videoAssetSnapshot] = await Promise.all([
    db().collection("mediaAssets").doc(audioMediaId).get(),
    db().collection("mediaAssets").doc(videoMediaId).get(),
  ]);
  if (!audioAssetSnapshot.exists || !videoAssetSnapshot.exists) {
    throw new HttpsError("failed-precondition", "لم تكتمل سجلات ملفات التوثيق.");
  }
  const audioAsset = audioAssetSnapshot.data() ?? {};
  const videoAsset = videoAssetSnapshot.data() ?? {};
  const expectedAudioOriginal = "quarantine/" + uid + "/" + audioMediaId;
  const expectedVideoOriginal = "quarantine/" + uid + "/" + videoMediaId;
  const expectedAudioSafe = "processed/" + uid + "/" + audioMediaId + "/audio.mp3";
  const expectedVideoSafe = "processed/" + uid + "/" + videoMediaId + "/video.mp4";
  const commonValid = (asset: Record<string, any>, mediaId: string) =>
    asset.ownerUid === uid && asset.mediaPurpose === "biometric" &&
    asset.biometricRequestId === requestId && asset.status === "security_approved" &&
    asset.scannerVerdict === "clean" && asset.scannerEngine === "ClamAV" &&
    typeof asset.storageGeneration === "string" && /^\d+$/.test(asset.storageGeneration) &&
    typeof asset.scannerSha256 === "string" && /^[a-f0-9]{64}$/.test(asset.scannerSha256) &&
    typeof asset.scannerVerifiedAt !== "undefined" &&
    asset.objectPath === "quarantine/" + uid + "/" + mediaId;
  if (!commonValid(audioAsset, audioMediaId) || !commonValid(videoAsset, videoMediaId) ||
      audioAsset.mediaCategory !== "audio" || audioAsset.declaredContentType !== "audio/mp4" ||
      audioAsset.detectedContentType !== "audio/mp4" || audioAsset.safeAudioPath !== expectedAudioSafe ||
      audioAsset.safeAudioContentType !== "audio/mpeg" ||
      typeof audioAsset.safeAudioGeneration !== "string" || !/^\d+$/.test(audioAsset.safeAudioGeneration) ||
      typeof audioAsset.safeAudioSha256 !== "string" || !/^[a-f0-9]{64}$/.test(audioAsset.safeAudioSha256) ||
      audioAsset.processingStatus !== "safe_audio_derivative_ready" ||
      videoAsset.mediaCategory !== "video" || videoAsset.declaredContentType !== "video/mp4" ||
      videoAsset.detectedContentType !== "video/mp4" || videoAsset.safeVideoPath !== expectedVideoSafe ||
      videoAsset.safeVideoContentType !== "video/mp4" ||
      typeof videoAsset.safeVideoGeneration !== "string" || !/^\d+$/.test(videoAsset.safeVideoGeneration) ||
      typeof videoAsset.safeVideoSha256 !== "string" || !/^[a-f0-9]{64}$/.test(videoAsset.safeVideoSha256) ||
      videoAsset.processingStatus !== "safe_video_derivative_ready") {
    throw new HttpsError("failed-precondition", "يجب أن يجتاز الصوت والفيديو فحص ClamAV وإنشاء النسخ الآمنة قبل الإرسال.");
  }

  const [safeAudioMetadata, safeVideoMetadata] = await Promise.all([
    mediaBucket().file(expectedAudioSafe).getMetadata(),
    mediaBucket().file(expectedVideoSafe).getMetadata(),
  ]);
  if (String(safeAudioMetadata[0].generation) !== audioAsset.safeAudioGeneration ||
      safeAudioMetadata[0].contentType !== "audio/mpeg" ||
      String(safeVideoMetadata[0].generation) !== videoAsset.safeVideoGeneration ||
      safeVideoMetadata[0].contentType !== "video/mp4") {
    throw new HttpsError("failed-precondition", "النسخ الآمنة الناتجة عن الفحص غير متاحة أو تغيرت.");
  }
  const audioFile = mediaBucket().file(expectedAudioOriginal);
  const videoFile = mediaBucket().file(expectedVideoOriginal);
  let audio: Buffer, video: Buffer;
  try {
    const [am, vm] = await Promise.all([audioFile.getMetadata(), videoFile.getMetadata()]);
    const audioSize = Number(am[0].size), videoSize = Number(vm[0].size);
    if (!Number.isSafeInteger(audioSize) || audioSize < 1 || audioSize > BIOMETRIC_AUDIO_MAX_BYTES ||
        am[0].contentType !== "audio/mp4" || String(am[0].generation) !== audioAsset.storageGeneration ||
        !Number.isSafeInteger(videoSize) || videoSize < 1 || videoSize > BIOMETRIC_VIDEO_MAX_BYTES ||
        vm[0].contentType !== "video/mp4" || String(vm[0].generation) !== videoAsset.storageGeneration) {
      throw new Error("BIOMETRIC_EVIDENCE_SIZE_TYPE_OR_GENERATION_INVALID");
    }
    [audio, video] = await Promise.all([audioFile.download().then(x => x[0]), videoFile.download().then(x => x[0])]);
    if (audio.length !== audioSize || video.length !== videoSize ||
        detectMediaSignature(audio.subarray(0, 32)) !== "audio/mp4" ||
        detectMediaSignature(video.subarray(0, 32)) !== "video/mp4") {
      throw new Error("BIOMETRIC_EVIDENCE_SIGNATURE_INVALID");
    }
    assertBiometricAudioFileAllowed(audio);
    assertBiometricVideoFileAllowed(video);
    if (createHash("sha256").update(audio).digest("hex") !== audioAsset.scannerSha256 ||
        createHash("sha256").update(video).digest("hex") !== videoAsset.scannerSha256) {
      throw new Error("BIOMETRIC_SCANNER_SOURCE_HASH_MISMATCH");
    }
  } catch (error) {
    const failureCode = error instanceof Error ? error.message : "INVALID_EVIDENCE";
    await ref.update({
      status: "upload_rejected", uploadFailureCode: failureCode,
      evidenceDeletionStatus: "pending",
      evidenceDeletionRetryAt: Timestamp.fromMillis(Date.now()),
      updatedAt: FieldValue.serverTimestamp(),
    });
    await db().collection("verificationAuditLogs").doc("biometric_upload_rejected_" + requestId).set({
      uid, requestId, action: "biometric_upload_rejected",
      failureCode, createdAt: FieldValue.serverTimestamp(),
    });
    await deleteEvidence(requestId).catch(cleanupError =>
      logger.warn("Rejected biometric media cleanup queued", { requestId, cleanupError }));
    throw new HttpsError("invalid-argument", "ملفات التوثيق غير مطابقة للنوع أو الحجم أو المدة المعتمدة.");
  }
  const audioHash = createHash("sha256").update(audio).digest("hex");
  const videoHash = createHash("sha256").update(video).digest("hex");
  const now = Timestamp.now();
  await db().runTransaction(async transaction => {
    const fresh = await transaction.get(ref);
    if (!fresh.exists || fresh.data()?.uid !== uid || fresh.data()?.status !== "uploading" ||
        fresh.data()?.audioMediaId !== audioMediaId || fresh.data()?.videoMediaId !== videoMediaId) {
      throw new HttpsError("aborted", "تغير طلب التوثيق أثناء التحقق؛ أعد المحاولة.");
    }
    transaction.update(ref, {
      status: "pending", submittedAt: now, submittedAtMs: now.toMillis(),
      audioBytes: audio.length, videoBytes: video.length,
      audioSha256: audioHash, videoSha256: videoHash,
      evidenceValidatedByServer: true, evidenceValidatedAt: now,
      evidenceScanner: "ClamAV", audioMediaId, videoMediaId,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
  await db().collection("verificationAuditLogs").doc("biometric_submission_" + requestId).create({
    uid, requestId, action: "biometric_evidence_submitted", phraseVersion: BIOMETRIC_SPOKEN_PHRASE_VERSION,
    audioSha256: audioHash, videoSha256: videoHash, audioBytes: audio.length, videoBytes: video.length,
    audioMediaId, videoMediaId, scanner: "ClamAV", createdAt: now,
  });
  return { submitted: true, requestId, status: "pending", attemptNumber: data.attemptNumber };
});

export const listOwnerBiometricVerificationRequests = onCall(async request => {
  const ownerUid = await requireOwnerForReview(request, "biometric_request_inbox_read");
  const snapshot = await requests().where("status", "==", "pending").limit(50).get();
  await appendAudit({
    actorUid: ownerUid, action: "biometric_request_inbox_read",
    outcome: "success", resultCount: snapshot.size,
  });
  return {
    requests: snapshot.docs.map(doc => {
      const value = doc.data();
      return {
        requestId: doc.id, uid: value.uid, fullName: value.fullName,
        username: value.username, gender: value.gender,
        attemptNumber: value.attemptNumber, submittedAtMs: value.submittedAtMs,
        phrase: BIOMETRIC_SPOKEN_PHRASE, phraseVersion: value.phraseVersion,
      };
    }).sort((a, b) => Number(a.submittedAtMs) - Number(b.submittedAtMs)),
  };
});

export const getOwnerBiometricEvidencePlayback = onCall(async request => {
  const ownerUid = await requireOwnerForReview(request, "biometric_evidence_playback");
  const requestId = typeof request.data?.requestId === "string" ? request.data.requestId : "";
  if (!/^[A-Za-z0-9_-]{16,128}$/.test(requestId)) throw new HttpsError("invalid-argument", "معرف طلب التوثيق غير صالح.");
  const snapshot = await requests().doc(requestId).get();
  const value = snapshot.data() ?? {};
  const audioMediaId = typeof value.audioMediaId === "string" ? value.audioMediaId : "";
  const videoMediaId = typeof value.videoMediaId === "string" ? value.videoMediaId : "";
  if (!snapshot.exists || value.status !== "pending" ||
      !/^[0-9a-f-]{36}$/i.test(audioMediaId) || !/^[0-9a-f-]{36}$/i.test(videoMediaId)) {
    throw new HttpsError("not-found", "أدلة الطلب غير متاحة للمراجعة.");
  }
  const [audioAssetSnapshot, videoAssetSnapshot] = await Promise.all([
    db().collection("mediaAssets").doc(audioMediaId).get(),
    db().collection("mediaAssets").doc(videoMediaId).get(),
  ]);
  const audioAsset = audioAssetSnapshot.data() ?? {};
  const videoAsset = videoAssetSnapshot.data() ?? {};
  const expectedAudio = "processed/" + value.uid + "/" + audioMediaId + "/audio.mp3";
  const expectedVideo = "processed/" + value.uid + "/" + videoMediaId + "/video.mp4";
  if (!audioAssetSnapshot.exists || !videoAssetSnapshot.exists ||
      audioAsset.ownerUid !== value.uid || videoAsset.ownerUid !== value.uid ||
      audioAsset.biometricRequestId !== requestId || videoAsset.biometricRequestId !== requestId ||
      audioAsset.mediaPurpose !== "biometric" || videoAsset.mediaPurpose !== "biometric" ||
      audioAsset.status !== "security_approved" || videoAsset.status !== "security_approved" ||
      audioAsset.scannerEngine !== "ClamAV" || videoAsset.scannerEngine !== "ClamAV" ||
      audioAsset.scannerVerdict !== "clean" || videoAsset.scannerVerdict !== "clean" ||
      typeof audioAsset.scannerVerifiedAt === "undefined" || typeof videoAsset.scannerVerifiedAt === "undefined" ||
      audioAsset.safeAudioPath !== expectedAudio || videoAsset.safeVideoPath !== expectedVideo ||
      audioAsset.safeAudioContentType !== "audio/mpeg" || videoAsset.safeVideoContentType !== "video/mp4" ||
      typeof audioAsset.safeAudioGeneration !== "string" || !/^\d+$/.test(audioAsset.safeAudioGeneration) ||
      typeof videoAsset.safeVideoGeneration !== "string" || !/^\d+$/.test(videoAsset.safeVideoGeneration) ||
      typeof audioAsset.safeAudioSha256 !== "string" || !/^[a-f0-9]{64}$/.test(audioAsset.safeAudioSha256) ||
      typeof videoAsset.safeVideoSha256 !== "string" || !/^[a-f0-9]{64}$/.test(videoAsset.safeVideoSha256)) {
    throw new HttpsError("failed-precondition", "النسخ الآمنة لم تعد متاحة أو تغير ارتباطها بالطلب.");
  }
  const [audioMetadata, videoMetadata] = await Promise.all([
    mediaBucket().file(expectedAudio).getMetadata(),
    mediaBucket().file(expectedVideo).getMetadata(),
  ]);
  const audioMeta = audioMetadata[0], videoMeta = videoMetadata[0];
  if (String(audioMeta.generation) !== audioAsset.safeAudioGeneration ||
      audioMeta.contentType !== "audio/mpeg" ||
      !Number.isSafeInteger(Number(audioMeta.size)) || Number(audioMeta.size) <= 0 ||
      Number(audioMeta.size) > BIOMETRIC_AUDIO_MAX_BYTES ||
      String(videoMeta.generation) !== videoAsset.safeVideoGeneration ||
      videoMeta.contentType !== "video/mp4" ||
      !Number.isSafeInteger(Number(videoMeta.size)) || Number(videoMeta.size) <= 0 ||
      Number(videoMeta.size) > 15 * 1024 * 1024) {
    throw new HttpsError("failed-precondition", "تغيرت النسخ الآمنة أو لم تعد مطابقة لبيانات الفحص.");
  }
  const [audioUrl, videoUrl] = await Promise.all([
    signedUrl(expectedAudio, "read", "audio/mpeg", BIOMETRIC_EVIDENCE_REVIEW_TTL_MS),
    signedUrl(expectedVideo, "read", "video/mp4", BIOMETRIC_EVIDENCE_REVIEW_TTL_MS),
  ]);
  const playbackExpiresAtMs = Date.now() + BIOMETRIC_EVIDENCE_REVIEW_TTL_MS;
  await db().collection("biometricOwnerPlaybackGrants").doc(requestId + "_" + ownerUid).set({
    requestId, reviewerUid: ownerUid,
    audioSha256: value.audioSha256, videoSha256: value.videoSha256,
    issuedAt: Timestamp.fromMillis(Date.now()),
    expiresAt: Timestamp.fromMillis(playbackExpiresAtMs),
  });
  await appendAudit({
    actorUid: ownerUid, action: "biometric_evidence_playback_issued",
    requestId, subjectUid: value.uid, outcome: "success",
    audioSha256: value.audioSha256, videoSha256: value.videoSha256,
  });
  return { audioUrl, videoUrl, expiresAtMs: playbackExpiresAtMs };
});

export const decideBiometricVerificationRequest = onCall(async request => {
  const reviewerUid = await requireOwnerForReview(request, "biometric_review_decision");
  const requestId = typeof request.data?.requestId === "string" ? request.data.requestId : "";
  const decision = request.data?.decision;
  if (request.data?.evidenceReviewed !== true) {
    throw new HttpsError("failed-precondition", "يجب تأكيد مراجعة الصوت والفيديو قبل تسجيل القرار.");
  }
  if (!/^[A-Za-z0-9_-]{16,128}$/.test(requestId) || !["accepted", "rejected"].includes(String(decision))) {
    throw new HttpsError("invalid-argument", "معرف الطلب أو قرار المراجعة غير صالح.");
  }
  const ref = requests().doc(requestId);
  const before = await ref.get();
  if (!before.exists) throw new HttpsError("not-found", "طلب التوثيق غير موجود.");
  const memberUid = String(before.data()?.uid ?? "");
  const userRef = db().collection("users").doc(memberUid);
  const ledgerRef = userRef.collection("walletLedger").doc(biometricRewardLedgerId(requestId));
  const playbackGrantRef = db().collection("biometricOwnerPlaybackGrants").doc(requestId + "_" + reviewerUid);
  const nowMs = Date.now(), acceptedAt = Timestamp.fromMillis(nowMs);
  const expiresAt = Timestamp.fromMillis(addCalendarMonthsUtc(nowMs, 1));
  const mfaAt = Number(request.auth?.token.auth_time) * 1000;
  if (!Number.isSafeInteger(mfaAt) || mfaAt > nowMs || nowMs - mfaAt > 15 * 60 * 1000) {
    throw new HttpsError("permission-denied", "انتهت صلاحية جلسة MFA الحديثة؛ أعد توثيق جلسة المالك.");
  }
  const result = await db().runTransaction(async transaction => {
    const [review, member, ledger, playbackGrant, auditHeadSnapshot] = await Promise.all([
      transaction.get(ref), transaction.get(userRef), transaction.get(ledgerRef),
      transaction.get(playbackGrantRef), transaction.get(auditHead()),
    ]);
    if (!review.exists || review.data()?.status !== "pending" ||
        (decision === "accepted" && !member.exists) || reviewerUid === memberUid) {
      throw new HttpsError("failed-precondition", "الطلب ليس معلقاً أو أن هوية المراجع غير صالحة.");
    }
    const data = review.data() ?? {}, user = member.data() ?? {};
    let identityMatches = false;
    try {
      const identity = validateBiometricMemberIdentity(user, memberUid);
      identityMatches = identity.fullName === data.fullName &&
        identity.username === data.username && identity.gender === data.gender;
    } catch {
      identityMatches = false;
    }
    if ((decision === "accepted" && !identityMatches) ||
        data.consentAccepted !== true || data.consentVersion !== BIOMETRIC_CONSENT_VERSION ||
        data.evidenceValidatedByServer !== true ||
        typeof data.audioSha256 !== "string" || typeof data.videoSha256 !== "string") {
      throw new HttpsError("failed-precondition", "لا يمكن قبول الطلب لأن بيانات الهوية أو الأدلة غير مكتملة أو تغيرت؛ يمكن للمالك رفضه.");
    }
    const grant = playbackGrant.data() ?? {};
    const grantExpiry = grant.expiresAt instanceof Timestamp ? grant.expiresAt.toMillis() : 0;
    if (!playbackGrant.exists || grant.reviewerUid !== reviewerUid ||
        grant.audioSha256 !== data.audioSha256 || grant.videoSha256 !== data.videoSha256 ||
        grantExpiry < nowMs || grant.consumedAt) {
      throw new HttpsError("failed-precondition", "يجب على Super Owner فتح الأدلة الآمنة ومراجعتها من جديد قبل تسجيل القرار.");
    }
    let next;
    try {
      next = decideBiometricReview({ state: stateFromRequest(data), decision: decision as "accepted" | "rejected", reviewerUid, decidedAtMs: nowMs });
    } catch { throw new HttpsError("failed-precondition", "انتقال حالة التوثيق غير صالح أو سبق اتخاذ القرار."); }
    if (decision === "accepted") {
      if (ledger.exists) throw new HttpsError("already-exists", "مكافأة هذا الطلب مسجلة مسبقاً.");
      if (!Number.isSafeInteger(user.coins) || (user.coins as number) < 0) {
        throw new HttpsError("failed-precondition", "رصيد المحفظة غير صالح؛ أوقفنا منح المكافأة حتى إصلاح سجل الاقتصاد.");
      }
      const balance = user.coins as number;
      const newBalance = balance + BIOMETRIC_REWARD_COINS;
      if (!Number.isSafeInteger(newBalance)) throw new HttpsError("out-of-range", "رصيد الكوينز تجاوز الحد الرقمي الآمن.");
      transaction.update(userRef, {
        coins: newBalance,
        biometricVerification: {
          accountUid: memberUid, status: "verified", revokedAt: null,
          verificationMethod: "super_owner_manual_review",
          trustModel: "server_authoritative_owner_decision",
          reviewerRole: "super_owner", reviewerMfaVerified: true,
          decision: "accepted", reviewerUid, reviewerMfaAt: Timestamp.fromMillis(mfaAt),
          reviewRequestId: requestId, acceptedAt, expiresAt,
        },
        biometricVerificationAcceptedAt: acceptedAt, biometricVerificationExpiresAt: expiresAt,
        biometricVerificationPermanentlyClosed: false, updatedAt: FieldValue.serverTimestamp(),
      });
      transaction.create(ledgerRef, {
        type: "biometric_verification_reward", direction: "credit",
        amount: BIOMETRIC_REWARD_COINS, reason: "accepted_biometric_verification",
        requestId, idempotencyKey: requestId, balanceBefore: balance, balanceAfter: newBalance, createdAt: acceptedAt,
      });
      transaction.create(db().collection("verificationAuditLogs").doc("biometric_reward_" + requestId), {
        actorUid: reviewerUid, uid: memberUid, requestId,
        action: "biometric_verification_rewarded", rewardCoins: BIOMETRIC_REWARD_COINS,
        idempotencyKey: requestId, createdAt: acceptedAt,
      });
    } else if (next.status === "closed" && member.exists) {
      transaction.update(userRef, { biometricVerificationPermanentlyClosed: true, updatedAt: FieldValue.serverTimestamp() });
    }
    transaction.update(ref, {
      status: next.status, reviewState: next, decision, decidedByUid: reviewerUid, decidedAt: acceptedAt,
      ...(decision === "accepted" ? { acceptedAt, expiresAt } : {}),
      ...(next.nextEligibleAtMs !== null ? { nextEligibleAt: Timestamp.fromMillis(next.nextEligibleAtMs) } : { nextEligibleAt: FieldValue.delete() }),
      evidenceDeletionStatus: "pending", evidenceDeletionRetryAt: Timestamp.fromMillis(nowMs),
      updatedAt: FieldValue.serverTimestamp(),
    });
    if (playbackGrant.exists && playbackGrant.data()?.reviewerUid === reviewerUid) {
      transaction.update(playbackGrantRef, { consumedAt: acceptedAt, consumedDecision: decision });
    }
    const auditLogId = await appendAuditInTransaction(transaction, {
      actorUid: reviewerUid, action: "biometric_review_decided",
      requestId, subjectUid: memberUid, decision,
      attemptNumber: next.attemptNumber, finalRejection: next.finalRejection,
      rewardCoins: decision === "accepted" ? BIOMETRIC_REWARD_COINS : 0,
      evidenceReviewed: true,
      nextEligibleAtMs: next.nextEligibleAtMs, outcome: "success",
    }, auditHeadSnapshot);
    return {
      requestId, status: next.status, decision, attemptNumber: next.attemptNumber,
      nextEligibleAtMs: next.nextEligibleAtMs,
      rewardGranted: decision === "accepted", rewardCoins: decision === "accepted" ? BIOMETRIC_REWARD_COINS : 0,
      auditLogId,
    };
  });
  await deleteEvidence(requestId).catch(error => logger.warn("Biometric evidence deletion queued for retry", { requestId, error }));
  return result;
});

export const cleanupDecidedBiometricEvidence = onSchedule("every 15 minutes", async () => {
  const due = await requests().where("evidenceDeletionStatus", "in", ["pending", "retry_required"]).limit(100).get();
  for (const doc of due.docs) {
    await deleteEvidence(doc.id).catch(error => logger.warn("Biometric evidence cleanup retry failed", { requestId: doc.id, error }));
  }
});


/** Expire abandoned upload intents only after their five-minute signed URLs can no longer be used. */
