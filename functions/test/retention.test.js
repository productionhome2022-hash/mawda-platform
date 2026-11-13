const test = require("node:test");
const assert = require("node:assert/strict");
const {
  CHAT_MEDIA_RETENTION_MS,
  CHAT_TEXT_RETENTION_MS,
  retentionDeadline,
  isRetentionDue,
  isSupportedChatMessagePath,
  shouldSuspendMediaDeletion,
  isKnownDeletedMediaObjectPath,
} = require("../lib/retention");

test("chat media retention is exactly four hours from validated upload finalization", () => {
  const createdAt = 1_800_000_000_000;
  const deadline = retentionDeadline(createdAt, CHAT_MEDIA_RETENTION_MS);
  assert.equal(deadline, createdAt + 4 * 60 * 60 * 1000);
  assert.equal(isRetentionDue(createdAt, CHAT_MEDIA_RETENTION_MS, deadline - 1), false);
  assert.equal(isRetentionDue(createdAt, CHAT_MEDIA_RETENTION_MS, deadline), true);
});

test("chat text retention is exactly seven days for every chat type", () => {
  const createdAt = 1_800_000_000_000;
  const deadline = retentionDeadline(createdAt, CHAT_TEXT_RETENTION_MS);
  assert.equal(deadline, createdAt + 7 * 24 * 60 * 60 * 1000);
  assert.equal(isRetentionDue(createdAt, CHAT_TEXT_RETENTION_MS, deadline - 1), false);
  assert.equal(isRetentionDue(createdAt, CHAT_TEXT_RETENTION_MS, deadline), true);
});

test("retention clock rejects invalid timestamps and durations", () => {
  assert.throws(() => retentionDeadline(-1, CHAT_MEDIA_RETENTION_MS), /INVALID_RETENTION_CLOCK/);
  assert.throws(() => retentionDeadline(1, 0), /INVALID_RETENTION_CLOCK/);
  assert.throws(() => isRetentionDue(1, CHAT_TEXT_RETENTION_MS, -1), /INVALID_RETENTION_CLOCK/);
});

test("only direct and room message documents are eligible for seven-day deletion", () => {
  assert.equal(isSupportedChatMessagePath("directChats/abc/messages/msg1"), true);
  assert.equal(isSupportedChatMessagePath("rooms/room-1/messages/msg1"), true);
  assert.equal(isSupportedChatMessagePath("users/u1/messages/msg1"), false);
  assert.equal(isSupportedChatMessagePath("directChats/abc/messages"), false);
  assert.equal(isSupportedChatMessagePath("directChats/abc/messages/msg1/attachments/a"), false);
});

test("active media legal holds suspend exact-asset deletion fail-closed", () => {
  assert.equal(shouldSuspendMediaDeletion({ legalHoldStatus: "active", activeLegalHoldId: "hold-1" }), true);
  assert.equal(shouldSuspendMediaDeletion({ legalHoldStatus: "active" }), true);
  assert.equal(shouldSuspendMediaDeletion({ legalHoldStatus: "released" }), false);
  assert.equal(shouldSuspendMediaDeletion({}), false);
});

test("late finalized media is deleted only when its exact object path is recorded", () => {
  const ownerUid = "member-123";
  const mediaId = "12345678-1234-1234-1234-123456789abc";
  const original = `quarantine/${ownerUid}/${mediaId}`;
  const preview = `processed/${ownerUid}/${mediaId}/preview.webp`;
  const derived = `processed/${ownerUid}/${mediaId}/thumbnail.webp`;
  const tombstone = {
    deletedObjectPaths: [original, preview, derived],
  };
  assert.equal(isKnownDeletedMediaObjectPath(tombstone, original, ownerUid, mediaId), true);
  assert.equal(isKnownDeletedMediaObjectPath(tombstone, preview, ownerUid, mediaId), true);
  assert.equal(isKnownDeletedMediaObjectPath(tombstone, derived, ownerUid, mediaId), true);
  // Rejected scan assets may retain no path fields; the deterministic original
  // path must still be recognized for a still-valid signed PUT replay.
  assert.equal(isKnownDeletedMediaObjectPath({}, original, ownerUid, mediaId), true);
  assert.equal(isKnownDeletedMediaObjectPath(tombstone, `quarantine/${ownerUid}/other`, ownerUid, mediaId), false);
});
