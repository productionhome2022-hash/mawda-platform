/** Returns the resulting balance or null when the balance is insufficient/invalid. */
export function calculateStorePurchaseBalance(balance: unknown, priceCoins: unknown): number | null {
  if (typeof balance !== "number" || !Number.isSafeInteger(balance) || balance < 0) return null;
  if (typeof priceCoins !== "number" || !Number.isSafeInteger(priceCoins) || priceCoins <= 0) return null;
  if (balance < priceCoins) return null;
  return balance - priceCoins;
}

/** Permanent active entitlements have no expiry; temporary ones require a future expiry. */
export function isStoreEntitlementActive(value: unknown, nowMs = Date.now()): boolean {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const entitlement = value as Record<string, unknown>;
  if (entitlement.status !== "active") return false;
  const expiry = entitlement.expiresAt;
  if (expiry === undefined || expiry === null) return true;
  let expiresAtMs: number;
  if (expiry instanceof Date) {
    expiresAtMs = expiry.getTime();
  } else if (typeof expiry === "object" &&
      typeof (expiry as { toMillis?: unknown }).toMillis === "function") {
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
