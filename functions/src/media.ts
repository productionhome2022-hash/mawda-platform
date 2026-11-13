import { randomUUID } from "node:crypto";
import { FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { HttpsError, onCall, onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { createHash } from "node:crypto";
import { verifyScannerWebhook, validateScannerVerdict } from "./media-scanner";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { defineSecret, defineString } from "firebase-functions/params";
import { hasPlatformOwnerSession } from "./owner-access";
import { reserveMediaQuota, releaseMediaQuota } from "./media-quota";
import { MEDIA_UPLOAD_CLEANUP_GRACE_MS, uploadIntentIsEligibleForCleanup } from "./media-cleanup";
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
const mediaScannerHmacSecret = defineSecret("MAWDA_MEDIA_SCANNER_HMAC_SECRET");
const mediaScannerBearerToken = defineSecret("MAWDA_MEDIA_SCANNER_BEARER_TOKEN");
const mediaScannerUrl = defineString("MAWDA_MEDIA_SCANNER_URL");
const mediaScannerCallbackUrl = defineString("MAWDA_MEDIA_SCANNER_CALLBACK_URL");
const mediaScannerProvider = defineString("MAWDA_MEDIA_SCANNER_PROVIDER", {
  default: "mawadda-malware-gateway",
});

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

/** Minimal HTTP contract keeps the scanner callback directly integration-testable. */
interface MediaScanCallbackRequest {
  method: string;
  rawBody?: Buffer;
  get(name: string): string | undefined;
}
interface MediaScanCallbackResponse {
  status(code: number): MediaScanCallbackResponse;
  set(name: string, value: string): MediaScanCallbackResponse;
  send(body: string): MediaScanCallbackResponse;
  json(body: Record<string, unknown>): MediaScanCallbackResponse;
}

/** Authenticated gateway callback; any missing/mismatched evidence stays quarantined. */
export async function handleMediaScanVerdict(
  request: MediaScanCallbackRequest,
  response: MediaScanCallbackResponse,
): Promise<void> {
  if (request.method !== "POST") {
    response.status(405).set("Allow", "POST").send("Method not allowed");
    return;
  }
  const rawBody = request.rawBody;
  const secret = mediaScannerHmacSecret.value();
  const provider = mediaScannerProvider.value();
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
  if (verdict.verdict === "error") {
    await auditMediaAccess({
      actorUid: "trusted-scanner",
      mediaId: verdict.mediaId,
      action: "media_security_scan_verdict",
      outcome: "error",
      provider: verdict.provider,
      engine: verdict.engine,
      engineVersion: verdict.engineVersion,
      signatureVersion: verdict.signatureVersion,
      objectGeneration: verdict.objectGeneration,
      sha256: verdict.sha256,
    });
    response.status(503).send("Scanner reported an error; retry required");
    return;
  }
  const db = mediaDb();
  const assetRef = db.collection("mediaAssets").doc(verdict.mediaId);
  const snapshot = await assetRef.get();
  if (!snapshot.exists) {
    response.status(404).send("Asset does not exist");
    return;
  }
  const asset = snapshot.data()!;
  const expectedObjectPath = `quarantine/${String(asset.ownerUid)}/${verdict.mediaId}`;
  if (asset.objectPath !== expectedObjectPath) {
    response.status(409).send("Quarantined object path mismatch");
    return;
  }
  const file = mediaBucket().file(expectedObjectPath);
  if (asset.status !== "pending_security_scan") {
    const duplicate = asset.scannerObjectGeneration === verdict.objectGeneration &&
      asset.scannerSha256 === verdict.sha256 && asset.scannerVerdict === verdict.verdict &&
      ((verdict.verdict === "clean" && asset.status === "security_approved") ||
       (verdict.verdict === "malicious" && asset.status === "rejected"));
    if (!duplicate) {
      response.status(409).send("Asset is not awaiting this scan verdict");
      return;
    }
    if (verdict.verdict === "malicious") {
      await file.delete({ ignoreNotFound: true, ifGenerationMatch: Number(verdict.objectGeneration) });
    }
    response.status(200).json({ mediaId: verdict.mediaId, status: asset.status, duplicate: true });
    return;
  }
  let metadata: Record<string, unknown>;
  try {
    const [rawMetadata] = await file.getMetadata();
    metadata = rawMetadata as unknown as Record<string, unknown>;
  } catch {
    response.status(409).send("Quarantined object is missing");
    return;
  }
  if (String(metadata.generation) !== verdict.objectGeneration ||
      String(asset.storageGeneration) !== verdict.objectGeneration ||
      Number(metadata.size) !== Number(asset.sizeBytes) ||
      String(metadata.contentType) !== String(asset.detectedContentType ?? asset.declaredContentType)) {
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
      scannerEngine: verdict.engine,
      scannerEngineVersion: verdict.engineVersion,
      scannerSignatureVersion: verdict.signatureVersion,
      scannerVerdict: verdict.verdict,
      scannerSha256: actualHash,
      scannerObjectGeneration: verdict.objectGeneration,
      scannerScannedAt: new Date(verdict.scannedAtMs),
      scannerVerifiedAt: FieldValue.serverTimestamp(),
      ...(verdict.verdict === "malicious" ? { rejectionCode: "MALWARE_DETECTED" } : {}),
      updatedAt: FieldValue.serverTimestamp(),
    });
    const auditRef = db.collection("mediaAccessAudit").doc();
    transaction.create(auditRef, {
      actorUid: "trusted-scanner",
      mediaId: verdict.mediaId,
      action: "media_security_scan_verdict",
      outcome: verdict.verdict,
      provider: verdict.provider,
      engine: verdict.engine,
      engineVersion: verdict.engineVersion,
      signatureVersion: verdict.signatureVersion,
      objectGeneration: verdict.objectGeneration,
      sha256: actualHash,
      createdAt: FieldValue.serverTimestamp(),
    });
  });
  if (verdict.verdict === "malicious") {
    await file.delete({ ignoreNotFound: true, ifGenerationMatch: Number(verdict.objectGeneration) });
  }
  response.status(200).json({ mediaId: verdict.mediaId, status: nextStatus });
}

