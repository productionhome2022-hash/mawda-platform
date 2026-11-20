import { createHash, randomUUID } from "node:crypto";
import { FieldValue, Timestamp, getFirestore, type Transaction } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
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
  biometricEvidenceObjectPaths, biometricRewardLedgerId,
} from "./biometric-evidence";

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

async function appendAuditInTransaction(transaction: Transaction, event: Record<string, unknown>): Promise<string> {
  const auditRef = db().collection("adminAuditLogs").doc();
  const headRef = auditHead();
  const headSnapshot = await transaction.get(headRef);
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
  await db().runTransaction(async transaction => { await appendAuditInTransaction(transaction, event); });
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
  const [url] = await getStorage().bucket().file(path).getSignedUrl({
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
  if (!["accepted", "rejected", "closed"].includes(String(data.status))) return;
  const prefix = "biometric-evidence/" + data.uid + "/" + requestId + "/";
  const paths = [data.audioPath, data.videoPath].filter((path): path is string =>
    typeof path === "string" && path.startsWith(prefix));
  try {
    for (const path of paths) await getStorage().bucket().file(path).delete({ ignoreNotFound: true });
    await ref.update({
      evidenceDeletionStatus: "deleted", evidenceDeletedAt: FieldValue.serverTimestamp(),
      audioPath: FieldValue.delete(), videoPath: FieldValue.delete(),
      evidenceDeletionLastError: FieldValue.delete(), updatedAt: FieldValue.serverTimestamp(),
    });
    await db().collection("verificationAuditLogs").doc("biometric_evidence_deleted_" + requestId).set({
      uid: data.uid, requestId, action: "biometric_evidence_deleted",
      deletedObjectCount: paths.length, createdAt: FieldValue.serverTimestamp(),
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
  const requestId = randomUUID();
  const paths = biometricEvidenceObjectPaths(uid, requestId);
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
      const previousSnapshot = await transaction.get(requests().doc(previousId));
      if (!previousSnapshot.exists) throw new HttpsError("failed-precondition", "سجل محاولة التوثيق السابقة غير موجود.");
      const previous = previousSnapshot.data() ?? {};
      if (previous.status === "uploading" || previous.status === "pending") {
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
      audioPath: paths.audioPath, videoPath: paths.videoPath,
      createdAt: Timestamp.fromMillis(nowMs), submittedAtMs: nowMs,
      evidenceDeletionStatus: "not_due", updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.update(userRef, {
      biometricVerificationLastRequestId: requestId,
      biometricVerificationAttemptNumber: attempt,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return attempt;
  });
  const [audioUploadUrl, videoUploadUrl] = await Promise.all([
    signedUrl(paths.audioPath, "write", "audio/mp4", BIOMETRIC_EVIDENCE_UPLOAD_TTL_MS),
    signedUrl(paths.videoPath, "write", "video/mp4", BIOMETRIC_EVIDENCE_UPLOAD_TTL_MS),
  ]);
  return {
    requestId, attemptNumber, phrase: BIOMETRIC_SPOKEN_PHRASE, phraseVersion: BIOMETRIC_SPOKEN_PHRASE_VERSION,
    audio: { uploadUrl: audioUploadUrl, contentType: "audio/mp4", maxBytes: BIOMETRIC_AUDIO_MAX_BYTES, maxDurationSeconds: 60 },
    video: { uploadUrl: videoUploadUrl, contentType: "video/mp4", maxBytes: BIOMETRIC_VIDEO_MAX_BYTES, minDurationSeconds: 3, maxDurationSeconds: 5 },
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
  const audioFile = getStorage().bucket().file(data.audioPath);
  const videoFile = getStorage().bucket().file(data.videoPath);
  let audio: Buffer, video: Buffer;
  try {
    const [am, vm] = await Promise.all([audioFile.getMetadata(), videoFile.getMetadata()]);
    const audioSize = Number(am[0].size), videoSize = Number(vm[0].size);
    if (!Number.isSafeInteger(audioSize) || audioSize < 1 || audioSize > BIOMETRIC_AUDIO_MAX_BYTES ||
        am[0].contentType !== "audio/mp4" ||
        !Number.isSafeInteger(videoSize) || videoSize < 1 || videoSize > BIOMETRIC_VIDEO_MAX_BYTES ||
        vm[0].contentType !== "video/mp4") throw new Error("BIOMETRIC_EVIDENCE_SIZE_OR_TYPE_INVALID");
    [audio, video] = await Promise.all([audioFile.download().then(x => x[0]), videoFile.download().then(x => x[0])]);
    if (audio.length !== audioSize || video.length !== videoSize ||
        detectMediaSignature(audio.subarray(0, 32)) !== "audio/mp4" ||
        detectMediaSignature(video.subarray(0, 32)) !== "video/mp4") throw new Error("BIOMETRIC_EVIDENCE_SIGNATURE_INVALID");
    assertBiometricAudioFileAllowed(audio);
    assertBiometricVideoFileAllowed(video);
  } catch (error) {
    await Promise.all([audioFile.delete({ ignoreNotFound: true }).catch(() => undefined), videoFile.delete({ ignoreNotFound: true }).catch(() => undefined)]);
    await ref.update({
      status: "upload_rejected", uploadFailureCode: error instanceof Error ? error.message : "INVALID_EVIDENCE",
      evidenceDeletionStatus: "deleted", audioPath: FieldValue.delete(), videoPath: FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
    }).catch(() => undefined);
    throw new HttpsError("invalid-argument", "ملفات التوثيق غير مطابقة للنوع أو الحجم أو المدة المعتمدة.");
  }
  const audioHash = createHash("sha256").update(audio).digest("hex");
  const videoHash = createHash("sha256").update(video).digest("hex");
  const now = Timestamp.now();
  await db().runTransaction(async transaction => {
    const fresh = await transaction.get(ref);
    if (!fresh.exists || fresh.data()?.uid !== uid || fresh.data()?.status !== "uploading") {
      throw new HttpsError("aborted", "تغير طلب التوثيق أثناء التحقق؛ أعد المحاولة.");
    }
    transaction.update(ref, {
      status: "pending", submittedAt: now, submittedAtMs: now.toMillis(),
      audioBytes: audio.length, videoBytes: video.length,
      audioSha256: audioHash, videoSha256: videoHash,
      evidenceValidatedByServer: true, evidenceValidatedAt: now,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
  await db().collection("verificationAuditLogs").doc("biometric_submission_" + requestId).create({
    uid, requestId, action: "biometric_evidence_submitted", phraseVersion: BIOMETRIC_SPOKEN_PHRASE_VERSION,
    audioSha256: audioHash, videoSha256: videoHash, audioBytes: audio.length, videoBytes: video.length, createdAt: now,
  });
  return { submitted: true, requestId, status: "pending", attemptNumber: data.attemptNumber };
});

export const listOwnerBiometricVerificationRequests = onCall(async request => {
  await requireOwnerForReview(request, "biometric_request_inbox_read");
  const snapshot = await requests().where("status", "==", "pending").limit(50).get();
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
  if (!snapshot.exists || value.status !== "pending" || typeof value.audioPath !== "string" || typeof value.videoPath !== "string") {
    throw new HttpsError("not-found", "أدلة الطلب غير متاحة للمراجعة.");
  }
  const [audioUrl, videoUrl] = await Promise.all([
    signedUrl(value.audioPath, "read", "audio/mp4", BIOMETRIC_EVIDENCE_REVIEW_TTL_MS),
    signedUrl(value.videoPath, "read", "video/mp4", BIOMETRIC_EVIDENCE_REVIEW_TTL_MS),
  ]);
  await appendAudit({
    actorUid: ownerUid, action: "biometric_evidence_playback_issued",
    requestId, subjectUid: value.uid, outcome: "success",
    audioSha256: value.audioSha256, videoSha256: value.videoSha256,
  });
  return { audioUrl, videoUrl, expiresAtMs: Date.now() + BIOMETRIC_EVIDENCE_REVIEW_TTL_MS };
});

export const decideBiometricVerificationRequest = onCall(async request => {
  const reviewerUid = await requireOwnerForReview(request, "biometric_review_decision");
  const requestId = typeof request.data?.requestId === "string" ? request.data.requestId : "";
  const decision = request.data?.decision;
  if (!/^[A-Za-z0-9_-]{16,128}$/.test(requestId) || !["accepted", "rejected"].includes(String(decision))) {
    throw new HttpsError("invalid-argument", "معرف الطلب أو قرار المراجعة غير صالح.");
  }
  const ref = requests().doc(requestId);
  const before = await ref.get();
  if (!before.exists) throw new HttpsError("not-found", "طلب التوثيق غير موجود.");
  const memberUid = String(before.data()?.uid ?? "");
  const userRef = db().collection("users").doc(memberUid);
  const ledgerRef = userRef.collection("walletLedger").doc(biometricRewardLedgerId(requestId));
  const nowMs = Date.now(), acceptedAt = Timestamp.fromMillis(nowMs);
  const expiresAt = Timestamp.fromMillis(addCalendarMonthsUtc(nowMs, 1));
  const mfaAt = Number(request.auth?.token.auth_time) * 1000;
  if (!Number.isSafeInteger(mfaAt) || mfaAt > nowMs || nowMs - mfaAt > 15 * 60 * 1000) {
    throw new HttpsError("permission-denied", "انتهت صلاحية جلسة MFA الحديثة؛ أعد توثيق جلسة المالك.");
  }
  const result = await db().runTransaction(async transaction => {
    const [review, member, ledger] = await Promise.all([
      transaction.get(ref), transaction.get(userRef), transaction.get(ledgerRef),
    ]);
    if (!review.exists || review.data()?.status !== "pending" || !member.exists || reviewerUid === memberUid) {
      throw new HttpsError("failed-precondition", "الطلب ليس معلقاً أو أن هوية المراجع غير صالحة.");
    }
    const data = review.data() ?? {}, user = member.data() ?? {};
    let identity;
    try { identity = validateBiometricMemberIdentity(user, memberUid); }
    catch { throw new HttpsError("failed-precondition", "بيانات العضو الأساسية غير صالحة."); }
    if (identity.fullName !== data.fullName || identity.username !== data.username ||
        identity.gender !== data.gender || data.evidenceValidatedByServer !== true ||
        typeof data.audioSha256 !== "string" || typeof data.videoSha256 !== "string") {
      throw new HttpsError("failed-precondition", "الأدلة أو بيانات الهوية غير مكتملة أو تغيرت.");
    }
    let next;
    try {
      next = decideBiometricReview({ state: stateFromRequest(data), decision: decision as "accepted" | "rejected", reviewerUid, decidedAtMs: nowMs });
    } catch { throw new HttpsError("failed-precondition", "انتقال حالة التوثيق غير صالح أو سبق اتخاذ القرار."); }
    if (decision === "accepted") {
      if (ledger.exists) throw new HttpsError("already-exists", "مكافأة هذا الطلب مسجلة مسبقاً.");
      const balance = Number.isSafeInteger(user.coins) ? user.coins as number : 0;
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
    } else if (next.status === "closed") {
      transaction.update(userRef, { biometricVerificationPermanentlyClosed: true, updatedAt: FieldValue.serverTimestamp() });
    }
    transaction.update(ref, {
      status: next.status, reviewState: next, decision, decidedByUid: reviewerUid, decidedAt: acceptedAt,
      ...(decision === "accepted" ? { acceptedAt, expiresAt } : {}),
      ...(next.nextEligibleAtMs !== null ? { nextEligibleAt: Timestamp.fromMillis(next.nextEligibleAtMs) } : { nextEligibleAt: FieldValue.delete() }),
      evidenceDeletionStatus: "pending", evidenceDeletionRetryAt: Timestamp.fromMillis(nowMs),
      updatedAt: FieldValue.serverTimestamp(),
    });
    const auditLogId = await appendAuditInTransaction(transaction, {
      actorUid: reviewerUid, action: "biometric_review_decided",
      requestId, subjectUid: memberUid, decision,
      attemptNumber: next.attemptNumber, finalRejection: next.finalRejection,
      rewardCoins: decision === "accepted" ? BIOMETRIC_REWARD_COINS : 0,
      nextEligibleAtMs: next.nextEligibleAtMs, outcome: "success",
    });
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
