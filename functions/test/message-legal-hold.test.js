const test = require("node:test");
const assert = require("node:assert/strict");
const { validateMessageLegalHoldInput } = require("../lib/message-legal-hold");

test("message legal hold accepts only exact direct-chat and room message paths", () => {
  const common = {
    authority: "Court order",
    legalBasis: "Preserve the specifically identified text message evidence.",
    reference: "CASE-2026-456",
    startsAtMs: 100,
    reviewAtMs: 200,
    endsAtMs: 300,
  };
  const directPath = `directChats/${"a".repeat(64)}/messages/${"b".repeat(64)}`;
  const roomPath = `rooms/room_123/messages/${"c".repeat(64)}`;
  assert.equal(validateMessageLegalHoldInput({ ...common, messagePath: directPath }, 150).messagePath, directPath);
  assert.equal(validateMessageLegalHoldInput({ ...common, messagePath: roomPath }, 150).messagePath, roomPath);
  for (const messagePath of [
    "users/u/messages/m",
    `directChats/${"a".repeat(63)}/messages/${"b".repeat(64)}`,
    `rooms/../messages/${"c".repeat(64)}`,
    `rooms/r/messages/${"c".repeat(63)}`,
  ]) {
    assert.throws(() => validateMessageLegalHoldInput({ ...common, messagePath }, 150));
  }
});

test("message legal hold requires bounded authority and ordered review/end dates", () => {
  const valid = {
    messagePath: `rooms/room_1/messages/${"d".repeat(64)}`,
    authority: "Court order",
    legalBasis: "Preserve the specifically identified text message evidence.",
    reference: "CASE-2026-456",
    startsAtMs: 100,
    reviewAtMs: 200,
    endsAtMs: 300,
  };
  for (const patch of [
    { authority: "" }, { legalBasis: "short" }, { reference: "" },
    { startsAtMs: 250 }, { reviewAtMs: 100 }, { endsAtMs: 200 },
  ]) {
    assert.throws(() => validateMessageLegalHoldInput({ ...valid, ...patch }, 250));
  }
});
