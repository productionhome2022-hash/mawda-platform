import { createHash } from "node:crypto";
import { calculateOwnerAuditHash } from "./owner-audit-chain";
import type { OwnerAuditEvent } from "./owner-audit-chain";

export const OWNER_AUDIT_ARCHIVE_RETENTION_SECONDS = 64_281_600;
export const OWNER_AUDIT_ARCHIVE_MIN_AGE_MS = 5 * 60 * 1000;
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
  const value = metadata as {
    retentionPolicy?: { isLocked?: unknown; retentionPeriod?: unknown };
    iamConfiguration?: {
      uniformBucketLevelAccess?: { enabled?: unknown };
      publicAccessPrevention?: unknown;
    };
  };
  const retention = value.retentionPolicy;
  const retentionPeriodSeconds = typeof retention?.retentionPeriod === "number"
    ? retention.retentionPeriod
    : Number(retention?.retentionPeriod);
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
  if (!Number.isFinite(date.getTime())) throw new Error("INVALID_AUDIT_ARCHIVE_DATE");
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

export const ADDITIONAL_AUDIT_COLLECTIONS = [
  "adminAuditLogs",
  "verificationAuditLogs",
  "profileFeatureAuditLogs",
  "mediaAccessAudit",
  "memberPrivacyAudit",
  "memberProfileAudit",
  "directMessageDeletionAudit",
  "roomAuditLogs",
  "privacyAcknowledgements",
] as const;

export type AuditCollectionArchiveEntry = {
  docId: string;
  createdAtMs: number;
  data: unknown;
};

export function auditCollectionArchiveObjectName(
  collectionName: string,
  firstDocId: string,
  lastDocId: string,
  createdAtMs: number,
): string {
  if (!(ADDITIONAL_AUDIT_COLLECTIONS as readonly string[]).includes(collectionName) ||
      !firstDocId || firstDocId.includes("/") || !lastDocId || lastDocId.includes("/") ||
      !Number.isSafeInteger(createdAtMs) || createdAtMs < 0) {
    throw new Error("INVALID_AUDIT_COLLECTION_ARCHIVE_RANGE");
  }
  const date = new Date(createdAtMs);
  if (!Number.isFinite(date.getTime())) throw new Error("INVALID_AUDIT_ARCHIVE_DATE");
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const batchId = createHash("sha256")
    .update(collectionName + "|" + firstDocId + "|" + lastDocId)
    .digest("hex")
    .slice(0, 20);
  return `collections/${collectionName}/${yyyy}/${mm}/${dd}/batch-${batchId}.jsonl`;
}

export function serializeAuditCollectionArchive(
  collectionName: string,
  entries: AuditCollectionArchiveEntry[],
  metadata: {
    firstDocId: string;
    lastDocId: string;
    firstCreatedAtMs: number;
    lastCreatedAtMs: number;
    archivedAtMs: number;
  },
): { payload: string; sha256: string } {
  if (!(ADDITIONAL_AUDIT_COLLECTIONS as readonly string[]).includes(collectionName) ||
      entries.length < 1 || entries.length > OWNER_AUDIT_ARCHIVE_BATCH_SIZE ||
      entries[0].docId !== metadata.firstDocId ||
      entries[entries.length - 1].docId !== metadata.lastDocId) {
    throw new Error("INVALID_AUDIT_COLLECTION_ARCHIVE_PAYLOAD");
  }
  const header = {
    recordType: "mawdda-audit-collection-archive",
    archiveVersion: 1,
    collectionName,
    ...metadata,
    entryCount: entries.length,
    retentionSeconds: OWNER_AUDIT_ARCHIVE_RETENTION_SECONDS,
  };
  const payload = [
    JSON.stringify(header),
    ...entries.map((entry) => JSON.stringify(entry)),
    "",
  ].join("\n");
  const sha256 = createHash("sha256").update(payload, "utf8").digest("hex");
  return { payload, sha256 };
}
