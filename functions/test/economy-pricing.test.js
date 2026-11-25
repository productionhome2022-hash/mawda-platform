const test = require("node:test");
const assert = require("node:assert/strict");
const { validateCoinPackages, validateAdPrices, isValidPositiveCurrencyAmount } = require("../lib/economy-pricing");

// Test-only fixtures; production package prices and advertising prices are
// supplied exclusively by the owner through the versioned settings callable.
const coinPackageFixture = {
  packageId: "test_coins_1000", name: "Test package",
  coins: 1000, priceMinor: 100, currency: "EUR", active: true,
};
const adPriceFixture = {
  placementId: "test_banner", name: "Test placement",
  billingModel: "cpm", priceMinor: 200, currency: "EUR", active: true,
};

test("proposed money amounts obey supported currency minor-unit precision", () => {
  assert.equal(isValidPositiveCurrencyAmount("125.00", "EUR"), true);
  assert.equal(isValidPositiveCurrencyAmount("125.000", "JOD"), true);
  assert.equal(isValidPositiveCurrencyAmount("125", "JPY"), false);
  assert.equal(isValidPositiveCurrencyAmount("125.001", "EUR"), false);
  assert.equal(isValidPositiveCurrencyAmount("125.0", "JPY"), false);
  assert.equal(isValidPositiveCurrencyAmount("125.0001", "JOD"), false);
  assert.equal(isValidPositiveCurrencyAmount("125.00", "XXX"), false);
  assert.equal(isValidPositiveCurrencyAmount("0.00", "EUR"), false);
});

test("empty price catalogs remain valid until the owner explicitly configures offers", () => {
  assert.deepEqual(validateCoinPackages([]), []);
  assert.deepEqual(validateAdPrices([]), []);
});

test("owner-authored coin packages and ad prices validate with selected ISO currency precision", () => {
  assert.equal(validateCoinPackages([coinPackageFixture]).length, 1);
  assert.equal(validateAdPrices([adPriceFixture]).length, 1);
  assert.equal(validateCoinPackages([coinPackageFixture])[0].currency, "EUR");
  assert.equal(validateCoinPackages([coinPackageFixture])[0].currencyExponent, 2);
  assert.equal(validateAdPrices([adPriceFixture])[0].priceMinor, 200);
  assert.equal(validateAdPrices([adPriceFixture])[0].currencyExponent, 2);
});

test("coin package validation rejects duplicate IDs, fractional values and malformed currency", () => {
  assert.throws(() => validateCoinPackages([
    coinPackageFixture, { ...coinPackageFixture },
  ]), /INVALID_COIN_PACKAGE_ID/);
  assert.throws(() => validateCoinPackages([
    { ...coinPackageFixture, coins: 2.5 },
  ]), /INVALID_COIN_PACKAGE_FIELDS/);
  assert.throws(() => validateCoinPackages([
    { ...coinPackageFixture, currency: "XYZ" },
  ]), /INVALID_COIN_PACKAGE_FIELDS/);
});

test("advertising price validation rejects invalid billing models and prices", () => {
  assert.throws(() => validateAdPrices([
    { ...adPriceFixture, billingModel: "weekly" },
  ]), /INVALID_AD_PRICE_FIELDS/);
  assert.throws(() => validateAdPrices([
    { ...adPriceFixture, priceMinor: 0 },
  ]), /INVALID_AD_PRICE_FIELDS/);
});


const { validateBilateralCallTariffs } = require("../lib/economy-pricing");

test("bilateral call tariffs accept unset or positive even whole-coin totals", () => {
  assert.deepEqual(validateBilateralCallTariffs({
    audioTotalCoinsPerMinute: null, videoTotalCoinsPerMinute: 200,
  }), { audioTotalCoinsPerMinute: null, videoTotalCoinsPerMinute: 200 });
  assert.deepEqual(validateBilateralCallTariffs({
    audioTotalCoinsPerMinute: 500, videoTotalCoinsPerMinute: 2000,
  }), { audioTotalCoinsPerMinute: 500, videoTotalCoinsPerMinute: 2000 });
});

test("bilateral call tariffs reject odd, fractional, negative, zero and non-finite totals", () => {
  for (const invalid of [1, 3, 0, -2, 2.5, NaN, Infinity, "200", undefined]) {
    assert.throws(() => validateBilateralCallTariffs({
      audioTotalCoinsPerMinute: invalid, videoTotalCoinsPerMinute: null,
    }), /INVALID_BILATERAL_CALL_TARIFF/);
  }
});

test("bilateral call tariff validator rejects unknown fields", () => {
  assert.throws(() => validateBilateralCallTariffs({
    audioTotalCoinsPerMinute: 200, videoTotalCoinsPerMinute: null,
    callerPrice: 100,
  }), /INVALID_CALL_TARIFFS/);
});


test("email verification reward policy is disabled until owner configures it", () => {
  const { defaultEmailVerificationRewardPolicy, validateEmailVerificationRewardPolicy } =
    require("../lib/economy-pricing");
  assert.deepEqual(defaultEmailVerificationRewardPolicy(), {
    enabled: false, rewardCoins: 0, cycleDays: 90,
  });
  assert.deepEqual(validateEmailVerificationRewardPolicy({
    enabled: true, rewardCoins: 750, cycleDays: 45,
  }), { enabled: true, rewardCoins: 750, cycleDays: 45 });
  for (const policy of [
    { enabled: true, rewardCoins: 0, cycleDays: 90 },
    { enabled: false, rewardCoins: -1, cycleDays: 90 },
    { enabled: false, rewardCoins: 0, cycleDays: 0 },
    { enabled: false, rewardCoins: 0, cycleDays: 3651 },
    { enabled: "yes", rewardCoins: 100, cycleDays: 90 },
  ]) assert.throws(() => validateEmailVerificationRewardPolicy(policy));
});


test("owner pricing catalogs accept owner-selected ISO 4217 currencies", () => {
  const { validateCoinPackages, validateAdPrices } = require("../lib/economy-pricing");
  const packages = validateCoinPackages([
    { ...coinPackageFixture, packageId: "coins_usd", currency: "USD" },
    { ...coinPackageFixture, packageId: "coins_jod", currency: "JOD" },
  ]);
  assert.deepEqual(packages.map((item) => item.currency), ["USD", "JOD"]);
  assert.deepEqual(packages.map((item) => item.currencyExponent), [2, 3]);
  const ads = validateAdPrices([
    { ...adPriceFixture, placementId: "ad_iqd", currency: "IQD" },
  ]);
  assert.equal(ads[0].currency, "IQD");
  assert.equal(ads[0].currencyExponent, 3);
  for (const currency of ["CHF", "KWD", "JPY", "XXX"]) {
    assert.throws(() => validateCoinPackages([{ ...coinPackageFixture, currency }]), /INVALID_COIN_PACKAGE_FIELDS/);
    assert.throws(() => validateAdPrices([{ ...adPriceFixture, currency }]), /INVALID_AD_PRICE_FIELDS/);
  }
  for (const currency of ["eur", "US", "USDD", "1US"]) {
    assert.throws(() => validateCoinPackages([
      { ...coinPackageFixture, currency },
    ]), /INVALID_COIN_PACKAGE_FIELDS/);
    assert.throws(() => validateAdPrices([
      { ...adPriceFixture, currency },
    ]), /INVALID_AD_PRICE_FIELDS/);
  }
});
