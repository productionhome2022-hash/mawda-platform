/**
 * A biometric lease is usable only after an accepted, server-authoritative
 * Super Owner manual review. This predicate does not authorize the reviewer;
 * the review callable must enforce the owner claim and fresh MFA before writing
 * this server-owned record. Until that workflow exists, no record can qualify.
 */
type TimestampLike = { toMillis?: unknown };

function timestampMillis(value: unknown): number | null {
  if (value instanceof Date) {
    const result = value.getTime();
    return Number.isSafeInteger(result) && result >= 0 ? result : null;
  }
  if (value === null || typeof value !== "object" ||
      typeof (value as TimestampLike).toMillis !== "function") return null;
  try {
    const result = (value as { toMillis: () => number }).toMillis();
    return Number.isSafeInteger(result) && result >= 0 ? result : null;
  } catch {
    return null;
  }
}

function validServerId(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{16,128}$/.test(value);
}

function validUid(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9._:@-]{1,128}$/.test(value);
}

export function hasActiveBiometricVerification(
  value: unknown,
  expectedUid: string,
  nowMs = Date.now(),
): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value) ||
      !validUid(expectedUid) || !Number.isSafeInteger(nowMs) || nowMs < 0) return false;

  const verification = value as Record<string, unknown>;
  if (verification.accountUid !== expectedUid ||
      verification.status !== "verified" ||
      verification.revokedAt != null ||
      verification.verificationMethod !== "super_owner_manual_review" ||
      verification.trustModel !== "server_authoritative_owner_decision" ||
      verification.reviewerRole !== "super_owner" ||
      verification.reviewerMfaVerified !== true ||
      verification.decision !== "accepted" ||
      !validUid(verification.reviewerUid) ||
      verification.reviewerUid === expectedUid ||
      !validServerId(verification.reviewRequestId)) return false;

  const acceptedAtMs = timestampMillis(verification.acceptedAt);
  const mfaAtMs = timestampMillis(verification.reviewerMfaAt);
  const expiresAtMs = timestampMillis(verification.expiresAt);
  return acceptedAtMs !== null && acceptedAtMs <= nowMs &&
    mfaAtMs !== null && mfaAtMs <= acceptedAtMs &&
    acceptedAtMs - mfaAtMs <= 15 * 60 * 1000 &&
    expiresAtMs !== null && expiresAtMs > nowMs &&
    expiresAtMs > acceptedAtMs;
}
