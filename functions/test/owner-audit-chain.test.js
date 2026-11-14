const test = require("node:test");
const assert = require("node:assert/strict");
const {
  calculateOwnerAuditHash,
  verifyOwnerAuditChain,
} = require("../lib/owner-audit-chain");

function makeChain(events) {
  let previousHash = "GENESIS";
  return events.map((event, index) => {
    const sequence = index + 1;
    const eventHash = calculateOwnerAuditHash(event, sequence, previousHash);
    const entry = { sequence, previousHash, eventHash, event };
    previousHash = eventHash;
    return entry;
  });
}

test("owner audit hashes are stable regardless of object key insertion order", () => {
  const first = { actorUid: "owner", details: { z: 2, a: 1 }, action: "review" };
  const second = { action: "review", details: { a: 1, z: 2 }, actorUid: "owner" };
  assert.equal(
    calculateOwnerAuditHash(first, 1, "GENESIS"),
    calculateOwnerAuditHash(second, 1, "GENESIS"),
  );
});

test("verifies a complete hash-linked owner audit chain and its pinned head", () => {
  const entries = makeChain([
    { actorUid: "owner-1", action: "review_requested", chatId: "chat-1" },
    { actorUid: "owner-1", action: "review_page_result", returnedCount: 25 },
    { actorUid: "owner-1", action: "review_requested", chatId: "chat-2" },
  ]);
  const last = entries[entries.length - 1];
  assert.deepEqual(
    verifyOwnerAuditChain(entries, { sequence: last.sequence, eventHash: last.eventHash }),
    { valid: true, sequence: 3, eventHash: last.eventHash, reason: null },
  );
});

test("detects event edits and previous-hash tampering", () => {
  const entries = makeChain([
    { actorUid: "owner-1", action: "review_requested" },
    { actorUid: "owner-1", action: "review_completed" },
  ]);
  const edited = structuredClone(entries);
  edited[0].event.action = "forged_action";
  assert.equal(verifyOwnerAuditChain(edited).reason, "EVENT_HASH_MISMATCH");

  const relinked = structuredClone(entries);
  relinked[1].previousHash = "0".repeat(64);
  assert.equal(verifyOwnerAuditChain(relinked).reason, "PREVIOUS_HASH_MISMATCH");
});

test("detects missing sequence entries and a changed chain head", () => {
  const entries = makeChain([
    { actorUid: "owner-1", action: "one" },
    { actorUid: "owner-1", action: "two" },
  ]);
  assert.equal(verifyOwnerAuditChain([entries[1]]).reason, "SEQUENCE_GAP");
  assert.equal(
    verifyOwnerAuditChain(entries, { sequence: 2, eventHash: "0".repeat(64) }).reason,
    "HEAD_MISMATCH",
  );
});

test("rejects non-finite and unsupported audit payload values", () => {
  assert.throws(
    () => calculateOwnerAuditHash({ amount: Number.NaN }, 1, "GENESIS"),
    /INVALID_AUDIT_VALUE/,
  );
  assert.throws(
    () => calculateOwnerAuditHash({ value: undefined }, 1, "GENESIS"),
    /INVALID_AUDIT_VALUE/,
  );
});
