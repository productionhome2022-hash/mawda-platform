const test = require("node:test");
const { after } = require("node:test");
const assert = require("node:assert/strict");

// Configure the Admin Storage SDK before importing any module that loads it.
// The emulator listens on plain HTTP even when the CLI host variable carries a scheme.
const rawStorageEmulatorHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST ?? "127.0.0.1:9199";
const storageEmulatorHost = rawStorageEmulatorHost.replace("https://", "").replace("http://", "");
process.env.STORAGE_EMULATOR_HOST = `http://${storageEmulatorHost}`;
const { EventEmitter } = require("node:events");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { generateKeyPairSync } = require("node:crypto");

// Import the callable module before initializeApp(). This intentionally guards
// against eager Admin SDK access during the Functions entry-point import phase.
const {
  createMediaUploadIntent,
  listOwnerMediaAssets,
  finalizeMediaUpload,
  getOwnerMediaInspectionUrl,
  ownerMediaInspectionStream,
  getOwnerMediaSafePreview,
  cleanupExpiredMediaUploadIntents,
  sendChatImageAttachment,
  getChatImageAttachmentUrl,
  sendChatMediaAttachment,
  getChatMediaAttachmentUrl,
} = require("../../lib/media");

const { createMemberStory, listMemberStories } = require("../../lib/index");
const { initializeApp, getApps } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");
const { randomUUID, createHash } = require("node:crypto");

// Signed URL generation needs a signer even when the target is the Storage Emulator.
// Generate an ephemeral, test-only service account key; never use production credentials.
const testKey = generateKeyPairSync("rsa", { modulusLength: 2048 }).privateKey
  .export({ type: "pkcs8", format: "pem" });
const testCredentialsPath = path.join(os.tmpdir(), `mawda-media-test-${process.pid}.json`);
fs.writeFileSync(testCredentialsPath, JSON.stringify({
  type: "service_account", project_id: "demo-mawda-media", private_key_id: "test-only",
  private_key: testKey,
  client_email: "firebase-adminsdk@demo-mawda-media.iam.gserviceaccount.com",
  client_id: "123456789012345678901", token_uri: "https://oauth2.googleapis.com/token",
}), { mode: 0o600 });
process.env.GOOGLE_APPLICATION_CREDENTIALS = testCredentialsPath;
after(() => { try { fs.unlinkSync(testCredentialsPath); } catch {} });

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


test("members cannot create PDF chat or room upload intents", async () => {
  for (const purpose of ["chat", "room"]) {
    const uid = `member-pdf-denied-${purpose}-${Date.now()}-${Math.random()}`;
    await assert.rejects(
      () => createMediaUploadIntent.run({
        data: { originalName: "policy.pdf", contentType: "application/pdf", sizeBytes: 12, purpose },
        auth: memberRequest(uid).auth,
      }),
      (error) => error && error.code === "permission-denied",
    );
    const assets = await db.collection("mediaAssets").where("ownerUid", "==", uid).get();
    assert.equal(assets.empty, true);
  }
});

test("only a fresh MFA-authenticated platform owner may create PDF chat and room upload intents", async () => {
  for (const purpose of ["chat", "room"]) {
    const uid = `owner-pdf-allowed-${purpose}-${Date.now()}-${Math.random()}`;
    const intent = await createMediaUploadIntent.run(ownerRequest(uid, {
      originalName: "owner-document.pdf", contentType: "application/pdf", sizeBytes: 12, purpose,
    }));
    const assetRef = db.collection("mediaAssets").doc(intent.mediaId);
    const asset = await assetRef.get();
    assert.equal(asset.data().uploaderRole, "platform_owner");
    assert.equal(asset.data().mediaPurpose, purpose);
    await Promise.all([
      assetRef.delete(),
      db.collection("mediaUploadQuotas").doc(uid).delete(),
    ]);
  }

  const staleUid = `owner-pdf-stale-mfa-${Date.now()}-${Math.random()}`;
  const stale = ownerRequest(staleUid, {
    originalName: "stale.pdf", contentType: "application/pdf", sizeBytes: 12, purpose: "chat",
  });
  stale.auth.token.auth_time -= 16 * 60;
  await assert.rejects(
    () => createMediaUploadIntent.run(stale),
    (error) => error && error.code === "permission-denied",
  );
});

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
    mediaId, ownerUid: uid, objectPath, uploaderType: "member", mediaPurpose: "profile_album",
    retentionPolicyStatus: "seven_day_profile_album",
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
  assert.equal(asset.data().retentionPolicyStatus, "seven_day_profile_album");
  assert.ok(asset.data().retentionExpiresAt instanceof Timestamp);
  assert.ok(asset.data().retentionExpiresAt.toMillis() >= Date.now() + 6 * 24 * 60 * 60 * 1000);
  assert.ok(asset.data().retentionExpiresAt.toMillis() <= Date.now() + 7 * 24 * 60 * 60 * 1000 + 5000);
  assert.ok((await auditEvents(uid)).some((event) =>
    event.action === "media_upload_validation" && event.outcome === "pending_security_scan"));
});

