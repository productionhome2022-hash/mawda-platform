// Production-safe first-run policy: no reward amount or quota is assumed
// before the owner explicitly configures and approves the campaign economy.
export const FEATURED_AD_REWARD_DEFAULTS = {
  enabled: false,
  rewardCoinsPerView: 0,
  maxRewardedViewsPerUtcDay: 0,
  maxRewardCoinsPerUtcDay: 0,
  videoCompletionPercent: 90,
  imageContinuousVisibleMs: 10_000,
} as const;

export interface FeaturedAdRewardPolicy {
  enabled: boolean;
  rewardCoinsPerView: number;
  maxRewardedViewsPerUtcDay: number;
  maxRewardCoinsPerUtcDay: number;
  videoCompletionPercent: number;
  imageContinuousVisibleMs: number;
}

export type FeaturedAdRewardDecision =
  | { eligible: true; amountCoins: number; reason: "qualified" }
  | {
      eligible: false;
      amountCoins: 0;
      reason:
        | "policy_disabled"
        | "campaign_ineligible"
        | "budget_unavailable"
        | "foreground_evidence_missing"
        | "completion_not_met"
        | "daily_view_cap"
        | "daily_coin_cap"
        | "campaign_view_cap";
    };

function integerInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= min && value <= max;
}

export function validateFeaturedAdRewardPolicy(value: unknown): FeaturedAdRewardPolicy {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("FEATURED_AD_REWARD_POLICY_INVALID");
  }
  const input = value as Record<string, unknown>;
  if (typeof input.enabled !== "boolean" ||
      !integerInRange(input.rewardCoinsPerView, 0, 100_000) ||
      !integerInRange(input.maxRewardedViewsPerUtcDay, 0, 100_000) ||
      !integerInRange(input.maxRewardCoinsPerUtcDay, 0, 100_000_000) ||
      !integerInRange(input.videoCompletionPercent, 1, 100) ||
      !integerInRange(input.imageContinuousVisibleMs, 1_000, 60 * 60 * 1000) ||
      (input.enabled && (input.rewardCoinsPerView < 1 ||
        input.maxRewardedViewsPerUtcDay < 1 ||
        input.maxRewardCoinsPerUtcDay < input.rewardCoinsPerView))) {
    throw new Error("FEATURED_AD_REWARD_POLICY_INVALID");
  }
  return {
    enabled: input.enabled,
    rewardCoinsPerView: input.rewardCoinsPerView,
    maxRewardedViewsPerUtcDay: input.maxRewardedViewsPerUtcDay,
    maxRewardCoinsPerUtcDay: input.maxRewardCoinsPerUtcDay,
    videoCompletionPercent: input.videoCompletionPercent,
    imageContinuousVisibleMs: input.imageContinuousVisibleMs,
  };
}

export function defaultFeaturedAdRewardPolicy(): FeaturedAdRewardPolicy {
  return { ...FEATURED_AD_REWARD_DEFAULTS };
}

/**
 * Per-campaign repetition is an owner-controlled campaign setting, not a
 * hard-coded global rolling-window rule. The caller must supply the campaign's
 * server-stored limit and the server-counted successful claims for this member.
 */
export interface FeaturedAdRewardEvidence {
  nowMs: number;
  campaignEligible: boolean;
  rewardBudgetAvailable: boolean;
  foregroundAndVisibilityValidated: boolean;
  creativeType: "video" | "image";
  videoCompletionPercent: number;
  continuousVisibleMs: number;
  rewardedViewsToday: number;
  rewardCoinsToday: number;
  maxRewardedViewsForCampaign: number;
  rewardedViewsForCampaign: number;
}

export function decideFeaturedAdReward(
  policyInput: unknown,
  evidence: FeaturedAdRewardEvidence,
): FeaturedAdRewardDecision {
  const policy = validateFeaturedAdRewardPolicy(policyInput);
  if (!policy.enabled || policy.rewardCoinsPerView === 0) {
    return { eligible: false, amountCoins: 0, reason: "policy_disabled" };
  }
  if (!Number.isSafeInteger(evidence.nowMs) || evidence.nowMs < 0 ||
      !Number.isSafeInteger(evidence.rewardedViewsToday) || evidence.rewardedViewsToday < 0 ||
      !Number.isSafeInteger(evidence.rewardCoinsToday) || evidence.rewardCoinsToday < 0 ||
      !integerInRange(evidence.maxRewardedViewsForCampaign, 1, Number.MAX_SAFE_INTEGER) ||
      !Number.isSafeInteger(evidence.rewardedViewsForCampaign) || evidence.rewardedViewsForCampaign < 0) {
    throw new Error("FEATURED_AD_REWARD_EVIDENCE_INVALID");
  }
  if (!evidence.campaignEligible) {
    return { eligible: false, amountCoins: 0, reason: "campaign_ineligible" };
  }
  if (!evidence.rewardBudgetAvailable) {
    return { eligible: false, amountCoins: 0, reason: "budget_unavailable" };
  }
  if (!evidence.foregroundAndVisibilityValidated) {
    return { eligible: false, amountCoins: 0, reason: "foreground_evidence_missing" };
  }
  if (evidence.creativeType === "video") {
    if (!Number.isFinite(evidence.videoCompletionPercent) ||
        evidence.videoCompletionPercent < policy.videoCompletionPercent) {
      return { eligible: false, amountCoins: 0, reason: "completion_not_met" };
    }
  } else if (evidence.creativeType === "image") {
    if (!integerInRange(evidence.continuousVisibleMs, 0, Number.MAX_SAFE_INTEGER) ||
        evidence.continuousVisibleMs < policy.imageContinuousVisibleMs) {
      return { eligible: false, amountCoins: 0, reason: "completion_not_met" };
    }
  } else {
    throw new Error("FEATURED_AD_CREATIVE_TYPE_INVALID");
  }
  if (evidence.rewardedViewsToday >= policy.maxRewardedViewsPerUtcDay) {
    return { eligible: false, amountCoins: 0, reason: "daily_view_cap" };
  }
  if (evidence.rewardCoinsToday + policy.rewardCoinsPerView > policy.maxRewardCoinsPerUtcDay) {
    return { eligible: false, amountCoins: 0, reason: "daily_coin_cap" };
  }
  if (evidence.rewardedViewsForCampaign >= evidence.maxRewardedViewsForCampaign) {
    return { eligible: false, amountCoins: 0, reason: "campaign_view_cap" };
  }
  return { eligible: true, amountCoins: policy.rewardCoinsPerView, reason: "qualified" };
}
