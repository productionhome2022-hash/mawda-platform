const test = require("node:test");
const assert = require("node:assert/strict");
const {
  validateGroupCallEntitlementPolicy,
  isGroupCallBillingCollectionEnabled,
  projectStoreGiftHistoryEntry,
  projectGroupCallTestPricingSnapshot,
  hasActiveCallEntitlement,
  evaluateCallParticipantEntitlements,
} = require("../lib/call-entitlements.js");

const policy = {
  policyId: "call-test-2026", version: 1, active: true,
  audioCoinsPerMinute: 137, videoCoinsPerMinute: 293,
  updatedAtMs: 1800000000000, environment: "test_only", billingEnabled: false,
};

test("owner test tariff is validated and explicitly marked non-collecting", () => {
  assert.deepEqual(validateGroupCallEntitlementPolicy(policy), policy);
  assert.equal(isGroupCallBillingCollectionEnabled(policy), false);
  assert.equal(isGroupCallBillingCollectionEnabled({ ...policy, billingEnabled: true }), false);
});

test("invalid or live collection policy cannot pass the test-only validator", () => {
  assert.throws(() => validateGroupCallEntitlementPolicy(null));
  assert.throws(() => validateGroupCallEntitlementPolicy({ ...policy, billingEnabled: true }));
  assert.throws(() => validateGroupCallEntitlementPolicy({ ...policy, environment: "production" }));
  assert.throws(() => validateGroupCallEntitlementPolicy({ ...policy, audioCoinsPerMinute: -1 }));
  assert.throws(() => validateGroupCallEntitlementPolicy({
    ...policy, audioCoinsPerMinute: 0, videoCoinsPerMinute: 0,
  }));
});

test("gift history projection exposes only a viewer's sent or received completed gift", () => {
  const record = {
    giftId: "gift-1", senderUid: "sender", recipientUid: "viewer",
    itemId: "vip_monthly", itemName: "VIP", category: "vip",
    priceCoins: 2500, durationDays: 30, status: "completed",
    createdAt: { toMillis: () => 1800000000000 },
    expiresAt: { toMillis: () => 1802592000000 },
    storagePath: "private/secret", auditPayload: { secret: true },
  };
  const projected = projectStoreGiftHistoryEntry(record, "viewer");
  assert.equal(projected.direction, "received");
  assert.equal(projected.priceCoins, 2500);
  assert.equal(projected.createdAtMs, 1800000000000);
  assert.equal(Object.hasOwn(projected, "storagePath"), false);
  assert.equal(Object.hasOwn(projected, "auditPayload"), false);
  assert.equal(projectStoreGiftHistoryEntry(record, "unrelated"), null);
  assert.equal(projectStoreGiftHistoryEntry({ ...record, status: "pending" }, "viewer"), null);
});

test("call session pricing snapshot freezes the test-only owner policy without collection", () => {
  const snapshot = projectGroupCallTestPricingSnapshot({
    environment: "test_only", billingEnabled: false, policy,
  }, "video");
  assert.deepEqual(snapshot, {
    policyId: policy.policyId, policyVersion: policy.version,
    mode: "video", coinsPerMinute: policy.videoCoinsPerMinute,
    environment: "test_only", billingEnabled: false,
  });
  assert.equal(projectGroupCallTestPricingSnapshot({
    environment: "test_only", billingEnabled: false, policy: { ...policy, active: false },
  }, "audio"), null);
  assert.equal(projectGroupCallTestPricingSnapshot({
    environment: "production", billingEnabled: false, policy,
  }, "audio"), null);
  assert.equal(projectGroupCallTestPricingSnapshot({
    environment: "test_only", billingEnabled: true, policy,
  }, "audio"), null);
});

test("audio and video access requires a matching active, unexpired package for every participant", () => {
  const now = 1800000000000;
  const audio = [{ itemId: "voice_call_30d", data: {
    itemId: "voice_call_30d", category: "voice_call", status: "active",
    expiresAt: { toMillis: () => now + 1000 },
  } }];
  const video = [{ itemId: "video_call_7d", data: {
    itemId: "video_call_7d", category: "video_call", status: "active",
    expiresAt: { toMillis: () => now + 1000 },
  } }];
  assert.equal(hasActiveCallEntitlement(audio, "audio", now), true);
  assert.equal(hasActiveCallEntitlement(audio, "video", now), false);
  assert.equal(hasActiveCallEntitlement([{ ...audio[0], data: { ...audio[0].data, expiresAt: { toMillis: () => now } } }], "audio", now), false);
  const allowed = evaluateCallParticipantEntitlements(
    ["caller", "callee"], "audio", new Map([["caller", audio], ["callee", audio]]), now,
  );
  assert.deepEqual(allowed, { allowed: true, missingUids: [] });
  const denied = evaluateCallParticipantEntitlements(
    ["caller", "callee"], "audio", new Map([["caller", audio]]), now,
  );
  assert.deepEqual(denied, { allowed: false, missingUids: ["callee"] });
});
