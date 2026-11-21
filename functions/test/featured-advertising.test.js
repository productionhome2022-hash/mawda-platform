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
  geographicTargets: ["syria"],
  featuredPlacement: "rotation",
};

test("featured previews default to a one-second rotation and can never award coins", () => {
  const result = selectFeaturedAdShowcase({
    campaigns: [{ ...base, campaignId: "ad_one" }],
    audienceGeography: "syria",
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

test("Owner-approved priority campaigns take precedence only in their geographic target", () => {
  const result = selectFeaturedAdShowcase({
    campaigns: [
      { ...base, campaignId: "rotation_ad" },
      { ...base, campaignId: "priority_later", featuredPlacement: "priority", priorityOrder: 2 },
      { ...base, campaignId: "priority_first", featuredPlacement: "priority", priorityOrder: 1 },
      { ...base, campaignId: "priority_other_geo", featuredPlacement: "priority", geographicTargets: ["lebanon"] },
    ],
    audienceGeography: "syria",
    nowMs: 500,
  });
  assert.equal(result.mode, "priority");
  assert.deepEqual(result.campaignIds, ["priority_first", "priority_later"]);
  assert.equal(result.rewardEligible, false);
});

test("fallback rotates a randomized eligible pool and does not rank by view counts", () => {
  const result = selectFeaturedAdShowcase({
    campaigns: [
      { ...base, campaignId: "most_viewed", viewCount: 999999 },
      { ...base, campaignId: "less_viewed", viewCount: 1 },
      { ...base, campaignId: "third_ad", viewCount: 50 },
    ],
    audienceGeography: "syria",
    nowMs: 500,
    random: () => 0,
  });
  assert.equal(result.mode, "rotation");
  assert.deepEqual(result.campaignIds, ["less_viewed", "third_ad", "most_viewed"]);
  assert.equal(result.rewardEligible, false);
});

test("withdrawn, unpaid, unapproved, expired and geographically unrelated campaigns are excluded", () => {
  const campaigns = [
    { ...base, campaignId: "withdrawn", ownerWithdrawn: true },
    { ...base, campaignId: "unpaid", paymentConfirmed: false },
    { ...base, campaignId: "unsafe", creativeApproved: false },
    { ...base, campaignId: "not_approved", ownerApproved: false },
    { ...base, campaignId: "expired", endsAtMs: 500 },
    { ...base, campaignId: "future", startsAtMs: 501 },
    { ...base, campaignId: "wrong_geo", geographicTargets: ["egypt"] },
  ];
  const result = selectFeaturedAdShowcase({
    campaigns,
    audienceGeography: "syria",
    nowMs: 500,
  });
  assert.equal(result.mode, "empty");
  assert.deepEqual(result.campaignIds, []);
});

test("owner can configure rotation interval and invalid inputs fail closed", () => {
  const result = selectFeaturedAdShowcase({
    campaigns: [{ ...base, campaignId: "ad_one" }],
    audienceGeography: "syria",
    nowMs: 500,
    rotationIntervalMs: 1500,
  });
  assert.equal(result.rotationIntervalMs, 1500);
  assert.throws(() => selectFeaturedAdShowcase({
    campaigns: [],
    audienceGeography: "",
    nowMs: 500,
  }), /INPUT_INVALID/);
  assert.throws(() => selectFeaturedAdShowcase({
    campaigns: [{ ...base, campaignId: "ad_one" }, { ...base, campaignId: "ad_two" }],
    audienceGeography: "syria",
    nowMs: 500,
    random: () => 1,
  }), /RANDOM_SOURCE_INVALID/);
});


test("all-Arab-country campaigns match each supported country without widening country-only campaigns", () => {
  const allArabCampaign = {
    ...base, campaignId: "all_arab_campaign",
    geographicTargets: ["all_arab_countries"],
  };
  const syriaOnlyCampaign = {
    ...base, campaignId: "syria_only",
    geographicTargets: ["syria"],
  };
  const syria = selectFeaturedAdShowcase({
    campaigns: [allArabCampaign, syriaOnlyCampaign],
    audienceGeography: "syria",
    nowMs: 500,
  });
  assert.deepEqual(syria.campaignIds.sort(), ["all_arab_campaign", "syria_only"]);

  const lebanon = selectFeaturedAdShowcase({
    campaigns: [allArabCampaign, syriaOnlyCampaign],
    audienceGeography: "lebanon",
    nowMs: 500,
  });
  assert.deepEqual(lebanon.campaignIds, ["all_arab_campaign"]);

  const allArabPseudoAudience = selectFeaturedAdShowcase({
    campaigns: [syriaOnlyCampaign],
    audienceGeography: "all_arab_countries",
    nowMs: 500,
  });
  assert.deepEqual(allArabPseudoAudience.campaignIds, [],
    "an all-Arab campaign target must not be treated as a viewer location that matches every country-specific campaign");
});
