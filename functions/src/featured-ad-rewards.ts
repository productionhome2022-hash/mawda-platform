export const FEATURED_AD_REWARD_DEFAULTS = {
  // No reward amount or quota is assumed until the owner explicitly configures it.
  enabled: false,
  rewardCoinsPerView: 0,
  maxRewardedViewsPerUtcDay: 0,
  maxRewardCoinsPerUtcDay: 0,
  maxRewardsPerCampaignRolling24h: 0,
  sameCampaignWindowMs: 24 * 60 * 60 * 1000,
  videoCompletionPercent: 90,
  imageContinuousVisibleMs: 10_000,
} as const;

export interface FeaturedAdRewardPolicy {
  enabled: boolean;
  rewardCoinsPerView: number;
  maxRewardedViewsPerUtcDay: number;
  maxRewardCoinsPerUtcDay: number;
  maxRewardsPerCampaignRolling24h: number;
  sameCampaignWindowMs: number;
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
        | "campaign_daily_view_cap"
        | "campaign_rolling_cap";
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
      !integerInRange(input.maxRewardedViewsPerUtcDay, 0, 10_000) ||
      !integerInRange(input.maxRewardCoinsPerUtcDay, 0, 1_000_000) ||
      !integerInRange(input.maxRewardsPerCampaignRolling24h, 0, 1000) ||
      !integerInRange(input.sameCampaignWindowMs, 1, 31 * 24 * 60 * 60 * 1000) ||
      !integerInRange(input.videoCompletionPercent, 1, 100) ||
      !integerInRange(input.imageContinuousVisibleMs, 1_000, 60 * 60 * 1000) ||
      (input.enabled && (input.rewardCoinsPerView < 1 ||
        input.maxRewardedViewsPerUtcDay < 1 ||
        input.maxRewardCoinsPerUtcDay < input.rewardCoinsPerView ||
        input.maxRewardsPerCampaignRolling24h < 1))) {
    throw new Error("FEATURED_AD_REWARD_POLICY_INVALID");
  }
  return {
    enabled: input.enabled,
    rewardCoinsPerView: input.rewardCoinsPerView,
    maxRewardedViewsPerUtcDay: input.maxRewardedViewsPerUtcDay,
    maxRewardCoinsPerUtcDay: input.maxRewardCoinsPerUtcDay,
    maxRewardsPerCampaignRolling24h: input.maxRewardsPerCampaignRolling24h,
    sameCampaignWindowMs: input.sameCampaignWindowMs,
    videoCompletionPercent: input.videoCompletionPercent,
    imageContinuousVisibleMs: input.imageContinuousVisibleMs,
  };
}

export function defaultFeaturedAdRewardPolicy(): FeaturedAdRewardPolicy {
  return { ...FEATURED_AD_REWARD_DEFAULTS };
}

/** Resolve an immutable campaign reward under the owner's global per-view ceiling. */
export function featuredAdCampaignRewardPolicy(
  policyInput: unknown,
  campaignRewardCoins: unknown,
): FeaturedAdRewardPolicy {
  const policy = validateFeaturedAdRewardPolicy(policyInput);
  const configured = integerInRange(campaignRewardCoins, 1, 100_000) &&
    campaignRewardCoins <= policy.rewardCoinsPerView;
  return {
    ...policy,
    rewardCoinsPerView: configured ? campaignRewardCoins : 0,
  };
}

export function featuredAdRewardBudgetAvailable(
  budgetCoins: unknown,
  spentCoins: unknown,
  rewardCoins: unknown,
): boolean {
  return integerInRange(budgetCoins, 0, Number.MAX_SAFE_INTEGER) &&
    integerInRange(spentCoins, 0, Number.MAX_SAFE_INTEGER) &&
    integerInRange(rewardCoins, 1, 100_000) &&
    spentCoins <= budgetCoins &&
    budgetCoins - spentCoins >= rewardCoins;
}

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
  sameCampaignRewardedViewsToday: number;
  sameCampaignRewardsInWindow: number;
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
      !Number.isSafeInteger(evidence.sameCampaignRewardedViewsToday) ||
      evidence.sameCampaignRewardedViewsToday < 0 ||
      !Number.isSafeInteger(evidence.sameCampaignRewardsInWindow) || evidence.sameCampaignRewardsInWindow < 0) {
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
  // The owner may configure a lower rolling-window cap, but cannot raise
  // the fixed product ceiling of ten rewarded views per member/campaign/UTC day.
  if (evidence.sameCampaignRewardedViewsToday >= 10) {
    return { eligible: false, amountCoins: 0, reason: "campaign_daily_view_cap" };
  }
  if (evidence.sameCampaignRewardsInWindow >= policy.maxRewardsPerCampaignRolling24h) {
    return { eligible: false, amountCoins: 0, reason: "campaign_rolling_cap" };
  }
  return { eligible: true, amountCoins: policy.rewardCoinsPerView, reason: "qualified" };
}
