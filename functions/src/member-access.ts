/**
 * Account-level gate for member-initiated social actions.
 * Missing accountStatus is tolerated for legacy profiles, but any explicit
 * non-active or unknown status fails closed.
 */
export function isMemberAccountInGoodStanding(value: unknown): boolean {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const member = value as Record<string, unknown>;
  if (member.isBanned === true || member.isSuspended === true) return false;
  if (member.accountStatus !== undefined && member.accountStatus !== "active") return false;
  return true;
}
