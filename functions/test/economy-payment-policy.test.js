const test = require("node:test");
const assert = require("node:assert/strict");
const {
  validateEconomicPaymentPolicy,
  projectEconomicPaymentPolicy,
} = require("../lib/economy-payment-policy");

test("projects legacy manual switches into service-scoped policy during migration", () => {
  const policy = projectEconomicPaymentPolicy(undefined, {
    manualCoinPurchasesEnabled: true,
    manualFeaturedAdsEnabled: false,
  });
  assert.equal(policy.coin_purchases.manualEnabled, true);
  assert.equal(policy.featured_ads.manualEnabled, false);
  assert.equal(policy.public_ads.manualEnabled, false);
  assert.equal(policy.influencer_services.manualEnabled, false);
  assert.equal(policy.store_entitlements.manualEnabled, false);
  assert.equal(policy.coin_purchases.automatedEnabled, false);
});

test("validates independent manual modes without inventing prices or enabling automation", () => {
  const policy = validateEconomicPaymentPolicy({
    coin_purchases: { manualEnabled: true, automatedEnabled: false },
    featured_ads: { manualEnabled: false },
    public_ads: { manualEnabled: false },
    influencer_services: { manualEnabled: false },
    store_entitlements: { manualEnabled: false },
  });
  assert.equal(policy.coin_purchases.manualEnabled, true);
  assert.equal(policy.public_ads.manualEnabled, false);
  assert.equal(policy.store_entitlements.manualEnabled, false);
  assert.equal(policy.influencer_services.manualEnabled, false);
  assert.equal(policy.coin_purchases.automatedEnabled, false);
});

test("fails closed for manual payment services without complete request and fulfilment workflows", () => {
  for (const service of ["public_ads", "influencer_services", "store_entitlements"]) {
    assert.throws(() => validateEconomicPaymentPolicy({
      [service]: { manualEnabled: true, automatedEnabled: false },
    }), /MANUAL_PAYMENT_WORKFLOW_NOT_READY/);
  }
});

test("projects previously persisted unsupported switches as disabled", () => {
  const policy = projectEconomicPaymentPolicy({
    coin_purchases: { manualEnabled: true, automatedEnabled: false },
    featured_ads: { manualEnabled: true, automatedEnabled: false },
    public_ads: { manualEnabled: true, automatedEnabled: false },
    influencer_services: { manualEnabled: true, automatedEnabled: false },
    store_entitlements: { manualEnabled: true, automatedEnabled: false },
  });
  assert.equal(policy.coin_purchases.manualEnabled, true);
  assert.equal(policy.featured_ads.manualEnabled, true);
  assert.equal(policy.public_ads.manualEnabled, false);
  assert.equal(policy.influencer_services.manualEnabled, false);
  assert.equal(policy.store_entitlements.manualEnabled, false);
});

test("rejects automated checkout until a verified provider integration is available", () => {
  assert.throws(() => validateEconomicPaymentPolicy({
    coin_purchases: { manualEnabled: true, automatedEnabled: true },
  }), /PAYMENT_MODE_INVALID/);
});

test("rejects unknown services and malformed switches", () => {
  assert.throws(() => validateEconomicPaymentPolicy({
    unknown_service: { manualEnabled: true },
  }), /PAYMENT_POLICY_UNKNOWN_SERVICE/);
  assert.throws(() => validateEconomicPaymentPolicy({
    public_ads: { manualEnabled: "yes" },
  }), /PAYMENT_MODE_INVALID/);
});

test("explicit service policy overrides legacy migration defaults", () => {
  const policy = projectEconomicPaymentPolicy({
    coin_purchases: { manualEnabled: false, automatedEnabled: false },
    featured_ads: { manualEnabled: true, automatedEnabled: false },
  }, {
    manualCoinPurchasesEnabled: true,
    manualFeaturedAdsEnabled: false,
  });
  assert.equal(policy.coin_purchases.manualEnabled, false);
  assert.equal(policy.featured_ads.manualEnabled, true);
});
