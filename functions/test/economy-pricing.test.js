const test = require("node:test");
const assert = require("node:assert/strict");
const { validateCoinPackages, validateAdPrices } = require("../lib/economy-pricing");

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

test("empty price catalogs remain valid until the owner explicitly configures offers", () => {
  assert.deepEqual(validateCoinPackages([]), []);
  assert.deepEqual(validateAdPrices([]), []);
});

test("owner-authored coin packages and ad prices validate with EUR minor units", () => {
  assert.equal(validateCoinPackages([coinPackageFixture]).length, 1);
  assert.equal(validateAdPrices([adPriceFixture]).length, 1);
  assert.equal(validateCoinPackages([coinPackageFixture])[0].currency, "EUR");
  assert.equal(validateAdPrices([adPriceFixture])[0].priceMinor, 200);
});

test("coin package validation rejects duplicate IDs, fractional values and unsupported currency", () => {
  assert.throws(() => validateCoinPackages([
    coinPackageFixture, { ...coinPackageFixture },
  ]), /INVALID_COIN_PACKAGE_ID/);
  assert.throws(() => validateCoinPackages([
    { ...coinPackageFixture, coins: 2.5 },
  ]), /INVALID_COIN_PACKAGE_FIELDS/);
  assert.throws(() => validateCoinPackages([
    { ...coinPackageFixture, currency: "USD" },
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
