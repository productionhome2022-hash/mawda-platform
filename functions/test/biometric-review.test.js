const test = require("node:test");
const assert = require("node:assert/strict");
const {
  BIOMETRIC_MAX_ATTEMPTS, BIOMETRIC_LOCKOUT_MS,
  addBiometricRenewalMonth, canSubmitBiometricRequest, nextBiometricAttemptNumber, decideBiometricRequest,
} = require("../lib/biometric-review");

const pending = (attemptNumber) => ({
  status: "pending_review", attemptNumber, rewardGranted: false, lockoutUntilMs: null,
});

test("owner delay leaves request pending and blocks duplicate submissions without auto-rejection", () => {
  assert.equal(canSubmitBiometricRequest(pending(1), Date.now() + 365 * 86400000), false);
});

test("email and biometric renewal policies stay separate; biometric renewal is one calendar month", () => {
  const jan31 = new Date("2026-01-31T12:00:00Z").getTime();
  assert.equal(new Date(addBiometricRenewalMonth(jan31)).toISOString(), "2026-02-28T12:00:00.000Z");
  const feb28 = new Date("2026-02-28T12:00:00Z").getTime();
  assert.equal(new Date(addBiometricRenewalMonth(feb28)).toISOString(), "2026-03-28T12:00:00.000Z");
  assert.equal(canSubmitBiometricRequest({
    status: "accepted", attemptNumber: 1, rewardGranted: true, lockoutUntilMs: null,
    nextRenewalAtMs: feb28,
  }, feb28 - 1), false);
  assert.equal(canSubmitBiometricRequest({
    status: "accepted", attemptNumber: 1, rewardGranted: true, lockoutUntilMs: null,
    nextRenewalAtMs: feb28,
  }, feb28), true);
});

test("calendar-month renewal is UTC-stable across leap years and month ends", () => {
  const jan31Leap = Date.parse("2024-01-31T23:30:00.000Z");
  assert.equal(new Date(addBiometricRenewalMonth(jan31Leap)).toISOString(), "2024-02-29T23:30:00.000Z");
  const mar31 = Date.parse("2026-03-31T00:15:00.000Z");
  assert.equal(new Date(addBiometricRenewalMonth(mar31)).toISOString(), "2026-04-30T00:15:00.000Z");
});

test("attempt sequence advances after rejection and resets only after the full lockout", () => {
  assert.equal(nextBiometricAttemptNumber(null, 100), 1);
  assert.equal(nextBiometricAttemptNumber({ ...pending(1), status: "rejected" }, 100), 2);
  assert.equal(nextBiometricAttemptNumber({ ...pending(2), status: "rejected" }, 100), 3);
  const locked = { ...pending(3), status: "locked", lockoutUntilMs: 200 };
  assert.throws(() => nextBiometricAttemptNumber(locked, 199), /LOCKOUT_ACTIVE/);
  assert.equal(nextBiometricAttemptNumber(locked, 200), 1);
  assert.throws(() => nextBiometricAttemptNumber(pending(1), 100), /ALREADY_PENDING/);
});

test("only Super Owner can decide and accepted request grants reward and schedules monthly renewal", () => {
  assert.throws(() => decideBiometricRequest({
    state: pending(1), decision: "accept", actorIsSuperOwner: false, nowMs: 10,
  }), /SUPER_OWNER_ONLY/);
  const accepted = decideBiometricRequest({
    state: pending(1), decision: "accept", actorIsSuperOwner: true, nowMs: Date.parse("2026-01-31T12:00:00Z"),
  });
  assert.equal(accepted.rewardCoins, 1500);
  assert.equal(accepted.badgeGranted, true);
  assert.equal(accepted.nextRenewalAtMs, Date.parse("2026-02-28T12:00:00Z"));
});

test("rejections expose two, then one, then zero attempts and lock for three months", () => {
  const first = decideBiometricRequest({ state: pending(1), decision: "reject", actorIsSuperOwner: true, nowMs: 1000 });
  assert.equal(first.remainingAttempts, 2);
  const second = decideBiometricRequest({ state: pending(2), decision: "reject", actorIsSuperOwner: true, nowMs: 1000 });
  assert.equal(second.remainingAttempts, 1);
  const third = decideBiometricRequest({ state: pending(3), decision: "reject", actorIsSuperOwner: true, nowMs: 1000 });
  assert.equal(third.status, "locked");
  assert.equal(third.lockoutUntilMs, 1000 + BIOMETRIC_LOCKOUT_MS);
  assert.equal(BIOMETRIC_MAX_ATTEMPTS, 3);
});

test("invalid status, attempt and replayed decision fail closed", () => {
  assert.throws(() => decideBiometricRequest({
    state: { ...pending(1), status: "accepted" }, decision: "accept", actorIsSuperOwner: true, nowMs: 1,
  }), /NOT_REVIEWABLE/);
  assert.throws(() => decideBiometricRequest({
    state: pending(4), decision: "reject", actorIsSuperOwner: true, nowMs: 1,
  }), /NOT_REVIEWABLE/);
});
