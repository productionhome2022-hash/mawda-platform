const test = require("node:test");
const assert = require("node:assert/strict");

// Import the callable module before initializeApp(). This intentionally guards
// against eager Admin SDK access during the Functions entry-point import phase.
const {
  createMediaUploadIntent,
  listOwnerMediaAssets,
  finalizeMediaUpload,
  getOwnerMediaInspectionUrl,
  ownerMediaInspectionStream,
  getOwnerMediaSafePreview,
} = require("../../lib/media");

const { initializeApp, getApps } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");
const { randomUUID } = require("node:crypto");

if (getApps().length === 0) {
  initializeApp({ projectId: "demo-mawda-media", storageBucket: "demo-mawda-media.appspot.com" });
}
const db = getFirestore();

function ownerRequest(uid, data = {}) {
  return {
    data,
    auth: {
      uid,
      token: {
        platformOwner: true,
        auth_time: Math.floor(Date.now() / 1000),
        firebase: { sign_in_provider: "password", sign_in_second_factor: "phone" },
      },
    },
  };
}

function memberRequest(uid, provider = "password") {
  return {
    data: { status: "pending_security_scan", uploaderType: "all" },
    auth: {
      uid,
      token: {
        auth_time: Math.floor(Date.now() / 1000),
        firebase: { sign_in_provider: provider },
      },
    },
  };
}

async function reserveFixtureQuota(uid, bytes) {
  await db.collection("mediaUploadQuotas").doc(uid).set({
    activeUploads: 1,
    activeBytes: bytes,
    dailyBytes: bytes,
    dailyWindow: new Date().toISOString().slice(0, 10),
  });
}

async function auditEvents(uid) {
  const snapshot = await db.collection("mediaAccessAudit")
    .where("actorUid", "==", uid)
    .get();
  return snapshot.docs.map((doc) => doc.data());
}

test("owner media listing succeeds and writes a success audit event", async () => {
  const uid = `owner-${Date.now()}-${Math.random()}`;
  const result = await listOwnerMediaAssets.run(ownerRequest(uid));
  assert.deepEqual(result.assets, []);
  assert.equal(result.hasMore, false);
  const events = await auditEvents(uid);
  assert.ok(events.some((event) =>
    event.action === "owner_media_asset_listed" && event.outcome === "success"));
});

for (const [label, request] of [
  ["ordinary member", (uid) => memberRequest(uid)],
  ["anonymous guest", (uid) => memberRequest(uid, "anonymous")],
  ["owner with stale MFA", (uid) => ({
    ...ownerRequest(uid),
    auth: {
      ...ownerRequest(uid).auth,
      token: {
        ...ownerRequest(uid).auth.token,
        auth_time: Math.floor(Date.now() / 1000) - 16 * 60,
      },
    },
  })],
]) {
  test(`${label} is denied and the denial is audited`, async () => {
    const uid = `${label.replace(/[^a-z]/gi, "-")}-${Date.now()}-${Math.random()}`;
    await assert.rejects(
      () => listOwnerMediaAssets.run(request(uid)),
      (error) => error && error.code === "permission-denied",
    );
    const events = await auditEvents(uid);
    assert.ok(events.some((event) =>
      event.action === "owner_media_asset_list_attempt" &&
      event.outcome === "denied" &&
      event.failureCode === "permission-denied"));
  });
}

test("owner invalid filters are rejected and audited", async () => {
  const uid = `owner-invalid-filter-${Date.now()}-${Math.random()}`;
  await assert.rejects(
    () => listOwnerMediaAssets.run(ownerRequest(uid, { uploaderType: "guest;member" })),
    (error) => error && error.code === "invalid-argument",
  );
  const events = await auditEvents(uid);
  assert.ok(events.some((event) =>
    event.action === "owner_media_asset_list_attempt" &&
    event.outcome === "denied" &&
    event.failureCode === "invalid-uploader-type"));
});

