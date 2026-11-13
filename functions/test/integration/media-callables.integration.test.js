const test = require("node:test");
const assert = require("node:assert/strict");

// Import the callable module before initializeApp(). This intentionally guards
// against eager Admin SDK access during the Functions entry-point import phase.
const {
  createMediaUploadIntent,
  listOwnerMediaAssets,
  finalizeMediaUpload,
  getOwnerMediaInspectionUrl,
  cleanupExpiredMediaUploadIntents,
  receiveMediaScanVerdict,
} = require("../../lib/media");

const { initializeApp, getApps } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");
const { randomUUID, createHmac, createHash } = require("node:crypto");

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
    data: { originalName: "quota.png", contentType: "image/png", sizeBytes: 1024 },
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
      data: { originalName: "blocked.png", contentType: "image/png", sizeBytes: 1024 },
      auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
    }),
    (error) => error && error.code === "resource-exhausted",
  );
});


test("signed upload URL performs a real Storage Emulator HTTP PUT and rejects replay", async () => {
  const uid = `http-upload-${Date.now()}-${Math.random()}`;
  const png = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0x00,0x00,0x00,0x00]);
  const intent = await createMediaUploadIntent.run({
    data: { originalName: "http-check.png", contentType: "image/png", sizeBytes: png.length },
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

test("owner inspection URL is owner/MFA gated and its signed HTTP GET returns the exact quarantined object", async () => {
  const uid = `http-owner-${Date.now()}-${Math.random()}`;
  const mediaId = randomUUID();
  const objectPath = `quarantine/fixture/${mediaId}`;
  const bytes = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0x00,0x00,0x00,0x00]);
  const file = getStorage().bucket().file(objectPath);
  await file.save(bytes, { metadata: { contentType: "image/png" } });
  const [metadata] = await file.getMetadata();
  await db.collection("mediaAssets").doc(mediaId).create({
    mediaId, ownerUid: "uploader-fixture", objectPath,
    uploaderType: "member", declaredContentType: "image/png",
    detectedContentType: "image/png", sizeBytes: bytes.length,
    storageGeneration: String(metadata.generation),
    status: "pending_security_scan",
  });

  const result = await getOwnerMediaInspectionUrl.run(ownerRequest(uid, { mediaId }));
  assert.equal(result.mediaId, mediaId);
  assert.equal(new URL(result.downloadUrl).searchParams.get("X-Goog-Expires"), "60");
  const response = await fetch(result.downloadUrl);
  assert.equal(response.status, 200, await response.text());
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), bytes);
  assert.match(response.headers.get("content-disposition") ?? "", /attachment/i);
  assert.ok((await auditEvents(uid)).some((event) =>
    event.action === "owner_media_inspection_url_issued" && event.outcome === "success"));
});

