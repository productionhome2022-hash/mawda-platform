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
  sameCampaignRewardsInWindow: 0,
};

test("uses the approved experimental featured-ad reward defaults", () => {
  assert.deepEqual(policy, FEATURED_AD_REWARD_DEFAULTS);
});

test("validates and rejects unsafe owner reward policies", () => {
  assert.equal(validateFeaturedAdRewardPolicy(policy).rewardCoinsPerView, 2);
  assert.throws(() => validateFeaturedAdRewardPolicy({ ...policy, maxRewardCoinsPerUtcDay: 1 }));
  assert.throws(() => validateFeaturedAdRewardPolicy({ ...policy, videoCompletionPercent: 101 }));
  assert.throws(() => validateFeaturedAdRewardPolicy({ ...policy, maxRewardsPerCampaignRolling24h: 0 }));
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

test("enforces the daily rewarded-view and coin caps", () => {
  assert.equal(decideFeaturedAdReward(policy, { ...base, rewardedViewsToday: 10 }).reason, "daily_view_cap");
  assert.equal(decideFeaturedAdReward(policy, { ...base, rewardCoinsToday: 19 }).reason, "daily_coin_cap");
});

test("enforces the approved three rewards per campaign in a rolling 24-hour window", () => {
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
