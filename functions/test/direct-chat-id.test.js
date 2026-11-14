const test = require("node:test");
const assert = require("node:assert/strict");
const { createDirectChatId } = require("../lib/direct-chat-id");

test("direct chat ID is symmetric and a fixed-length lowercase SHA-256 digest", () => {
  const forward = createDirectChatId("member-a", "member-b");
  const reverse = createDirectChatId("member-b", "member-a");
  assert.equal(forward, reverse);
  assert.match(forward, /^[a-f0-9]{64}$/);
});

test("different participant pairs receive different conversation IDs", () => {
  assert.notEqual(
    createDirectChatId("member-a", "member-b"),
    createDirectChatId("member-a", "member-c"),
  );
});

test("invalid participant pairs fail closed", () => {
  assert.throws(() => createDirectChatId("", "member-b"));
  assert.throws(() => createDirectChatId("member-a", "member-a"));
  assert.throws(() => createDirectChatId("x".repeat(129), "member-b"));
});
