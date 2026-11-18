export type CallEntitlementMode = "audio" | "video";

export const CALL_ENTITLEMENT_ITEM_IDS: Readonly<Record<CallEntitlementMode, readonly string[]>> = {
  audio: ["voice_call_24h", "voice_call_7d", "voice_call_30d"],
  video: ["video_call_24h", "video_call_7d", "video_call_30d"],
};

type CallEntitlementRecord = {
  itemId: string;
  data: Record<string, unknown>;
};

function expiryMs(value: unknown): number | null {
  if (value instanceof Date) return value.getTime();
  if (value && typeof value === "object" &&
      typeof (value as { toMillis?: unknown }).toMillis === "function") {
    try {
      const result = (value as { toMillis: () => number }).toMillis();
      return Number.isFinite(result) ? result : null;
    } catch {
      return null;
    }
  }
  return null;
}

/** Call access requires a currently active, time-bounded entitlement of the matching mode. */
export function hasActiveCallEntitlement(
  mode: CallEntitlementMode,
  entitlements: readonly CallEntitlementRecord[],
  nowMs = Date.now(),
): boolean {
  if (!Number.isSafeInteger(nowMs) || nowMs < 0) return false;
  const expectedCategory = mode === "audio" ? "voice_call" : "video_call";
  const allowedIds = CALL_ENTITLEMENT_ITEM_IDS[mode];
  return entitlements.some(({ itemId, data }) => {
    if (!allowedIds.includes(itemId) || data.itemId !== itemId ||
        data.category !== expectedCategory || data.status !== "active") return false;
    const expiresAtMs = expiryMs(data.expiresAt);
    return expiresAtMs !== null && expiresAtMs > nowMs;
  });
}