test("story upload requires and preserves its explicit expiry as the retention deadline", async () => {
  const uid = `story-uploader-${Date.now()}-${Math.random()}`;
  const intentExpiry = Date.now() + 60 * 60 * 1000;
  const intent = await createMediaUploadIntent.run({
    data: {
      originalName: "story.png",
      contentType: "image/png",
      sizeBytes: 12,
      purpose: "story",
      storyExpiresAtMs: intentExpiry,
    },
    auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
  });
  const assetRef = db.collection("mediaAssets").doc(intent.mediaId);
  const before = await assetRef.get();
  assert.equal(before.data().retentionPolicyStatus, "delete_at_story_expiry");
  assert.equal(before.data().storyExpiresAt.toMillis(), intentExpiry);
  const bytes = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0x00,0x00,0x00,0x00]);
  const file = getStorage().bucket().file(before.data().objectPath);
  await file.save(bytes, { metadata: { contentType: "image/png" } });

  const result = await finalizeMediaUpload.run({
    data: { mediaId: intent.mediaId },
    auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
  });
  assert.equal(result.status, "pending_security_scan");
  const after = await assetRef.get();
  assert.equal(after.data().retentionExpiresAt.toMillis(), intentExpiry);
  assert.equal(after.data().storyExpiresAt.toMillis(), intentExpiry);
  await Promise.all([
    assetRef.delete().catch(() => undefined),
    db.collection("mediaUploadQuotas").doc(uid).delete().catch(() => undefined),
    file.delete({ ignoreNotFound: true }).catch(() => undefined),
  ]);
});

test("custom avatar and cover uploads receive a 30-day expiry after validation", async () => {
  const uid = `avatar-cover-uploader-${Date.now()}-${Math.random()}`;
  const intent = await createMediaUploadIntent.run({
    data: {
      originalName: "avatar.png", contentType: "image/png", sizeBytes: 12,
      purpose: "avatar_cover",
    },
    auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
  });
  const assetRef = db.collection("mediaAssets").doc(intent.mediaId);
  const before = await assetRef.get();
  assert.equal(before.data().retentionPolicyStatus, "thirty_day_avatar_cover");
  const bytes = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0x00,0x00,0x00,0x00]);
  const file = getStorage().bucket().file(before.data().objectPath);
  await file.save(bytes, { metadata: { contentType: "image/png" } });
  const result = await finalizeMediaUpload.run({
    data: { mediaId: intent.mediaId },
    auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
  });
  assert.equal(result.status, "pending_security_scan");
  const after = await assetRef.get();
  assert.ok(after.data().retentionExpiresAt instanceof Timestamp);
  assert.ok(after.data().retentionExpiresAt.toMillis() >= Date.now() + 29 * 24 * 60 * 60 * 1000);
  await Promise.all([
    assetRef.delete().catch(() => undefined),
    db.collection("mediaUploadQuotas").doc(uid).delete().catch(() => undefined),
    file.delete({ ignoreNotFound: true }).catch(() => undefined),
  ]);
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
  assert.equal(asset.data().mediaPurpose, "profile_album");
  assert.equal(asset.data().retentionPolicyStatus, "seven_day_profile_album");
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