export const receiveMediaScanVerdict = onRequest(
  { secrets: [mediaScannerHmacSecret], timeoutSeconds: 180, memory: "1GiB", maxInstances: 5 },
  handleMediaScanVerdict,
);

/**
 * Sends each newly quarantined asset to the isolated Cloud Run scanner. IAM
 * identity tokens protect the service invocation; a separate rotated secret
 * provides application-level defense in depth. Failed scans are retried.
 */
async function getScannerIdentityToken(audience: string): Promise<string> {
  const endpoint = new URL("http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity");
  endpoint.searchParams.set("audience", audience);
  endpoint.searchParams.set("format", "full");
  const tokenResponse = await fetch(endpoint, {
    headers: { "Metadata-Flavor": "Google" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!tokenResponse.ok) throw new Error("SCANNER_IDENTITY_TOKEN_UNAVAILABLE");
  const token = await tokenResponse.text();
  if (!token) throw new Error("SCANNER_IDENTITY_TOKEN_EMPTY");
  return token;
}

export const dispatchMediaSecurityScan = onDocumentUpdated(
  {
    document: "mediaAssets/{mediaId}",
    retry: true,
    memory: "1GiB",
    timeoutSeconds: 540,
    maxInstances: 2,
    secrets: [mediaScannerBearerToken],
  },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after || before.status === "pending_security_scan" ||
        after.status !== "pending_security_scan") return;

    const mediaId = event.params.mediaId;
    // A previous delivery may have completed the callback even if the
    // gateway response was lost. Never rescan an already-terminal asset.
    const latestAsset = await mediaDb().collection("mediaAssets").doc(mediaId).get();
    if (!latestAsset.exists || latestAsset.data()?.status !== "pending_security_scan") return;
    const ownerUid = String(after.ownerUid ?? "");
    const objectPath = String(after.objectPath ?? "");
    if (!ownerUid || objectPath !== `quarantine/${ownerUid}/${mediaId}`) {
      throw new Error("SCANNER_OBJECT_PATH_INVALID");
    }
    const scannerUrl = new URL(mediaScannerUrl.value());
    const callbackUrl = new URL(mediaScannerCallbackUrl.value());
    if (scannerUrl.protocol !== "https:" || callbackUrl.protocol !== "https:" ||
        !scannerUrl.pathname.endsWith("/scan")) {
      throw new Error("SCANNER_ENDPOINT_CONFIGURATION_INVALID");
    }
    const bearerToken = mediaScannerBearerToken.value();
    if (!bearerToken || bearerToken.length < 32) {
      throw new Error("SCANNER_BEARER_SECRET_NOT_CONFIGURED");
    }

    const file = mediaBucket().file(objectPath);
    const [metadata] = await file.getMetadata();
    const generation = String(metadata.generation);
    const policy = mediaPolicyFor(String(after.declaredContentType));
    const actualSize = Number(metadata.size);
    if (!policy || generation !== String(after.storageGeneration) ||
        actualSize !== Number(after.sizeBytes) || actualSize <= 0 ||
        actualSize > policy.maxBytes ||
        String(metadata.contentType) !== String(after.declaredContentType)) {
      throw new Error("SCANNER_OBJECT_METADATA_MISMATCH");
    }
    const [bytes] = await file.download();
    if (bytes.length !== actualSize) throw new Error("SCANNER_OBJECT_LENGTH_MISMATCH");
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    const identityToken = await getScannerIdentityToken(scannerUrl.origin);
    const scannerResponse = await fetch(scannerUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${identityToken}`,
        "X-Mawadda-Scanner-Token": bearerToken,
        "X-Mawadda-Media-Id": mediaId,
        "X-Mawadda-Object-Generation": generation,
        "X-Mawadda-Expected-SHA256": sha256,
        "X-Mawadda-Provider": mediaScannerProvider.value(),
        "X-Mawadda-Callback-URL": callbackUrl.toString(),
        "Content-Type": "application/octet-stream",
      },
      body: bytes,
      signal: AbortSignal.timeout(510_000),
    });
    if (!scannerResponse.ok) {
      throw new Error(`SCANNER_GATEWAY_HTTP_${scannerResponse.status}`);
    }
  },
);


export const createMediaUploadIntent = onCall(async (request) => {
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

  let uploadUrl: string;
  try {
    const [signedUrl] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: expiresAt,
      contentType: input.contentType,
      // Create-only precondition: a replay cannot overwrite the first object generation.
      queryParams: { ifGenerationMatch: "0" },
    });
    uploadUrl = signedUrl;
  } catch {
    // A signer outage must not strand a quota reservation or leave a usable intent.
    await mediaDb().runTransaction(async (transaction) => {
      const [latestAsset, quotaSnapshot] = await Promise.all([
        transaction.get(assetRef),
        transaction.get(quotaRef),
      ]);
      if (!latestAsset.exists || latestAsset.data()?.status !== "upload_authorized") return;
      const reservation = releaseMediaQuota(quotaSnapshot.data(), input.declaredSizeBytes);
      transaction.update(assetRef, {
        status: "upload_authorization_failed",
        failureCode: "SIGNED_URL_ISSUANCE_FAILED",
        updatedAt: FieldValue.serverTimestamp(),
      });
      transaction.set(quotaRef, { ...reservation, updatedAt: FieldValue.serverTimestamp() });
      const auditRef = mediaDb().collection("mediaAccessAudit").doc();
      transaction.create(auditRef, {
        actorUid: uid,
        mediaId,
        action: "media_upload_intent_signing",
        outcome: "failed",
        failureCode: "SIGNED_URL_ISSUANCE_FAILED",
        createdAt: FieldValue.serverTimestamp(),
      });
    });
    throw new HttpsError("unavailable", "تعذر إنشاء رابط رفع آمن. حاول مرة أخرى لاحقاً.");
  }

  await auditMediaAccess({
    actorUid: uid,
    mediaId,
    action: "media_upload_intent_created",
    outcome: "success",
    objectPath,
    declaredContentType: input.contentType,
    declaredSizeBytes: input.declaredSizeBytes,
  });
  return { mediaId, uploadUrl, expiresAt };
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
export const getOwnerMediaInspectionUrl = onCall(async (request) => {
  const actorUid = await requireSoleOwnerForMediaReview(request, "owner_media_inspection_attempt");
  const mediaId = typeof request.data?.mediaId === "string" ? request.data.mediaId : "";
  try {
    if (!/^[0-9a-f-]{36}$/i.test(mediaId)) {
      throw new HttpsError("invalid-argument", "معرف الملف غير صالح.");
    }
    const assetRef = mediaDb().collection("mediaAssets").doc(mediaId);
    const snapshot = await assetRef.get();
    if (!snapshot.exists) throw new HttpsError("not-found", "الملف غير موجود.");
    const asset = snapshot.data()!;
    if (!["pending_security_scan", "security_approved"].includes(String(asset.status))) {
      throw new HttpsError("failed-precondition", "الملف غير متاح للفحص في حالته الحالية.");
    }
    const file = mediaBucket().file(String(asset.objectPath));
    const [metadata] = await file.getMetadata();
    if (String(metadata.generation) !== String(asset.storageGeneration)) {
      throw new HttpsError("failed-precondition", "تغير إصدار الملف؛ أوقف الوصول احترازياً.");
    }
    const expiresAt = mediaSignedUrlExpiresAt("owner-inspection");
    const [downloadUrl] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: expiresAt,
      responseDisposition: "attachment",
    });
    await auditMediaAccess({
      actorUid,
      mediaId,
      action: "owner_media_inspection_url_issued",
      outcome: "success",
      objectPath: asset.objectPath,
      storageGeneration: String(asset.storageGeneration),
      expiresAt: new Date(expiresAt),
    });
    return { mediaId, downloadUrl, expiresAt };
  } catch (error) {
    // Every authenticated owner inspection attempt is recorded, including invalid,
    // missing, stale-generation and storage failures. Audit failure blocks the call.
    await auditMediaAccess({
      actorUid,
      mediaId: mediaId || null,
      action: "owner_media_inspection_result",
      outcome: "denied_or_failed",
      failureCode: error instanceof HttpsError ? error.code : "storage_or_internal_error",
    });
    throw error;
  }
});


/**
 * Reclaims abandoned upload reservations only after the signed PUT capability
 * expiry plus a 30-minute grace period. A transactional state claim prevents
 * cleanup/finalize races; exact object paths and generations are checked.
 */
export const cleanupExpiredMediaUploadIntents = onSchedule(
  { schedule: "every 15 minutes", timeZone: "UTC", retryCount: 3 },
  async () => {
    const nowMs = Date.now();
    const assets = mediaDb().collection("mediaAssets");
    const [authorized, retrying] = await Promise.all([
      assets.where("status", "==", "upload_authorized")
        .orderBy("createdAt").limit(100).get(),
      assets.where("status", "==", "expired_cleanup_in_progress")
        .orderBy("createdAt").limit(100).get(),
    ]);
    const candidates = new Map<string, (typeof authorized.docs)[number]>();
    for (const doc of retrying.docs) candidates.set(doc.id, doc);
    for (const doc of authorized.docs) {
      const expiry = doc.data().uploadUrlExpiresAt;
      const expiryMs = expiry instanceof Timestamp ? expiry.toMillis() :
        expiry instanceof Date ? expiry.getTime() : Number.NaN;
      if (Number.isSafeInteger(expiryMs) &&
          uploadIntentIsEligibleForCleanup(expiryMs, nowMs, MEDIA_UPLOAD_CLEANUP_GRACE_MS)) {
        candidates.set(doc.id, doc);
      }
    }

    let reclaimed = 0;
    for (const candidate of candidates.values()) {
      const assetRef = candidate.ref;
      const claimed = await mediaDb().runTransaction(async (transaction) => {
        const current = await transaction.get(assetRef);
        const data = current.data();
        if (!current.exists || !data) return null;
        if (data.status === "upload_authorized") {
          const expiry = data.uploadUrlExpiresAt;
          const expiryMs = expiry instanceof Timestamp ? expiry.toMillis() :
            expiry instanceof Date ? expiry.getTime() : Number.NaN;
          if (!Number.isSafeInteger(expiryMs) ||
              !uploadIntentIsEligibleForCleanup(expiryMs, nowMs, MEDIA_UPLOAD_CLEANUP_GRACE_MS)) {
            return null;
          }
        } else if (data.status !== "expired_cleanup_in_progress") {
          return null;
        }

        const ownerUid = typeof data.ownerUid === "string" ? data.ownerUid : "";
        const objectPath = typeof data.objectPath === "string" ? data.objectPath : "";
        const reservedBytes = Number(data.declaredSizeBytes);
        if (!ownerUid || objectPath !== `quarantine/${ownerUid}/${candidate.id}` ||
            !Number.isSafeInteger(reservedBytes) || reservedBytes <= 0) {
          throw new HttpsError("failed-precondition", "Abandoned upload metadata failed integrity checks.");
        }
        if (data.status === "upload_authorized") {
          transaction.update(assetRef, {
            status: "expired_cleanup_in_progress",
            cleanupStartedAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
        return { ownerUid, objectPath, reservedBytes };
      });
      if (!claimed) continue;

      try {
        const file = mediaBucket().file(claimed.objectPath);
        let generation: number | null = null;
        try {
          const [metadata] = await file.getMetadata();
          generation = Number(metadata.generation);
          if (!Number.isSafeInteger(generation) || generation <= 0) {
            throw new Error("INVALID_STORAGE_GENERATION");
          }
        } catch (error) {
          const code = (error as { code?: number | string })?.code;
          if (code !== 404 && code !== "404") throw error;
        }
        if (generation !== null) {
          await file.delete({ ignoreNotFound: true, ifGenerationMatch: generation });
        }

        await mediaDb().runTransaction(async (transaction) => {
          const quotaRef = mediaDb().collection("mediaUploadQuotas").doc(claimed.ownerUid);
          const [current, quotaSnapshot] = await Promise.all([
            transaction.get(assetRef),
            transaction.get(quotaRef),
          ]);
          if (!current.exists || current.data()?.status !== "expired_cleanup_in_progress") return;
          const quota = releaseMediaQuota(quotaSnapshot.data(), claimed.reservedBytes);
          transaction.update(assetRef, {
            status: "expired",
            cleanupObjectGeneration: generation === null ? null : String(generation),
            expiredAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });
          transaction.set(quotaRef, { ...quota, updatedAt: FieldValue.serverTimestamp() });
          const auditRef = mediaDb().collection("mediaAccessAudit").doc();
          transaction.create(auditRef, {
            actorUid: claimed.ownerUid,
            mediaId: candidate.id,
            action: "media_upload_intent_expired",
            outcome: "success",
            objectPath: claimed.objectPath,
            objectGeneration: generation === null ? null : String(generation),
            createdAt: FieldValue.serverTimestamp(),
          });
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
    logger.info("Media upload cleanup completed", { reclaimed });
  },
);
