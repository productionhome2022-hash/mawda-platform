/**
 * Exact allowlist check for the web-only legal/professional portal.
 *
 * App Check is enforced by the callable runtime separately. This helper adds
 * the independent app-identity boundary and deliberately fails closed when
 * configuration or request identity is absent.
 */
export function isAllowedLegalPortalAppId(
  actualAppId: unknown,
  configuredAppIds: unknown,
): boolean {
  if (typeof actualAppId !== "string" || actualAppId.length === 0) return false;

  // Native app identities are permanently excluded from the legal portal,
  // even if an operator accidentally includes one in the runtime allowlist.
  const nativeAppIds = new Set([
    "1:697303475139:android:0aad1a52d2276f273ed376",
    "1:697303475139:ios:7be58cfe1ac9c4c23ed376",
  ]);
  if (nativeAppIds.has(actualAppId)) return false;
  if (typeof configuredAppIds !== "string" || configuredAppIds.length === 0) return false;

  const allowedAppIds = configuredAppIds
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return allowedAppIds.includes(actualAppId);
}