test("signed upload intent binds exact byte range and create-only precondition; emulator finalization succeeds", async () => {
  const uid = `http-upload-${Date.now()}-${Math.random()}`;
  const png = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0x00,0x00,0x00,0x00]);
  const intent = await createMediaUploadIntent.run({
    data: { originalName: "http-check.png", contentType: "image/png", sizeBytes: png.length, purpose: "chat" },
    auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
  });

  const signedUrl = new URL(intent.uploadUrl);
  assert.equal(signedUrl.searchParams.get("ifGenerationMatch"), "0");
  assert.equal(intent.requiredHeaders["Content-Type"], "image/png");
  assert.equal(intent.requiredHeaders["x-goog-content-length-range"], `${png.length},${png.length}`);

  // The Storage Emulator does not implement signed PUT endpoints (returns 501).
  // Exercise object creation and generation preconditions through its Admin API;
  // the opt-in real-GCS HTTP test covers the signed URL wire protocol itself.
  const assetRef = db.collection("mediaAssets").doc(intent.mediaId);
  const assetBeforeFinalize = await assetRef.get();
  const file = getStorage().bucket().file(assetBeforeFinalize.data().objectPath);
  await file.save(png, {
    resumable: false,
    preconditionOpts: { ifGenerationMatch: 0 },
    metadata: { contentType: "image/png" },
  });

  const finalized = await finalizeMediaUpload.run({
    data: { mediaId: intent.mediaId },
    auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
  });
  assert.equal(finalized.status, "pending_security_scan");
  const asset = await assetRef.get();
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

  const response = new EventEmitter();
  response.statusCode = 200;
  response.headers = {};
  response.status = function (code) { this.statusCode = code; return this; };
  response.set = function (name, value) { this.headers[name.toLowerCase()] = value; return this; };
  response.send = function (body) { this.body = body; this.ended = true; this.emit("finish"); return this; };
  response.end = function (body) { this.body = body; this.ended = true; this.emit("finish"); return this; };
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
    createdAt: Timestamp.fromMillis(Date.now() - 60 * 60 * 1000),
    uploadUrlExpiresAt: new Date(Date.now() - 55 * 60 * 1000),
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




test("missing-object cleanup retains quota until a delayed recheck confirms no late upload", async () => {
  const uid = `missing-abandoned-${Date.now()}-${Math.random()}`;
  const mediaId = randomUUID();
  const objectPath = `quarantine/${uid}/${mediaId}`;
  const reservedBytes = 1024;
  await db.collection("mediaUploadQuotas").doc(uid).set({
    activeUploads: 1,
    activeBytes: reservedBytes,
    dailyBytes: reservedBytes,
    dailyWindow: new Date().toISOString().slice(0, 10),
  });
  const assetRef = db.collection("mediaAssets").doc(mediaId);
  await assetRef.create({
    mediaId, ownerUid: uid, objectPath, originalName: "missing.png",
    declaredContentType: "image/png", declaredSizeBytes: reservedBytes,
    status: "upload_authorized",
    createdAt: Timestamp.fromMillis(Date.now() - 60 * 60 * 1000),
    uploadUrlExpiresAt: new Date(Date.now() - 55 * 60 * 1000),
  });

  await cleanupExpiredMediaUploadIntents.run();
  let asset = await assetRef.get();
  assert.equal(asset.data().status, "expired_cleanup_in_progress");
  assert.ok(asset.data().cleanupMissingObjectRecheckAt.toMillis() > Date.now());
  let quota = await db.collection("mediaUploadQuotas").doc(uid).get();
  assert.equal(quota.data().activeUploads, 1);
  assert.equal(quota.data().activeBytes, reservedBytes);

  await assetRef.update({
    cleanupMissingObjectRecheckAt: Timestamp.fromMillis(Date.now() - 1),
  });
  await cleanupExpiredMediaUploadIntents.run();
  asset = await assetRef.get();
  assert.equal(asset.data().status, "expired");
  quota = await db.collection("mediaUploadQuotas").doc(uid).get();
  assert.equal(quota.data().activeUploads, 0);
  assert.equal(quota.data().activeBytes, 0);
  assert.equal(quota.data().dailyBytes, reservedBytes);
});

