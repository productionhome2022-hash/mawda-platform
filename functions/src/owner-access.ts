export function hasPlatformOwnerSession(token: Record<string, unknown>): boolean {
  if (token.platformOwner !== true) return false;
  const firebase = token.firebase;
  if (!firebase || typeof firebase !== "object" || Array.isArray(firebase)) {
    return false;
  }
  const secondFactor = (firebase as Record<string, unknown>).sign_in_second_factor;
  return typeof secondFactor === "string" && secondFactor.trim().length > 0;
}
