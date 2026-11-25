const test = require("node:test");
const assert = require("node:assert/strict");
const {
  validateGroupCallPricingPolicy, getGroupCallRate,
  calculateGroupCallCoinShares, calculateGroupCallBillingSlice,
  calculateGroupCallMaximumReservation, calculateGroupCallFinalSettlement,
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

test("integer allocation is balanced, deterministic and assigns every remainder coin to the initiator", () => {
  const a = calculateGroupCallCoinShares(101, ["owner", "b", "c"], "owner");
  const b = calculateGroupCallCoinShares(101, ["c", "owner", "b"], "owner");
  assert.deepEqual(a, b);
  assert.deepEqual(a.map((item) => item.amount), [33, 33, 35]);
  assert.equal(a.reduce((sum, item) => sum + item.amount, 0), 101);
  assert.equal(a.find((item) => item.uid === "owner").amount, 35);
});

test("late and early connected members receive the same share based only on final participant count", () => {
  const four = calculateGroupCallCoinShares(2000, ["owner", "early", "late", "last-second"], "owner");
  assert.deepEqual(four.map((item) => item.amount), [500, 500, 500, 500]);
  const three = calculateGroupCallCoinShares(2000, ["owner", "early", "late"], "owner");
  assert.deepEqual(three.map((item) => item.amount), [666, 666, 668]);
  const two = calculateGroupCallCoinShares(2000, ["owner", "late"], "owner");
  assert.deepEqual(two.map((item) => item.amount), [1000, 1000]);
});

test("billing slice freezes owner policy version and charges actual active participants", () => {
  const result = calculateGroupCallBillingSlice(policy, "audio", ["owner", "b", "c"], "owner", 2);
  assert.equal(result.policyId, policy.policyId);
  assert.equal(result.policyVersion, policy.version);
  assert.equal(result.totalAmount, 274);
  assert.equal(result.shares.reduce((sum, item) => sum + item.amount, 0), result.totalAmount);
});

test("integer allocation handles participant counts larger than whole-coin total deterministically", () => {
  const shares = calculateGroupCallCoinShares(1, ["owner", "b", "c", "d"], "owner");
  assert.deepEqual(shares.map((item) => item.amount), [0, 0, 0, 1]);
  assert.equal(shares.find((item) => item.uid === "owner").amount, 1);
  assert.equal(shares.reduce((sum, item) => sum + item.amount, 0), 1);
});

test("maximum reservation and final settlement charge late joiners equally", () => {
  const reserve = calculateGroupCallMaximumReservation(policy, "video", 3 * 60 * 1000);
  assert.equal(reserve.maxBillableMinutes, 3);
  assert.equal(reserve.maxTotalAmount, 879);
  assert.equal(reserve.perParticipantReserve, 440);
  const result = calculateGroupCallFinalSettlement(
    policy, "video", ["owner", "early", "late", "last-second"], "owner",
    15 * 1000, 3 * 60 * 1000,
  );
  assert.equal(result.billableMinutes, 1);
  assert.equal(result.totalAmount, 293);
  assert.equal(result.shares.find((item) => item.uid === "owner").amount, 74);
  assert.deepEqual(result.shares.map((item) => item.amount), [73, 73, 73, 74]);
  assert.equal(result.shares.reduce((sum, item) => sum + item.amount, 0), 293);
});

test("invalid participant sets and invalid duration fail closed", () => {
  assert.throws(() => calculateGroupCallCoinShares(10, ["owner", "owner"], "owner"));
  assert.throws(() => calculateGroupCallCoinShares(10, ["b", "c"], "owner"));
  assert.throws(() => calculateGroupCallBillingSlice(policy, "video", ["owner", "b"], "owner", 0));
  assert.throws(() => calculateGroupCallBillingSlice(policy, "video", ["owner", "b"], "owner", 1441));
});

test("audio group allocation handles five participants without asserting an admission cap", () => {
  const shares = calculateGroupCallCoinShares(1000, ["owner", "b", "c", "d", "e"], "owner");
  assert.deepEqual(shares.map((item) => item.amount), [200, 200, 200, 200, 200]);
  assert.equal(shares.reduce((sum, item) => sum + item.amount, 0), 1000);
});

test("video group allocation supports the four-person owner-approved maximum", () => {
  const shares = calculateGroupCallCoinShares(2000, ["owner", "b", "c", "d"], "owner");
  assert.deepEqual(shares.map((item) => item.amount), [500, 500, 500, 500]);
  assert.equal(shares.reduce((sum, item) => sum + item.amount, 0), 2000);
});