test("signed upload transport rejects bytes larger than the exact quota reservation", async () => {
  const uid = `http-size-mismatch-${Date.now()}-${Math.random()}`;
  const png = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0x00,0x00,0x00,0x00]);
  const intent = await createMediaUploadIntent.run({
    data: { originalName: "oversized.png", contentType: "image/png", sizeBytes: 8, purpose: "chat" },
    auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
  });
  assert.equal(intent.requiredHeaders["x-goog-content-length-range"], "8,8");
  const put = await fetch(intent.uploadUrl, {
    method: "PUT",
    headers: intent.requiredHeaders,
    body: png,
  });
  assert.notEqual(put.status, 200, "oversized payload must be rejected by Storage before object creation");
  const asset = await db.collection("mediaAssets").doc(intent.mediaId).get();
  const [exists] = await getStorage().bucket().file(asset.data().objectPath).exists();
  assert.equal(exists, false);
});


test("stories publish only after malware approval and active public stories appear in feed", async () => {
  const uid = `story-member-${Date.now()}`;
  const mediaId = randomUUID();
  const expiresAt = Timestamp.fromMillis(Date.now() + 60 * 60 * 1000);
  const userRef = db.collection("users").doc(uid);
  const assetRef = db.collection("mediaAssets").doc(mediaId);
  await Promise.all([
    userRef.set({ profileCompleted: true, profileVisibility: "public", displayName: "Story Member" }),
    assetRef.set({
      mediaId, ownerUid: uid, mediaPurpose: "story", status: "security_approved",
      processingStatus: "safe_raster_derivative_ready",
      safePreviewPath: `processed/${uid}/${mediaId}/preview.webp`,
      safePreviewContentType: "image/webp",
      retentionExpiresAt: expiresAt, storyExpiresAt: expiresAt,
    }),
  ]);
  try {
    const created = await createMemberStory.run({ data: { mediaId }, auth: { uid, token: {} } });
    assert.equal(created.mediaId, mediaId);
    assert.equal(created.expiresAt, expiresAt.toMillis());
    const replay = await createMemberStory.run({ data: { mediaId }, auth: { uid, token: {} } });
    assert.equal(replay.storyId, created.storyId);
    assert.equal(replay.idempotentReplay, true);
    assert.equal((await assetRef.get()).data().storyDocumentId, created.storyId);
    const feed = await listMemberStories.run({ data: {}, auth: { uid, token: {} } });
    assert.ok(feed.stories.some((story) => story.storyId === created.storyId));
    await db.collection("stories").doc(created.storyId).update({
      expiresAt: Timestamp.fromMillis(Date.now() - 1000),
    });
    const expiredFeed = await listMemberStories.run({ data: {}, auth: { uid, token: {} } });
    assert.ok(!expiredFeed.stories.some((story) => story.storyId === created.storyId));
  } finally {
    const stories = await db.collection("stories").where("ownerUid", "==", uid).get();
    await Promise.all([
      userRef.delete().catch(() => undefined),
      assetRef.delete().catch(() => undefined),
      ...stories.docs.map((doc) => doc.ref.delete()),
    ]);
  }
});

test("story publication rejects media that remains quarantined pending malware scan", async () => {
  const uid = `story-pending-${Date.now()}`;
  const mediaId = randomUUID();
  const userRef = db.collection("users").doc(uid);
  const assetRef = db.collection("mediaAssets").doc(mediaId);
  await Promise.all([
    userRef.set({ profileCompleted: true, profileVisibility: "public" }),
    assetRef.set({
      mediaId, ownerUid: uid, mediaPurpose: "story", status: "pending_security_scan",
      retentionExpiresAt: Timestamp.fromMillis(Date.now() + 60 * 60 * 1000),
    }),
  ]);
  try {
    await assert.rejects(
      () => createMemberStory.run({ data: { mediaId }, auth: { uid, token: {} } }),
      (error) => error && error.code === "failed-precondition",
    );
  } finally {
    await Promise.all([userRef.delete(), assetRef.delete()]);
  }
});

