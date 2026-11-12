const OWNER_SESSION_MAX_AGE_SECONDS = 15 * 60;

/**
 * Require an owner claim, a completed second-factor sign-in, and a recent
 * authentication event. Callers must fail closed when token metadata is absent.
 */
export function hasPlatformOwnerSession(
  token: Record<string, unknown>,
  nowSeconds = Math.floor(Date.now() / 1000),
): boolean {
  if (token.platformOwner !== true) return false;
  const firebase = token.firebase;
  if (!firebase || typeof firebase !== "object" || Array.isArray(firebase)) {
    return false;
  }
  const authTime = token.auth_time;
  if (typeof authTime !== "number" || !Number.isSafeInteger(authTime)) return false;
  const ageSeconds = nowSeconds - authTime;
  if (ageSeconds < 0 || ageSeconds > OWNER_SESSION_MAX_AGE_SECONDS) return false;
  const secondFactor = (firebase as Record<string, unknown>).sign_in_second_factor;
  return typeof secondFactor === "string" && secondFactor.trim().length > 0;
}
