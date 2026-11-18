const test = require("node:test");
const assert = require("node:assert/strict");
const {
  BIOMETRIC_MAX_ATTEMPTS, BIOMETRIC_LOCKOUT_MS,
  canSubmitBiometricRequest, decideBiometricRequest,
} = require("../lib/biometric-review");

const pending = (attemptNumber) => ({
  status: "pending_review", attemptNumber, rewardGranted: false, lockoutUntilMs: null,
});

test("owner delay leaves request pending and blocks duplicate submissions without auto-rejection", () => {
  assert.equal(canSubmitBiometricRequest(pending(1), Date.now() + 365 * 86400000), false);
});

test("only Super Owner can decide and accepted request grants badge and one reward", () => {
  assert.throws(() => decideBiometricRequest({
    state: pending(1), decision: "accept", actorIsSuperOwner: false, nowMs: 10,
  }), /SUPER_OWNER_ONLY/);
  assert.deepEqual(decideBiometricRequest({
    state: pending(1), decision: "accept", actorIsSuperOwner: true, nowMs: 10,
  }), {
    status: "accepted", rewardCoins: 1500, badgeGranted: true,
    remainingAttempts: 0, lockoutUntilMs: null,
  });
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