test("finalize callable accepts a matching quarantined PNG and audits the result", async () => {
  const uid = `uploader-${Date.now()}-${Math.random()}`;
  const mediaId = randomUUID();
  const objectPath = `quarantine/${uid}/${mediaId}`;
  const bytes = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0x00,0x00,0x00,0x00]);
  await reserveFixtureQuota(uid, bytes.length);
  await db.collection("mediaAssets").doc(mediaId).create({
    mediaId, ownerUid: uid, objectPath, uploaderType: "member",
    declaredContentType: "image/png", declaredSizeBytes: bytes.length,
    status: "upload_authorized",
  });
  await getStorage().bucket().file(objectPath).save(bytes, {
    metadata: { contentType: "image/png" },
  });

  const result = await finalizeMediaUpload.run({
    data: { mediaId },
    auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
  });
  assert.equal(result.status, "pending_security_scan");
  const asset = await db.collection("mediaAssets").doc(mediaId).get();
  assert.equal(asset.data().status, "pending_security_scan");
  assert.ok((await auditEvents(uid)).some((event) =>
    event.action === "media_upload_validation" && event.outcome === "pending_security_scan"));
});

test("finalize callable rejects and deletes a file whose bytes contradict its declared type", async () => {
  const uid = `uploader-invalid-${Date.now()}-${Math.random()}`;
  const mediaId = randomUUID();
  const objectPath = `quarantine/${uid}/${mediaId}`;
  const bytes = Buffer.from("MZ executable");
  await db.collection("mediaAssets").doc(mediaId).create({
    mediaId, ownerUid: uid, objectPath, uploaderType: "member",
    declaredContentType: "image/png", declaredSizeBytes: bytes.length,
    status: "upload_authorized",
  });
  await reserveFixtureQuota(uid, bytes.length);
  const file = getStorage().bucket().file(objectPath);
  await file.save(bytes, { metadata: { contentType: "image/png" } });

  await assert.rejects(
    () => finalizeMediaUpload.run({
      data: { mediaId },
      auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
    }),
    (error) => error && error.code === "invalid-argument",
  );
  const asset = await db.collection("mediaAssets").doc(mediaId).get();
  assert.equal(asset.data().status, "rejected");
  const [exists] = await file.exists();
  assert.equal(exists, false);
  assert.ok((await auditEvents(uid)).some((event) =>
    event.action === "media_upload_validation" && event.outcome === "rejected"));
});

test("upload intent reserves per-user quota atomically and audits the capability issuance", async () => {
  const uid = `quota-uploader-${Date.now()}-${Math.random()}`;
  const result = await createMediaUploadIntent.run({
    data: { originalName: "quota.png", contentType: "image/png", sizeBytes: 1024, purpose: "profile_album" },
    auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
  });
  assert.equal(typeof result.mediaId, "string");
  assert.equal(typeof result.uploadUrl, "string");
  assert.ok(result.uploadUrl.startsWith("http"));
  const quota = await db.collection("mediaUploadQuotas").doc(uid).get();
  assert.equal(quota.data().activeUploads, 1);
  assert.equal(quota.data().activeBytes, 1024);
  const asset = await db.collection("mediaAssets").doc(result.mediaId).get();
  assert.equal(asset.data().status, "upload_authorized");
  assert.equal(asset.data().purpose, "profile_album");
  assert.equal(asset.data().retentionPolicyStatus, "owner_approval_required");
  assert.equal(asset.data().retentionExpiresAt, null);
  assert.ok((await auditEvents(uid)).some((event) =>
    event.action === "media_upload_intent_created" && event.outcome === "success"));
});

test("upload intent rejects a user who has exhausted the concurrent upload quota", async () => {
  const uid = `quota-exhausted-${Date.now()}-${Math.random()}`;
  await db.collection("mediaUploadQuotas").doc(uid).set({
    activeUploads: 5, activeBytes: 1024, dailyBytes: 1024,
    dailyWindow: new Date().toISOString().slice(0, 10),
  });
  await assert.rejects(
    () => createMediaUploadIntent.run({
      data: { originalName: "blocked.png", contentType: "image/png", sizeBytes: 1024, purpose: "profile_album" },
      auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
    }),
    (error) => error && error.code === "resource-exhausted",
  );
});


