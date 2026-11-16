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
  if (typeof configuredAppIds !== "string" || configuredAppIds.length === 0) return false;

  const allowedAppIds = configuredAppIds
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return allowedAppIds.includes(actualAppId);
}
