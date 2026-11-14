const test = require("node:test");
const assert = require("node:assert/strict");
const {
  EMAIL_VERIFICATION_CYCLE_MS,
  EMAIL_VERIFICATION_REWARD_COINS,
  createEmailVerificationCycle,
  isEmailVerificationCycleDue,
  canRewardEmailVerificationCycle,
  emailVerificationRewardLedgerId,
} = require("../lib/email-verification-cycle");

const NOW = 1_800_000_000_000;

test("creates deterministic server-clocked 90-day cycle bound to normalized email", () => {
  const input = { uid: "member-1", email: " Member@Example.com ", sequence: 2, serverNowMs: NOW };
  const first = createEmailVerificationCycle(input);
  assert.deepEqual(first, createEmailVerificationCycle(input));
  assert.equal(first.email, "member@example.com");
  assert.equal(first.startedAtMs, NOW);
  assert.equal(first.expiresAtMs, NOW + EMAIL_VERIFICATION_CYCLE_MS);
  assert.equal(first.status, "pending");
});

test("rejects invalid identity, email, sequence and server clock", () => {
  for (const input of [
    { uid: "", email: "a@b.com", sequence: 1, serverNowMs: NOW },
    { uid: "u", email: "not-an-email", sequence: 1, serverNowMs: NOW },
    { uid: "u", email: "a@b.com", sequence: 0, serverNowMs: NOW },
    { uid: "u", email: "a@b.com", sequence: 1, serverNowMs: -1 },
  ]) assert.throws(() => createEmailVerificationCycle(input));
});

test("renewal becomes due at exactly 90 days using server time", () => {
  assert.equal(isEmailVerificationCycleDue(NOW, NOW + EMAIL_VERIFICATION_CYCLE_MS - 1), false);
  assert.equal(isEmailVerificationCycleDue(NOW, NOW + EMAIL_VERIFICATION_CYCLE_MS), true);
});

test("reward requires pending cycle, verified Auth state, unchanged email and unexpired cycle", () => {
  const cycle = createEmailVerificationCycle({
    uid: "member-1", email: "member@example.com", sequence: 1, serverNowMs: NOW,
  });
  const base = { cycle, currentEmail: "MEMBER@example.com", authEmailVerified: true, serverNowMs: NOW + 1 };
  assert.equal(canRewardEmailVerificationCycle(base), true);
  assert.equal(canRewardEmailVerificationCycle({ ...base, currentEmail: "changed@example.com" }), false);
  assert.equal(canRewardEmailVerificationCycle({ ...base, authEmailVerified: false }), false);
  assert.equal(canRewardEmailVerificationCycle({ ...base, serverNowMs: cycle.expiresAtMs }), false);
  assert.equal(canRewardEmailVerificationCycle({ ...base, cycle: { ...cycle, status: "rewarded" } }), false);
  assert.equal(canRewardEmailVerificationCycle({ ...base, cycle: { ...cycle, status: "revoked" } }), false);
});

test("cycle-specific ledger identity prevents reward collisions and validates ids", () => {
  const cycle = createEmailVerificationCycle({
    uid: "member-1", email: "member@example.com", sequence: 1, serverNowMs: NOW,
  });
  assert.equal(emailVerificationRewardLedgerId(cycle.cycleId), "email_verification_" + cycle.cycleId);
  assert.throws(() => emailVerificationRewardLedgerId("bad-id"));
  assert.equal(EMAIL_VERIFICATION_REWARD_COINS, 500);
});