async function createReadyChatImage({ uid, purpose = "chat", mediaId = randomUUID() }) {
  const objectPath = `processed/${uid}/${mediaId}/preview.webp`;
  const bytes = Buffer.from("safe-webp-test-fixture");
  const sourceGeneration = "1740000000000000";
  const sourceSha256 = "c".repeat(64);
  const safePreviewSha256 = createHash("sha256").update(bytes).digest("hex");
  await getStorage().bucket().file(objectPath).save(bytes, {
    resumable: false,
    metadata: {
      contentType: "image/webp",
      metadata: {
        mediaId, sourceGeneration, sourceSha256,
        scannerProvider: "clamav-mawadda-gateway",
        processing: "sharp-decode-reencode-v1",
      },
    },
  });
  const [stored] = await getStorage().bucket().file(objectPath).getMetadata();
  await db.collection("mediaAssets").doc(mediaId).set({
    mediaId, ownerUid: uid, uploaderRole: "member", uploaderType: "member",
    mediaPurpose: purpose, mediaCategory: "image", detectedContentType: "image/png",
    status: "security_approved", processingStatus: "safe_raster_derivative_ready",
    processingPipelineVersion: "sharp-decode-reencode-v1",
    storageGeneration: sourceGeneration, scannerSha256: sourceSha256,
    scannerProvider: "clamav-mawadda-gateway",
    safePreviewPath: objectPath, safePreviewGeneration: String(stored.generation),
    safePreviewSha256, safePreviewContentType: "image/webp",
    safePreviewSizeBytes: bytes.length, retentionExpiresAt: Timestamp.fromMillis(Date.now() + 4 * 60 * 60 * 1000),
    legalHoldStatus: "none", deliveryState: "pending",
  });
  return mediaId;
}

async function createReadyTypedChatMedia({ uid, category, purpose = "chat", mediaId = randomUUID(), owner = false }) {
  const specs = {
    gif: { source: "image/gif", suffix: "animation.gif", output: "image/gif", path: "safeAnimationPath", generation: "safeAnimationGeneration", hash: "safeAnimationSha256", pipeline: "gif-sanitize-preserve-animation-v1", status: "safe_animation_derivative_ready" },
    audio: { source: "audio/wav", suffix: "audio.mp3", output: "audio/mpeg", path: "safeAudioPath", generation: "safeAudioGeneration", hash: "safeAudioSha256", pipeline: "ffmpeg-audio-transcode-v1", status: "safe_audio_derivative_ready" },
    video: { source: "video/mp4", suffix: "video.mp4", output: "video/mp4", path: "safeVideoPath", generation: "safeVideoGeneration", hash: "safeVideoSha256", pipeline: "ffmpeg-video-transcode-v1", status: "safe_video_derivative_ready" },
    document: { source: "application/pdf", suffix: "document.pdf", output: "application/pdf", path: "safeDocumentPath", generation: "safeDocumentGeneration", hash: "safeDocumentSha256", pipeline: "pdf-raster-flatten-v1", status: "safe_document_derivative_ready" },
  };
  const spec = specs[category];
  const objectPath = "processed/" + uid + "/" + mediaId + "/" + spec.suffix;
  const bytes = Buffer.from("safe-" + category + "-fixture-" + mediaId);
  const sourceGeneration = "1740000000000000";
  const sourceSha256 = "c".repeat(64);
  const digest = createHash("sha256").update(bytes).digest("hex");
  const file = getStorage().bucket().file(objectPath);
  await file.save(bytes, {
    resumable: false,
    metadata: {
      contentType: spec.output,
      metadata: {
        mediaId, sourceGeneration, sourceSha256,
        scannerProvider: "clamav-mawadda-gateway",
        processing: spec.pipeline,
      },
    },
  });
  const [stored] = await file.getMetadata();
  await db.collection("mediaAssets").doc(mediaId).set({
    mediaId, ownerUid: uid, uploaderRole: owner ? "platform_owner" : "member",
    uploaderType: "member", mediaPurpose: purpose, mediaCategory: category,
    detectedContentType: spec.source, status: "security_approved",
    processingStatus: spec.status, processingPipelineVersion: spec.pipeline,
    storageGeneration: sourceGeneration, scannerSha256: sourceSha256,
    scannerProvider: "clamav-mawadda-gateway",
    [spec.path]: objectPath, [spec.generation]: String(stored.generation), [spec.hash]: digest,
    retentionExpiresAt: Timestamp.fromMillis(Date.now() + 4 * 60 * 60 * 1000),
    legalHoldStatus: "none", deliveryState: "pending",
  });
  return mediaId;
}

