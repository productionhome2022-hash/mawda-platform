import { randomUUID, createHash } from "node:crypto";
import { pipeline } from "node:stream/promises";
import { getAppCheck } from "firebase-admin/app-check";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { HttpsError, onCall, onRequest } from "firebase-functions/v2/https";
import { verifyScannerWebhook, validateScannerVerdict } from "./media-scanner";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { hasPlatformOwnerSession } from "./owner-access";
import { reserveMediaQuota, releaseMediaQuota } from "./media-quota";
import {
  detectMediaSignature,
  mediaPolicyFor,
  normalizeMediaRequest,
  mediaUploaderTypeFromToken,
  mediaSignedUrlExpiresAt,
} from "./media-security";

// Resolve Admin SDK services lazily. This module is re-exported by index.ts,
// whose static imports execute before initializeApp(); eager resolution here
// would make the Functions entry point fail during module loading.
const mediaDb = () => getFirestore();
const mediaBucket = () => getStorage().bucket();

function requireUid(uid: string | undefined): string {
  if (!uid) throw new HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً.");
  return uid;
}

function requireSoleOwner(request: {
  auth?: { uid: string; token: Record<string, unknown> } | null;
}): string {
  const uid = requireUid(request.auth?.uid);
  if (request.auth?.token.platformOwner !== true ||
      !hasPlatformOwnerSession(request.auth.token)) {
    throw new HttpsError("permission-denied", "الوصول إلى ملفات المنصة مخصص للمالك بعد تحقق MFA حديث.");
  }
  return uid;
}

async function auditMediaAccess(event: Record<string, unknown>): Promise<void> {
  await mediaDb().collection("mediaAccessAudit").add({
    ...event,
    createdAt: FieldValue.serverTimestamp(),
  });
}

/** Persist authenticated denials before returning an authorization error. */
async function requireSoleOwnerForMediaReview(
  request: { auth?: { uid: string; token: Record<string, unknown> } | null },
  action: string,
): Promise<string> {
  try {
    return requireSoleOwner(request);
  } catch (error) {
    const actorUid = request.auth?.uid;
    if (actorUid) {
      // Fail closed: do not return an authorization denial if its audit cannot be persisted.
      await auditMediaAccess({
        actorUid,
        action,
        outcome: "denied",
        failureCode: error instanceof HttpsError ? error.code : "permission-denied",
        ownerAuthTime: request.auth?.token.auth_time ?? null,
      });
    }
    throw error;
  }
}


/**
 * Issues a five-minute, single-object upload URL. Objects are written only
 * beneath a private quarantine prefix and are never made publicly readable.
 */