test("signed upload URL performs a real Storage Emulator HTTP PUT and rejects replay", async () => {
  const uid = `http-upload-${Date.now()}-${Math.random()}`;
  const png = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0x00,0x00,0x00,0x00]);
  const intent = await createMediaUploadIntent.run({
    data: { originalName: "http-check.png", contentType: "image/png", sizeBytes: png.length, purpose: "chat" },
    auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
  });

  const firstPut = await fetch(intent.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "image/png" },
    body: png,
  });
  assert.equal(firstPut.status, 200, await firstPut.text());

  const replayPut = await fetch(intent.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "image/png" },
    body: png,
  });
  assert.ok([400, 403, 412].includes(replayPut.status),
    `Expected create-only replay rejection, received HTTP ${replayPut.status}`);

  const finalized = await finalizeMediaUpload.run({
    data: { mediaId: intent.mediaId },
    auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
  });
  assert.equal(finalized.status, "pending_security_scan");
  const asset = await db.collection("mediaAssets").doc(intent.mediaId).get();
  assert.ok(asset.data().storageGeneration);
});

test("legacy owner inspection URL is disabled; the authenticated streaming endpoint rejects missing credentials", async () => {
  const uid = `http-owner-disabled-${Date.now()}-${Math.random()}`;
  await assert.rejects(
    () => getOwnerMediaInspectionUrl.run(ownerRequest(uid, {
      mediaId: "123e4567-e89b-12d3-a456-426614174000",
    })),
    (error) => error && error.code === "failed-precondition",
  );

  const response = {
    statusCode: 200,
    headers: {},
    status(code) { this.statusCode = code; return this; },
    set(name, value) { this.headers[name.toLowerCase()] = value; return this; },
    end() { this.ended = true; return this; },
  };
  await ownerMediaInspectionStream({
    method: "POST",
    get: () => "",
    body: { mediaId: "123e4567-e89b-12d3-a456-426614174000" },
  }, response);
  assert.equal(response.statusCode, 401);
  assert.equal(response.headers["cache-control"], "no-store");
  assert.equal(response.ended, true);
});


test("owner receives only a hash-verified WebP derivative and never a Storage URL", async () => {
  const uid = `safe-preview-owner-${Date.now()}-${Math.random()}`;
  const mediaId = randomUUID();
  const objectPath = `quarantine/uploader/${mediaId}`;
  const previewPath = `processed/uploader/${mediaId}/preview.webp`;
  const sourceGeneration = "1740000000000000";
  const previewBytes = Buffer.from("RIFF0000WEBP-safe-preview-fixture");
  const previewFile = getStorage().bucket().file(previewPath);
  await previewFile.save(previewBytes, {
    metadata: {
      contentType: "image/webp",
      metadata: {
        mediaId,
        sourceGeneration,
        scannerProvider: "clamav-mawadda-gateway",
        processing: "sharp-decode-reencode-v1",
      },
    },
  });
  const [previewMetadata] = await previewFile.getMetadata();
  const { createHash } = require("node:crypto");
  const safePreviewSha256 = createHash("sha256").update(previewBytes).digest("hex");
  await db.collection("mediaAssets").doc(mediaId).create({
    mediaId,
    ownerUid: "uploader",
    objectPath,
    storageGeneration: sourceGeneration,
    status: "security_approved",
    scannerProvider: "clamav-mawadda-gateway",
    detectedContentType: "image/png",
    safePreviewPath: previewPath,
    safePreviewGeneration: String(previewMetadata.generation),
    safePreviewSha256,
    safePreviewContentType: "image/webp",
  });

  const result = await getOwnerMediaSafePreview.run(ownerRequest(uid, { mediaId }));
  assert.equal(result.contentType, "image/webp");
  assert.equal(result.sizeBytes, previewBytes.length);
  assert.deepEqual(Buffer.from(result.imageBase64, "base64"), previewBytes);
  assert.equal("downloadUrl" in result, false);
  assert.ok((await auditEvents(uid)).some((event) =>
    event.action === "owner_media_safe_preview" && event.outcome === "success"));
});

