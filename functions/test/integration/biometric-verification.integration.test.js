const test = require("node:test");
const assert = require("node:assert/strict");
const { createHash, randomUUID } = require("node:crypto");

// Configure the Admin Storage SDK to use the emulator before importing it.
const rawStorageEmulatorHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST ?? "127.0.0.1:9199";
const storageEmulatorHost = rawStorageEmulatorHost.replace("https://", "").replace("http://", "");
process.env.STORAGE_EMULATOR_HOST = "http://" + storageEmulatorHost;

const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");
const {
  getBiometricVerificationPhrase, startBiometricVerificationRequest,
  submitBiometricVerificationRequest, listOwnerBiometricVerificationRequests,
  getOwnerBiometricEvidencePlayback, decideBiometricVerificationRequest,
  completeBiometricVerificationCycle,
} = require("../../lib/index");
const { hasActiveBiometricVerification } = require("../../lib/biometric-verification");
const db = getFirestore();
const bucket = getStorage().bucket();
const BIOMETRIC_CONSENT_VERSION = "2026-11-20-owner-review-v1";
const suffix = () => Date.now() + "_" + Math.random().toString(36).slice(2, 9);
const memberRequest = (uid, data = {}) => ({ data: {
  consentAccepted: true, consentVersion: BIOMETRIC_CONSENT_VERSION, ...data,
}, auth: { uid, token: { firebase: { sign_in_provider: "password" } } } });
const ownerRequest = (uid, data = {}) => ({ data, auth: { uid, token: {
  platformOwner: true, platformOwnerUid: uid, auth_time: Math.floor(Date.now() / 1000),
  firebase: { sign_in_second_factor: "phone" },
} } });
function atom(type, payload) {
  const header = Buffer.alloc(8); header.writeUInt32BE(payload.length + 8, 0); header.write(type, 4, 4, "ascii");
  return Buffer.concat([header, payload]);
}
function header(type, duration) {
  const payload = Buffer.alloc(20); payload.writeUInt8(0, 0); payload.writeUInt32BE(1000, 12); payload.writeUInt32BE(duration, 16);
  return atom(type, payload);
}
function handler(type) { const payload = Buffer.alloc(12); payload.write(type, 8, 4, "ascii"); return atom("hdlr", payload); }
function track(type, duration) { return atom("trak", atom("mdia", Buffer.concat([header("mdhd", duration), handler(type)]))); }
function mp4(duration, kind) {
  const ftypPayload = Buffer.alloc(8); ftypPayload.write(kind === "audio" ? "M4A " : "isom", 0, 4, "ascii");
  return Buffer.concat([atom("ftyp", ftypPayload), atom("moov", Buffer.concat([header("mvhd", duration), track(kind === "audio" ? "soun" : "vide", duration)]))]);
}
const sha = bytes => createHash("sha256").update(bytes).digest("hex");
async function save(path, bytes, contentType) {
  await bucket.file(path).save(bytes, { resumable: false, metadata: { contentType } });
  const [metadata] = await bucket.file(path).getMetadata();
  return metadata;
}
async function makeBiometricAsset(uid, requestId, kind, sourceBytes, status = "security_approved") {
  const mediaId = randomUUID();
  const objectPath = "quarantine/" + uid + "/" + mediaId;
  const derivativePath = "processed/" + uid + "/" + mediaId + (kind === "audio" ? "/audio.mp3" : "/video.mp4");
  const declaredContentType = kind === "audio" ? "audio/mp4" : "video/mp4";
  const safeContentType = kind === "audio" ? "audio/mpeg" : "video/mp4";
  const safeBytes = Buffer.from(kind === "audio" ? "safe-mp3-derivative" : "safe-mp4-derivative");
  const originalMetadata = await save(objectPath, sourceBytes, declaredContentType);
  const derivativeMetadata = await save(derivativePath, safeBytes, safeContentType);
  const asset = {
    mediaId, ownerUid: uid, uploaderType: "member", uploaderRole: "member",
    mediaPurpose: "biometric", biometricRequestId: requestId,
    objectPath, declaredContentType, detectedContentType: declaredContentType,
    declaredSizeBytes: sourceBytes.length, sizeBytes: sourceBytes.length,
    mediaCategory: kind, status, storageGeneration: String(originalMetadata.generation),
    scannerVerdict: "clean", scannerEngine: "ClamAV", scannerEngineVersion: "1.0.0",
    scannerSha256: sha(sourceBytes), scannerVerifiedAt: Timestamp.now(),
    ...(kind === "audio" ? {
      safeAudioPath: derivativePath, safeAudioGeneration: String(derivativeMetadata.generation),
      safeAudioSha256: sha(safeBytes), safeAudioContentType: safeContentType,
      processingStatus: "safe_audio_derivative_ready",
    } : {
      safeVideoPath: derivativePath, safeVideoGeneration: String(derivativeMetadata.generation),
      safeVideoSha256: sha(safeBytes), safeVideoContentType: safeContentType,
      processingStatus: "safe_video_derivative_ready",
    }),
    createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
  };
  await db.collection("mediaAssets").doc(mediaId).set(asset);
  return { mediaId, asset };
}
async function attachEvidence(requestRef, uid, requestId, audioDuration = 60000, videoDuration = 4000, status = "security_approved") {
  const audio = await makeBiometricAsset(uid, requestId, "audio", mp4(audioDuration, "audio"), status);
  const video = await makeBiometricAsset(uid, requestId, "video", mp4(videoDuration, "video"), status);
  await requestRef.update({ audioMediaId: audio.mediaId, videoMediaId: video.mediaId });
  return { audio, video };
}
async function cleanup(uid, requestIds) {
  await db.recursiveDelete(db.collection("users").doc(uid)).catch(() => undefined);
  for (const id of requestIds) {
    const ref = db.collection("biometricVerificationRequests").doc(id);
    const snap = await ref.get(), data = snap.data() || {};
    for (const mediaId of [data.audioMediaId, data.videoMediaId]) {
      if (!mediaId) continue;
      const assetRef = db.collection("mediaAssets").doc(mediaId);
      const asset = (await assetRef.get()).data() || {};
      for (const path of [asset.objectPath, asset.safeAudioPath, asset.safeVideoPath]) {
        if (path) await bucket.file(path).delete({ ignoreNotFound: true }).catch(() => undefined);
      }
      await assetRef.delete().catch(() => undefined);
    }
    await ref.delete().catch(() => undefined);
  }
}

