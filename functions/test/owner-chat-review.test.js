const test = require("node:test");
const assert = require("node:assert/strict");
const { validateOwnerChatReviewRequest } = require("../lib/owner-chat-review");

const chatId = "a".repeat(64);

test("accepts a scoped owner review request with a documented reason", () => {
  assert.deepEqual(
    validateOwnerChatReviewRequest({ chatId, reason: "Member submitted a safety report", limit: 25 }),
    { chatId, reason: "Member submitted a safety report", limit: 25 },
  );
});

test("defaults owner review page size to fifty", () => {
  assert.equal(
    validateOwnerChatReviewRequest({ chatId, reason: "Investigating a reported incident" }).limit,
    50,
  );
});

test("rejects malformed conversation identifiers", () => {
  assert.throws(
    () => validateOwnerChatReviewRequest({ chatId: "not-a-chat", reason: "Investigating a reported incident" }),
    /INVALID_CHAT_ID/,
  );
});

test("requires a meaningful review reason", () => {
  assert.throws(
    () => validateOwnerChatReviewRequest({ chatId, reason: "checking" }),
    /REVIEW_REASON_REQUIRED/,
  );
  assert.throws(
    () => validateOwnerChatReviewRequest({ chatId, reason: "x".repeat(501) }),
    /REVIEW_REASON_REQUIRED/,
  );
});

test("rejects invalid or excessive page sizes", () => {
  for (const limit of [0, -1, 51, 1.5, "25", Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(
      () => validateOwnerChatReviewRequest({ chatId, reason: "Investigating a reported incident", limit }),
      /INVALID_PAGE_SIZE/,
    );
  }
});
