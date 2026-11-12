const test = require("node:test");
const assert = require("node:assert/strict");
const {
  validateOwnerChatReviewRequest,
  validateOwnerChatParticipationRequest,
  validateOwnerConversationPageRequest,
  encodeOwnerMessagePageToken,
  decodeOwnerMessagePageToken,
} = require("../lib/owner-chat-review");

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


test("owner message review accepts a validated continuation cursor", () => {
  assert.deepEqual(
    validateOwnerChatReviewRequest({ chatId, pageToken: "message_123" }),
    { chatId, reason: null, mode: "silent", limit: 50, pageToken: "message_123" },
  );
  assert.equal(validateOwnerChatReviewRequest({ chatId }).pageToken, null);
});

test("owner message review rejects malformed continuation cursors", () => {
  for (const pageToken of [42, {}, "contains spaces", "x".repeat(129)]) {
    assert.throws(
      () => validateOwnerChatReviewRequest({ chatId, pageToken }),
      /INVALID_PAGE_TOKEN/,
    );
  }
});

test("owner conversation pagination is member-scoped and bounded", () => {
  assert.deepEqual(
    validateOwnerConversationPageRequest({
      memberUid: " member-123 ",
      limit: 20,
      pageToken: "chat_456",
    }),
    { memberUid: "member-123", limit: 20, pageToken: "chat_456" },
  );
  assert.deepEqual(
    validateOwnerConversationPageRequest({ memberUid: "member-123" }),
    { memberUid: "member-123", limit: 50, pageToken: null },
  );
});

test("owner conversation pagination rejects invalid member, page size and cursor", () => {
  assert.throws(() => validateOwnerConversationPageRequest({ memberUid: " " }), /INVALID_MEMBER_UID/);
  for (const limit of [0, 51, 1.2, "20"]) {
    assert.throws(
      () => validateOwnerConversationPageRequest({ memberUid: "member-123", limit }),
      /INVALID_PAGE_SIZE/,
    );
  }
  assert.throws(
    () => validateOwnerConversationPageRequest({ memberUid: "member-123", pageToken: "bad token" }),
    /INVALID_PAGE_TOKEN/,
  );
});


test("owner message cursors round-trip timestamp and message identity", () => {
  const token = encodeOwnerMessagePageToken(1794500000123, "message_abc-123");
  assert.deepEqual(decodeOwnerMessagePageToken(token), {
    createdAtMillis: 1794500000123,
    messageId: "message_abc-123",
  });
});

test("owner message cursor decoder rejects malformed, noncanonical and unsafe tokens", () => {
  for (const token of ["not-base64!", Buffer.from("[1, \"m\"]").toString("base64url") + "x",
    Buffer.from(JSON.stringify([-1, "m"])).toString("base64url"),
    Buffer.from(JSON.stringify([1.5, "m"])).toString("base64url"),
    Buffer.from(JSON.stringify([1, ""])).toString("base64url")]) {
    assert.throws(() => decodeOwnerMessagePageToken(token), /INVALID_MESSAGE_CURSOR/);
  }
  assert.throws(() => encodeOwnerMessagePageToken(-1, "m"), /INVALID_MESSAGE_CURSOR/);
});
