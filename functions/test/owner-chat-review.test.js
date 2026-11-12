const test = require("node:test");
const assert = require("node:assert/strict");
const { validateOwnerChatReviewRequest } = require("../lib/owner-chat-review");

const chatId = "a".repeat(64);

test("accepts owner review without requiring a reason or case", () => {
  assert.deepEqual(
    validateOwnerChatReviewRequest({ chatId, limit: 25 }),
    { chatId, reason: null, mode: "silent", limit: 25 },
  );
});

test("keeps an optional reason as audit context", () => {
  assert.deepEqual(
    validateOwnerChatReviewRequest({ chatId, reason: "Routine owner review" }),
    { chatId, reason: "Routine owner review", mode: "silent", limit: 50 },
  );
  assert.deepEqual(
    validateOwnerChatReviewRequest({ chatId, reason: "   " }),
    { chatId, reason: null, mode: "silent", limit: 50 },
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


test("owner participation accepts only the three approved display labels", () => {
  const base = {
    chatId,
    text: "مرحباً، هذه رسالة إدارية من فريق مودة.",
    clientMessageId: "owner-message-123",
  };
  for (const mode of ["platform_admin", "super_admin", "anonymous"]) {
    assert.equal(validateOwnerChatParticipationRequest({ ...base, mode }).mode, mode);
  }
  assert.throws(() => validateOwnerChatParticipationRequest({
    ...base, mode: "member_impersonation",
  }), /INVALID_OWNER_PARTICIPATION_MODE/);
});

test("owner participation rejects malformed chat, message text, and idempotency keys", () => {
  const base = {
    chatId,
    text: "رسالة إدارية",
    clientMessageId: "owner-message-123",
    mode: "anonymous",
  };
  assert.throws(() => validateOwnerChatParticipationRequest({
    ...base, chatId: "bad",
  }), /INVALID_CHAT_ID/);
  assert.throws(() => validateOwnerChatParticipationRequest({
    ...base, text: "   ",
  }), /INVALID_OWNER_MESSAGE_TEXT/);
  assert.throws(() => validateOwnerChatParticipationRequest({
    ...base, text: "x".repeat(4001),
  }), /INVALID_OWNER_MESSAGE_TEXT/);
  assert.throws(() => validateOwnerChatParticipationRequest({
    ...base, clientMessageId: "bad key",
  }), /INVALID_OWNER_MESSAGE_ID/);
});
