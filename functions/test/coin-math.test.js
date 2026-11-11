const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateTransferBreakdown } = require("../lib/coin-math.js");

test("20% commission on 1,000 coins credits 800 and records 200", () => {
  assert.deepEqual(calculateTransferBreakdown(1000, 2000), {
    grossAmount: 1000, commissionBps: 2000, commissionAmount: 200, netAmount: 800,
  });
});

test("zero commission passes the full amount to the recipient", () => {
  assert.deepEqual(calculateTransferBreakdown(875, 0), {
    grossAmount: 875, commissionBps: 0, commissionAmount: 0, netAmount: 875,
  });
});

test("fractional commission is rounded down to whole coins", () => {
  assert.deepEqual(calculateTransferBreakdown(3, 2000), {
    grossAmount: 3, commissionBps: 2000, commissionAmount: 0, netAmount: 3,
  });
});

test("large safe integer amounts use exact arithmetic", () => {
  const amount = Number.MAX_SAFE_INTEGER;
  const result = calculateTransferBreakdown(amount, 2000);
  assert.equal(result.commissionAmount, Number((BigInt(amount) * 2000n) / 10000n));
  assert.equal(result.netAmount + result.commissionAmount, amount);
});

test("invalid amounts and commission rates are rejected", () => {
  assert.throws(() => calculateTransferBreakdown(0, 2000));
  assert.throws(() => calculateTransferBreakdown(100, 10000));
  assert.throws(() => calculateTransferBreakdown(1.5, 1000));
});
