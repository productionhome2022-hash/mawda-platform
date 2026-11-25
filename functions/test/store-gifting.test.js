const test = require("node:test");
const assert = require("node:assert/strict");
const {
  isStoreGiftReplayCompatible,
  isEligibleStoreGiftMemberRecord,
  isEligibleStoreGiftAuthUser,
  calculateStoreGiftExpiryMs,
} = require("../lib/store-gifting");

const NOW = 1_800_000_000_000;

test("gift replay is bound to sender, recipient, item, price and completed state", () => {
  const prior = {
    senderUid: "sender-a", recipientUid: "recipient-b",
    itemId: "vip_monthly", priceCoins: 2500, catalogVersion: 3, status: "completed",
  };
  const identity = {
    senderUid: "sender-a", recipientUid: "recipient-b",
    itemId: "vip_monthly", expectedPriceCoins: 2500, expectedCatalogVersion: 3,
  };
  assert.equal(isStoreGiftReplayCompatible(prior, identity), true);
  assert.equal(isStoreGiftReplayCompatible(prior, { ...identity, recipientUid: "recipient-c" }), false);
  assert.equal(isStoreGiftReplayCompatible(prior, { ...identity, itemId: "other_item" }), false);
  assert.equal(isStoreGiftReplayCompatible(prior, { ...identity, expectedPriceCoins: 3000 }), false);
  assert.equal(isStoreGiftReplayCompatible(prior, { ...identity, expectedCatalogVersion: 4 }), false);
  assert.equal(isStoreGiftReplayCompatible({ ...prior, status: "pending" }, identity), false);
  assert.equal(isStoreGiftReplayCompatible(null, identity), false);
});

test("gift recipient eligibility requires a completed active non-guest member profile", () => {
  assert.equal(isEligibleStoreGiftMemberRecord({ profileCompleted: true }), true);
  assert.equal(isEligibleStoreGiftMemberRecord({ profileCompleted: true, accountStatus: "active" }), true);
  assert.equal(isEligibleStoreGiftMemberRecord({ profileCompleted: false }), false);
  assert.equal(isEligibleStoreGiftMemberRecord({ profileCompleted: true, accountStatus: "suspended" }), false);
  assert.equal(isEligibleStoreGiftMemberRecord({ profileCompleted: true, accountType: "guest" }), false);
  assert.equal(isEligibleStoreGiftMemberRecord({ profileCompleted: true, isGuest: true }), false);
  assert.equal(isEligibleStoreGiftMemberRecord({ profileCompleted: true, profileType: "guest" }), false);
  assert.equal(isEligibleStoreGiftMemberRecord(null), false);
});

test("timed gifts extend from the later of server now and active expiry", () => {
  assert.equal(
    calculateStoreGiftExpiryMs({ status: "active", expiresAt: { toMillis: () => NOW + 10_000 } }, 7, NOW),
    NOW + 10_000 + 7 * 24 * 60 * 60 * 1000,
  );
  assert.equal(
    calculateStoreGiftExpiryMs({ status: "active", expiresAt: { toMillis: () => NOW - 1 } }, 1, NOW),
    NOW + 24 * 60 * 60 * 1000,
  );
  assert.equal(
    calculateStoreGiftExpiryMs({ status: "expired", expiresAt: { toMillis: () => NOW + 50_000 } }, 1, NOW),
    NOW + 24 * 60 * 60 * 1000,
  );
});

test("a permanent active entitlement cannot be shortened by a timed gift", () => {
  assert.equal(
    calculateStoreGiftExpiryMs({ status: "active", expiresAt: null }, 30, NOW),
    null,
  );
});

test("permanent catalog items stay permanent and invalid durations fail closed", () => {
  assert.equal(calculateStoreGiftExpiryMs({ status: "expired" }, undefined, NOW), null);
  assert.throws(() => calculateStoreGiftExpiryMs({}, 0, NOW), /INVALID_GIFT_DURATION/);
  assert.throws(() => calculateStoreGiftExpiryMs({}, 7, -1), /INVALID_SERVER_TIME/);
});

test("malformed active entitlement expiry fails closed instead of granting guessed time", () => {
  assert.throws(
    () => calculateStoreGiftExpiryMs({ status: "active", expiresAt: "not-a-timestamp" }, 7, NOW),
    /INVALID_CURRENT_ENTITLEMENT_EXPIRY/,
  );
  assert.throws(
    () => calculateStoreGiftExpiryMs({ status: "active", expiresAt: { toMillis: () => Number.NaN } }, 7, NOW),
    /INVALID_CURRENT_ENTITLEMENT_EXPIRY/,
  );
});
test("gift recipient Auth must be enabled and have a non-anonymous provider", () => {
  assert.equal(isEligibleStoreGiftAuthUser({
    disabled: false, providerData: [{ providerId: "google.com" }],
  }), true);
  assert.equal(isEligibleStoreGiftAuthUser({
    disabled: true, providerData: [{ providerId: "google.com" }],
  }), false);
  assert.equal(isEligibleStoreGiftAuthUser({
    disabled: false, providerData: [],
  }), false);
  assert.equal(isEligibleStoreGiftAuthUser({
    disabled: false, providerData: [{ providerId: "anonymous" }],
  }), false);
  assert.equal(isEligibleStoreGiftAuthUser(null), false);
});
