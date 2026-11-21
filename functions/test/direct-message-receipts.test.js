const test = require("node:test");
const assert = require("node:assert/strict");
const {
  shouldAdvanceReadReceipt,
  isMessageReadByPeer,
} = require("../lib/direct-message-receipts");

test("read receipt cursor advances monotonically and accepts first receipt", () => {
  assert.equal(shouldAdvanceReadReceipt(null, 100), true);
  assert.equal(shouldAdvanceReadReceipt(100, 101), true);
  assert.equal(shouldAdvanceReadReceipt(100, 100), true);
  assert.equal(shouldAdvanceReadReceipt(101, 100), false);
});

test("read receipt cursor rejects invalid timestamps", () => {
  for (const value of [-1, 1.5, "100", Number.MAX_SAFE_INTEGER + 1, NaN]) {
    assert.equal(shouldAdvanceReadReceipt(null, value), false);
  }
  assert.equal(shouldAdvanceReadReceipt("100", 101), false);
});

test("a message is read only when its creation time is covered by the peer cursor", () => {
  assert.equal(isMessageReadByPeer(99, 100), true);
  assert.equal(isMessageReadByPeer(100, 100), true);
  assert.equal(isMessageReadByPeer(101, 100), false);
  assert.equal(isMessageReadByPeer(100, null), false);
  assert.equal(isMessageReadByPeer("100", 200), false);
});
