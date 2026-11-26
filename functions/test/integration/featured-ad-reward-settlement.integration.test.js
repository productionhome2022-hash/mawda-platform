const test = require("node:test");
const assert = require("node:assert/strict");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { completeFeaturedAdViewingSession } = require("../../lib/index");

const db = getFirestore();
const memberRequest = (uid, data = {}) => ({
  data, auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
});

test("featured-ad reward completion atomically commits one claim, wallet ledger, daily counter and campaign spend", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const uid = `featured_reward_member_${tag}`;
  const campaignId = `featured_reward_campaign_${tag}`;
  const sessionId = `00000000-0000-4000-8000-${tag.replace(/[^0-9]/g, "").padEnd(12, "2").slice(0, 12)}`;
  const userRef = db.collection("users").doc(uid);
  const campaignRef = db.collection("featuredAdCampaigns").doc(campaignId);
  const sessionRef = db.collection("featuredAdViewingSessions").doc(sessionId);
  const policyRef = db.doc("platformSettings/featuredAdRewardPolicy");
  const priorPolicy = await policyRef.get();
  const priorPolicyData = priorPolicy.exists ? priorPolicy.data() : null;
  const now = Date.now();
  const policy = {
    enabled: true, rewardCoinsPerView: 5,
    maxRewardedViewsPerUtcDay: 10, maxRewardCoinsPerUtcDay: 50,
    maxRewardsPerCampaignRolling24h: 5, sameCampaignWindowMs: 86400000,
    videoCompletionPercent: 90, imageContinuousVisibleMs: 10000,
  };
  await Promise.all([
    userRef.set({ profileCompleted: true, accountStatus: "active", coins: 10 }),
    campaignRef.set({
      campaignId, status: "published", ownerApproved: true, ownerWithdrawn: false,
      paymentConfirmed: true, creativeApproved: true,
      startsAtMs: now - 60000, endsAtMs: now + 3600000,
      rewardCoinsPerView: 5, rewardBudgetCoins: 100, spentRewardCoins: 0,
    }),
    sessionRef.set({
      uid, campaignId, creativeType: "image", status: "active",
      rewardClaimed: false, serverValidatedVisibility: true,
      serverValidatedPlayback: false, serverValidatedContinuousVisibleMs: 12000,
      serverValidatedProgressPercent: 100, startedAtMs: now - 15000,
    }),
    policyRef.set({ version: 1, policy }),
  ]);
  try {
    const request = memberRequest(uid, { sessionId });
    const results = await Promise.all([
      completeFeaturedAdViewingSession.run(request),
      completeFeaturedAdViewingSession.run(request),
    ]);
    assert.equal(results.filter((item) => item.rewarded && !item.idempotentReplay).length, 1);
    assert.equal(results.filter((item) => item.rewarded && item.idempotentReplay).length, 1);

    const ledgerId = `featured_ad_reward_${sessionId}`;
    const ledgerRef = userRef.collection("walletLedger").doc(ledgerId);
    const claimRef = db.collection("featuredAdRewardClaims").doc(sessionId);
    const dayRef = userRef.collection("featuredAdRewardDays").doc(new Date(now).toISOString().slice(0, 10));
    const memberRef = db.collection("featuredAdCampaignMembers").doc(uid + "_" + campaignId);
    const [user, ledger, claim, session, campaign, day, member] = await Promise.all([
      userRef.get(), ledgerRef.get(), claimRef.get(), sessionRef.get(),
      campaignRef.get(), dayRef.get(), memberRef.get(),
    ]);
    assert.equal(user.data().coins, 15);
    assert.equal(ledger.exists, true);
    assert.equal(ledger.data().amount, 5);
    assert.equal(ledger.data().balanceBefore, 10);
    assert.equal(ledger.data().balanceAfter, 15);
    assert.equal(claim.exists, true);
    assert.equal(claim.data().ledgerId, ledgerId);
    assert.equal(session.data().rewardClaimed, true);
    assert.equal(campaign.data().spentRewardCoins, 5);
    assert.equal(day.data().rewardedViews, 1);
    assert.equal(day.data().rewardCoins, 5);
    assert.equal(member.data().rewardedViews, 1);
  } finally {
    const dayRef = userRef.collection("featuredAdRewardDays").doc(new Date(now).toISOString().slice(0, 10));
    const memberRef = db.collection("featuredAdCampaignMembers").doc(uid + "_" + campaignId);
    await Promise.all([
      userRef.delete().catch(() => undefined),
      campaignRef.delete().catch(() => undefined),
      sessionRef.delete().catch(() => undefined),
      db.collection("featuredAdRewardClaims").doc(sessionId).delete().catch(() => undefined),
      userRef.collection("walletLedger").doc(`featured_ad_reward_${sessionId}`).delete().catch(() => undefined),
      dayRef.delete().catch(() => undefined),
      memberRef.delete().catch(() => undefined),
      priorPolicyData ? policyRef.set(priorPolicyData) : policyRef.delete(),
    ]);
  }
});

test("featured-ad reward completion refuses a ledger replay whose claim receipt is missing", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const uid = `featured_reward_corrupt_member_${tag}`;
  const sessionId = `00000000-0000-4000-8000-${tag.replace(/[^0-9]/g, "").padEnd(12, "3").slice(0, 12)}`;
  const userRef = db.collection("users").doc(uid);
  const sessionRef = db.collection("featuredAdViewingSessions").doc(sessionId);
  const ledgerRef = userRef.collection("walletLedger").doc(`featured_ad_reward_${sessionId}`);
  await Promise.all([
    userRef.set({ profileCompleted: true, accountStatus: "active", coins: 15 }),
    sessionRef.set({ uid, campaignId: "missing_campaign", status: "rewarded", rewardClaimed: true }),
    ledgerRef.set({
      type: "featured_ad_reward", source: "featured_ad", amount: 5,
      campaignId: "missing_campaign", sessionId, policyVersion: 1,
      balanceBefore: 10, balanceAfter: 15,
    }),
  ]);
  try {
    await assert.rejects(
      () => completeFeaturedAdViewingSession.run(memberRequest(uid, { sessionId })),
      (error) => error && error.code === "data-loss",
    );
  } finally {
    await Promise.all([
      userRef.delete().catch(() => undefined),
      sessionRef.delete().catch(() => undefined),
      ledgerRef.delete().catch(() => undefined),
    ]);
  }
});