test("approved phrase, ClamAV-approved safe derivatives, owner review and exactly-once reward", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator required");
  assert.ok(process.env.FIREBASE_STORAGE_EMULATOR_HOST, "Storage emulator required");
  const tag = suffix(), uid = "biometric_member_" + tag, ownerUid = "biometric_owner_" + tag;
  const userRef = db.collection("users").doc(uid), ids = [];
  await userRef.set({
    uid, fullName: "Biometric Member", username: "bio_" + Math.floor(Math.random() * 1000000),
    gender: "female", profileCompleted: true, accountStatus: "active", coins: 321,
  });
  try {
    await assert.rejects(() => startBiometricVerificationRequest.run(memberRequest(uid, {
      consentAccepted: false,
    })), error => error && error.code === "failed-precondition");
    await assert.rejects(() => startBiometricVerificationRequest.run(memberRequest(uid, {
      consentVersion: "stale-consent-version",
    })), error => error && error.code === "failed-precondition");
    const phrase = await getBiometricVerificationPhrase.run(memberRequest(uid));
    assert.equal(phrase.consentVersion, BIOMETRIC_CONSENT_VERSION);
    assert.equal(phrase.phrase, "أنا أريد الانضمام إلى مرحلة التوثيق البيومتري لأحصل على مكافأة ألف وخمسمائة بيتكوينز. الرجاء قبول التوثيق.");
    const started = await startBiometricVerificationRequest.run(memberRequest(uid));
    ids.push(started.requestId);
    assert.equal(started.attemptNumber, 1);
    assert.equal(started.uploadPurpose, "biometric");
    assert.equal(started.audio.maxDurationSeconds, 60);
    assert.equal(started.video.minDurationSeconds, 3);
    const ref = db.collection("biometricVerificationRequests").doc(started.requestId);
    await attachEvidence(ref, uid, started.requestId, 60000, 4000, "pending_security_scan");
    await assert.rejects(() => submitBiometricVerificationRequest.run(memberRequest(uid, {
      requestId: started.requestId,
    })), error => error && error.code === "failed-precondition");
    const requestData = (await ref.get()).data();
    await Promise.all([
      db.collection("mediaAssets").doc(requestData.audioMediaId).update({ status: "security_approved" }),
      db.collection("mediaAssets").doc(requestData.videoMediaId).update({ status: "security_approved" }),
    ]);
    const submitted = await submitBiometricVerificationRequest.run(memberRequest(uid, { requestId: started.requestId }));
    assert.equal(submitted.status, "pending");
    assert.equal((await ref.get()).data().evidenceScanner, "ClamAV");
    await assert.rejects(() => listOwnerBiometricVerificationRequests.run(memberRequest(uid)),
      error => error && error.code === "permission-denied");
    const inbox = await listOwnerBiometricVerificationRequests.run(ownerRequest(ownerUid));
    assert.ok(inbox.requests.some(item => item.requestId === started.requestId));
    await assert.rejects(() => getOwnerBiometricEvidencePlayback.run(memberRequest(uid, {
      requestId: started.requestId,
    })), error => error && error.code === "permission-denied");
    const playback = await getOwnerBiometricEvidencePlayback.run(ownerRequest(ownerUid, {
      requestId: started.requestId,
    }));
    assert.match(playback.audioUrl, /mawddaEmulatorOnly=1/);
    assert.match(playback.videoUrl, /mawddaEmulatorOnly=1/);
    const decisions = await Promise.allSettled([1, 2].map(() =>
      decideBiometricVerificationRequest.run(ownerRequest(ownerUid, {
        requestId: started.requestId, decision: "accepted",
      }))));
    assert.equal(decisions.filter(item => item.status === "fulfilled").length, 1,
      "concurrent duplicate decisions must have exactly one winner");
    const decision = decisions.find(item => item.status === "fulfilled").value;
    assert.equal(decision.rewardGranted, true);
    assert.equal(decision.rewardCoins, 1500);
    const member = (await userRef.get()).data();
    assert.equal(member.coins, 1821);
    assert.equal(hasActiveBiometricVerification(member.biometricVerification, uid), true);
    const ledger = await userRef.collection("walletLedger").doc("biometric_verification_" + started.requestId).get();
    assert.equal(ledger.data().amount, 1500);
    assert.equal(ledger.data().idempotencyKey, started.requestId);
    assert.equal((await ref.get()).data().status, "accepted");
    assert.equal((await ref.get()).data().evidenceDeletionStatus, "deleted");
    const deletedAudio = (await db.collection("mediaAssets").doc((await ref.get()).data().audioMediaId).get()).data();
    assert.equal(deletedAudio.status, "manually_deleted");
    await assert.rejects(() => decideBiometricVerificationRequest.run(ownerRequest(ownerUid, {
      requestId: started.requestId, decision: "accepted",
    })), error => error && error.code === "failed-precondition");
    assert.equal((await userRef.get()).data().coins, 1821);
  } finally {
    await cleanup(uid, ids);
  }
});

