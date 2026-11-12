const test = require("node:test");
const assert = require("node:assert/strict");
const { validateOwnerChatReviewRequest } = require("../lib/owner-chat-review");

const chatId = "a".repeat(64);

test("accepts owner review without requiring a reason or case", () => {
  assert.deepEqual(
    validateOwnerChatReviewRequest({ chatId, limit: 25 }),
    { chatId, reason: null, limit: 25 },
  );
});

test("keeps an optional reason as audit context", () => {
  assert.deepEqual(
    validateOwnerChatReviewRequest({ chatId, reason: "Routine owner review" }),
    { chatId, reason: "Routine owner review", limit: 50 },
  );
  assert.equal(
    validateOwnerChatReviewRequest({ chatId, reason: "   " }).reason,
    null,
  );
});

test("rejects optional audit context longer than five hundred characters", () => {
  assert.throws(
    () => validateOwnerChatReviewRequest({ chatId, reason: "x".repeat(501) }),
    /INVALID_REVIEW_REASON/,
  );
});

test("defaults owner review page size to fifty", () => {
  assert.equal(
    validateOwnerChatReviewRequest({ chatId }).limit,
    50,
  );
});

test("rejects malformed conversation identifiers", () => {
  assert.throws(
    () => validateOwnerChatReviewRequest({ chatId: "not-a-chat" }),
    /INVALID_CHAT_ID/,
  );
});

test("rejects invalid or excessive page sizes", () => {
  for (const limit of [0, -1, 51, 1.5, "25", Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(
      () => validateOwnerChatReviewRequest({ chatId, limit }),
      /INVALID_PAGE_SIZE/,
    );
  }
});
