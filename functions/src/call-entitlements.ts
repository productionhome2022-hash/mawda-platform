import type { GroupCallPricingPolicy } from "./group-call-economy";

/**
 * Pricing configuration is available to the owner for development previews.
 * It is deliberately separate from collection/settlement authorization.
 */
export type GroupCallEntitlementPolicy = GroupCallPricingPolicy & {
  environment: "test_only";
  billingEnabled: false;
};

export function validateGroupCallEntitlementPolicy(value: unknown): GroupCallEntitlementPolicy {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("INVALID_GROUP_CALL_ENTITLEMENT_POLICY");
  }
  const input = value as Record<string, unknown>;
  const allowed = new Set([
    "policyId", "version", "active", "audioCoinsPerMinute",
    "videoCoinsPerMinute", "updatedAtMs", "environment", "billingEnabled",
  ]);
  if (Object.keys(input).some((key) => !allowed.has(key)) ||
      input.environment !== "test_only" || input.billingEnabled !== false ||
      typeof input.policyId !== "string" || !/^[A-Za-z0-9_-]{8,100}$/.test(input.policyId) ||
      !Number.isSafeInteger(input.version) || (input.version as number) < 1 ||
      typeof input.active !== "boolean" ||
      !Number.isSafeInteger(input.audioCoinsPerMinute) || (input.audioCoinsPerMinute as number) < 0 ||
      !Number.isSafeInteger(input.videoCoinsPerMinute) || (input.videoCoinsPerMinute as number) < 0 ||
      (input.active && input.audioCoinsPerMinute === 0 && input.videoCoinsPerMinute === 0) ||
      !Number.isSafeInteger(input.updatedAtMs) || (input.updatedAtMs as number) < 1) {
    throw new Error("INVALID_GROUP_CALL_ENTITLEMENT_POLICY");
  }
  return {
    policyId: input.policyId,
    version: input.version as number,
    active: input.active,
    audioCoinsPerMinute: input.audioCoinsPerMinute as number,
    videoCoinsPerMinute: input.videoCoinsPerMinute as number,
    updatedAtMs: input.updatedAtMs as number,
    environment: "test_only",
    billingEnabled: false,
  };
}

/** No client, owner setting, or test tariff can enable real call collection. */
export function isGroupCallBillingCollectionEnabled(_settings: unknown): false {
  return false;
}

export type StoreGiftHistoryProjection = {
  giftId: string;
  direction: "sent" | "received";
  senderUid: string;
  recipientUid: string;
  itemId: string;
  itemName: string;
  category: string;
  priceCoins: number;
  durationDays: number | null;
  expiresAtMs: number | null;
  createdAtMs: number | null;
  status: "completed" | "fulfilled";
};

function timestampMillis(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" && Number.isSafeInteger(value) && value >= 0) return value;
  if (typeof value === "object" && typeof (value as { toMillis?: unknown }).toMillis === "function") {
    try {
      const result = (value as { toMillis: () => number }).toMillis();
      return Number.isSafeInteger(result) && result >= 0 ? result : null;
    } catch { return null; }
  }
  return null;
}

/** Whitelist projection prevents storage paths, audit payloads, and internal fields leaking. */
export function projectStoreGiftHistoryEntry(
  value: unknown,
  viewerUid: string,
): StoreGiftHistoryProjection | null {
  if (!value || typeof value !== "object" || Array.isArray(value) ||
      typeof viewerUid !== "string" || viewerUid.length < 1) return null;
  const input = value as Record<string, unknown>;
  if (typeof input.giftId !== "string" || input.giftId.length < 1 ||
      typeof input.senderUid !== "string" || typeof input.recipientUid !== "string" ||
      typeof input.itemId !== "string" || typeof input.itemName !== "string" ||
      typeof input.category !== "string" ||
      !Number.isSafeInteger(input.priceCoins) || (input.priceCoins as number) < 1 ||
      !(input.status === "completed" || input.status === "fulfilled") ||
      (input.senderUid !== viewerUid && input.recipientUid !== viewerUid)) return null;
  const durationDays = input.durationDays === null || input.durationDays === undefined
    ? null : Number.isSafeInteger(input.durationDays) && (input.durationDays as number) > 0
      ? input.durationDays as number : null;
  if (input.durationDays !== null && input.durationDays !== undefined && durationDays === null) return null;
  return {
    giftId: input.giftId,
    direction: input.senderUid === viewerUid ? "sent" : "received",
    senderUid: input.senderUid,
    recipientUid: input.recipientUid,
    itemId: input.itemId,
    itemName: input.itemName,
    category: input.category,
    priceCoins: input.priceCoins as number,
    durationDays,
    expiresAtMs: timestampMillis(input.expiresAt),
    createdAtMs: timestampMillis(input.createdAt),
    status: input.status,
  };
}
