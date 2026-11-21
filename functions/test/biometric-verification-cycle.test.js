const test = require("node:test");
const assert = require("node:assert/strict");
const {
  BIOMETRIC_VERIFICATION_CYCLE_MS,
  BIOMETRIC_VERIFICATION_REWARD_COINS,
  createBiometricVerificationCycle,
  isBiometricVerificationDue,
  biometricVerificationRewardLedgerId,
} = require("../lib/biometric-verification-cycle");

const NOW = 1_800_000_000_000;

test("creates deterministic 30-day server-clocked cycles", () => {
  const input = { uid: "member-1", sequence: 3, serverNowMs: NOW };
  const cycle = createBiometricVerificationCycle(input);
  assert.deepEqual(cycle, createBiometricVerificationCycle(input));
  assert.equal(cycle.startedAtMs, NOW);
  assert.equal(cycle.expiresAtMs, NOW + BIOMETRIC_VERIFICATION_CYCLE_MS);
  assert.equal(cycle.status, "pending");
});

test("rejects invalid member, sequence and server clock", () => {
  for (const input of [
    { uid: "", sequence: 1, serverNowMs: NOW },
    { uid: "member", sequence: 0, serverNowMs: NOW },
    { uid: "member", sequence: 1, serverNowMs: -1 },
    { uid: "member", sequence: 1.5, serverNowMs: NOW },
  ]) assert.throws(() => createBiometricVerificationCycle(input));
});

test("renewal becomes due exactly at 30 days", () => {
  assert.equal(isBiometricVerificationDue(NOW, NOW + BIOMETRIC_VERIFICATION_CYCLE_MS - 1), false);
  assert.equal(isBiometricVerificationDue(NOW, NOW + BIOMETRIC_VERIFICATION_CYCLE_MS), true);
});

test("ledger identity is cycle-specific and reward is exactly 1500 coins", () => {
  const cycle = createBiometricVerificationCycle({ uid: "member", sequence: 1, serverNowMs: NOW });
  assert.equal(
    biometricVerificationRewardLedgerId(cycle.cycleId),
    "biometric_verification_" + cycle.cycleId,
  );
  assert.throws(() => biometricVerificationRewardLedgerId("bad-id"));
  assert.equal(BIOMETRIC_VERIFICATION_REWARD_COINS, 1500);
});
