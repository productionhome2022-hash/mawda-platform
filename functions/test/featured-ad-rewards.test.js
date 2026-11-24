const test = require("node:test");
const assert = require("node:assert/strict");
const {
  FEATURED_AD_REWARD_DEFAULTS,
  defaultFeaturedAdRewardPolicy,
  validateFeaturedAdRewardPolicy,
  decideFeaturedAdReward,
  featuredAdCampaignRewardPolicy,
  featuredAdRewardBudgetAvailable,
} = require("../lib/featured-ad-rewards");

const defaults = defaultFeaturedAdRewardPolicy();
// Values below are isolated test fixtures, not production defaults or owner policy.
const policy = validateFeaturedAdRewardPolicy({
  ...defaults,
  enabled: true,
  rewardCoinsPerView: 2,
  maxRewardedViewsPerUtcDay: 10,
  maxRewardCoinsPerUtcDay: 20,
  maxRewardsPerCampaignRolling24h: 3,
});
const base = {
  nowMs: 1_800_000_000_000,
  campaignEligible: true,
  rewardBudgetAvailable: true,
  foregroundAndVisibilityValidated: true,
  creativeType: "video",
  videoCompletionPercent: 95,
  continuousVisibleMs: 0,
  rewardedViewsToday: 0,
  rewardCoinsToday: 0,
  sameCampaignRewardsInWindow: 0,
};

test("featured-ad rewards remain disabled and zero until the owner configures policy", () => {
  assert.deepEqual(defaults, FEATURED_AD_REWARD_DEFAULTS);
  assert.equal(defaults.enabled, false);
  assert.equal(defaults.rewardCoinsPerView, 0);
  assert.equal(defaults.maxRewardedViewsPerUtcDay, 0);
  assert.equal(defaults.maxRewardCoinsPerUtcDay, 0);
  assert.equal(defaults.maxRewardsPerCampaignRolling24h, 0);
  assert.deepEqual(validateFeaturedAdRewardPolicy(defaults), defaults);
});

test("validates and rejects unsafe owner reward policies", () => {
  assert.equal(validateFeaturedAdRewardPolicy(policy).rewardCoinsPerView, 2);
  assert.throws(() => validateFeaturedAdRewardPolicy({ ...policy, maxRewardCoinsPerUtcDay: 1 }));
  assert.throws(() => validateFeaturedAdRewardPolicy({ ...policy, videoCompletionPercent: 101 }));
  assert.throws(() => validateFeaturedAdRewardPolicy({ ...policy, maxRewardsPerCampaignRolling24h: 0 }));
});

test("rewards a qualifying visible video only under an enabled owner policy", () => {
  assert.deepEqual(decideFeaturedAdReward(policy, base), {
    eligible: true, amountCoins: 2, reason: "qualified",
  });
});

test("does not reward when policy is disabled", () => {
  assert.equal(decideFeaturedAdReward({ ...policy, enabled: false }, base).reason, "policy_disabled");
  assert.equal(decideFeaturedAdReward(defaults, base).reason, "policy_disabled");
});

test("does not reward withdrawn or otherwise ineligible campaigns", () => {
  assert.equal(decideFeaturedAdReward(policy, { ...base, campaignEligible: false }).reason, "campaign_ineligible");
});

test("does not reward when campaign reward budget is unavailable", () => {
  assert.equal(decideFeaturedAdReward(policy, { ...base, rewardBudgetAvailable: false }).reason, "budget_unavailable");
});

test("does not reward without server-validated foreground and visibility evidence", () => {
  assert.equal(decideFeaturedAdReward(policy, { ...base, foregroundAndVisibilityValidated: false }).reason, "foreground_evidence_missing");
});

test("enforces the video completion threshold", () => {
  assert.equal(decideFeaturedAdReward(policy, { ...base, videoCompletionPercent: 89.99 }).reason, "completion_not_met");
  assert.equal(decideFeaturedAdReward(policy, { ...base, videoCompletionPercent: 90 }).eligible, true);
});

test("enforces continuous visible time for static images", () => {
  assert.equal(decideFeaturedAdReward(policy, {
    ...base, creativeType: "image", videoCompletionPercent: 0, continuousVisibleMs: 9_999,
  }).reason, "completion_not_met");
  assert.equal(decideFeaturedAdReward(policy, {
    ...base, creativeType: "image", videoCompletionPercent: 0, continuousVisibleMs: 10_000,
  }).eligible, true);
});

test("enforces owner-configured daily rewarded-view and coin caps", () => {
  assert.equal(decideFeaturedAdReward(policy, { ...base, rewardedViewsToday: 10 }).reason, "daily_view_cap");
  assert.equal(decideFeaturedAdReward(policy, { ...base, rewardCoinsToday: 19 }).reason, "daily_coin_cap");
});

test("enforces the owner-configured per-campaign rolling window cap", () => {
  assert.equal(decideFeaturedAdReward(policy, {
    ...base, sameCampaignRewardsInWindow: 2,
  }).eligible, true);
  assert.equal(decideFeaturedAdReward(policy, {
    ...base, sameCampaignRewardsInWindow: 3,
  }).reason, "campaign_rolling_cap");
});

test("rejects invalid server evidence rather than granting a reward", () => {
  assert.throws(() => decideFeaturedAdReward(policy, { ...base, rewardedViewsToday: -1 }));
});

test("campaign reward cannot exceed the owner ceiling and must fit its remaining budget", () => {
  assert.equal(featuredAdCampaignRewardPolicy(policy, 2).rewardCoinsPerView, 2);
  assert.equal(featuredAdCampaignRewardPolicy(policy, 1).rewardCoinsPerView, 1);
  assert.equal(featuredAdCampaignRewardPolicy(policy, 3).rewardCoinsPerView, 0);
  assert.equal(featuredAdCampaignRewardPolicy(policy, "2").rewardCoinsPerView, 0);
  assert.equal(featuredAdRewardBudgetAvailable(100, 98, 2), true);
  assert.equal(featuredAdRewardBudgetAvailable(100, 99, 2), false);
  assert.equal(featuredAdRewardBudgetAvailable(100, 101, 1), false);
  assert.equal(featuredAdRewardBudgetAvailable(100, 0, 0), false);
});