test("three rejections require calendar-month waits, close permanently, and never reward", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator required");
  const originalNow = Date.now;
  let nowMs = originalNow();
  Date.now = () => nowMs;
  const tag = suffix(), uid = "biometric_retry_" + tag, ownerUid = "biometric_owner_retry_" + tag;
  const userRef = db.collection("users").doc(uid), ids = [];
  await userRef.set({
    uid, fullName: "Retry Member", username: "retry_" + Math.floor(Math.random() * 1000000),
    gender: "male", profileCompleted: true, accountStatus: "active", coins: 777,
  });
  try {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      if (attempt > 1) {
        await assert.rejects(() => startBiometricVerificationRequest.run(memberRequest(uid)),
          error => error && error.code === "failed-precondition");
        nowMs += 32 * 24 * 60 * 60 * 1000;
      }
      const started = await startBiometricVerificationRequest.run(memberRequest(uid));
      ids.push(started.requestId);
      assert.equal(started.attemptNumber, attempt);
      const ref = db.collection("biometricVerificationRequests").doc(started.requestId);
      await attachEvidence(ref, uid, started.requestId, 30000, 3000);
      await submitBiometricVerificationRequest.run(memberRequest(uid, { requestId: started.requestId }));
      const decision = await decideBiometricVerificationRequest.run(ownerRequest(ownerUid, {
        requestId: started.requestId, decision: "rejected",
      }));
      assert.equal(decision.rewardGranted, false);
      assert.equal(decision.rewardCoins, 0);
      assert.equal(decision.attemptNumber, attempt);
      assert.equal(decision.status, attempt === 3 ? "closed" : "rejected");
    }
    const member = (await userRef.get()).data();
    assert.equal(member.coins, 777);
    assert.equal(member.biometricVerificationPermanentlyClosed, true);
    await assert.rejects(() => startBiometricVerificationRequest.run(memberRequest(uid)),
      error => error && error.code === "failed-precondition");
  } finally {
    Date.now = originalNow;
    await cleanup(uid, ids);
  }
});

