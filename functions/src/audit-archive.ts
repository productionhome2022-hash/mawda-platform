import { createHash } from "node:crypto";
import { calculateOwnerAuditHash, OwnerAuditEvent } from "./owner-audit-chain";

export const OWNER_AUDIT_ARCHIVE_RETENTION_SECONDS = 63_072_000;
export const OWNER_AUDIT_ARCHIVE_MIN_AGE_MS = 24 * 60 * 60 * 1000;
export const OWNER_AUDIT_ARCHIVE_BATCH_SIZE = 500;

export type OwnerAuditArchiveEntry = {
  sequence: number;
  previousHash: string;
  eventHash: string;
  event: OwnerAuditEvent;
  createdAtMs: number;
};

export function isOwnerAuditArchiveEligible(createdAtMs: number, nowMs: number): boolean {
  if (!Number.isSafeInteger(createdAtMs) || createdAtMs < 0 ||
      !Number.isSafeInteger(nowMs) || nowMs < 0) {
    throw new Error("INVALID_AUDIT_ARCHIVE_CLOCK");
  }
  return createdAtMs <= nowMs - OWNER_AUDIT_ARCHIVE_MIN_AGE_MS;
}

/** The worker refuses buckets without a locked, minimum-24-month retention policy. */
export function validateLockedAuditArchiveBucket(metadata: unknown): {
  retentionPeriodSeconds: number;
  uniformBucketLevelAccess: boolean;
  publicAccessPrevention: boolean;
} {
  if (metadata === null || typeof metadata !== "object" || Array.isArray(metadata)) {
    throw new Error("AUDIT_ARCHIVE_BUCKET_METADATA_INVALID");
  }
  const value = metadata as Record<string, any>;
  const retention = value.retentionPolicy;
  const retentionPeriodSeconds = retention?.retentionPeriod;
  if (retention?.isLocked !== true ||
      !Number.isSafeInteger(retentionPeriodSeconds) ||
      retentionPeriodSeconds < OWNER_AUDIT_ARCHIVE_RETENTION_SECONDS) {
    throw new Error("AUDIT_ARCHIVE_RETENTION_NOT_LOCKED_FOR_24_MONTHS");
  }
  const uniformBucketLevelAccess = value.iamConfiguration?.uniformBucketLevelAccess?.enabled === true;
  const publicAccessPrevention = value.iamConfiguration?.publicAccessPrevention === "enforced";
  if (!uniformBucketLevelAccess || !publicAccessPrevention) {
    throw new Error("AUDIT_ARCHIVE_BUCKET_ACCESS_NOT_HARDENED");
  }
  return { retentionPeriodSeconds, uniformBucketLevelAccess, publicAccessPrevention };
}

/** Verifies a contiguous archive chunk against the last externally anchored sequence/hash. */
export function verifyOwnerAuditArchiveChunk(
  entries: OwnerAuditArchiveEntry[],
  previousSequence: number,
  previousHash: string,
): { valid: boolean; lastSequence: number; lastHash: string; reason: string | null } {
  if (!Number.isSafeInteger(previousSequence) || previousSequence < 0 ||
      typeof previousHash !== "string" ||
      !(previousHash === "GENESIS" || /^[a-f0-9]{64}$/.test(previousHash))) {
    throw new Error("INVALID_AUDIT_ARCHIVE_ANCHOR");
  }
  let expectedSequence = previousSequence + 1;
  let chainHash = previousHash;
  for (const entry of entries) {
    if (entry.sequence !== expectedSequence) {
      return { valid: false, lastSequence: expectedSequence - 1, lastHash: chainHash, reason: "SEQUENCE_GAP" };
    }
    if (entry.previousHash !== chainHash) {
      return { valid: false, lastSequence: expectedSequence - 1, lastHash: chainHash, reason: "PREVIOUS_HASH_MISMATCH" };
    }
    let calculated: string;
    try {
      calculated = calculateOwnerAuditHash(entry.event, entry.sequence, entry.previousHash);
    } catch {
      return { valid: false, lastSequence: expectedSequence - 1, lastHash: chainHash, reason: "INVALID_EVENT" };
    }
    if (calculated !== entry.eventHash) {
      return { valid: false, lastSequence: expectedSequence - 1, lastHash: chainHash, reason: "EVENT_HASH_MISMATCH" };
    }
    chainHash = entry.eventHash;
    expectedSequence += 1;
  }
  return { valid: true, lastSequence: expectedSequence - 1, lastHash: chainHash, reason: null };
}

export function ownerAuditArchiveObjectName(
  firstSequence: number,
  lastSequence: number,
  createdAtMs: number,
): string {
  if (!Number.isSafeInteger(firstSequence) || firstSequence < 1 ||
      !Number.isSafeInteger(lastSequence) || lastSequence < firstSequence ||
      !Number.isSafeInteger(createdAtMs) || createdAtMs < 0) {
    throw new Error("INVALID_AUDIT_ARCHIVE_OBJECT_RANGE");
  }
  const date = new Date(createdAtMs);
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `owner-review/${yyyy}/${mm}/${dd}/seq-${firstSequence}-${lastSequence}.jsonl`;
}

export function serializeOwnerAuditArchive(
  entries: Array<Omit<OwnerAuditArchiveEntry, "event"> & { event: unknown }>,
  metadata: {
    firstSequence: number;
    lastSequence: number;
    previousHash: string;
    finalHash: string;
    archivedAtMs: number;
  },
): { payload: string; sha256: string } {
  if (entries.length < 1 || entries.length > OWNER_AUDIT_ARCHIVE_BATCH_SIZE ||
      entries[0].sequence !== metadata.firstSequence ||
      entries[entries.length - 1].sequence !== metadata.lastSequence) {
    throw new Error("INVALID_AUDIT_ARCHIVE_PAYLOAD_RANGE");
  }
  const header = {
    recordType: "mawdda-owner-audit-archive",
    archiveVersion: 1,
    chainId: "owner-review-v1",
    ...metadata,
    eventCount: entries.length,
    retentionSeconds: OWNER_AUDIT_ARCHIVE_RETENTION_SECONDS,
  };
  const payload = [
    JSON.stringify(header),
    ...entries.map((entry) => JSON.stringify({
      sequence: entry.sequence,
      previousHash: entry.previousHash,
      eventHash: entry.eventHash,
      event: entry.event,
      createdAtMs: entry.createdAtMs,
    })),
    "",
  ].join("\n");
  const sha256 = createHash("sha256").update(payload, "utf8").digest("hex");
  return { payload, sha256 };
}