for (const item of [
  { category: "gif", owner: false },
  { category: "audio", owner: false },
  { category: "video", owner: false },
  { category: "document", owner: true },
]) {
  test("safe " + item.category + " attachment links and delivers only after its dedicated processor", async () => {
    const senderUid = (item.owner ? "platform-owner" : "member") + "-" + item.category + "-" + randomUUID();
    const recipientUid = "recipient-" + item.category + "-" + randomUUID();
    await db.collection("users").doc(recipientUid).set({ profileCompleted: true, age: 30, blockedUids: [] });
    if (!item.owner) {
      await db.collection("users").doc(senderUid).set({ profileCompleted: true, age: 30, blockedUids: [] });
    }
    const mediaId = await createReadyTypedChatMedia({
      uid: senderUid, category: item.category, owner: item.owner,
    });
    const clientMessageId = "typed_" + randomUUID().replace(/-/g, "");
    const auth = item.owner ? ownerRequest(senderUid).auth :
      { uid: senderUid, token: { firebase: { sign_in_provider: "password" } } };
    const sent = await sendChatMediaAttachment.run({
      data: { scope: "direct", recipientUid, mediaId, clientMessageId },
      auth,
    });
    const messageId = createHash("sha256").update(senderUid + ":" + clientMessageId).digest("hex");
    const message = await db.collection("directChats").doc(sent.chatId)
      .collection("messages").doc(messageId).get();
    assert.equal(message.data().mediaCategory, item.category);
    const delivered = await getChatMediaAttachmentUrl.run({
      data: { scope: "direct", chatId: sent.chatId, messageId, mediaId },
      auth: { uid: recipientUid, token: { firebase: { sign_in_provider: "password" } } },
    });
    assert.match(delivered.url, /^https?:\/\//);
    assert.equal(delivered.category, item.category);
    assert.ok(delivered.contentType);
  });
}

test("safe image can be linked to a direct message and delivered only to its participant", async () => {
  const senderUid = `attachment-sender-${randomUUID()}`;
  const recipientUid = `attachment-recipient-${randomUUID()}`;
  await db.collection("users").doc(senderUid).set({ profileCompleted: true, age: 30, blockedUids: [] });
  await db.collection("users").doc(recipientUid).set({ profileCompleted: true, age: 28, blockedUids: [] });
  const mediaId = await createReadyChatImage({ uid: senderUid });
  const clientMessageId = `img_${randomUUID().replace(/-/g, "")}`;
  const sent = await sendChatImageAttachment.run({
    data: { scope: "direct", recipientUid, mediaId, clientMessageId, caption: "صورة اختبار" },
    auth: { uid: senderUid, token: { firebase: { sign_in_provider: "password" } } },
  });
  assert.equal(sent.replayed, false);
  const messageId = createHash("sha256").update(senderUid + ":" + clientMessageId).digest("hex");
  const message = await db.collection("directChats").doc(sent.chatId).collection("messages").doc(messageId).get();
  assert.equal(message.data().mediaId, mediaId);
  assert.equal(message.data().attachmentStatus, "ready");
  const delivered = await getChatImageAttachmentUrl.run({
    data: { scope: "direct", chatId: sent.chatId, messageId, mediaId },
    auth: { uid: recipientUid, token: { firebase: { sign_in_provider: "password" } } },
  });
  assert.match(delivered.url, /^https?:\/\//);
  const messageRef = db.collection("directChats").doc(sent.chatId).collection("messages").doc(messageId);
  await messageRef.update({ deletedForUids: [recipientUid] });
  await assert.rejects(
    () => getChatImageAttachmentUrl.run({
      data: { scope: "direct", chatId: sent.chatId, messageId, mediaId },
      auth: { uid: recipientUid, token: { firebase: { sign_in_provider: "password" } } },
    }),
    (error) => error && error.code === "permission-denied",
  );
  await messageRef.update({ deletedForUids: [] });
  await db.collection("mediaAssets").doc(mediaId).update({ linkedScope: "room" });
  await assert.rejects(
    () => getChatImageAttachmentUrl.run({
      data: { scope: "direct", chatId: sent.chatId, messageId, mediaId },
      auth: { uid: recipientUid, token: { firebase: { sign_in_provider: "password" } } },
    }),
    (error) => error && error.code === "failed-precondition",
  );
  await db.collection("mediaAssets").doc(mediaId).update({ linkedScope: "direct" });
  await assert.rejects(
    () => getChatImageAttachmentUrl.run({
      data: { scope: "direct", chatId: sent.chatId, messageId, mediaId },
      auth: { uid: `intruder-${randomUUID()}`, token: { firebase: { sign_in_provider: "password" } } },
    }),
    (error) => error && error.code === "permission-denied",
  );
});

test("safe image can be linked to a room message; non-members cannot retrieve it", async () => {
  const senderUid = `room-attachment-sender-${randomUUID()}`;
  const roomId = `room-${randomUUID()}`;
  await db.collection("users").doc(senderUid).set({ status: "active" });
  await db.collection("rooms").doc(roomId).set({ status: "active", ownerUid: senderUid });
  await db.collection("rooms").doc(roomId).collection("members").doc(senderUid).set({ role: "member" });
  const mediaId = await createReadyChatImage({ uid: senderUid, purpose: "room" });
  const clientMessageId = `roomimg_${randomUUID().replace(/-/g, "")}`;
  const sent = await sendChatImageAttachment.run({
    data: { scope: "room", roomId, mediaId, clientMessageId, caption: "صورة غرفة" },
    auth: { uid: senderUid, token: { firebase: { sign_in_provider: "password" } } },
  });
  assert.equal(sent.replayed, false);
  const messageId = createHash("sha256").update(senderUid + ":" + clientMessageId).digest("hex");
  const delivered = await getChatImageAttachmentUrl.run({
    data: { scope: "room", roomId, messageId, mediaId },
    auth: { uid: senderUid, token: { firebase: { sign_in_provider: "password" } } },
  });
  assert.match(delivered.url, /^https?:\/\//);
  await assert.rejects(
    () => getChatImageAttachmentUrl.run({
      data: { scope: "room", roomId, messageId, mediaId },
      auth: { uid: `outsider-${randomUUID()}`, token: { firebase: { sign_in_provider: "password" } } },
    }),
    (error) => error && error.code === "permission-denied",
  );
});

test("an image attachment cannot be linked twice or use a forged owner role", async () => {
  const uid = `forgery-member-${randomUUID()}`;
  const peer = `forgery-peer-${randomUUID()}`;
  await db.collection("users").doc(uid).set({ profileCompleted: true, age: 31, blockedUids: [] });
  await db.collection("users").doc(peer).set({ profileCompleted: true, age: 29, blockedUids: [] });
  const mediaId = await createReadyChatImage({ uid });
  const clientMessageId = `forge_${randomUUID().replace(/-/g, "")}`;
  const auth = { uid, token: { firebase: { sign_in_provider: "password" } } };
  await sendChatImageAttachment.run({ data: { scope: "direct", recipientUid: peer, mediaId, clientMessageId }, auth });
  await assert.rejects(
    () => sendChatImageAttachment.run({ data: { scope: "direct", recipientUid: peer, mediaId, clientMessageId: `again_${randomUUID().replace(/-/g, "")}` }, auth }),
    (error) => error && error.code === "failed-precondition",
  );
  const pdfId = randomUUID();
  await db.collection("mediaAssets").doc(pdfId).set({
    mediaId: pdfId, ownerUid: uid, uploaderRole: "platform_owner", mediaPurpose: "chat",
    detectedContentType: "application/pdf", status: "security_approved",
    processingStatus: "safe_document_derivative_ready",
    safeDocumentPath: `processed/${uid}/${pdfId}/document.pdf`,
    safeDocumentGeneration: "1", safeDocumentSha256: "b".repeat(64),
    processingPipelineVersion: "pdf-sanitize-v1",
  });
  await assert.rejects(
    () => sendChatImageAttachment.run({ data: { scope: "direct", recipientUid: peer, mediaId: pdfId, clientMessageId: `pdf_${randomUUID().replace(/-/g, "")}` }, auth }),
    (error) => error && error.code === "failed-precondition",
  );
});

