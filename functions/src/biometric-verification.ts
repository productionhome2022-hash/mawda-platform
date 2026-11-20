/**
 * A biometric lease is usable only when it contains a server-verified,
 * challenge-bound device proof. Client-side OS prompts and legacy
 * "verified" flags are deliberately insufficient.
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

const BIOMETRIC_PROOF_PROVIDERS = new Set([
  "android_play_integrity",
  "ios_app_attest",
]);

export function hasActiveBiometricVerification(
  value: unknown,
  expectedUid: string,
  nowMs = Date.now(),
): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value) ||
      typeof expectedUid !== "string" ||
      !/^[A-Za-z0-9._:@-]{8,128}$/.test(expectedUid) ||
      !Number.isSafeInteger(nowMs) || nowMs < 0) return false;

  const verification = value as Record<string, unknown>;
  if (verification.status !== "verified" ||
      verification.revokedAt != null ||
      verification.verificationMethod !== "server_verified_device_attestation" ||
      verification.trustModel !== "challenge_bound_device_key") return false;

  const expiresAtMs = timestampMillis(verification.expiresAt);
  if (expiresAtMs === null || expiresAtMs <= nowMs) return false;

  const proof = verification.serverProof;
  if (!proof || typeof proof !== "object" || Array.isArray(proof)) return false;
  const evidence = proof as Record<string, unknown>;
  const verifiedAtMs = timestampMillis(evidence.verifiedAt);
  const nonceConsumedAtMs = timestampMillis(evidence.nonceConsumedAt);

  return evidence.status === "verified" &&
    BIOMETRIC_PROOF_PROVIDERS.has(String(evidence.provider)) &&
    evidence.accountUid === expectedUid &&
    typeof evidence.deviceKeyId === "string" &&
    /^[A-Za-z0-9_-]{16,128}$/.test(evidence.deviceKeyId) &&
    typeof evidence.challengeId === "string" &&
    /^[A-Za-z0-9_-]{16,128}$/.test(evidence.challengeId) &&
    typeof evidence.proofDigest === "string" &&
    /^[a-f0-9]{64}$/.test(evidence.proofDigest) &&
    evidence.signatureVerified === true &&
    evidence.attestationVerified === true &&
    evidence.nonceConsumed === true &&
    verifiedAtMs !== null && verifiedAtMs <= nowMs &&
    nonceConsumedAtMs !== null && nonceConsumedAtMs >= verifiedAtMs &&
    nonceConsumedAtMs <= nowMs;
}
