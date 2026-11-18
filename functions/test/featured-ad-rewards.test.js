const test = require("node:test");
const assert = require("node:assert/strict");
const {
  FEATURED_AD_REWARD_DEFAULTS,
  defaultFeaturedAdRewardPolicy,
  validateFeaturedAdRewardPolicy,
  decideFeaturedAdReward,
} = require("../lib/featured-ad-rewards");

const policy = defaultFeaturedAdRewardPolicy();
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
  maxRewardedViewsForCampaign: 100,
  rewardedViewsForCampaign: 0,
};

test("uses editable experimental featured-ad reward defaults", () => {
  assert.deepEqual(policy, FEATURED_AD_REWARD_DEFAULTS);
});

test("validates owner-configurable reward values", () => {
  assert.equal(validateFeaturedAdRewardPolicy(policy).rewardCoinsPerView, 2);
  assert.equal(policy.maxRewardedViewsPerUtcDay, 100);
  assert.equal(policy.maxRewardCoinsPerUtcDay, 200);
  assert.throws(() => validateFeaturedAdRewardPolicy({ ...policy, maxRewardCoinsPerUtcDay: 1 }));
  assert.throws(() => validateFeaturedAdRewardPolicy({ ...policy, videoCompletionPercent: 101 }));
  assert.equal(validateFeaturedAdRewardPolicy({
    ...policy, maxRewardedViewsPerUtcDay: 100, maxRewardCoinsPerUtcDay: 100_000,
  }).maxRewardedViewsPerUtcDay, 100);
});

test("rewards a qualifying visible video once", () => {
  assert.deepEqual(decideFeaturedAdReward(policy, base), {
    eligible: true, amountCoins: 2, reason: "qualified",
  });
});

test("does not reward when policy is disabled", () => {
  assert.equal(decideFeaturedAdReward({ ...policy, enabled: false }, base).reason, "policy_disabled");
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

test("enforces global daily view and coin controls", () => {
  assert.equal(decideFeaturedAdReward(policy, { ...base, rewardedViewsToday: 100 }).reason, "daily_view_cap");
  assert.equal(decideFeaturedAdReward(policy, { ...base, rewardCoinsToday: 199 }).reason, "daily_coin_cap");
});

test("honors the per-campaign repeat count configured by the owner", () => {
  assert.equal(decideFeaturedAdReward(policy, {
    ...base, maxRewardedViewsForCampaign: 100, rewardedViewsForCampaign: 99,
  }).eligible, true);
  assert.equal(decideFeaturedAdReward(policy, {
    ...base, maxRewardedViewsForCampaign: 100, rewardedViewsForCampaign: 100,
  }).reason, "campaign_view_cap");
  assert.equal(decideFeaturedAdReward(policy, {
    ...base, maxRewardedViewsForCampaign: 3, rewardedViewsForCampaign: 3,
  }).reason, "campaign_view_cap");
  assert.equal(decideFeaturedAdReward(policy, {
    ...base, maxRewardedViewsForCampaign: 1_000_000, rewardedViewsForCampaign: 999_999,
  }).eligible, true);
});

test("rejects invalid server evidence rather than granting a reward", () => {
  assert.throws(() => decideFeaturedAdReward(policy, { ...base, rewardedViewsToday: -1 }));
  assert.throws(() => decideFeaturedAdReward(policy, { ...base, maxRewardedViewsForCampaign: 0 }));
});
