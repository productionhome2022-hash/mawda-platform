const test = require("node:test");
const assert = require("node:assert/strict");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const {
  startEmailVerificationRenewal,
  completeEmailVerificationRenewal,
} = require("../../lib/index");
const { EMAIL_VERIFICATION_CYCLE_MS } = require("../../lib/email-verification-cycle");

const db = getFirestore();
const auth = getAuth();
const request = (uid) => ({
  data: {},
  auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
});
const suffix = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

test("fresh email link renewal credits 500 coins once and starts the next 90-day cycle", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  assert.ok(process.env.FIREBASE_AUTH_EMULATOR_HOST, "Auth emulator is required");
  const tag = suffix();
  const uid = `email_renewal_${tag}`;
  const email = `renewal_${tag}@example.test`;
  const userRef = db.collection("users").doc(uid);
  const lastVerifiedAtMs = Date.now() - EMAIL_VERIFICATION_CYCLE_MS - 1000;
  const ledgerIdPrefix = "email_verification_";
  let cycleRef;
  let ledgerRef;
  let auditRef;

  await auth.createUser({ uid, email, password: "Test-only-password-123!", emailVerified: true });
  await userRef.set({
    uid,
    email,
    emailVerified: true,
    emailVerifiedAt: Timestamp.fromMillis(lastVerifiedAtMs),
    emailVerificationSequence: 1,
    emailVerificationCycleId: "initial-cycle",
    emailVerificationCycleStartedAt: Timestamp.fromMillis(lastVerifiedAtMs),
    emailVerificationCycleExpiresAt: Timestamp.fromMillis(lastVerifiedAtMs + EMAIL_VERIFICATION_CYCLE_MS),
    coins: 250,
    profileCompleted: true,
    accountStatus: "active",
  });

  try {
    const started = await startEmailVerificationRenewal.run(request(uid));
    assert.equal(started.email, email);
    assert.equal(started.alreadyPending, false);
    assert.equal(started.sendVerificationEmail, true);

    const authAfterStart = await auth.getUser(uid);
    assert.equal(authAfterStart.emailVerified, false);
    cycleRef = db.collection("emailVerificationCycles").doc(`${uid}_${started.cycleId}`);
    const pending = (await cycleRef.get()).data();
    assert.equal(pending.status, "pending");
    assert.ok(pending.authResetAt);

    await assert.rejects(
      () => completeEmailVerificationRenewal.run(request(uid)),
      (error) => error && error.code === "failed-precondition",
    );
    assert.equal((await userRef.get()).data().coins, 250);

    // Simulate the Firebase Auth action link being redeemed by its owner.
    await auth.updateUser(uid, { emailVerified: true });
    const completed = await completeEmailVerificationRenewal.run(request(uid));
    assert.equal(completed.rewardGranted, true);
    assert.equal(completed.rewardAmount, 500);
    assert.equal(completed.newBalance, 750);

    const member = (await userRef.get()).data();
    assert.equal(member.coins, 750);
    assert.equal(member.emailVerified, true);
    assert.equal(member.emailVerificationSequence, 2);
    assert.equal(member.emailVerificationCycleId, started.cycleId);
    assert.equal(member.emailVerificationRenewalPendingCycleId, undefined);
    assert.ok(member.emailVerificationCycleExpiresAt.toMillis() > Date.now());

    const cycle = (await cycleRef.get()).data();
    assert.equal(cycle.status, "rewarded");
    ledgerRef = userRef.collection("walletLedger").doc(ledgerIdPrefix + started.cycleId);
    auditRef = db.collection("verificationAuditLogs").doc(ledgerIdPrefix + started.cycleId);
    assert.equal((await ledgerRef.get()).data().amount, 500);
    assert.equal((await auditRef.get()).data().action, "email_verification_cycle_rewarded");

    await assert.rejects(
      () => completeEmailVerificationRenewal.run(request(uid)),
      (error) => error && error.code === "failed-precondition",
    );
    await assert.rejects(
      () => startEmailVerificationRenewal.run(request(uid)),
      (error) => error && error.code === "failed-precondition",
    );
    assert.equal((await userRef.get()).data().coins, 750);
  } finally {
    await Promise.all([
      cycleRef?.delete().catch(() => undefined),
      ledgerRef?.delete().catch(() => undefined),
      auditRef?.delete().catch(() => undefined),
      userRef.delete().catch(() => undefined),
      auth.deleteUser(uid).catch(() => undefined),
    ]);
  }
});
