const test = require("node:test");
const assert = require("node:assert/strict");
const {
  calculateStorePurchaseBalance,
  isStoreEntitlementActive,
  isStorePurchasePriceCurrent,
} = require("../lib/store-purchase");

const NOW = 1_800_000_000_000;

test("coin purchase uses safe integer arithmetic and refuses insufficient balance", () => {
  assert.equal(calculateStorePurchaseBalance(5000, 1250), 3750);
  assert.equal(calculateStorePurchaseBalance(1000, 1000), 0);
  assert.equal(calculateStorePurchaseBalance(999, 1000), null);
  assert.equal(calculateStorePurchaseBalance(-1, 100), null);
  assert.equal(calculateStorePurchaseBalance(Number.MAX_SAFE_INTEGER + 1, 100), null);
  assert.equal(calculateStorePurchaseBalance(1000, 0), null);
  assert.equal(calculateStorePurchaseBalance(1000, 1.5), null);
});

test("permanent active entitlements prevent duplicate purchases", () => {
  assert.equal(isStoreEntitlementActive({ status: "active" }, NOW), true);
  assert.equal(isStoreEntitlementActive({ status: "expired" }, NOW), false);
});

test("temporary entitlement expires exactly at its server expiry and can later renew", () => {
  const future = { status: "active", expiresAt: { toMillis: () => NOW + 1 } };
  const expired = { status: "active", expiresAt: { toMillis: () => NOW } };
  assert.equal(isStoreEntitlementActive(future, NOW), true);
  assert.equal(isStoreEntitlementActive(expired, NOW), false);
  assert.equal(isStoreEntitlementActive({
    status: "active",
    expiresAt: { toMillis: () => { throw new Error("bad timestamp"); } },
  }, NOW), false);
});


test("store purchase rejects stale or malformed client price confirmations", () => {
  assert.equal(isStorePurchasePriceCurrent(2500, 2500), true);
  assert.equal(isStorePurchasePriceCurrent(2500, 3000), false);
  assert.equal(isStorePurchasePriceCurrent(0, 2500), false);
  assert.equal(isStorePurchasePriceCurrent(2500.5, 2500), false);
  assert.equal(isStorePurchasePriceCurrent(2500, Number.MAX_SAFE_INTEGER + 1), false);
});
