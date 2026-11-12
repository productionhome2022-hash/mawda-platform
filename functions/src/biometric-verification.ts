/**
 * Server-owned biometric verification eligibility.
 *
 * A bare "verified" status is insufficient: the record must carry a valid,
 * future expiresAt timestamp and must not have been revoked.
 */
export function hasActiveBiometricVerification(
  value: unknown,
  nowMs = Date.now(),
): boolean {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const verification = value as Record<string, unknown>;
  if (verification.status !== "verified" || verification.revokedAt != null) {
    return false;
  }

  const expiry = verification.expiresAt;
  let expiresAtMs: number;

  if (expiry instanceof Date) {
    expiresAtMs = expiry.getTime();
  } else if (
    expiry !== null &&
    typeof expiry === "object" &&
    typeof (expiry as { toMillis?: unknown }).toMillis === "function"
  ) {
    try {
      expiresAtMs = (expiry as { toMillis: () => number }).toMillis();
    } catch {
      return false;
    }
  } else {
    return false;
  }

  return Number.isFinite(expiresAtMs) && expiresAtMs > nowMs;
}
