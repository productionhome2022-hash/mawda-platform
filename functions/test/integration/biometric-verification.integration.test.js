const test = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { getFirestore } = require("firebase-admin/firestore");
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


test("manual biometric evidence collection and settings remain disabled until REWARD-002 proof is implemented", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const uid = `biometric_closed_${suffix()}`;
  const userRef = db.collection("users").doc(uid);
  const settingsRef = db.doc("platformSettings/biometricVerification");
  await userRef.set({
    uid, fullName: "Canonical Member", username: "canonical_member",
    gender: "female", profileCompleted: true, accountStatus: "active", coins: 50,
  });
  await settingsRef.set({
    enabled: false, version: 0, maxAudioBytes: 1024 * 1024,
    maxVideoBytes: 2 * 1024 * 1024, uploadWindowMinutes: 15,
    mediaAccessTtlSeconds: 300,
    phrases: [{ id: "phrase_ar_1", text: "هذه جملة تحقق خاصة بمنصة مودة." }],
  });
  try {
    await assert.rejects(
      () => startBiometricVerificationRequest.run(request(uid, {
        consent: true, phraseId: "phrase_ar_1",
      })),
      (error) => error && error.code === "failed-precondition",
    );
    await assert.rejects(
      () => setOwnerBiometricVerificationSettings.run(ownerRequest("owner_biometric_settings_" + suffix(), {
        expectedVersion: 0, enabled: true,
        maxAudioBytes: 1024 * 1024, maxVideoBytes: 2 * 1024 * 1024,
        uploadWindowMinutes: 15, mediaAccessTtlSeconds: 300,
        phrases: [{ id: "phrase_ar_1", text: "هذه جملة تحقق خاصة بمنصة مودة." }],
      })),
      (error) => error && error.code === "failed-precondition",
    );
    assert.equal((await db.collection("biometricVerificationRequests").where("uid", "==", uid).get()).size, 0);
    assert.equal((await userRef.get()).data().coins, 50);
    assert.equal((await userRef.collection("walletLedger").get()).size, 0);
    assert.equal((await settingsRef.get()).data().enabled, false);
  } finally {
    await Promise.all([userRef.delete(), settingsRef.delete()]);
  }
});

test("manual biometric upload access is blocked even for an existing legacy request", async () => {
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
      (error) => error && error.code === "failed-precondition",
    );
    await assert.rejects(
      () => getMyBiometricVerificationUploadAccess.run(request(`other_${uid}`, { requestId })),
      (error) => error && error.code === "failed-precondition",
    );
  } finally {
    await Promise.all([userRef.delete(), requestRef.delete()]);
  }
});

test("manual Super Owner review cannot grant a biometric badge, privilege, or 1500 BetaCoins", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const uid = `biometric_accept_${suffix()}`;
  const requestId = randomUUID();
  const userRef = db.collection("users").doc(uid);
  const requestRef = db.collection("biometricVerificationRequests").doc(requestId);
  await userRef.set({
    uid, fullName: "Accepted Member", username: "accepted_member", gender: "male",
    profileCompleted: true, accountStatus: "active", coins: 100,
  });
  await requestRef.set({
    uid, requestId, fullName: "Accepted Member", username: "accepted_member", gender: "male",
    attemptNumber: 1, status: "pending_review", requestVersion: 2,
  });
  try {
    await assert.rejects(
      () => decideBiometricVerificationRequest.run(ownerRequest("owner_biometric_" + suffix(), {
        requestId, expectedVersion: 2, decision: "accept",
      })),
      (error) => error && error.code === "failed-precondition",
    );
    const [user, ledger, savedRequest] = await Promise.all([
      userRef.get(), userRef.collection("walletLedger").get(), requestRef.get(),
    ]);
    assert.equal(user.data().coins, 100);
    assert.equal(user.data().biometricVerification, undefined);
    assert.equal(ledger.size, 0);
    assert.equal(savedRequest.data().status, "pending_review");
  } finally {
    await Promise.all([db.recursiveDelete(userRef).catch(() => undefined), requestRef.delete()]);
  }
});
