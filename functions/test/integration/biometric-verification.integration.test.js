const test = require("node:test");
const assert = require("node:assert/strict");
const { getFirestore } = require("firebase-admin/firestore");
const { completeBiometricVerificationCycle } = require("../../lib/index");

const db = getFirestore();
const request = (uid, data) => ({
  data,
  auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
});
const suffix = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

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
