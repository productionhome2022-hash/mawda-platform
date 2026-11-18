const test = require("node:test");
const assert = require("node:assert/strict");
const {
  validateGroupCallPricingPolicy, getGroupCallRate,
  calculateGroupCallCoinShares, calculateGroupCallBillingSlice,
} = require("../lib/group-call-economy.js");

const policy = {
  policyId: "owner-policy-2026",
  version: 7,
  active: true,
  audioCoinsPerMinute: 137,
  videoCoinsPerMinute: 293,
  updatedAtMs: 1795000000000,
};

test("owner policy is versioned and rates are read from policy, never hard-coded", () => {
  assert.equal(getGroupCallRate(policy, "audio"), 137);
  assert.equal(getGroupCallRate(policy, "video"), 293);
  assert.equal(validateGroupCallPricingPolicy(policy).version, 7);
});

test("missing, inactive, malformed or zero active rates fail closed", () => {
  assert.throws(() => validateGroupCallPricingPolicy(null));
  assert.throws(() => getGroupCallRate({ ...policy, active: false }, "audio"), /DISABLED/);
  assert.throws(() => validateGroupCallPricingPolicy({ ...policy, audioCoinsPerMinute: 0, videoCoinsPerMinute: 0 }));
  assert.throws(() => validateGroupCallPricingPolicy({ ...policy, version: 0 }));
});

test("owner can independently disable one call mode without inventing a price", () => {
  const audioOnly = { ...policy, videoCoinsPerMinute: 0 };
  assert.equal(getGroupCallRate(audioOnly, "audio"), policy.audioCoinsPerMinute);
  assert.throws(() => getGroupCallRate(audioOnly, "video"), /MODE_DISABLED/);
  const videoOnly = { ...policy, audioCoinsPerMinute: 0 };
  assert.equal(getGroupCallRate(videoOnly, "video"), policy.videoCoinsPerMinute);
  assert.throws(() => getGroupCallRate(videoOnly, "audio"), /MODE_DISABLED/);
  assert.throws(() => getGroupCallRate(policy, "unknown"), /INVALID_GROUP_CALL_MODE/);
});

test("unknown runtime call modes are rejected", () => {
  assert.throws(() => getGroupCallRate(policy, "screen"), /INVALID_GROUP_CALL_MODE/);
});

test("integer allocation assigns all remainder to initiator and is deterministic", () => {
  const a = calculateGroupCallCoinShares(101, ["owner", "b", "c"], "owner");
  const b = calculateGroupCallCoinShares(101, ["c", "owner", "b"], "owner");
  assert.deepEqual(a, b);
  assert.equal(a.reduce((sum, item) => sum + item.amount, 0), 101);
  assert.equal(a.find((item) => item.uid === "owner").amount, 35);
});

test("billing slice freezes owner policy version and charges actual active participants", () => {
  const result = calculateGroupCallBillingSlice(policy, "audio", ["owner", "b", "c"], "owner", 2);
  assert.equal(result.policyId, policy.policyId);
  assert.equal(result.policyVersion, policy.version);
  assert.equal(result.totalAmount, 274);
  assert.equal(result.shares.reduce((sum, item) => sum + item.amount, 0), result.totalAmount);
});

test("invalid participant sets and invalid duration fail closed", () => {
  assert.throws(() => calculateGroupCallCoinShares(10, ["owner", "owner"], "owner"));
  assert.throws(() => calculateGroupCallCoinShares(1, ["owner", "b"], "owner"));
  assert.throws(() => calculateGroupCallCoinShares(10, ["b", "c"], "owner"));
  assert.throws(() => calculateGroupCallBillingSlice(policy, "video", ["owner", "b"], "owner", 0));
  assert.throws(() => calculateGroupCallBillingSlice(policy, "video", ["owner", "b"], "owner", 1441));
});
