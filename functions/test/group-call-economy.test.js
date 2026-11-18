const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateGroupCallCoinShares } = require("../lib/group-call-economy.js");

function assertExactSplit(total, participants, key) {
  const shares = calculateGroupCallCoinShares(total, participants, key);
  assert.equal(shares.reduce((sum, item) => sum + item.amount, 0), total);
  assert.equal(new Set(shares.map((item) => item.uid)).size, participants.length);
  assert.ok(shares.every((item) => Number.isSafeInteger(item.amount) && item.amount > 0));
  return shares;
}

test("audio 1,000 coins split across four participants exactly", () => {
  const shares = assertExactSplit(1000, ["a", "b", "c", "d"], "call-a:minute-1");
  assert.deepEqual(shares.map((item) => item.amount), [250, 250, 250, 250]);
});

test("audio 1,000 coins split across seven participants without fractional balances", () => {
  const shares = assertExactSplit(1000, ["a", "b", "c", "d", "e", "f", "g"], "call-a:minute-1");
  assert.equal(shares.filter((item) => item.amount === 143).length, 6);
  assert.equal(shares.filter((item) => item.amount === 142).length, 1);
});

test("audio 1,000 coins split across nine participants without losing remainder", () => {
  const shares = assertExactSplit(1000, ["a", "b", "c", "d", "e", "f", "g", "h", "i"], "call-a:minute-1");
  assert.equal(shares.filter((item) => item.amount === 112).length, 4);
  assert.equal(shares.filter((item) => item.amount === 111).length, 5);
});

test("video 2,000 coins split across four participants", () => {
  const shares = assertExactSplit(2000, ["a", "b", "c", "d"], "call-v:minute-1");
  assert.deepEqual(shares.map((item) => item.amount), [500, 500, 500, 500]);
});

test("allocation is independent of input order and stable for retries", () => {
  const first = calculateGroupCallCoinShares(1000, ["a", "b", "c", "d", "e", "f", "g"], "call-a:minute-1");
  const second = calculateGroupCallCoinShares(1000, ["g", "e", "c", "a", "f", "d", "b"], "call-a:minute-1");
  assert.deepEqual(first, second);
  assert.notDeepEqual(
    first,
    calculateGroupCallCoinShares(1000, ["a", "b", "c", "d", "e", "f", "g"], "call-a:minute-2"),
  );
});

test("invalid totals, keys, duplicate members and zero-sized shares fail closed", () => {
  assert.throws(() => calculateGroupCallCoinShares(0, ["a"], "interval"));
  assert.throws(() => calculateGroupCallCoinShares(1.5, ["a"], "interval"));
  assert.throws(() => calculateGroupCallCoinShares(100, ["a", "a"], "interval"));
  assert.throws(() => calculateGroupCallCoinShares(2, ["a", "b", "c"], "interval"));
  assert.throws(() => calculateGroupCallCoinShares(100, ["a"], ""));
});