test("owner inspection rejects stale storage generations and audits the denial", async () => {
  const uid = `http-owner-stale-${Date.now()}-${Math.random()}`;
  const mediaId = randomUUID();
  const objectPath = `quarantine/fixture/${mediaId}`;
  await getStorage().bucket().file(objectPath).save(Buffer.from("replacement"), {
    metadata: { contentType: "image/png" },
  });
  await db.collection("mediaAssets").doc(mediaId).create({
    mediaId, ownerUid: "uploader-fixture", objectPath,
    uploaderType: "member", declaredContentType: "image/png",
    storageGeneration: "1", status: "pending_security_scan",
  });
  await assert.rejects(
    () => getOwnerMediaInspectionUrl.run(ownerRequest(uid, { mediaId })),
    (error) => error && error.code === "failed-precondition",
  );
  assert.ok((await auditEvents(uid)).some((event) =>
    event.action === "owner_media_inspection_result" && event.outcome === "denied_or_failed"));
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
    createdAt: Timestamp.fromMillis(Date.now() - 40 * 60 * 1000),
    uploadUrlExpiresAt: Timestamp.fromMillis(Date.now() - 35 * 60 * 1000),
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
    data: { originalName: "oversized.png", contentType: "image/png", sizeBytes: 8 },
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


function scannerResponse() {
  return {
    code: 200,
    body: null,
    headers: {},
    status(code) { this.code = code; return this; },
    set(name, value) { this.headers[name.toLowerCase()] = value; return this; },
    send(body) { this.body = body; return this; },
    json(body) { this.body = body; return this; },
  };
}

async function submitScannerVerdict({ uid, mediaId, bytes, verdict = "clean", generationOverride, hashOverride, signatureOverride }) {
  const objectPath = `quarantine/${uid}/${mediaId}`;
  const file = getStorage().bucket().file(objectPath);
  await file.save(bytes, { metadata: { contentType: "image/png" } });
  const [metadata] = await file.getMetadata();
  await db.collection("mediaAssets").doc(mediaId).create({
    mediaId, ownerUid: uid, objectPath, uploaderType: "member",
    declaredContentType: "image/png", detectedContentType: "image/png",
    declaredSizeBytes: bytes.length, sizeBytes: bytes.length,
    storageGeneration: String(metadata.generation), status: "pending_security_scan",
  });
  process.env.MAWDA_MEDIA_SCANNER_PROVIDER = "test-scanner";
  process.env.MAWDA_MEDIA_SCANNER_HMAC_SECRET = "integration-test-secret-".padEnd(48, "x");
  const payload = {
    mediaId,
    provider: "test-scanner",
    engine: "ClamAV",
    engineVersion: "1.4.2-test",
    signatureVersion: "test-db-1",
    verdict,
    objectGeneration: generationOverride ?? String(metadata.generation),
    sha256: hashOverride ?? createHash("sha256").update(bytes).digest("hex"),
    scannedAtMs: Date.now(),
  };
  const rawBody = Buffer.from(JSON.stringify(payload));
  const signature = signatureOverride ?? createHmac("sha256", process.env.MAWDA_MEDIA_SCANNER_HMAC_SECRET)
    .update(rawBody).digest("hex");
  const response = scannerResponse();
  await receiveMediaScanVerdict.run({
    method: "POST",
    rawBody,
    get: (name) => name.toLowerCase() === "x-mawadda-scanner-signature" ? signature : undefined,
  }, response);
  return { response, file, payload };
}

test("trusted scanner callback approves only the exact current generation and full-object hash", async () => {
  const uid = `scanner-clean-${Date.now()}-${Math.random()}`;
  const mediaId = randomUUID();
  const bytes = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0x00,0x00,0x00,0x00]);
  const { response, payload } = await submitScannerVerdict({ uid, mediaId, bytes });
  assert.equal(response.code, 200);
  assert.equal(response.body.status, "security_approved");
  const asset = await db.collection("mediaAssets").doc(mediaId).get();
  assert.equal(asset.data().status, "security_approved");
  assert.equal(asset.data().scannerSha256, payload.sha256);
  assert.ok((await auditEvents("trusted-scanner")).some((event) =>
    event.action === "media_security_scan_verdict" && event.mediaId === mediaId && event.outcome === "clean"));
});

test("malicious scanner verdict rejects and deletes only the scanned object", async () => {
  const uid = `scanner-malicious-${Date.now()}-${Math.random()}`;
  const mediaId = randomUUID();
  const bytes = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0x00,0x00,0x00,0x00]);
  const { response, file } = await submitScannerVerdict({ uid, mediaId, bytes, verdict: "malicious" });
  assert.equal(response.code, 200);
  assert.equal(response.body.status, "rejected");
  const asset = await db.collection("mediaAssets").doc(mediaId).get();
  assert.equal(asset.data().rejectionCode, "MALWARE_DETECTED");
  const [exists] = await file.exists();
  assert.equal(exists, false);
});

test("tampered scanner hash and stale generation cannot approve quarantined media", async () => {
  for (const mode of ["hash", "generation"]) {
    const uid = `scanner-tampered-${mode}-${Date.now()}-${Math.random()}`;
    const mediaId = randomUUID();
    const bytes = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0x00,0x00,0x00,0x00]);
    const options = mode === "hash"
      ? { hashOverride: "f".repeat(64) }
      : { generationOverride: "999999999999" };
    const { response } = await submitScannerVerdict({ uid, mediaId, bytes, ...options });
    assert.equal(response.code, 409);
    const asset = await db.collection("mediaAssets").doc(mediaId).get();
    assert.equal(asset.data().status, "pending_security_scan");
  }
});

test("scanner callback rejects invalid HMAC without changing asset state", async () => {
  const uid = `scanner-unauthorized-${Date.now()}-${Math.random()}`;
  const mediaId = randomUUID();
  const bytes = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0x00,0x00,0x00,0x00]);
  const { file } = await submitScannerVerdict({ uid, mediaId, bytes });
  const payload = Buffer.from(JSON.stringify({
    mediaId, provider: "test-scanner", engine: "ClamAV",
    engineVersion: "1.4.2-test", signatureVersion: "test-db-1", verdict: "clean",
    objectGeneration: "1", sha256: createHash("sha256").update(bytes).digest("hex"),
    scannedAtMs: Date.now(),
  }));
  const response = scannerResponse();
  await receiveMediaScanVerdict.run({
    method: "POST", rawBody: payload,
    get: () => "0".repeat(64),
  }, response);
  assert.equal(response.code, 401);
  const asset = await db.collection("mediaAssets").doc(mediaId).get();
  assert.equal(asset.data().status, "pending_security_scan");
  const [exists] = await file.exists();
  assert.equal(exists, true);
});
