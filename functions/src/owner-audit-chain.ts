import { createHash } from "node:crypto";

export type OwnerAuditEvent = Record<string, unknown>;

function normalize(value: unknown): unknown {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("INVALID_AUDIT_VALUE");
    return value;
  }
  if (Array.isArray(value)) return value.map(normalize);
  if (typeof value === "object") {
    const input = value as Record<string, unknown>;
    const output: Record<string, unknown> = {};
    for (const key of Object.keys(input).sort()) {
      if (input[key] === undefined) throw new Error("INVALID_AUDIT_VALUE");
      output[key] = normalize(input[key]);
    }
    return output;
  }
  throw new Error("INVALID_AUDIT_VALUE");
}

/** SHA-256 over a stable canonical event representation and its chain position. */
export function calculateOwnerAuditHash(
  event: OwnerAuditEvent,
  sequence: number,
  previousHash: string,
): string {
  if (!Number.isSafeInteger(sequence) || sequence < 1 ||
      typeof previousHash !== "string" || !/^(GENESIS|[a-f0-9]{64})$/.test(previousHash)) {
    throw new Error("INVALID_AUDIT_CHAIN_POSITION");
  }
  const canonical = JSON.stringify({
    sequence,
    previousHash,
    event: normalize(event),
  });
  return createHash("sha256").update(canonical, "utf8").digest("hex");
}

export type OwnerAuditChainEntry = {
  sequence: number;
  previousHash: string;
  eventHash: string;
  event: OwnerAuditEvent;
};

/** Verify order, linkage and event integrity; optionally pin the expected head. */
export function verifyOwnerAuditChain(
  entries: OwnerAuditChainEntry[],
  expectedHead?: { sequence: number; eventHash: string },
): { valid: boolean; sequence: number; eventHash: string; reason: string | null } {
  let previousHash = "GENESIS";
  let expectedSequence = 1;
  for (const entry of entries) {
    if (entry.sequence !== expectedSequence) {
      return { valid: false, sequence: expectedSequence - 1, eventHash: previousHash, reason: "SEQUENCE_GAP" };
    }
    if (entry.previousHash !== previousHash) {
      return { valid: false, sequence: expectedSequence - 1, eventHash: previousHash, reason: "PREVIOUS_HASH_MISMATCH" };
    }
    let calculated: string;
    try {
      calculated = calculateOwnerAuditHash(entry.event, entry.sequence, entry.previousHash);
    } catch {
      return { valid: false, sequence: expectedSequence - 1, eventHash: previousHash, reason: "INVALID_EVENT" };
    }
    if (calculated !== entry.eventHash) {
      return { valid: false, sequence: expectedSequence - 1, eventHash: previousHash, reason: "EVENT_HASH_MISMATCH" };
    }
    previousHash = entry.eventHash;
    expectedSequence += 1;
  }

  const sequence = expectedSequence - 1;
  if (expectedHead && (expectedHead.sequence !== sequence || expectedHead.eventHash !== previousHash)) {
    return { valid: false, sequence, eventHash: previousHash, reason: "HEAD_MISMATCH" };
  }
  return { valid: true, sequence, eventHash: previousHash, reason: null };
}