async function sha256Object(file: ReturnType<ReturnType<typeof mediaBucket>["file"]>): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = file.createReadStream();
    stream.on("data", (chunk: Buffer) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

/** Authenticated gateway callback; any missing/mismatched evidence stays quarantined. */
export const receiveMediaScanVerdict = onRequest(async (request, response) => {
  if (request.method !== "POST") {
    response.status(405).set("Allow", "POST").send("Method not allowed");
    return;
  }
  const rawBody = request.rawBody;
  const secret = process.env.MAWDA_MEDIA_SCANNER_HMAC_SECRET;
  const provider = process.env.MAWDA_MEDIA_SCANNER_PROVIDER;
  if (!rawBody || rawBody.length > 16 * 1024 || !secret || !provider ||
      !verifyScannerWebhook(rawBody, request.get("x-mawadda-scanner-signature"), secret)) {
    response.status(401).send("Unauthorized scanner callback");
    return;
  }
  let decoded: unknown;
  try { decoded = JSON.parse(rawBody.toString("utf8")); } catch {
    response.status(400).send("Invalid JSON");
    return;
  }
  const verdict = validateScannerVerdict(decoded, provider);
  if (!verdict) {
    response.status(400).send("Invalid or stale scanner verdict");
    return;
  }
  const db = mediaDb();
  const assetRef = db.collection("mediaAssets").doc(verdict.mediaId);
  const snapshot = await assetRef.get();
  if (!snapshot.exists || snapshot.data()?.status !== "pending_security_scan") {
    response.status(409).send("Asset is not awaiting a scan");
    return;
  }
  const asset = snapshot.data()!;
  const file = mediaBucket().file(String(asset.objectPath));
  let metadata: Record<string, unknown>;
  try {
    const [rawMetadata] = await file.getMetadata();
    metadata = rawMetadata as unknown as Record<string, unknown>;
  } catch {
    response.status(409).send("Quarantined object is missing");
    return;
  }
  if (String(metadata.generation) !== verdict.objectGeneration ||
      String(asset.storageGeneration) !== verdict.objectGeneration) {
    response.status(409).send("Object generation mismatch");
    return;
  }
  const actualHash = await sha256Object(file);
  if (actualHash !== verdict.sha256) {
    response.status(409).send("Object hash mismatch");
    return;
  }
  const nextStatus = verdict.verdict === "clean" ? "security_approved" :
    verdict.verdict === "malicious" ? "rejected" : "pending_security_scan";
  await db.runTransaction(async (transaction) => {
    const latest = await transaction.get(assetRef);
    if (!latest.exists || latest.data()?.status !== "pending_security_scan" ||
        String(latest.data()?.storageGeneration) !== verdict.objectGeneration) {
      throw new HttpsError("failed-precondition", "Asset state changed during scanner callback.");
    }
    transaction.update(assetRef, {
      status: nextStatus,
      scannerProvider: verdict.provider,
      scannerVerdict: verdict.verdict,
      scannerSha256: actualHash,
      scannerObjectGeneration: verdict.objectGeneration,
      scannerScannedAt: new Date(verdict.scannedAtMs),
      scannerVerifiedAt: FieldValue.serverTimestamp(),
      ...(verdict.verdict === "malicious" ? { rejectionCode: "MALWARE_DETECTED" } : {}),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
  await auditMediaAccess({
    actorUid: "trusted-scanner",
    mediaId: verdict.mediaId,
    action: "media_security_scan_verdict",
    outcome: verdict.verdict,
    provider: verdict.provider,
    objectGeneration: verdict.objectGeneration,
    sha256: actualHash,
  });
  if (verdict.verdict === "malicious") {
    await file.delete({ ignoreNotFound: true, ifGenerationMatch: Number(verdict.objectGeneration) });
  }
  response.status(200).json({ mediaId: verdict.mediaId, status: nextStatus });
});
\nexport const createMediaUploadIntent = onCall(async (request) => {
  const uid = requireUid(request.auth?.uid);
  let input;
  try {
    input = normalizeMediaRequest(request.data ?? {});
  } catch (error) {
    throw new HttpsError("invalid-argument", error instanceof Error ? error.message : "بيانات الملف غير صالحة.");
  }
  const policy = mediaPolicyFor(input.contentType);
  if (!policy) throw new HttpsError("invalid-argument", "نوع الملف غير مسموح به.");
  if (input.declaredSizeBytes > policy.maxBytes) {
    throw new HttpsError("invalid-argument", "حجم الملف يتجاوز الحد المسموح لهذا النوع.");
  }

  const mediaId = randomUUID();
  const objectPath = `quarantine/${uid}/${mediaId}`;
  const file = mediaBucket().file(objectPath);
  const expiresAt = mediaSignedUrlExpiresAt("upload");
  const uploadUrl = await file.getSignedUrl({
    version: "v4",
    action: "write",
    expires: expiresAt,
    contentType: input.contentType,
    // Create-only precondition: a leaked/replayed upload URL cannot overwrite
    // the first object generation after the quarantine object is created.
    queryParams: { ifGenerationMatch: "0" },
  });

  const assetRef = mediaDb().collection("mediaAssets").doc(mediaId);
  const quotaRef = mediaDb().collection("mediaUploadQuotas").doc(uid);
  await mediaDb().runTransaction(async (transaction) => {
    const [quotaSnapshot, existingAsset] = await Promise.all([
      transaction.get(quotaRef),
      transaction.get(assetRef),
    ]);
    if (existingAsset.exists) {
      throw new HttpsError("already-exists", "معرف طلب الرفع مستخدم مسبقاً.");
    }
    let reservation;
    try {
      reservation = reserveMediaQuota(quotaSnapshot.data(), input.declaredSizeBytes);
    } catch {
      throw new HttpsError("resource-exhausted", "تم بلوغ حصة الرفع المؤقتة أو اليومية. حاول لاحقاً.");
    }
    const now = FieldValue.serverTimestamp();
    transaction.set(quotaRef, { ...reservation, updatedAt: now });
    transaction.create(assetRef, {
      mediaId,
      ownerUid: uid,
      uploaderType: mediaUploaderTypeFromToken(request.auth?.token ?? {}),
      objectPath,
      originalName: input.originalName,
      declaredContentType: input.contentType,
      declaredSizeBytes: input.declaredSizeBytes,
      mediaCategory: policy.category,
      status: "upload_authorized",
      uploadUrlExpiresAt: new Date(expiresAt),
      createdAt: now,
      updatedAt: now,
    });
  });
  await auditMediaAccess({
    actorUid: uid,
    mediaId,
    action: "media_upload_intent_created",
    outcome: "success",
    objectPath,
    declaredContentType: input.contentType,
    declaredSizeBytes: input.declaredSizeBytes,
  });
  return { mediaId, uploadUrl: uploadUrl[0], expiresAt };
});

/**
 * Verifies the uploaded object's server metadata and file signature. This is
 * format validation, not antivirus scanning; accepted files remain quarantined
 * with pending_security_scan and cannot be served to members.
 */
export const finalizeMediaUpload = onCall(async (request) => {
  const uid = requireUid(request.auth?.uid);
  const mediaId = typeof request.data?.mediaId === "string" ? request.data.mediaId : "";
  if (!/^[0-9a-f-]{36}$/i.test(mediaId)) {
    throw new HttpsError("invalid-argument", "معرف الملف غير صالح.");
  }
  const assetRef = mediaDb().collection("mediaAssets").doc(mediaId);
  const snapshot = await assetRef.get();
  if (!snapshot.exists) throw new HttpsError("not-found", "طلب رفع الملف غير موجود.");
  const asset = snapshot.data()!;
  if (asset.ownerUid !== uid || asset.status !== "upload_authorized") {
    throw new HttpsError("permission-denied", "لا تملك صلاحية إكمال رفع هذا الملف.");
  }

  const file = mediaBucket().file(String(asset.objectPath));
  let metadata: Record<string, unknown>;
  try {
    const [rawMetadata] = await file.getMetadata();
    metadata = rawMetadata as unknown as Record<string, unknown>;
  } catch {
    throw new HttpsError("failed-precondition", "لم يتم العثور على الملف المرفوع.");
  }
  const sizeBytes = Number(metadata.size);
  const contentType = typeof metadata.contentType === "string" ? metadata.contentType : "";
  const policy = mediaPolicyFor(String(asset.declaredContentType));
  const [header] = await file.download({ start: 0, end: 31 });
  const detectedType = detectMediaSignature(header);
  const valid = Boolean(
    policy &&
    Number.isSafeInteger(sizeBytes) &&
    sizeBytes > 0 &&
    sizeBytes <= policy.maxBytes &&
    // Quotas reserve declared bytes; reject any object whose actual size differs.
    sizeBytes === Number(asset.declaredSizeBytes) &&
    contentType === asset.declaredContentType &&
    detectedType === asset.declaredContentType &&
    metadata.generation,
  );

  if (!valid) {
    await file.delete({ ignoreNotFound: true });
    const quotaRef = mediaDb().collection("mediaUploadQuotas").doc(uid);
    await mediaDb().runTransaction(async (transaction) => {
      const [latestAsset, quotaSnapshot] = await Promise.all([
        transaction.get(assetRef),
        transaction.get(quotaRef),
      ]);
      if (!latestAsset.exists || latestAsset.data()?.status !== "upload_authorized") {
        throw new HttpsError("failed-precondition", "تغيرت حالة طلب الرفع أثناء التحقق.");
      }
      const reservation = releaseMediaQuota(quotaSnapshot.data(), Number(asset.declaredSizeBytes));
      transaction.update(assetRef, {
        status: "rejected",
        rejectionCode: "CONTENT_TYPE_SIZE_OR_SIGNATURE_MISMATCH",
        updatedAt: FieldValue.serverTimestamp(),
      });
      transaction.set(quotaRef, { ...reservation, updatedAt: FieldValue.serverTimestamp() });
    });
    await auditMediaAccess({
      actorUid: uid,
      mediaId,
      action: "media_upload_validation",
      outcome: "rejected",
      detectedContentType: detectedType,
      declaredContentType: asset.declaredContentType,
      sizeBytes: Number.isFinite(sizeBytes) ? sizeBytes : null,
    });
    throw new HttpsError("invalid-argument", "رُفض الملف لأن نوع المحتوى أو حجمه أو بصمته لا يطابق البيانات المعلنة.");
  }

  const quotaRef = mediaDb().collection("mediaUploadQuotas").doc(uid);
  await mediaDb().runTransaction(async (transaction) => {
    const [latestAsset, quotaSnapshot] = await Promise.all([
      transaction.get(assetRef),
      transaction.get(quotaRef),
    ]);
    if (!latestAsset.exists || latestAsset.data()?.status !== "upload_authorized") {
      throw new HttpsError("failed-precondition", "تمت معالجة طلب الرفع مسبقاً أو تغيرت حالته.");
    }
    const reservation = releaseMediaQuota(quotaSnapshot.data(), Number(asset.declaredSizeBytes));
    transaction.update(assetRef, {
      status: "pending_security_scan",
      detectedContentType: detectedType,
      sizeBytes,
      storageGeneration: String(metadata.generation),
      finalizedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.set(quotaRef, { ...reservation, updatedAt: FieldValue.serverTimestamp() });
  });
  await auditMediaAccess({
    actorUid: uid,
    mediaId,
    action: "media_upload_validation",
    outcome: "pending_security_scan",
    detectedContentType: detectedType,
    sizeBytes,
    storageGeneration: String(metadata.generation),
  });
  return { mediaId, status: "pending_security_scan", detectedContentType: detectedType, sizeBytes };
});

/** Lists bounded metadata only; file bytes and download URLs are never returned here. */
export const listOwnerMediaAssets = onCall(async (request) => {
  const actorUid = await requireSoleOwnerForMediaReview(request, "owner_media_asset_list_attempt");
  const requestedLimit = request.data?.limit;
  const limit = Number.isSafeInteger(requestedLimit)
    ? Math.max(1, Math.min(50, requestedLimit as number))
    : 25;
  const status = typeof request.data?.status === "string" ? request.data.status : "pending_security_scan";
  const uploaderType = typeof request.data?.uploaderType === "string" ? request.data.uploaderType : "all";
  const allowedUploaderTypes = ["all", "member", "guest"];
  if (!allowedUploaderTypes.includes(uploaderType)) {
    await auditMediaAccess({
      actorUid,
      action: "owner_media_asset_list_attempt",
      outcome: "denied",
      failureCode: "invalid-uploader-type",
    });
    throw new HttpsError("invalid-argument", "نوع صاحب الملف المطلوب غير صالح.");
  }
  const allowedStatuses = ["upload_authorized", "pending_security_scan", "rejected", "security_approved"];
  if (!allowedStatuses.includes(status)) {
    await auditMediaAccess({
      actorUid,
      action: "owner_media_asset_list_attempt",
      outcome: "denied",
      failureCode: "invalid-status",
    });
    throw new HttpsError("invalid-argument", "حالة الملفات المطلوبة غير صالحة.");
  }
  let query = mediaDb().collection("mediaAssets").where("status", "==", status);
  if (uploaderType !== "all") query = query.where("uploaderType", "==", uploaderType);
  query = query.orderBy("createdAt", "desc").limit(limit + 1);
  const cursor = typeof request.data?.pageToken === "string" ? request.data.pageToken : "";
  if (cursor) {
    const cursorDoc = await mediaDb().collection("mediaAssets").doc(cursor).get();
    if (!cursorDoc.exists || cursorDoc.data()?.status !== status ||
        (uploaderType !== "all" && cursorDoc.data()?.uploaderType !== uploaderType)) {
      await auditMediaAccess({
        actorUid,
        action: "owner_media_asset_list_attempt",
        outcome: "denied",
        failureCode: "invalid-page-token",
        requestedStatus: status,
        requestedUploaderType: uploaderType,
      });
      throw new HttpsError("invalid-argument", "مؤشر صفحة الملفات غير صالح.");
    }
    query = query.startAfter(cursorDoc);
  }
  const result = await query.get();
  const hasMore = result.docs.length > limit;
  const docs = result.docs.slice(0, limit);
  await auditMediaAccess({
    actorUid,
    action: "owner_media_asset_listed",
    outcome: "success",
    requestedStatus: status,
    requestedUploaderType: uploaderType,
    returnedCount: docs.length,
    hasMore,
  });
  return {
    assets: docs.map((doc) => {
      const data = doc.data();
      return {
        mediaId: doc.id,
        ownerUid: data.ownerUid,
        uploaderType: data.uploaderType ?? "legacy_unknown",
        originalName: data.originalName,
        declaredContentType: data.declaredContentType,
        detectedContentType: data.detectedContentType ?? null,
        sizeBytes: data.sizeBytes ?? data.declaredSizeBytes,
        mediaCategory: data.mediaCategory,
        status: data.status,
        createdAt: data.createdAt?.toMillis?.() ?? null,
      };
    }),
    nextPageToken: hasMore && docs.length ? docs[docs.length - 1].id : null,
    hasMore,
  };
});

/**
 * Owner-only short-lived read URL for a quarantined object. This is an
 * explicit privileged inspection path, not a member-facing media URL.
 */
/**
 * Authenticated owner-only raster preview. A Firebase ID token is checked on
 * every request; no storage bearer URL is returned or placed in browser history.
 */
export const ownerMediaPreview = onRequest(async (request, response) => {
  if (request.method !== "GET") {
    response.status(405).set("Allow", "GET").send("Method not allowed");
    return;
  }
  const match = /^Bearer (.+)$/.exec(request.get("authorization") ?? "");
  if (!match) { response.status(401).send("Authentication required"); return; }
  let decoded;
  try { decoded = await getAuth().verifyIdToken(match[1], true); }
  catch { response.status(401).send("Authentication required"); return; }
  const actorUid = decoded.uid;
  if (decoded.platformOwner !== true || !hasPlatformOwnerSession(decoded)) {
    await auditMediaAccess({ actorUid, action: "owner_media_preview", outcome: "denied", failureCode: "permission-denied" });
    response.status(403).send("Forbidden"); return;
  }
  const mediaId = typeof request.query.mediaId === "string" ? request.query.mediaId : "";
  if (!/^[0-9a-f-]{36}$/i.test(mediaId)) {
    await auditMediaAccess({ actorUid, action: "owner_media_preview", outcome: "denied", failureCode: "invalid-media-id" });
    response.status(400).send("Invalid media ID"); return;
  }
  const snapshot = await mediaDb().collection("mediaAssets").doc(mediaId).get();
  if (!snapshot.exists) {
    await auditMediaAccess({ actorUid, mediaId, action: "owner_media_preview", outcome: "denied", failureCode: "not-found" });
    response.status(404).send("Not found"); return;
  }
  const asset = snapshot.data()!;
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!["pending_security_scan", "security_approved"].includes(String(asset.status)) ||
      !allowedTypes.includes(String(asset.detectedContentType))) {
    await auditMediaAccess({ actorUid, mediaId, action: "owner_media_preview", outcome: "denied", failureCode: "preview-not-allowed" });
    response.status(415).send("Media type is not eligible for inline preview"); return;
  }
  const file = mediaBucket().file(String(asset.objectPath));
  let metadata;
  try { [metadata] = await file.getMetadata(); }
  catch { response.status(404).send("Media object not found"); return; }
  if (String(metadata.generation) !== String(asset.storageGeneration)) {
    await auditMediaAccess({ actorUid, mediaId, action: "owner_media_preview", outcome: "denied", failureCode: "generation-mismatch" });
    response.status(409).send("Media generation changed"); return;
  }
  await auditMediaAccess({ actorUid, mediaId, action: "owner_media_preview", outcome: "success", objectGeneration: String(metadata.generation) });
  response.set({
    "Content-Type": String(asset.detectedContentType),
    "Content-Disposition": "inline; filename=\"mawadda-preview\"",
    "Cache-Control": "private, no-store, max-age=0",
    "Pragma": "no-cache",
    "X-Content-Type-Options": "nosniff",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Content-Security-Policy": "default-src 'none'; sandbox",
  });
  file.createReadStream({ validation: "crc32c" })
    .on("error", () => { if (!response.headersSent) response.status(502); response.end(); })
    .pipe(response);
});

/** Legacy signed-URL callable disabled; use the authenticated streaming preview. */
export const getOwnerMediaInspectionUrl = onCall(async () => {
  throw new HttpsError("failed-precondition", "استخدم معاينة المالك الآمنة التي تتحقق من جلسة الدخول عند كل طلب.");
});

 * Reclaims abandoned upload reservations after the signed PUT capability has
 * expired plus a safety grace period. A transactional state claim prevents a
 * cleanup/finalize race; failed object deletion is retried on the next sweep.
 */
export const cleanupExpiredMediaUploadIntents = onSchedule(
  { schedule: "every 15 minutes", timeZone: "UTC", retryCount: 3 },
  async () => {
    const cutoff = Timestamp.fromMillis(Date.now() - 15 * 60 * 1000);
    const assets = mediaDb().collection("mediaAssets");
    const [expired, retrying] = await Promise.all([
      assets.where("status", "==", "upload_authorized")
        .where("createdAt", "<=", cutoff).orderBy("createdAt").limit(100).get(),
      assets.where("status", "==", "expired_cleanup_in_progress")
        .orderBy("createdAt").limit(100).get(),
    ]);
    const candidates = new Map<string, (typeof expired.docs)[number]>();
    for (const doc of [...expired.docs, ...retrying.docs]) candidates.set(doc.id, doc);

    let reclaimed = 0;
    for (const candidate of candidates.values()) {
      const assetRef = candidate.ref;
      const claimed = await mediaDb().runTransaction(async (transaction) => {
        const current = await transaction.get(assetRef);
        const data = current.data();
        if (!current.exists || !data) return null;
        if (data.status === "upload_authorized") {
          const createdAt = data.createdAt as Timestamp | undefined;
          if (!createdAt || createdAt.toMillis() > cutoff.toMillis()) return null;
          transaction.update(assetRef, {
            status: "expired_cleanup_in_progress",
            cleanupStartedAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });
          return { ownerUid: String(data.ownerUid), objectPath: String(data.objectPath),
            reservedBytes: Number(data.declaredSizeBytes) };
        }
        if (data.status === "expired_cleanup_in_progress") {
          return { ownerUid: String(data.ownerUid), objectPath: String(data.objectPath),
            reservedBytes: Number(data.declaredSizeBytes) };
        }
        return null;
      });
      if (!claimed) continue;

      try {
        await mediaBucket().file(claimed.objectPath).delete({ ignoreNotFound: true });
        await mediaDb().runTransaction(async (transaction) => {
          const [current, quotaSnapshot] = await Promise.all([
            transaction.get(assetRef),
            transaction.get(mediaDb().collection("mediaUploadQuotas").doc(claimed.ownerUid)),
          ]);
          if (!current.exists || current.data()?.status !== "expired_cleanup_in_progress") return;
          const quota = releaseMediaQuota(quotaSnapshot.data(), claimed.reservedBytes);
          transaction.update(assetRef, {
            status: "expired",
            expiredAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });
          transaction.set(mediaDb().collection("mediaUploadQuotas").doc(claimed.ownerUid), {
            ...quota, updatedAt: FieldValue.serverTimestamp(),
          });
        });
        await auditMediaAccess({
          actorUid: claimed.ownerUid,
          mediaId: candidate.id,
          action: "media_upload_intent_expired",
          outcome: "success",
          objectPath: claimed.objectPath,
        });
        reclaimed += 1;
      } catch (error) {
        // Keep the cleanup claim so the next scheduled sweep retries safely.
        await auditMediaAccess({
          actorUid: claimed.ownerUid,
          mediaId: candidate.id,
          action: "media_upload_intent_expired",
          outcome: "retry_required",
          failureCode: error instanceof Error ? error.name : "cleanup_error",
        });
        throw error;
      }
    }
    return { reclaimed };
  },
);


/**
 * Authenticated owner-only attachment stream. Unlike a signed URL, the object
 * path is never turned into a bearer URL or placed in browser history/query
 * strings. App Check, revocation-aware ID-token verification, owner claim and
 * recent MFA are all mandatory. Content is forced to octet-stream/attachment.
 */
export const ownerMediaInspectionStream = onRequest(
  { cors: false, maxInstances: 5, memory: "512MiB", timeoutSeconds: 120 },
  async (request, response) => {
    if (request.method !== "POST") {
      response.set("Allow", "POST").status(405).end();
      return;
    }
    const authorization = request.get("authorization") ?? "";
    const match = /^Bearer ([A-Za-z0-9._-]+)$/.exec(authorization);
    const appCheckToken = request.get("X-Firebase-AppCheck") ?? "";
    if (!match || !appCheckToken) {
      response.status(401).set("Cache-Control", "no-store").end();
      return;
    }

    let decoded;
    try {
      decoded = await getAuth().verifyIdToken(match[1], true);
      await getAppCheck().verifyToken(appCheckToken);
    } catch {
      response.status(401).set("Cache-Control", "no-store").end();
      return;
    }
    const actorUid = decoded.uid;
    try {
      requireSoleOwner({ auth: { uid: actorUid, token: decoded } });
    } catch (error) {
      await auditMediaAccess({
        actorUid,
        action: "owner_media_stream_attempt",
        outcome: "denied",
        failureCode: error instanceof HttpsError ? error.code : "permission-denied",
      });
      response.status(403).set("Cache-Control", "no-store").end();
      return;
    }

    const mediaId = typeof request.body?.mediaId === "string" ? request.body.mediaId : "";
    if (!/^[0-9a-f-]{36}$/i.test(mediaId)) {
      await auditMediaAccess({
        actorUid, action: "owner_media_stream_attempt",
        outcome: "denied", failureCode: "invalid-media-id",
      });
      response.status(400).set("Cache-Control", "no-store").end();
      return;
    }

    try {
      const snapshot = await mediaDb().collection("mediaAssets").doc(mediaId).get();
      if (!snapshot.exists) {
        response.status(404).set("Cache-Control", "no-store").end();
        return;
      }
      const asset = snapshot.data()!;
      if (!["pending_security_scan", "security_approved"].includes(String(asset.status))) {
        response.status(409).set("Cache-Control", "no-store").end();
        return;
      }
      const file = mediaBucket().file(String(asset.objectPath));
      const [metadata] = await file.getMetadata();
      if (String(metadata.generation) !== String(asset.storageGeneration)) {
        response.status(409).set("Cache-Control", "no-store").end();
        return;
      }
      await auditMediaAccess({
        actorUid,
        mediaId,
        action: "owner_media_stream_started",
        outcome: "success",
        storageGeneration: String(asset.storageGeneration),
      });
      response.status(200);
      response.set({
        "Content-Type": "application/octet-stream",
        "Content-Disposition": "attachment; filename=\"mawadda-owner-inspection.bin\"",
        "Content-Length": String(metadata.size),
        "Cache-Control": "private, no-store, max-age=0",
        "Pragma": "no-cache",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
        "Referrer-Policy": "no-referrer",
      });
      await pipeline(file.createReadStream({ validation: "crc32c" }), response);
    } catch (error) {
      await auditMediaAccess({
        actorUid,
        mediaId,
        action: "owner_media_stream_result",
        outcome: "failed",
        failureCode: error instanceof Error ? error.name : "stream_error",
      });
      if (!response.headersSent) response.status(500).set("Cache-Control", "no-store").end();
      else response.destroy(error instanceof Error ? error : undefined);
    }
  },
);
