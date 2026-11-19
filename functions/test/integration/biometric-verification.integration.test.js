const test = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");
const {
  completeBiometricVerificationCycle,
  startBiometricVerificationRequest,
  getMyBiometricVerificationStatus,
  getMyBiometricVerificationUploadAccess,
  decideBiometricVerificationRequest,
} = require("../../lib/index");

const db = getFirestore();
const request = (uid, data) => ({
  data,
  auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
});
const suffix = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
const ownerRequest = (uid, data) => ({
  data,
  auth: { uid, token: {
    platformOwner: true,
    platformOwnerUid: uid,
    auth_time: Math.floor(Date.now() / 1000),
    firebase: { sign_in_second_factor: "phone" },
  } },
});

test("client-asserted local OS prompt cannot mint biometric reward or verification status", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const uid = `biometric_member_${suffix()}`;
  const userRef = db.collection("users").doc(uid);
  await userRef.set({ coins: 100, profileCompleted: true, accountStatus: "active" });
  try {
    for (const platform of ["android", "ios"]) {
      await assert.rejects(
        () => completeBiometricVerificationCycle.run(request(uid, {
          localAuthenticationSucceeded: true,
          platform,
          attemptId: `attempt_${suffix()}`,
        })),
        (error) => error && error.code === "failed-precondition",
      );
    }

    const user = (await userRef.get()).data();
    assert.equal(user.coins, 100);
    assert.equal(user.biometricVerification, undefined);
    assert.equal(user.biometricVerificationRewardedAt, undefined);
    assert.equal(user.biometricVerificationSequence, undefined);
    assert.equal((await userRef.collection("walletLedger").get()).size, 0);
    assert.equal((await db.collection("verificationAuditLogs")
      .where("actorUid", "==", uid).get()).size, 0);
  } finally {
    const ledger = await userRef.collection("walletLedger").get();
    await Promise.all([...ledger.docs.map((doc) => doc.ref.delete()), userRef.delete()]);
  }
});

test("failed, unsupported, or incomplete client biometric claims never earn a reward", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const uid = `biometric_invalid_${suffix()}`;
  const userRef = db.collection("users").doc(uid);
  await userRef.set({ coins: 100, profileCompleted: true, accountStatus: "active" });
  try {
    for (const payload of [
      { localAuthenticationSucceeded: false, platform: "android", attemptId: `attempt_${suffix()}` },
      { localAuthenticationSucceeded: true, platform: "web", attemptId: `attempt_${suffix()}` },
      { localAuthenticationSucceeded: true, platform: "android", attemptId: "x" },
    ]) {
      await assert.rejects(
        () => completeBiometricVerificationCycle.run(request(uid, payload)),
        (error) => error && error.code === "failed-precondition",
      );
    }
    assert.equal((await userRef.get()).data().coins, 100);
    assert.equal((await userRef.collection("walletLedger").get()).size, 0);
  } finally {
    await userRef.delete();
  }
});


test("member request uses canonical profile identity, one pending upload, and configured phrase challenge", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const uid = `biometric_submit_${suffix()}`;
  const requestIdRef = db.collection("users").doc(uid);
  const settingsRef = db.doc("platformSettings/biometricVerification");
  await Promise.all([
    requestIdRef.set({
      uid, fullName: "Canonical Member", username: "canonical_member",
      gender: "female", profileCompleted: true, accountStatus: "active", coins: 50,
    }),
    settingsRef.set({
      enabled: true,
      maxAudioBytes: 1024 * 1024,
      maxVideoBytes: 2 * 1024 * 1024,
      uploadWindowMinutes: 15,
      mediaAccessTtlSeconds: 300,
      phrases: [{ id: "phrase_ar_1", text: "هذه جملة تحقق خاصة بمنصة مودة." }],
    }),
  ]);
  let createdRequestId;
  try {
    await assert.rejects(
      () => startBiometricVerificationRequest.run(request(uid, { phraseId: "phrase_ar_1" })),
      (error) => error && error.code === "failed-precondition",
    );
    const started = await startBiometricVerificationRequest.run(request(uid, {
      consent: true,
      phraseId: "phrase_ar_1",
      fullName: "Forged Name",
      username: "forged_user",
      gender: "male",
    }));
    createdRequestId = started.requestId;
    assert.equal(started.attemptNumber, 1);
    assert.equal(started.phraseId, "phrase_ar_1");
    assert.equal(started.requiredAudioContentType, "audio/mp4");
    assert.equal(started.requiredVideoContentType, "video/mp4");
    assert.match(started.audioObjectPath, new RegExp(uid));
    await assert.rejects(
      () => startBiometricVerificationRequest.run(request(uid, { consent: true })),
      (error) => error && error.code === "already-exists",
    );
    const saved = (await db.collection("biometricVerificationRequests").doc(createdRequestId).get()).data();
    assert.equal(saved.fullName, "Canonical Member");
    assert.equal(saved.username, "canonical_member");
    assert.equal(saved.gender, "female");
    assert.equal(saved.status, "uploading");
    assert.equal((await getMyBiometricVerificationStatus.run(request(uid, {}))).requestStatus, "uploading");
  } finally {
    await Promise.all([
      db.recursiveDelete(requestIdRef).catch(() => undefined),
      createdRequestId
        ? db.collection("biometricVerificationRequests").doc(createdRequestId).delete().catch(() => undefined)
        : Promise.resolve(),
      settingsRef.delete().catch(() => undefined),
    ]);
  }
});

