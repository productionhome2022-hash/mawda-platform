const test = require("node:test");
const assert = require("node:assert/strict");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { completeBiometricVerificationCycle } = require("../../lib/index");

const db = getFirestore();
const request = (uid, data) => ({
  data,
  auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
});
const suffix = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

test("successful local OS prompt claim rewards exactly once per 30-day server cycle", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const uid = `biometric_member_${suffix()}`;
  const userRef = db.collection("users").doc(uid);
  const payload = {
    localAuthenticationSucceeded: true,
    platform: "android",
    attemptId: `attempt_${suffix()}`,
  };
  await userRef.set({ coins: 100, profileCompleted: true, accountStatus: "active" });
  try {
    const results = await Promise.all([
      completeBiometricVerificationCycle.run(request(uid, payload)),
      completeBiometricVerificationCycle.run(request(uid, payload)),
    ]);
    assert.equal(results.filter((value) => value.rewardGranted === true).length, 1);
    assert.equal(results.filter((value) => value.alreadyRewarded === true).length, 1);
    let user = (await userRef.get()).data();
    assert.equal(user.coins, 1600);
    assert.equal(user.biometricVerification.status, "verified");
    assert.ok(user.biometricVerification.expiresAt.toMillis() > Date.now());
    assert.ok(user.biometricVerification.expiresAt.toMillis() <= Date.now() + 30 * 24 * 60 * 60 * 1000);
    let ledger = await userRef.collection("walletLedger")
      .where("type", "==", "biometric_verification_reward").get();
    assert.equal(ledger.size, 1);
    assert.equal(ledger.docs[0].data().amount, 1500);
    assert.equal(ledger.docs[0].data().direction, "credit");

    const previousCycleTime = Date.now() - 31 * 24 * 60 * 60 * 1000;
    await userRef.update({
      biometricVerificationRewardedAt: Timestamp.fromMillis(previousCycleTime),
    });
    const renewed = await completeBiometricVerificationCycle.run(request(uid, {
      ...payload, attemptId: `renew_${suffix()}`,
    }));
    assert.equal(renewed.rewardGranted, true);
    assert.equal(renewed.cycleSequence, 2);
    user = (await userRef.get()).data();
    assert.equal(user.coins, 3100);
    ledger = await userRef.collection("walletLedger")
      .where("type", "==", "biometric_verification_reward").get();
    assert.equal(ledger.size, 2);
  } finally {
    const ledger = await userRef.collection("walletLedger").get();
    const audit = await db.collection("verificationAuditLogs")
      .where("actorUid", "==", uid).get();
    await Promise.all([
      ...ledger.docs.map((doc) => doc.ref.delete()),
      ...audit.docs.map((doc) => doc.ref.delete()),
      userRef.delete(),
    ]);
  }
});

test("failed or unsupported local biometric claims never earn a reward", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const uid = `biometric_invalid_${suffix()}`;
  const userRef = db.collection("users").doc(uid);
  await userRef.set({ coins: 100, profileCompleted: true, accountStatus: "active" });
  try {
    await assert.rejects(
      () => completeBiometricVerificationCycle.run(request(uid, {
        localAuthenticationSucceeded: false, platform: "android", attemptId: `attempt_${suffix()}`,
      })),
      (error) => error && error.code === "failed-precondition",
    );
    await assert.rejects(
      () => completeBiometricVerificationCycle.run(request(uid, {
        localAuthenticationSucceeded: true, platform: "web", attemptId: `attempt_${suffix()}`,
      })),
      (error) => error && error.code === "failed-precondition",
    );
    assert.equal((await userRef.get()).data().coins, 100);
    assert.equal((await userRef.collection("walletLedger").get()).size, 0);
  } finally {
    await userRef.delete();
  }
});
