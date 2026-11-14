const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateOwnerAuditHash } = require("../lib/owner-audit-chain");
const {
  OWNER_AUDIT_ARCHIVE_MIN_AGE_MS,
  OWNER_AUDIT_ARCHIVE_RETENTION_SECONDS,
  isOwnerAuditArchiveEligible,
  validateLockedAuditArchiveBucket,
  verifyOwnerAuditArchiveChunk,
  ownerAuditArchiveObjectName,
  serializeOwnerAuditArchive,
  auditCollectionArchiveObjectName,
  serializeAuditCollectionArchive,
} = require("../lib/audit-archive");

const NOW = 1_800_000_000_000;

function entries() {
  const first = { actorUid: "owner", action: "review", outcome: "success" };
  const firstHash = calculateOwnerAuditHash(first, 11, "a".repeat(64));
  const second = { actorUid: "owner", action: "export", outcome: "success" };
  const secondHash = calculateOwnerAuditHash(second, 12, firstHash);
  return [
    { sequence: 11, previousHash: "a".repeat(64), eventHash: firstHash, event: first, createdAtMs: NOW - 2 * OWNER_AUDIT_ARCHIVE_MIN_AGE_MS },
    { sequence: 12, previousHash: firstHash, eventHash: secondHash, event: second, createdAtMs: NOW - 2 * OWNER_AUDIT_ARCHIVE_MIN_AGE_MS },
  ];
}

test("archives only events older than the five-minute safety buffer", () => {
  assert.equal(isOwnerAuditArchiveEligible(NOW - OWNER_AUDIT_ARCHIVE_MIN_AGE_MS, NOW), true);
  assert.equal(isOwnerAuditArchiveEligible(NOW - OWNER_AUDIT_ARCHIVE_MIN_AGE_MS + 1, NOW), false);
  assert.throws(() => isOwnerAuditArchiveEligible(Number.NaN, NOW));
});

test("requires a locked 24-month retention policy and hardened bucket access", () => {
  assert.deepEqual(validateLockedAuditArchiveBucket({
    retentionPolicy: { isLocked: true, retentionPeriod: OWNER_AUDIT_ARCHIVE_RETENTION_SECONDS },
    iamConfiguration: {
      uniformBucketLevelAccess: { enabled: true },
      publicAccessPrevention: "enforced",
    },
  }), {
    retentionPeriodSeconds: OWNER_AUDIT_ARCHIVE_RETENTION_SECONDS,
    uniformBucketLevelAccess: true,
    publicAccessPrevention: true,
  });
  assert.throws(() => validateLockedAuditArchiveBucket({
    retentionPolicy: { isLocked: false, retentionPeriod: OWNER_AUDIT_ARCHIVE_RETENTION_SECONDS },
    iamConfiguration: { uniformBucketLevelAccess: { enabled: true }, publicAccessPrevention: "enforced" },
  }), /RETENTION_NOT_LOCKED/);
});

test("verifies contiguous audit sequence, previous hashes and event hashes", () => {
  const chunk = entries();
  const result = verifyOwnerAuditArchiveChunk(chunk, 10, "a".repeat(64));
  assert.equal(result.valid, true);
  assert.equal(result.lastSequence, 12);
  const tampered = [{ ...chunk[1], eventHash: "0".repeat(64) }];
  assert.equal(verifyOwnerAuditArchiveChunk(tampered, 11, chunk[0].eventHash).reason, "EVENT_HASH_MISMATCH");
  assert.equal(verifyOwnerAuditArchiveChunk(chunk.slice(1), 10, "a".repeat(64)).reason, "SEQUENCE_GAP");
});

test("creates deterministic dated archive paths and hash-addressed redacted payloads", () => {
  const chunk = entries();
  const path = ownerAuditArchiveObjectName(11, 12, NOW);
  assert.match(path, /^owner-review\/\d{4}\/\d{2}\/\d{2}\/seq-11-12\.jsonl$/);
  const archive = serializeOwnerAuditArchive(chunk, {
    firstSequence: 11,
    lastSequence: 12,
    previousHash: "a".repeat(64),
    finalHash: chunk[1].eventHash,
    archivedAtMs: NOW,
  });
  assert.equal(archive.sha256.length, 64);
  assert.equal(archive.payload.split("\n").length, 4);
});

test("archives every approved audit collection using deterministic immutable batch names", () => {
  const entries = [
    { docId: "audit-a", createdAtMs: NOW - 1000, data: { action: "block" } },
    { docId: "audit-b", createdAtMs: NOW, data: { action: "appeal" } },
  ];
  const objectName = auditCollectionArchiveObjectName(
    "verificationAuditLogs", "audit-a", "audit-b", NOW,
  );
  assert.match(objectName, /^collections\/verificationAuditLogs\/\d{4}\/\d{2}\/\d{2}\/batch-[a-f0-9]{20}\.jsonl$/);
  const archive = serializeAuditCollectionArchive("verificationAuditLogs", entries, {
    firstDocId: "audit-a",
    lastDocId: "audit-b",
    firstCreatedAtMs: NOW - 1000,
    lastCreatedAtMs: NOW,
    archivedAtMs: NOW,
  });
  assert.equal(archive.sha256.length, 64);
  assert.equal(archive.payload.split("\\n").length, 4);
  assert.throws(() => auditCollectionArchiveObjectName("users", "a", "b", NOW));
});
