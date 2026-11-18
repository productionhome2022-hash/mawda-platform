const test = require("node:test");
const assert = require("node:assert/strict");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const {
  startEmailVerificationRenewal,
  completeEmailVerificationRenewal,
} = require("../../lib/index");
const DAY_MS = 24 * 60 * 60 * 1000;

const db = getFirestore();
const auth = getAuth();
const request = (uid) => ({
  data: {},
  auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
});
const suffix = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

test("fresh email link renewal uses its immutable owner-configured reward snapshot", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  assert.ok(process.env.FIREBASE_AUTH_EMULATOR_HOST, "Auth emulator is required");
  const tag = suffix();
  const uid = `email_renewal_${tag}`;
  const email = `renewal_${tag}@example.test`;
  const userRef = db.collection("users").doc(uid);
  const economyRef = db.doc("platformSettings/economyPricing");
  const oldEconomy = await economyRef.get();
  const oldEconomyData = oldEconomy.exists ? oldEconomy.data() : null;
  const cycleDays = 90;
  const rewardCoins = 500; // Test fixture only; never a production default.
  const lastVerifiedAtMs = Date.now() - cycleDays * DAY_MS - 1000;
  const ledgerIdPrefix = "email_verification_";
  let cycleRef;
  let ledgerRef;
  let auditRef;

  await auth.createUser({ uid, email, password: "Test-only-password-123!", emailVerified: true });
  await economyRef.set({
    emailVerificationReward: { enabled: true, rewardCoins, cycleDays },
    version: 1,
  }, { merge: true });
  await userRef.set({
    uid,
    email,
    emailVerified: true,
    emailVerifiedAt: Timestamp.fromMillis(lastVerifiedAtMs),
    emailVerificationSequence: 1,
    emailVerificationCycleId: "initial-cycle",
    emailVerificationCycleStartedAt: Timestamp.fromMillis(lastVerifiedAtMs),
    emailVerificationCycleExpiresAt: Timestamp.fromMillis(lastVerifiedAtMs + cycleDays * DAY_MS),
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
    assert.equal(completed.rewardAmount, rewardCoins);
    assert.equal(completed.newBalance, 250 + rewardCoins);

    const member = (await userRef.get()).data();
    assert.equal(member.coins, 250 + rewardCoins);
    assert.equal(member.emailVerified, true);
    assert.equal(member.emailVerificationSequence, 2);
    assert.equal(member.emailVerificationCycleId, started.cycleId);
    assert.equal(member.emailVerificationRenewalPendingCycleId, undefined);
    assert.ok(member.emailVerificationCycleExpiresAt.toMillis() > Date.now());

    const cycle = (await cycleRef.get()).data();
    assert.equal(cycle.status, "rewarded");
    ledgerRef = userRef.collection("walletLedger").doc(ledgerIdPrefix + started.cycleId);
    auditRef = db.collection("verificationAuditLogs").doc(ledgerIdPrefix + started.cycleId);
    assert.equal((await ledgerRef.get()).data().amount, rewardCoins);
    assert.equal((await auditRef.get()).data().action, "email_verification_cycle_rewarded");

    await assert.rejects(
      () => completeEmailVerificationRenewal.run(request(uid)),
      (error) => error && error.code === "failed-precondition",
    );
    await assert.rejects(
      () => startEmailVerificationRenewal.run(request(uid)),
      (error) => error && error.code === "failed-precondition",
    );
    assert.equal((await userRef.get()).data().coins, 250 + rewardCoins);
  } finally {
    await Promise.all([
      cycleRef?.delete().catch(() => undefined),
      ledgerRef?.delete().catch(() => undefined),
      auditRef?.delete().catch(() => undefined),
      userRef.delete().catch(() => undefined),
      auth.deleteUser(uid).catch(() => undefined),
      oldEconomy.exists ? economyRef.set(oldEconomyData) : economyRef.delete(),
    ]);
  }
});


test("email verification renewal completes without issuing coins when owner reward policy is disabled", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  assert.ok(process.env.FIREBASE_AUTH_EMULATOR_HOST, "Auth emulator is required");
  const tag = suffix();
  const uid = `email_no_reward_${tag}`;
  const email = `no_reward_${tag}@example.test`;
  const userRef = db.collection("users").doc(uid);
  const economyRef = db.doc("platformSettings/economyPricing");
  const oldEconomy = await economyRef.get();
  const oldEconomyData = oldEconomy.exists ? oldEconomy.data() : null;
  const cycleDays = 45;
  const now = Date.now();
  const startedAt = now - cycleDays * DAY_MS - 1000;
  let cycleRef;
  let auditRef;
  await auth.createUser({ uid, email, password: "Test-only-password-123!", emailVerified: true });
  await economyRef.set({
    emailVerificationReward: { enabled: false, rewardCoins: 0, cycleDays },
    version: 2,
  }, { merge: true });
  await userRef.set({
    uid, email, emailVerified: true, emailVerifiedAt: Timestamp.fromMillis(startedAt),
    emailVerificationSequence: 1, emailVerificationCycleId: "initial-cycle",
    emailVerificationCycleStartedAt: Timestamp.fromMillis(startedAt),
    emailVerificationCycleExpiresAt: Timestamp.fromMillis(startedAt + cycleDays * DAY_MS),
    coins: 250, profileCompleted: true, accountStatus: "active",
  });
  try {
    const started = await startEmailVerificationRenewal.run(request(uid));
    cycleRef = db.collection("emailVerificationCycles").doc(`${uid}_${started.cycleId}`);
    assert.equal((await cycleRef.get()).data().rewardPolicySnapshot.enabled, false);
    await auth.updateUser(uid, { emailVerified: true });
    const completed = await completeEmailVerificationRenewal.run(request(uid));
    assert.equal(completed.rewardGranted, false);
    assert.equal(completed.rewardAmount, 0);
    assert.equal(completed.newBalance, 250);
    assert.equal((await userRef.get()).data().coins, 250);
    assert.equal((await cycleRef.get()).data().status, "verified");
    const ledger = await userRef.collection("walletLedger")
      .doc("email_verification_" + started.cycleId).get();
    assert.equal(ledger.exists, false);
    auditRef = db.collection("verificationAuditLogs")
      .doc("email_verification_" + started.cycleId);
    assert.equal((await auditRef.get()).data().rewardCoins, 0);
  } finally {
    await Promise.all([
      cycleRef?.delete().catch(() => undefined),
      auditRef?.delete().catch(() => undefined),
      userRef.delete().catch(() => undefined),
      auth.deleteUser(uid).catch(() => undefined),
      oldEconomy.exists ? economyRef.set(oldEconomyData) : economyRef.delete(),
    ]);
  }
});
