const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateGroupCallCoinShares } = require("../lib/group-call-economy.js");

function assertExactSplit(total, participants, initiatorUid) {
  const shares = calculateGroupCallCoinShares(total, participants, initiatorUid);
  assert.equal(shares.reduce((sum, item) => sum + item.amount, 0), total);
  assert.equal(new Set(shares.map((item) => item.uid)).size, participants.length);
  assert.ok(shares.every((item) => Number.isSafeInteger(item.amount) && item.amount > 0));
  return Object.fromEntries(shares.map((item) => [item.uid, item.amount]));
}

test("audio 1,000 coins split across four participants", () => {
  assert.deepEqual(assertExactSplit(1000, ["owner", "b", "c", "d"], "owner"),
    { b: 250, c: 250, d: 250, owner: 250 });
});

test("audio remainder is charged entirely to initiator for seven participants", () => {
  const shares = assertExactSplit(1000, ["owner", "b", "c", "d", "e", "f", "g"], "owner");
  assert.equal(shares.owner, 148);
  for (const uid of ["b", "c", "d", "e", "f", "g"]) assert.equal(shares[uid], 142);
});

test("audio remainder is charged entirely to initiator for nine participants", () => {
  const shares = assertExactSplit(1000, ["owner", "b", "c", "d", "e", "f", "g", "h", "i"], "owner");
  assert.equal(shares.owner, 112);
  for (const uid of ["b", "c", "d", "e", "f", "g", "h", "i"]) assert.equal(shares[uid], 111);
});

test("video 2,000 coins split across four participants", () => {
  assert.deepEqual(assertExactSplit(2000, ["owner", "b", "c", "d"], "owner"),
    { b: 500, c: 500, d: 500, owner: 500 });
});

test("initiator remainder is deterministic and independent of input order", () => {
  const first = calculateGroupCallCoinShares(1000, ["owner", "b", "c", "d", "e", "f", "g"], "owner");
  const second = calculateGroupCallCoinShares(1000, ["g", "e", "c", "owner", "f", "d", "b"], "owner");
  assert.deepEqual(first, second);
});

test("invalid totals, missing initiator, duplicate members and zero-sized shares fail closed", () => {
  assert.throws(() => calculateGroupCallCoinShares(0, ["owner"], "owner"));
  assert.throws(() => calculateGroupCallCoinShares(1.5, ["owner"], "owner"));
  assert.throws(() => calculateGroupCallCoinShares(100, ["owner", "owner"], "owner"));
  assert.throws(() => calculateGroupCallCoinShares(2, ["owner", "b", "c"], "owner"));
  assert.throws(() => calculateGroupCallCoinShares(100, ["a", "b"], "owner"));
});
