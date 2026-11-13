const test = require("node:test");
const assert = require("node:assert/strict");
const { DEFAULT_COIN_PACKAGES, DEFAULT_AD_PRICES, validateCoinPackages, validateAdPrices } = require("../lib/economy-pricing");

test("starter coin packages and ad prices are valid and currency-safe", () => {
  assert.equal(validateCoinPackages(DEFAULT_COIN_PACKAGES).length, 5);
  assert.equal(validateAdPrices(DEFAULT_AD_PRICES).length, 4);
  assert.ok(DEFAULT_COIN_PACKAGES.every((item) => item.currency === "EUR" && item.priceMinor > 0));
  assert.ok(DEFAULT_AD_PRICES.every((item) => item.currency === "EUR" && item.priceMinor > 0));
});

test("coin package validation rejects duplicate IDs, fractional values and unsupported currency", () => {
  assert.throws(() => validateCoinPackages([
    DEFAULT_COIN_PACKAGES[0], { ...DEFAULT_COIN_PACKAGES[0] },
  ]), /INVALID_COIN_PACKAGE_ID/);
  assert.throws(() => validateCoinPackages([
    { ...DEFAULT_COIN_PACKAGES[0], coins: 2.5 },
  ]), /INVALID_COIN_PACKAGE_FIELDS/);
  assert.throws(() => validateCoinPackages([
    { ...DEFAULT_COIN_PACKAGES[0], currency: "USD" },
  ]), /INVALID_COIN_PACKAGE_FIELDS/);
});

test("advertising price validation rejects invalid billing models and prices", () => {
  assert.throws(() => validateAdPrices([
    { ...DEFAULT_AD_PRICES[0], billingModel: "weekly" },
  ]), /INVALID_AD_PRICE_FIELDS/);
  assert.throws(() => validateAdPrices([
    { ...DEFAULT_AD_PRICES[0], priceMinor: 0 },
  ]), /INVALID_AD_PRICE_FIELDS/);
});
