export const DEFAULT_FEATURED_AD_ROTATION_INTERVAL_MS = 1_000;

export type FeaturedAdCampaignCandidate = {
  campaignId: string;
  status: string;
  ownerApproved: boolean;
  ownerWithdrawn: boolean;
  paymentConfirmed: boolean;
  creativeApproved: boolean;
  startsAtMs: number;
  endsAtMs: number;
  geographicTargets: string[];
  featuredPlacement: "rotation" | "priority";
  /** Owner-assigned order within approved priority placements; lower comes first. */
  priorityOrder?: number;
};

export type FeaturedAdSelection = {
  mode: "priority" | "rotation" | "empty";
  campaignIds: string[];
  rotationIntervalMs: number;
  /** Featured previews are never eligible for rewarded-view claims. */
  rewardEligible: false;
};

function isEligible(
  campaign: FeaturedAdCampaignCandidate,
  audienceGeography: string,
  nowMs: number,
): boolean {
  return campaign.status === "published" &&
    campaign.ownerApproved &&
    !campaign.ownerWithdrawn &&
    campaign.paymentConfirmed &&
    campaign.creativeApproved &&
    Number.isSafeInteger(campaign.startsAtMs) &&
    Number.isSafeInteger(campaign.endsAtMs) &&
    campaign.startsAtMs <= nowMs &&
    campaign.endsAtMs > nowMs &&
    Array.isArray(campaign.geographicTargets) &&
    (campaign.geographicTargets.includes(audienceGeography) ||
      campaign.geographicTargets.includes("all_arab_countries"));
}

/** Fisher-Yates shuffle with injectable RNG so the fallback can be tested deterministically. */
function randomized<T>(items: T[], random: () => number): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) {
      throw new Error("FEATURED_AD_RANDOM_SOURCE_INVALID");
    }
    const swapIndex = Math.floor(value * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

/**
 * Chooses the upper Watch Ads showcase only. It deliberately does not create
 * rewarded-view sessions; reward claims must start from the geographic feed.
 */
export function selectFeaturedAdShowcase(args: {
  campaigns: FeaturedAdCampaignCandidate[];
  audienceGeography: string;
  nowMs: number;
  rotationIntervalMs?: number;
  random?: () => number;
}): FeaturedAdSelection {
  const interval = args.rotationIntervalMs ?? DEFAULT_FEATURED_AD_ROTATION_INTERVAL_MS;
  if (!args.audienceGeography ||
      !Number.isSafeInteger(args.nowMs) || args.nowMs < 0 ||
      !Number.isSafeInteger(interval) || interval < 1) {
    throw new Error("FEATURED_AD_SELECTION_INPUT_INVALID");
  }

  const eligible = args.campaigns.filter((campaign) =>
    isEligible(campaign, args.audienceGeography, args.nowMs));

  const priority = eligible
    .filter((campaign) => campaign.featuredPlacement === "priority")
    .sort((left, right) => {
      const leftOrder = Number.isSafeInteger(left.priorityOrder) ? left.priorityOrder! : Number.MAX_SAFE_INTEGER;
      const rightOrder = Number.isSafeInteger(right.priorityOrder) ? right.priorityOrder! : Number.MAX_SAFE_INTEGER;
      return leftOrder - rightOrder || left.campaignId.localeCompare(right.campaignId);
    });

  if (priority.length > 0) {
    return {
      mode: "priority",
      campaignIds: priority.map((campaign) => campaign.campaignId),
      rotationIntervalMs: interval,
      rewardEligible: false,
    };
  }

  if (eligible.length === 0) {
    return {
      mode: "empty",
      campaignIds: [],
      rotationIntervalMs: interval,
      rewardEligible: false,
    };
  }

  return {
    mode: "rotation",
    campaignIds: randomized(
      eligible.map((campaign) => campaign.campaignId),
      args.random ?? Math.random,
    ),
    rotationIntervalMs: interval,
    rewardEligible: false,
  };
}
