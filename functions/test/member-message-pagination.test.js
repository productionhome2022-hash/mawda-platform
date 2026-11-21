const test = require("node:test");
const assert = require("node:assert/strict");
const {
  encodeMemberMessagePageToken,
  validateMemberMessagePageRequest,
} = require("../lib/member-message-pagination");

test("defaults to the latest-page direction with a bounded page size", () => {
  assert.deepEqual(validateMemberMessagePageRequest({}), {
    direction: "before",
    limit: 50,
    cursor: null,
  });
  assert.equal(validateMemberMessagePageRequest({ limit: 25 }).limit, 25);
});

test("encodes and decodes stable timestamp plus document-id cursors", () => {
  const token = encodeMemberMessagePageToken(1_800_000_000_000, "message-0002");
  assert.deepEqual(validateMemberMessagePageRequest({ beforePageToken: token }), {
    direction: "before",
    limit: 50,
    cursor: { createdAtMillis: 1_800_000_000_000, messageId: "message-0002" },
  });
  assert.deepEqual(validateMemberMessagePageRequest({ afterPageToken: token }), {
    direction: "after",
    limit: 50,
    cursor: { createdAtMillis: 1_800_000_000_000, messageId: "message-0002" },
  });
});

test("document IDs make cursors distinct when timestamps are equal", () => {
  const first = encodeMemberMessagePageToken(1_800_000_000_000, "message-a");
  const second = encodeMemberMessagePageToken(1_800_000_000_000, "message-b");
  assert.notEqual(first, second);
  assert.equal(validateMemberMessagePageRequest({ afterPageToken: first }).cursor.messageId, "message-a");
  assert.equal(validateMemberMessagePageRequest({ afterPageToken: second }).cursor.messageId, "message-b");
});

test("rejects invalid sizes, malformed cursors and conflicting directions", () => {
  for (const limit of [0, -1, 51, 1.5, "50"]) {
    assert.throws(() => validateMemberMessagePageRequest({ limit }), /INVALID_MESSAGE_PAGE_SIZE/);
  }
  for (const token of ["not-base64", "eyJ4IjoxfQ", Buffer.from(JSON.stringify([1, ""])).toString("base64url")]) {
    assert.throws(() => validateMemberMessagePageRequest({ beforePageToken: token }), /INVALID_MESSAGE_PAGE_TOKEN/);
  }
  const token = encodeMemberMessagePageToken(1_800_000_000_000, "message-1");
  assert.throws(() => validateMemberMessagePageRequest({
    beforePageToken: token,
    afterPageToken: token,
  }), /CONFLICTING_MESSAGE_PAGE_TOKENS/);
});

test("rejects unsafe cursor values before encoding", () => {
  assert.throws(() => encodeMemberMessagePageToken(-1, "message-1"), /INVALID_MESSAGE_PAGE_CURSOR/);
  assert.throws(() => encodeMemberMessagePageToken(1, ""), /INVALID_MESSAGE_PAGE_CURSOR/);
});