test("rejects out-of-policy voice and video durations and keeps invalid submissions unrewarded", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator required");
  const tag = suffix(), uid = "biometric_invalid_" + tag, userRef = db.collection("users").doc(uid), ids = [];
  await userRef.set({
    uid, fullName: "Invalid Member", username: "bad_" + Math.floor(Math.random() * 1000000),
    gender: "male", profileCompleted: true, accountStatus: "active", coins: 99,
  });
  try {
    await assert.rejects(() => completeBiometricVerificationCycle.run(memberRequest(uid, {
      localAuthenticationSucceeded: true,
    })), error => error && error.code === "failed-precondition");
    for (const [audioDuration, videoDuration] of [[60001, 4000], [60000, 5001]]) {
      const started = await startBiometricVerificationRequest.run(memberRequest(uid));
      ids.push(started.requestId);
      const ref = db.collection("biometricVerificationRequests").doc(started.requestId);
      await attachEvidence(ref, uid, started.requestId, audioDuration, videoDuration);
      await assert.rejects(() => submitBiometricVerificationRequest.run(memberRequest(uid, {
        requestId: started.requestId,
      })), error => error && error.code === "invalid-argument");
    }
    assert.equal((await userRef.get()).data().coins, 99);
  } finally {
    await cleanup(uid, ids);
  }
});



test("an empty upload intent expires after its upload TTL without consuming an attempt", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator required");
  const originalNow = Date.now;
  let nowMs = originalNow();
  Date.now = () => nowMs;
  const uid = "biometric_empty_" + randomUUID().replaceAll("-", "");
  const userRef = db.collection("users").doc(uid), ids = [];
  await userRef.set({
    uid, fullName: "Empty Upload Member", username: "empty_" + Math.floor(Math.random() * 1000000),
    gender: "female", profileCompleted: true, accountStatus: "active", coins: 0,
  });
  try {
    const first = await startBiometricVerificationRequest.run(memberRequest(uid));
    ids.push(first.requestId);
    nowMs += 5 * 60 * 1000 + 1;
    const second = await startBiometricVerificationRequest.run(memberRequest(uid));
    ids.push(second.requestId);
    assert.equal(second.attemptNumber, 1);
    assert.equal((await db.collection("biometricVerificationRequests").doc(first.requestId).get()).data().status, "upload_rejected");
    assert.equal((await db.collection("biometricVerificationRequests").doc(first.requestId).get()).data().evidenceDeletionStatus, "deleted");
  } finally {
    Date.now = originalNow;
    await cleanup(uid, ids);
  }
});
