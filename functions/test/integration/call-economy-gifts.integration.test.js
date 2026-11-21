const test = require("node:test");
const assert = require("node:assert/strict");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const {
  getOwnerGroupCallPricingPolicy,
  setOwnerGroupCallPricingPolicy,
  getMyStoreGiftHistory,
} = require("../../lib/index");

const db = getFirestore();
const suffix = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
const ownerRequest = (uid, data = {}) => ({
  data,
  auth: { uid, token: {
    platformOwner: true, platformOwnerUid: uid,
    auth_time: Math.floor(Date.now() / 1000),
    firebase: { sign_in_second_factor: "phone" },
  } },
});
const memberRequest = (uid, data = {}) => ({
  data,
  auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
});

test("super-owner manages versioned test-only call rates while collection stays disabled", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const ownerUid = `call_pricing_owner_${tag}`;
  const settingsRef = db.doc("platformSettings/groupCallPricing");
  const prior = await settingsRef.get();
  const priorData = prior.exists ? prior.data() : null;
  try {
    const first = await setOwnerGroupCallPricingPolicy.run(ownerRequest(ownerUid, {
      audioCoinsPerMinute: 137, videoCoinsPerMinute: 293, active: true,
    }));
    assert.equal(first.saved, true);
    assert.equal(first.policy.environment, "test_only");
    assert.equal(first.billingEnabled, false);
    assert.equal(first.policy.version, 1);

    const read = await getOwnerGroupCallPricingPolicy.run(ownerRequest(ownerUid));
    assert.equal(read.configured, true);
    assert.equal(read.policy.audioCoinsPerMinute, 137);
    assert.equal(read.policy.videoCoinsPerMinute, 293);
    assert.equal(read.billingEnabled, false);

    const second = await setOwnerGroupCallPricingPolicy.run(ownerRequest(ownerUid, {
      audioCoinsPerMinute: 151, videoCoinsPerMinute: 311, active: true,
    }));
    assert.equal(second.policy.version, 2);
    assert.equal(second.billingEnabled, false);
    assert.equal((await settingsRef.get()).data().billingEnabled, false);

    await assert.rejects(
      () => setOwnerGroupCallPricingPolicy.run(ownerRequest(ownerUid, {
        audioCoinsPerMinute: -1, videoCoinsPerMinute: 1, active: true,
      })),
      (error) => error && error.code === "invalid-argument",
    );
  } finally {
    if (priorData) await settingsRef.set(priorData);
    else await settingsRef.delete();
  }
});

test("member gift history returns only sent or received completed gifts and rejects other members", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const viewerUid = `gift_history_viewer_${tag}`;
  const otherUid = `gift_history_other_${tag}`;
  const memberRef = db.collection("users").doc(viewerUid);
  const sentRef = db.collection("storeGifts").doc(`gift_sent_${tag}`);
  const receivedRef = db.collection("storeGifts").doc(`gift_received_${tag}`);
  const unrelatedRef = db.collection("storeGifts").doc(`gift_unrelated_${tag}`);
  const pendingRef = db.collection("storeGifts").doc(`gift_pending_${tag}`);
  await memberRef.set({ profileCompleted: true, accountStatus: "active", coins: 100 });
  const base = {
    itemId: "vip_monthly", itemName: "VIP Monthly", category: "vip",
    priceCoins: 2500, durationDays: 30, status: "completed",
    createdAt: Timestamp.fromMillis(Date.now()), expiresAt: null,
  };
  await Promise.all([
    sentRef.set({ ...base, giftId: sentRef.id, senderUid: viewerUid, recipientUid: otherUid }),
    receivedRef.set({ ...base, giftId: receivedRef.id, senderUid: otherUid, recipientUid: viewerUid }),
    unrelatedRef.set({ ...base, giftId: unrelatedRef.id, senderUid: otherUid, recipientUid: `stranger_${tag}` }),
    pendingRef.set({ ...base, giftId: pendingRef.id, senderUid: viewerUid, recipientUid: otherUid, status: "pending" }),
  ]);
  try {
    const result = await getMyStoreGiftHistory.run(memberRequest(viewerUid));
    assert.equal(result.entries.length, 2);
    assert.deepEqual(new Set(result.entries.map((entry) => entry.direction)), new Set(["sent", "received"]));
    assert.ok(result.entries.every((entry) => !Object.hasOwn(entry, "storagePath")));
    await assert.rejects(
      () => getMyStoreGiftHistory.run(memberRequest(`unknown_member_${tag}`)),
      (error) => error && error.code === "permission-denied",
    );
  } finally {
    await Promise.all([
      memberRef.delete(), sentRef.delete(), receivedRef.delete(),
      unrelatedRef.delete(), pendingRef.delete(),
    ]);
  }
});
