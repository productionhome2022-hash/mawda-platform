const test = require("node:test");
const assert = require("node:assert/strict");
const {
  CHAT_MEDIA_RETENTION_MS,
  STICKER_MEDIA_RETENTION_MS,
  CHAT_MEDIA_RETENTION_PURPOSES,
  INDEPENDENT_MEDIA_RETENTION_PURPOSES,
  STICKER_MEDIA_RETENTION_PURPOSES,
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

test("retention purpose sets are isolated by lifecycle", () => {
  assert.deepEqual(CHAT_MEDIA_RETENTION_PURPOSES, ["chat", "room"]);
  assert.deepEqual(INDEPENDENT_MEDIA_RETENTION_PURPOSES, ["profile_album", "story", "avatar_cover"]);
  assert.deepEqual(STICKER_MEDIA_RETENTION_PURPOSES, ["sticker"]);
});

test("sticker media retention is exactly one hour and expires at the boundary", () => {
  const acceptedAt = 1_800_000_000_000;
  assert.equal(STICKER_MEDIA_RETENTION_MS, 60 * 60 * 1000);
  const deadline = retentionDeadline(acceptedAt, STICKER_MEDIA_RETENTION_MS);
  assert.equal(deadline, acceptedAt + 60 * 60 * 1000);
  assert.equal(isRetentionDue(acceptedAt, STICKER_MEDIA_RETENTION_MS, deadline - 1), false);
  assert.equal(isRetentionDue(acceptedAt, STICKER_MEDIA_RETENTION_MS, deadline), true);
});

test("legacy/default normal chat text retention remains exactly seven days", () => {
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

test("only direct and room message documents are eligible for mode-aware text deletion", () => {
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

test("production retention requires explicit enablement and an exact project allowlist", () => {
  const { canRunRetentionJobs } = require("../lib/retention");
  assert.equal(canRunRetentionJobs("mawdda-production", false, "mawdda-production"), false);
  assert.equal(canRunRetentionJobs("mawdda-production", true, ""), false);
  assert.equal(canRunRetentionJobs("mawdda-production", true, "another-project"), false);
  assert.equal(canRunRetentionJobs("mawdda-production", true, "mawdda-production"), true);
});

test("non-production retention still requires explicit enablement", () => {
  const { canRunRetentionJobs } = require("../lib/retention");
  assert.equal(canRunRetentionJobs("demo-mawda-retention", false, ""), false);
  assert.equal(canRunRetentionJobs("demo-mawda-retention", true, ""), true);
  assert.equal(canRunRetentionJobs("mawda-app-2026", true, ""), false);
});
