const test = require("node:test");
const assert = require("node:assert/strict");
const { getFirestore } = require("firebase-admin/firestore");
const { getOwnerFeaturedAdRewardPolicy, setOwnerFeaturedAdRewardPolicy } = require("../../lib/index");

const db = getFirestore();
const ownerRequest = (uid, data = {}) => ({
  data,
  auth: {
    uid,
    token: {
      platformOwner: true,
      platformOwnerUid: uid,
      auth_time: Math.floor(Date.now() / 1000),
      firebase: { sign_in_second_factor: "phone" },
    },
  },
});

test("featured-ad reward policy is owner-only, versioned, audited and rejects stale or invalid updates", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const uid = `featured_reward_owner_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const policyRef = db.doc("platformSettings/featuredAdRewardPolicy");
  const priorPolicy = await policyRef.get();
  const priorPolicyData = priorPolicy.exists ? priorPolicy.data() : null;
  try {
  const initial = await getOwnerFeaturedAdRewardPolicy.run(ownerRequest(uid));
  const policy = {
    enabled: true,
    rewardCoinsPerView: 12,
    maxRewardedViewsPerUtcDay: 8,
    maxRewardCoinsPerUtcDay: 96,
    maxRewardsPerCampaignRolling24h: 3,
    sameCampaignWindowMs: 86400000,
    videoCompletionPercent: 90,
    imageContinuousVisibleMs: 10000,
  };
  const saved = await setOwnerFeaturedAdRewardPolicy.run(ownerRequest(uid, {
    expectedVersion: initial.version,
    policy,
  }));
  assert.equal(saved.saved, true);
  assert.equal(saved.version, initial.version + 1);
  const current = await getOwnerFeaturedAdRewardPolicy.run(ownerRequest(uid));
  assert.deepEqual(current.policy, policy);
  assert.equal(current.version, saved.version);
  const successAudit = await db.collection("adminAuditLogs")
    .where("actorUid", "==", uid)
    .where("action", "==", "featured_ad_reward_policy_updated").get();
  assert.equal(successAudit.size, 1, "successful owner policy updates must be audited");
  await assert.rejects(
    () => setOwnerFeaturedAdRewardPolicy.run(ownerRequest(uid, {
      expectedVersion: initial.version, policy,
    })),
    (error) => error && error.code === "aborted",
  );
  await assert.rejects(
    () => setOwnerFeaturedAdRewardPolicy.run(ownerRequest(uid, {
      expectedVersion: saved.version,
      policy: { ...policy, rewardCoinsPerView: 13, maxRewardCoinsPerUtcDay: 12 },
    })),
    (error) => error && error.code === "invalid-argument",
    "daily cap below the per-view reward must be rejected",
  );
  } finally {
    const audit = await db.collection("adminAuditLogs")
      .where("actorUid", "==", uid)
      .where("action", "==", "featured_ad_reward_policy_updated").get();
    await Promise.all([
      ...audit.docs.map((doc) => doc.ref.delete().catch(() => undefined)),
      priorPolicy.exists ? policyRef.set(priorPolicyData) : policyRef.delete(),
    ]);
  }
});

test("featured-ad reward policy rejects non-owner callers and audits the denial", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const uid = `featured_reward_non_owner_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  await assert.rejects(
    () => getOwnerFeaturedAdRewardPolicy.run({
      data: {},
      auth: {
        uid,
        token: {
          platformOwner: false,
          platformOwnerUid: uid,
          auth_time: Math.floor(Date.now() / 1000),
          firebase: { sign_in_second_factor: "phone" },
        },
      },
    }),
    (error) => error && error.code === "permission-denied",
  );
  const denialAudit = await db.collection("adminAuditLogs")
    .where("actorUid", "==", uid)
    .where("action", "==", "featured_ad_reward_policy_read").get();
  assert.equal(denialAudit.size, 1, "authenticated non-owner attempts must be audited");
  await Promise.all(denialAudit.docs.map((doc) => doc.ref.delete().catch(() => undefined)));
});