test("biometric upload URLs are denied outside the member's own active upload request", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const uid = `biometric_upload_access_${suffix()}`;
  const requestId = randomUUID();
  const userRef = db.collection("users").doc(uid);
  const requestRef = db.collection("biometricVerificationRequests").doc(requestId);
  await userRef.set({
    uid, profileCompleted: true, accountStatus: "active",
    biometricVerificationRequestId: requestId,
  });
  await requestRef.set({
    uid, requestId, status: "pending_review",
    audioObjectPath: `biometric-verification/${uid}/${requestId}/audio.mp4`,
    videoObjectPath: `biometric-verification/${uid}/${requestId}/video.mp4`,
  });
  try {
    await assert.rejects(
      () => getMyBiometricVerificationUploadAccess.run(request(uid, { requestId })),
      (error) => error && error.code === "permission-denied",
    );
    await assert.rejects(
      () => getMyBiometricVerificationUploadAccess.run(request(`other_${uid}`, { requestId })),
      (error) => error && error.code === "permission-denied",
    );
  } finally {
    await Promise.all([userRef.delete(), requestRef.delete()]);
  }
});

test("Super Owner acceptance credits 1500 once, sets monthly expiry and deletes evidence", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  assert.ok(process.env.FIREBASE_STORAGE_EMULATOR_HOST, "Storage emulator is required");
  const uid = `biometric_accept_${suffix()}`;
  const requestId = randomUUID();
  const audioObjectPath = `biometric-verification/${uid}/${requestId}/audio.mp4`;
  const videoObjectPath = `biometric-verification/${uid}/${requestId}/video.mp4`;
  const bucket = getStorage().bucket();
  const userRef = db.collection("users").doc(uid);
  const requestRef = db.collection("biometricVerificationRequests").doc(requestId);
  const ledgerRef = userRef.collection("walletLedger").doc("biometric_verification_" + requestId);
  const notificationRef = userRef.collection("notifications").doc("biometric_verification_" + requestId);
  await Promise.all([
    bucket.file(audioObjectPath).save(Buffer.from("Mawdda biometric audio emulator fixture"), {
      metadata: { contentType: "audio/mp4" },
    }),
    bucket.file(videoObjectPath).save(Buffer.from("Mawdda biometric video emulator fixture"), {
      metadata: { contentType: "video/mp4" },
    }),
  ]);
  await userRef.set({
    uid, fullName: "Accepted Member", username: "accepted_member", gender: "male",
    profileCompleted: true, accountStatus: "active", coins: 100,
  });
  await requestRef.set({
    uid, requestId, fullName: "Accepted Member", username: "accepted_member", gender: "male",
    attemptNumber: 1, status: "pending_review", requestVersion: 2,
    audioObjectPath, videoObjectPath, mediaDeletionStatus: "pending",
  });
  try {
    const input = { requestId, expectedVersion: 2, decision: "accept" };
    const first = await decideBiometricVerificationRequest.run(ownerRequest("owner_biometric_" + suffix(), input));
    assert.equal(first.status, "accepted");
    assert.equal(first.rewardCoins, 1500);
    assert.equal(first.idempotentReplay, false);
    const [user, ledger, notification, savedRequest] = await Promise.all([
      userRef.get(), ledgerRef.get(), notificationRef.get(), requestRef.get(),
    ]);
    assert.equal(user.data().coins, 1600);
    assert.equal(ledger.data().amount, 1500);
    assert.equal(ledger.data().type, "biometric_verification_reward");
    assert.equal(notification.exists, true);
    assert.equal(savedRequest.data().mediaDeletionStatus, "complete");
    const [audioExists, videoExists] = await Promise.all([
      bucket.file(audioObjectPath).exists(),
      bucket.file(videoObjectPath).exists(),
    ]);
    assert.equal(audioExists[0], false, "audio evidence must be deleted from Storage Emulator");
    assert.equal(videoExists[0], false, "video evidence must be deleted from Storage Emulator");
    assert.equal(user.data().biometricVerification.verificationMethod, "owner_manual_review");
    assert.equal(user.data().biometricVerification.reviewedBySuperOwner, true);
    assert.equal(user.data().biometricVerification.reviewRequestId, requestId);
    assert.ok(user.data().biometricVerification.expiresAt.toMillis() > Date.now());

    const replay = await decideBiometricVerificationRequest.run(ownerRequest("owner_biometric_" + suffix(), input));
    assert.equal(replay.status, "accepted");
    assert.equal(replay.rewardCoins, 1500);
    assert.equal(replay.idempotentReplay, true);
    assert.equal((await userRef.get()).data().coins, 1600);
    assert.equal((await userRef.collection("walletLedger").get()).size, 1);
  } finally {
    await Promise.all([
      bucket.file(audioObjectPath).delete({ ignoreNotFound: true }).catch(() => undefined),
      bucket.file(videoObjectPath).delete({ ignoreNotFound: true }).catch(() => undefined),
      db.recursiveDelete(userRef).catch(() => undefined),
      requestRef.delete().catch(() => undefined),
    ]);
  }
});