test("safe preview rejects stale generations and never falls back to original quarantine bytes", async () => {
  const uid = `safe-preview-stale-${Date.now()}-${Math.random()}`;
  const mediaId = randomUUID();
  const previewPath = `processed/uploader/${mediaId}/preview.webp`;
  const bytes = Buffer.from("RIFF0000WEBP-safe-preview-fixture");
  const file = getStorage().bucket().file(previewPath);
  await file.save(bytes, {
    metadata: {
      contentType: "image/webp",
      metadata: {
        mediaId,
        sourceGeneration: "10",
        scannerProvider: "clamav-mawadda-gateway",
      },
    },
  });
  await db.collection("mediaAssets").doc(mediaId).create({
    mediaId, ownerUid: "uploader", objectPath: `quarantine/uploader/${mediaId}`,
    storageGeneration: "10", status: "security_approved",
    scannerProvider: "clamav-mawadda-gateway", detectedContentType: "image/png",
    safePreviewPath: previewPath, safePreviewGeneration: "1",
    safePreviewSha256: "a".repeat(64), safePreviewContentType: "image/webp",
  });
  await assert.rejects(
    () => getOwnerMediaSafePreview.run(ownerRequest(uid, { mediaId })),
    (error) => error && error.code === "failed-precondition",
  );
});

test("scheduled cleanup deletes abandoned quarantine objects and releases active quota", async () => {
  const uid = `abandoned-${Date.now()}-${Math.random()}`;
  const mediaId = randomUUID();
  const objectPath = `quarantine/${uid}/${mediaId}`;
  const reservedBytes = 2048;
  await db.collection("mediaUploadQuotas").doc(uid).set({
    activeUploads: 1,
    activeBytes: reservedBytes,
    dailyBytes: reservedBytes,
    dailyWindow: new Date().toISOString().slice(0, 10),
  });
  await db.collection("mediaAssets").doc(mediaId).create({
    mediaId, ownerUid: uid, objectPath, originalName: "abandoned.png",
    declaredContentType: "image/png", declaredSizeBytes: reservedBytes,
    status: "upload_authorized",
    createdAt: Timestamp.fromMillis(Date.now() - 30 * 60 * 1000),
  });
  const file = getStorage().bucket().file(objectPath);
  await file.save(Buffer.from("abandoned upload"), {
    metadata: { contentType: "image/png" },
  });

  await cleanupExpiredMediaUploadIntents.run();

  const asset = await db.collection("mediaAssets").doc(mediaId).get();
  assert.equal(asset.data().status, "expired");
  const [exists] = await file.exists();
  assert.equal(exists, false);
  const quota = await db.collection("mediaUploadQuotas").doc(uid).get();
  assert.equal(quota.data().activeUploads, 0);
  assert.equal(quota.data().activeBytes, 0);
  assert.equal(quota.data().dailyBytes, reservedBytes);
  assert.ok((await auditEvents(uid)).some((event) =>
    event.action === "media_upload_intent_expired" && event.outcome === "success"));
});


test("finalization rejects an HTTP-uploaded object larger than its quota reservation", async () => {
  const uid = `http-size-mismatch-${Date.now()}-${Math.random()}`;
  const png = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0x00,0x00,0x00,0x00]);
  const intent = await createMediaUploadIntent.run({
    data: { originalName: "oversized.png", contentType: "image/png", sizeBytes: 8, purpose: "chat" },
    auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
  });
  const put = await fetch(intent.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "image/png" },
    body: png,
  });
  assert.equal(put.status, 200, await put.text());
  await assert.rejects(
    () => finalizeMediaUpload.run({
      data: { mediaId: intent.mediaId },
      auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
    }),
    (error) => error && error.code === "invalid-argument",
  );
  const asset = await db.collection("mediaAssets").doc(intent.mediaId).get();
  assert.equal(asset.data().status, "rejected");
  assert.equal(asset.data().rejectionCode, "CONTENT_TYPE_SIZE_OR_SIGNATURE_MISMATCH");
  const [exists] = await getStorage().bucket().file(asset.data().objectPath).exists();
  assert.equal(exists, false);
  const quota = await db.collection("mediaUploadQuotas").doc(uid).get();
  assert.equal(quota.data().activeUploads, 0);
  assert.equal(quota.data().activeBytes, 0);
});
