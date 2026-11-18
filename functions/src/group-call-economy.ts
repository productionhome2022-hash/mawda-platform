export type GroupCallMode = "audio" | "video";

export type GroupCallPricingPolicy = {
  policyId: string;
  version: number;
  active: boolean;
  audioCoinsPerMinute: number;
  videoCoinsPerMinute: number;
  updatedAtMs: number;
};

export type GroupCallCoinShare = { uid: string; amount: number };

export function validateGroupCallPricingPolicy(value: unknown): GroupCallPricingPolicy {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("INVALID_GROUP_CALL_PRICING_POLICY");
  }
  const p = value as Record<string, unknown>;
  if (typeof p.policyId !== "string" || !/^[A-Za-z0-9_-]{8,100}$/.test(p.policyId) ||
      !Number.isSafeInteger(p.version) || (p.version as number) < 1 ||
      typeof p.active !== "boolean" ||
      !Number.isSafeInteger(p.audioCoinsPerMinute) || (p.audioCoinsPerMinute as number) < 0 ||
      !Number.isSafeInteger(p.videoCoinsPerMinute) || (p.videoCoinsPerMinute as number) < 0 ||
      !Number.isSafeInteger(p.updatedAtMs) || (p.updatedAtMs as number) < 1 ||
      (p.active && (p.audioCoinsPerMinute as number) < 1 && (p.videoCoinsPerMinute as number) < 1)) {
    throw new Error("INVALID_GROUP_CALL_PRICING_POLICY");
  }
  return {
    policyId: p.policyId,
    version: p.version as number,
    active: p.active,
    audioCoinsPerMinute: p.audioCoinsPerMinute as number,
    videoCoinsPerMinute: p.videoCoinsPerMinute as number,
    updatedAtMs: p.updatedAtMs as number,
  };
}

export function getGroupCallRate(policyInput: unknown, mode: GroupCallMode): number {
  if (mode !== "audio" && mode !== "video") throw new Error("INVALID_GROUP_CALL_MODE");
  const policy = validateGroupCallPricingPolicy(policyInput);
  if (!policy.active) throw new Error("GROUP_CALL_PRICING_DISABLED");
  const rate = mode === "audio" ? policy.audioCoinsPerMinute : policy.videoCoinsPerMinute;
  if (rate < 1) throw new Error("GROUP_CALL_MODE_DISABLED");
  return rate;
}

/**
 * Splits one owner-priced call cost as evenly as integer coins permit.
 * Remainder coins are assigned one each in stable UID order, never based on
 * join time or initiator status. The sum is always exact and deterministic.
 */
export function calculateGroupCallCoinShares(
  totalAmount: number,
  participantUids: readonly string[],
  initiatorUid: string,
): GroupCallCoinShare[] {
  if (!Number.isSafeInteger(totalAmount) || totalAmount <= 0 ||
      typeof initiatorUid !== "string" || initiatorUid.trim().length < 1 ||
      initiatorUid.length > 128 || !Array.isArray(participantUids) ||
      participantUids.length < 2 ||
      participantUids.some((uid) => typeof uid !== "string" || uid.trim().length < 1 || uid.length > 128) ||
      new Set(participantUids).size !== participantUids.length ||
      !participantUids.includes(initiatorUid) || participantUids.length > totalAmount) {
    throw new Error("INVALID_GROUP_CALL_SETTLEMENT_INPUT");
  }
  const orderedUids = [...participantUids].sort((a, b) => a.localeCompare(b));
  const baseShare = Math.floor(totalAmount / orderedUids.length);
  const remainder = totalAmount % orderedUids.length;
  return orderedUids.map((uid, index) => ({
    uid, amount: baseShare + (index < remainder ? 1 : 0),
  }));
}

/** One settlement unit is one owner-configured minute for the actual active set. */
export function calculateGroupCallBillingSlice(
  policyInput: unknown,
  mode: GroupCallMode,
  activeParticipantUids: readonly string[],
  initiatorUid: string,
  billableMinutes: number,
): { policyId: string; policyVersion: number; totalAmount: number; shares: GroupCallCoinShare[] } {
  if (!Number.isSafeInteger(billableMinutes) || billableMinutes < 1 || billableMinutes > 1440) {
    throw new Error("INVALID_GROUP_CALL_BILLABLE_MINUTES");
  }
  const policy = validateGroupCallPricingPolicy(policyInput);
  const rate = getGroupCallRate(policy, mode);
  const totalAmount = rate * billableMinutes;
  if (!Number.isSafeInteger(totalAmount)) throw new Error("GROUP_CALL_AMOUNT_OUT_OF_RANGE");
  return {
    policyId: policy.policyId,
    policyVersion: policy.version,
    totalAmount,
    shares: calculateGroupCallCoinShares(totalAmount, activeParticipantUids, initiatorUid),
  };
}
