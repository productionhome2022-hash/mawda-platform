const test = require("node:test");
const assert = require("node:assert/strict");
const {
  TEMPORARY_CHAT_INACTIVITY_MS,
  NORMAL_CHAT_TEXT_RETENTION_MS,
  IMPORTANT_CHAT_TEXT_RETENTION_MS,
  resolveChatRetentionMode,
  chatTextRetentionMs,
  chatTextExpiryAtMs,
  temporaryChatInactivityExpiryAtMs,
  isTemporaryChatDeletionDue,
  isChatTextDeletionDue,
  chatRetentionNotice,
} = require("../lib/chat-retention-policy");

test("legacy conversations resolve to normal and a persisted mode is immutable", () => {
  assert.equal(resolveChatRetentionMode(undefined), "normal");
  assert.equal(resolveChatRetentionMode(null, "important"), "important");
  assert.equal(resolveChatRetentionMode("temporary", "important"), "temporary");
  assert.throws(() => resolveChatRetentionMode("unknown"), /CHAT_RETENTION_MODE_CORRUPT/);
  assert.throws(() => resolveChatRetentionMode(undefined, "unknown"), /CHAT_RETENTION_MODE_INVALID/);
});

test("normal and important text retention have exact seven and thirty day boundaries", () => {
  const createdAt = 1_800_000_000_000;
  assert.equal(chatTextRetentionMs("normal"), NORMAL_CHAT_TEXT_RETENTION_MS);
  assert.equal(chatTextRetentionMs("important"), IMPORTANT_CHAT_TEXT_RETENTION_MS);
  assert.equal(chatTextExpiryAtMs(createdAt, "normal"), createdAt + 7 * 24 * 60 * 60 * 1000);
  assert.equal(chatTextExpiryAtMs(createdAt, "important"), createdAt + 30 * 24 * 60 * 60 * 1000);
  assert.equal(isChatTextDeletionDue(createdAt, "normal", createdAt + NORMAL_CHAT_TEXT_RETENTION_MS - 1), false);
  assert.equal(isChatTextDeletionDue(createdAt, "normal", createdAt + NORMAL_CHAT_TEXT_RETENTION_MS), true);
  assert.equal(isChatTextDeletionDue(createdAt, "important", createdAt + IMPORTANT_CHAT_TEXT_RETENTION_MS - 1), false);
  assert.equal(isChatTextDeletionDue(createdAt, "important", createdAt + IMPORTANT_CHAT_TEXT_RETENTION_MS), true);
});

test("temporary mode deletes the whole conversation only after four hours of server activity inactivity", () => {
  const activityAt = 1_800_000_000_000;
  const deadline = activityAt + TEMPORARY_CHAT_INACTIVITY_MS;
  assert.equal(temporaryChatInactivityExpiryAtMs(activityAt), deadline);
  assert.equal(isTemporaryChatDeletionDue("temporary", activityAt, deadline - 1), false);
  assert.equal(isTemporaryChatDeletionDue("temporary", activityAt, deadline), true);
  assert.equal(isTemporaryChatDeletionDue("normal", activityAt, deadline + 1), false);
  assert.equal(isTemporaryChatDeletionDue("important", activityAt, deadline + 1), false);
});

test("temporary mode does not independently expire individual text messages", () => {
  assert.equal(chatTextRetentionMs("temporary"), null);
  assert.equal(chatTextExpiryAtMs(1_800_000_000_000, "temporary"), null);
  assert.equal(isChatTextDeletionDue(1_800_000_000_000, "temporary", 9_999_999_999_999), false);
});

test("retention notices disclose each exact policy", () => {
  assert.match(chatRetentionNotice("temporary"), /أربع ساعات/);
  assert.match(chatRetentionNotice("normal"), /سبعة أيام/);
  assert.match(chatRetentionNotice("important"), /ثلاثين يوماً/);
});

test("retention policy rejects invalid clocks", () => {
  assert.throws(() => chatTextExpiryAtMs(-1, "normal"), /INVALID_RETENTION_CLOCK/);
  assert.throws(() => temporaryChatInactivityExpiryAtMs(-1), /INVALID_RETENTION_CLOCK/);
  assert.throws(() => isTemporaryChatDeletionDue("temporary", 1, -1), /INVALID_RETENTION_CLOCK/);
});
