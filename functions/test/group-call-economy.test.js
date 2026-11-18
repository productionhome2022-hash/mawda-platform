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

test("audio group allocation supports the five-person owner-approved maximum", () => {
  const shares = assertExactSplit(1000, ["owner", "b", "c", "d", "e"], "owner");
  assert.equal(shares.owner, 200);
  for (const uid of ["b", "c", "d", "e"]) assert.equal(shares[uid], 200);
});

test("video 2,000 coins split across four participants", () => {
  assert.deepEqual(assertExactSplit(2000, ["owner", "b", "c", "d"], "owner"),
    { b: 500, c: 500, d: 500, owner: 500 });
});

test("video group allocation supports the four-person maximum", () => {
  const shares = assertExactSplit(2000, ["owner", "b", "c", "d"], "owner");
  assert.deepEqual(shares, { b: 500, c: 500, d: 500, owner: 500 });
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
  assert.throws(() => calculateGroupCallCoinShares(1000, ["owner", "b", "c", "d", "e", "f"], "owner"), /GROUP_CALL_PARTICIPANT_LIMIT_EXCEEDED/);
});
