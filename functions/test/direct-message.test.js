const test = require("node:test");
const assert = require("node:assert/strict");
const { validateDirectMessageInput } = require("../lib/direct-message");

test("normalizes a valid direct message request", () => {
  assert.deepEqual(validateDirectMessageInput({
    recipientUid: " recipient-1 ",
    text: "  Hello Mawda  ",
    clientMessageId: "message_123",
  }), {
    recipientUid: "recipient-1",
    text: "Hello Mawda",
    clientMessageId: "message_123",
  });
});

test("rejects empty, oversized and malformed messages", () => {
  assert.throws(() => validateDirectMessageInput({
    recipientUid: "u2", text: " ", clientMessageId: "message_123",
  }), /INVALID_MESSAGE_TEXT/);
  assert.throws(() => validateDirectMessageInput({
    recipientUid: "u2", text: "x".repeat(4001), clientMessageId: "message_123",
  }), /INVALID_MESSAGE_TEXT/);
  assert.throws(() => validateDirectMessageInput({
    recipientUid: "u2", text: "Hello", clientMessageId: "bad id",
  }), /INVALID_CLIENT_MESSAGE_ID/);
  assert.throws(() => validateDirectMessageInput({
    recipientUid: "", text: "Hello", clientMessageId: "message_123",
  }), /INVALID_RECIPIENT/);
});

test("rejects media attachment fields until the dedicated scanned-media delivery path exists", () => {
  assert.throws(() => validateDirectMessageInput({
    recipientUid: "u2",
    text: "not an attachment",
    clientMessageId: "message_123",
    mediaId: "123e4567-e89b-12d3-a456-426614174000",
    mediaContentType: "image/png",
  }), /UNSUPPORTED_DIRECT_MESSAGE_FIELDS/);
});
