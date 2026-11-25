export type StoreGiftIdentity = {
  senderUid: string;
  recipientUid: string;
  itemId: string;
  expectedPriceCoins: number;
  expectedCatalogVersion: number;
};

/** Bind a replay to the exact sender, recipient, item and confirmed price. */
export function isStoreGiftReplayCompatible(
  priorInput: unknown,
  identity: StoreGiftIdentity,
): boolean {
  if (priorInput === null || typeof priorInput !== "object" || Array.isArray(priorInput)) return false;
  const prior = priorInput as Record<string, unknown>;
  return prior.senderUid === identity.senderUid &&
    prior.recipientUid === identity.recipientUid &&
    prior.itemId === identity.itemId &&
    prior.priceCoins === identity.expectedPriceCoins &&
    Number.isSafeInteger(prior.priceCoins) &&
    prior.catalogVersion === identity.expectedCatalogVersion &&
    Number.isSafeInteger(prior.catalogVersion) &&
    (prior.status === "completed" || prior.status === "fulfilled");
}

/** Conservative server-side member profile gate; guest identity is checked separately via guest records/Auth. */
export function isEligibleStoreGiftMemberRecord(value: unknown): boolean {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const member = value as Record<string, unknown>;
  if (member.profileCompleted !== true || member.isBanned === true || member.isSuspended === true) return false;
  if (member.accountStatus !== undefined && member.accountStatus !== "active") return false;
  if (member.accountType === "guest" || member.isGuest === true || member.profileType === "guest") return false;
  return true;
}

/** Reject disabled, missing-provider and anonymous Firebase identities for gift recipients. */
export function isEligibleStoreGiftAuthUser(value: unknown): boolean {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const user = value as Record<string, unknown>;
  const providers = user.providerData;
  if (user.disabled === true || !Array.isArray(providers) || providers.length === 0) return false;
  const providerIds: string[] = [];
  for (const provider of providers) {
    if (provider === null || typeof provider !== "object" || Array.isArray(provider)) return false;
    const providerId = (provider as Record<string, unknown>).providerId;
    if (typeof providerId !== "string" || providerId.trim().length === 0) return false;
    providerIds.push(providerId);
  }
  return !providerIds.every((providerId) => providerId === "anonymous");
}

function readExpiryMs(value: unknown): number | null {
  let result: unknown;
  if (value instanceof Date) result = value.getTime();
  else if (typeof value === "number") result = value;
  else if (value !== null && typeof value === "object" &&
      typeof (value as { toMillis?: unknown }).toMillis === "function") {
    try { result = (value as { toMillis: () => number }).toMillis(); } catch { return null; }
  } else return null;
  return typeof result === "number" && Number.isSafeInteger(result) && result >= 0
    ? result : null;
}

/**
 * Timed gifts stack from max(server-now, current expiry). A permanent active
 * entitlement remains permanent and is never shortened by a timed gift.
 */
export function calculateStoreGiftExpiryMs(
  currentEntitlement: unknown,
  durationDays: number | undefined,
  nowMs: number,
): number | null {
  if (!Number.isSafeInteger(nowMs) || nowMs < 0) throw new Error("INVALID_SERVER_TIME");
  if (durationDays !== undefined &&
      (!Number.isSafeInteger(durationDays) || durationDays < 1 || durationDays > 3650)) {
    throw new Error("INVALID_GIFT_DURATION");
  }
  const current = currentEntitlement !== null && typeof currentEntitlement === "object" &&
    !Array.isArray(currentEntitlement) ? currentEntitlement as Record<string, unknown> : {};
  const active = current.status === "active";
  const currentExpiry = current.expiresAt;
  if (active && (currentExpiry === null || currentExpiry === undefined)) return null;
  if (durationDays === undefined) return null;
  const existingExpiryMs = active ? readExpiryMs(currentExpiry) : 0;
  if (active && existingExpiryMs === null) throw new Error("INVALID_CURRENT_ENTITLEMENT_EXPIRY");
  if (active && existingExpiryMs !== null && existingExpiryMs <= nowMs) {
    // Expired records do not contribute time to a new gift.
    return nowMs + durationDays * 24 * 60 * 60 * 1000;
  }
  return Math.max(nowMs, existingExpiryMs ?? 0) + durationDays * 24 * 60 * 60 * 1000;
}
