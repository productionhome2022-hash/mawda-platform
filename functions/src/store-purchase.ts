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


/** Reject a stale client confirmation if the owner changed the catalog price. */
export function isStorePurchasePriceCurrent(
  expectedPriceCoins: unknown,
  currentPriceCoins: unknown,
): boolean {
  return typeof expectedPriceCoins === "number" &&
    Number.isSafeInteger(expectedPriceCoins) &&
    expectedPriceCoins > 0 &&
    typeof currentPriceCoins === "number" &&
    Number.isSafeInteger(currentPriceCoins) &&
    currentPriceCoins > 0 &&
    expectedPriceCoins === currentPriceCoins;
}


export type StoreEntitlementFeatures = {
  vipActive: boolean;
  activeTitle: string | null;
};

/**
 * Projects only implemented profile consumers. The caller supplies active
 * entitlements ordered newest-first by server purchase time.
 */
export function projectStoreEntitlementFeatures(
  entitlements: unknown[],
  nowMs = Date.now(),
): StoreEntitlementFeatures {
  const active = entitlements.filter((item) => isStoreEntitlementActive(item, nowMs));
  const vipActive = active.some((item) =>
    item !== null && typeof item === "object" &&
    (item as Record<string, unknown>).category === "vip",
  );
  const title = active.find((item) =>
    item !== null && typeof item === "object" &&
    (item as Record<string, unknown>).category === "title" &&
    typeof (item as Record<string, unknown>).itemName === "string",
  ) as Record<string, unknown> | undefined;
  return {
    vipActive,
    activeTitle: title ? (title.itemName as string).trim().slice(0, 80) || null : null,
  };
}
