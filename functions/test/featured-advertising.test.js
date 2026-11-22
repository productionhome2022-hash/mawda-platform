const test = require("node:test");
const assert = require("node:assert/strict");
const {
  DEFAULT_FEATURED_AD_ROTATION_INTERVAL_MS,
  selectFeaturedAdShowcase,
} = require("../lib/featured-advertising");

const base = {
  status: "published",
  ownerApproved: true,
  ownerWithdrawn: false,
  paymentConfirmed: true,
  creativeApproved: true,
  startsAtMs: 100,
  endsAtMs: 10_000,
  featuredPlacement: "rotation",
};

test("featured selection defaults to non-rewarded preview mode", () => {
  const result = selectFeaturedAdShowcase({
    campaigns: [{ ...base, campaignId: "ad_one" }],
    nowMs: 500,
  });
  assert.equal(DEFAULT_FEATURED_AD_ROTATION_INTERVAL_MS, 1000);
  assert.deepEqual(result, {
    mode: "rotation",
    campaignIds: ["ad_one"],
    rotationIntervalMs: 1000,
    rewardEligible: false,
  });
});

test("Owner-approved priority campaigns take precedence without geographic filtering", () => {
  const result = selectFeaturedAdShowcase({
    campaigns: [
      { ...base, campaignId: "rotation_ad" },
      { ...base, campaignId: "priority_later", featuredPlacement: "priority", priorityOrder: 2 },
      { ...base, campaignId: "priority_first", featuredPlacement: "priority", priorityOrder: 1 },
      { ...base, campaignId: "priority_other_market", featuredPlacement: "priority" },
    ],
    nowMs: 500,
  });
  assert.equal(result.mode, "priority");
  assert.deepEqual(result.campaignIds, ["priority_first", "priority_later", "priority_other_market"]);
  assert.equal(result.rewardEligible, false);
});

test("fallback rotates a randomized eligible pool and does not rank by view counts", () => {
  const result = selectFeaturedAdShowcase({
    campaigns: [
      { ...base, campaignId: "most_viewed", viewCount: 999999 },
      { ...base, campaignId: "less_viewed", viewCount: 1 },
      { ...base, campaignId: "third_ad", viewCount: 50 },
    ],
    nowMs: 500,
    random: () => 0,
  });
  assert.equal(result.mode, "rotation");
  assert.deepEqual(result.campaignIds, ["less_viewed", "third_ad", "most_viewed"]);
  assert.equal(result.rewardEligible, false);
});

test("withdrawn, unpaid, unapproved and expired campaigns are excluded", () => {
  const campaigns = [
    { ...base, campaignId: "withdrawn", ownerWithdrawn: true },
    { ...base, campaignId: "unpaid", paymentConfirmed: false },
    { ...base, campaignId: "unsafe", creativeApproved: false },
    { ...base, campaignId: "not_approved", ownerApproved: false },
    { ...base, campaignId: "expired", endsAtMs: 500 },
    { ...base, campaignId: "future", startsAtMs: 501 },
  ];
  const result = selectFeaturedAdShowcase({ campaigns, nowMs: 500 });
  assert.equal(result.mode, "empty");
  assert.deepEqual(result.campaignIds, []);
});

test("owner can configure rotation interval and invalid inputs fail closed", () => {
  const result = selectFeaturedAdShowcase({
    campaigns: [{ ...base, campaignId: "ad_one" }],
    nowMs: 500,
    rotationIntervalMs: 1500,
  });
  assert.equal(result.rotationIntervalMs, 1500);
  assert.throws(() => selectFeaturedAdShowcase({
    campaigns: [],
    nowMs: -1,
  }), /INPUT_INVALID/);
  assert.throws(() => selectFeaturedAdShowcase({
    campaigns: [{ ...base, campaignId: "ad_one" }, { ...base, campaignId: "ad_two" }],
    nowMs: 500,
    random: () => 1,
  }), /RANDOM_SOURCE_INVALID/);
});

test("featured campaigns are selected independently of viewer geography", () => {
  const result = selectFeaturedAdShowcase({
    campaigns: [
      { ...base, campaignId: "all_market_campaign" },
      { ...base, campaignId: "another_market_campaign" },
    ],
    nowMs: 500,
  });
  assert.deepEqual(result.campaignIds.sort(), ["all_market_campaign", "another_market_campaign"]);
});

test("unified timed-ad serving can explicitly mark selected featured campaigns as reward eligible", () => {
  const result = selectFeaturedAdShowcase({
    campaigns: [{ ...base, campaignId: "featured_rewarded_ad" }],
    nowMs: 500,
    rewardEligible: true,
  });
  assert.equal(result.campaignIds[0], "featured_rewarded_ad");
  assert.equal(result.rewardEligible, true);
});
