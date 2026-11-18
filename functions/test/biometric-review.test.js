const test = require("node:test");
const assert = require("node:assert/strict");
const {
  BIOMETRIC_MAX_ATTEMPTS, BIOMETRIC_LOCKOUT_MS,
  addBiometricRenewalMonth, canSubmitBiometricRequest, decideBiometricRequest,
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
