const test = require("node:test");
const assert = require("node:assert/strict");
const { getFirestore } = require("firebase-admin/firestore");
const {
  setAttendanceRewardPolicy,
  getOwnerAttendanceRewardPolicy,
  claimAttendanceReward,
  setTimedAdCampaign,
  setTimedAdCampaignStatus,
  getActiveTimedAdCampaigns,
  getRewardCenter,
  startTimedAdvertisement,
  getActiveTimedAdSession,
  getTimedAdCreativeUrl,
  heartbeatTimedAdvertisement,
  completeTimedAdvertisement,
  runExpiredTimedAdSessionSweep,
  getOwnerFeaturedAdRewardPolicy,
  setOwnerFeaturedAdRewardPolicy,
  saveFeaturedAdCampaign,
  getOwnerFeaturedAdCampaigns,
  setFeaturedAdCampaignStatus,
  recordFeaturedAdFinancialEvent,
  getFeaturedAdShowcase,
  startFeaturedAdSession,
  heartbeatFeaturedAdSession,
  completeFeaturedAdSession,
  cancelFeaturedAdSession,
  getFeaturedAdRewardHistory,
} = require("../../lib/index");

const db = getFirestore();
const suffix = () => `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
const memberRequest = (uid, data = {}) => ({
  data,
  auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
});
const ownerRequest = (uid, data = {}) => ({
  data,
  auth: { uid, token: {
    platformOwner: true, platformOwnerUid: uid,
    auth_time: Math.floor(Date.now() / 1000),
    firebase: { sign_in_second_factor: "phone" },
  } },
});

async function setCampaignStatus(ownerUid, campaignId, status) {
  const snapshot = await db.collection("timedAdCampaigns").doc(campaignId).get();
  if (!snapshot.exists) throw new Error("TEST_CAMPAIGN_MISSING");
  return setTimedAdCampaignStatus.run(ownerRequest(ownerUid, {
    campaignId, status, expectedVersion: snapshot.data().version,
  }));
}

test("attendance rewards are server-policy gated, UTC-period idempotent and ledger-atomic", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const ownerUid = `attendance_owner_${tag}`;
  const uid = `attendance_member_${tag}`;
  const userRef = db.collection("users").doc(uid);
  const policyRef = db.doc("platformSettings/attendanceRewards");
  await userRef.set({ coins: 100, profileCompleted: true, accountStatus: "active" });
  const previousPolicy = await policyRef.get();
  try {
    await setAttendanceRewardPolicy.run(ownerRequest(ownerUid, { policy: {
      hourly: { enabled: false, amountCoins: 0 },
      daily: { enabled: true, amountCoins: 12 },
      weekly: { enabled: true, amountCoins: 40 },
    } }));
    const ownerPolicy = await getOwnerAttendanceRewardPolicy.run(ownerRequest(ownerUid));
    assert.equal(ownerPolicy.policy.daily.amountCoins, 12);
    const results = await Promise.all([
      claimAttendanceReward.run(memberRequest(uid, { type: "daily" })),
      claimAttendanceReward.run(memberRequest(uid, { type: "daily" })),
    ]);
    assert.equal(results.filter((r) => r.idempotentReplay === false).length, 1);
    assert.equal(results.filter((r) => r.idempotentReplay === true).length, 1);
    const [user, ledger, claims] = await Promise.all([
      userRef.get(),
      userRef.collection("walletLedger").get(),
      db.collection("attendanceRewardClaims").where("uid", "==", uid).get(),
    ]);
    assert.equal(user.data().coins, 112);
    assert.equal(ledger.size, 1);
    assert.equal(ledger.docs[0].data().type, "attendance_reward");
    assert.equal(ledger.docs[0].data().amount, 12);
    assert.equal(claims.size, 1);

    await assert.rejects(
      () => claimAttendanceReward.run(memberRequest(uid, { type: "hourly" })),
      (error) => error && error.code === "failed-precondition",
    );
    await assert.rejects(
      () => setAttendanceRewardPolicy.run(memberRequest(uid, { policy: {} })),
      (error) => error && error.code === "permission-denied",
    );
  } finally {
    const ledger = await userRef.collection("walletLedger").get();
    const claims = await db.collection("attendanceRewardClaims").where("uid", "==", uid).get();
    await Promise.all([
      ...ledger.docs.map((doc) => doc.ref.delete()),
      ...claims.docs.map((doc) => doc.ref.delete()),
      userRef.delete(),
      previousPolicy.exists ? policyRef.set(previousPolicy.data()) : policyRef.delete(),
    ]);
  }
});

test("timed advertisements require foreground heartbeat duration and pay once", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const ownerUid = `ad_owner_${tag}`;
  const uid = `ad_member_${tag}`;
  const userRef = db.collection("users").doc(uid);
  await userRef.set({ coins: 25, profileCompleted: true, accountStatus: "active" });
  let campaignId;
  let sessionId;
  try {
    const created = await setTimedAdCampaign.run(ownerRequest(ownerUid, {
      title: "Test campaign",
      sponsorLabel: "Mawdda test sponsor",
      body: "This is a synthetic test-only advertisement for CI validation.",
      placement: "reward_center",
      durationSeconds: 15,
      rewardCoins: 10,
      startsAtMs: Date.now() - 60000,
      endsAtMs: Date.now() + 3600000,
      maxClaimsPerMember: 1,
      rewardBudgetCoins: 100,
    }));
    campaignId = created.campaignId;
    await db.collection("timedAdCampaigns").doc(campaignId).update({ placement: "home" });
    await assert.rejects(
      () => setCampaignStatus(ownerUid, campaignId, "published"),
      (error) => error && error.code === "failed-precondition",
    );
    await db.collection("timedAdCampaigns").doc(campaignId).update({
      placement: "reward_center", creativeType: "video",
    });
    await assert.rejects(
      () => setCampaignStatus(ownerUid, campaignId, "published"),
      (error) => error && error.code === "failed-precondition",
    );
    await db.collection("timedAdCampaigns").doc(campaignId).update({ creativeType: "text" });
    await setCampaignStatus(ownerUid, campaignId, "published");
    const active = await getActiveTimedAdCampaigns.run(memberRequest(uid));
    assert.equal(active.campaigns.some((item) => item.campaignId === campaignId), true);

    const started = await startTimedAdvertisement.run(memberRequest(uid, { campaignId }));
    sessionId = started.sessionId;
    // The campaign remains published and unchanged while this session is active.
    const restored = await getActiveTimedAdSession.run(memberRequest(uid));
    assert.equal(restored.active, true);
    assert.equal(restored.sessionId, sessionId);
    assert.equal(restored.title, "Test campaign");
    const creative = await getTimedAdCreativeUrl.run(memberRequest(uid, { campaignId, sessionId }));
    assert.equal(creative.creativeType, "text");
    assert.equal(creative.url, null);
    await assert.rejects(
      () => getTimedAdCreativeUrl.run(memberRequest(`other_${uid}`, { campaignId, sessionId })),
      (error) => error && error.code === "permission-denied",
    );
    await assert.rejects(
      () => completeTimedAdvertisement.run(memberRequest(uid, { sessionId })),
      (error) => error && error.code === "failed-precondition",
    );
    await assert.rejects(
      () => startTimedAdvertisement.run(memberRequest(uid, { campaignId })),
      (error) => error && error.code === "already-exists",
    );

    // Advance only the emulator fixture's server-owned accumulated time. The
    // callable still validates the next sequential heartbeat and completion.
    await db.collection("timedAdSessions").doc(sessionId).update({
      eligibleMs: 15000,
      heartbeatSequence: 0,
      lastHeartbeatAtMs: Date.now() - 5000,
    });
    const heartbeat = await heartbeatTimedAdvertisement.run(memberRequest(uid, {
      sessionId, sequence: 1, foreground: true, visible: true,
    }));
    assert.equal(heartbeat.eligibleMs >= 15000, true);

    const completed = await completeTimedAdvertisement.run(memberRequest(uid, { sessionId }));
    assert.equal(completed.completed, true);
    assert.equal(completed.amountCoins, 10);
    const replay = await completeTimedAdvertisement.run(memberRequest(uid, { sessionId }));
    assert.equal(replay.idempotentReplay, true);

    const [user, ledger, campaign, claim] = await Promise.all([
      userRef.get(),
      userRef.collection("walletLedger").doc(`timed_ad_${sessionId}`).get(),
      db.collection("timedAdCampaigns").doc(campaignId).get(),
      db.collection("timedAdRewardClaims").doc(sessionId).get(),
    ]);
    assert.equal(user.data().coins, 35);
    assert.equal(ledger.data().amount, 10);
    assert.equal(campaign.data().spentRewardCoins, 10);
    assert.equal(campaign.data().reservedRewardCoins, 0);
    assert.equal(claim.exists, true);
    assert.equal((await getActiveTimedAdSession.run(memberRequest(uid))).active, false);
  } finally {
    if (sessionId) {
      await Promise.all([
        db.collection("timedAdSessions").doc(sessionId).delete().catch(() => undefined),
        db.collection("timedAdRewardClaims").doc(sessionId).delete().catch(() => undefined),
        db.collection("activeTimedAdSessions").doc(uid).delete().catch(() => undefined),
        userRef.collection("walletLedger").doc(`timed_ad_${sessionId}`).delete().catch(() => undefined),
      ]);
    }
    if (campaignId) {
      await Promise.all([
        db.collection("timedAdCampaigns").doc(campaignId).delete().catch(() => undefined),
        db.collection("timedAdMemberCounters").doc(`${uid}_${campaignId}`).delete().catch(() => undefined),
      ]);
    }
    await userRef.delete().catch(() => undefined);
  }
});


test("campaigns can bind only approved owner-uploaded advertisement media", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const ownerUid = `ad_media_owner_${tag}`;
  const mediaId = require("node:crypto").randomUUID();
  const mediaRef = db.collection("mediaAssets").doc(mediaId);
  let campaignId;
  await mediaRef.set({
    ownerUid, uploaderRole: "platform_owner", mediaPurpose: "advertisement",
    status: "security_approved", mediaCategory: "image",
    detectedContentType: "image/gif",
  });
  try {
    const result = await setTimedAdCampaign.run(ownerRequest(ownerUid, {
      title: "Creative-bound campaign",
      sponsorLabel: "Verified sponsor",
      body: "A synthetic campaign with a verified animated creative attached.",
      placement: "reward_center",
      durationSeconds: 20,
      rewardCoins: 5,
      startsAtMs: Date.now() - 1000,
      endsAtMs: Date.now() + 3600000,
      maxClaimsPerMember: 1,
      rewardBudgetCoins: 50,
      mediaId,
    }));
    campaignId = result.campaignId;
    assert.equal(result.creativeType, "gif");
    const campaign = await db.collection("timedAdCampaigns").doc(campaignId).get();
    assert.equal(campaign.data().mediaId, mediaId);
    assert.equal(campaign.data().mediaOwnerUid, ownerUid);
    await mediaRef.update({ status: "pending_security_scan" });
    await assert.rejects(
      () => setCampaignStatus(ownerUid, campaignId, "published"),
      (error) => error && error.code === "failed-precondition",
    );
    await mediaRef.update({ status: "security_approved" });
    await setCampaignStatus(ownerUid, campaignId, "published");
    await assert.rejects(
      () => setTimedAdCampaign.run(memberRequest(ownerUid, {
        title: "Unauthorized creative",
        sponsorLabel: "Fake sponsor",
        body: "A member must never create owner-only advertisement campaigns.",
        placement: "reward_center",
        durationSeconds: 20,
        rewardCoins: 5,
        startsAtMs: Date.now() - 1000,
        endsAtMs: Date.now() + 3600000,
        maxClaimsPerMember: 1,
        rewardBudgetCoins: 50,
        mediaId,
      })),
      (error) => error && error.code === "permission-denied",
    );
  } finally {
    await Promise.all([
      mediaRef.delete(),
      ...(campaignId ? [db.collection("timedAdCampaigns").doc(campaignId).delete()] : []),
    ]);
  }
});


test("timed-ad reward is withheld if its approved creative is revoked before completion", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const ownerUid = `ad_revocation_owner_${tag}`;
  const uid = `ad_revocation_member_${tag}`;
  const mediaId = require("node:crypto").randomUUID();
  const userRef = db.collection("users").doc(uid);
  const mediaRef = db.collection("mediaAssets").doc(mediaId);
  let campaignId;
  let sessionId;
  await userRef.set({ coins: 0, profileCompleted: true, accountStatus: "active" });
  await mediaRef.set({
    ownerUid, uploaderRole: "platform_owner", mediaPurpose: "advertisement",
    status: "security_approved", mediaCategory: "image",
    detectedContentType: "image/png",
  });
  try {
    const campaign = await setTimedAdCampaign.run(ownerRequest(ownerUid, {
      title: "Revocation test campaign",
      sponsorLabel: "Verified sponsor",
      body: "This test verifies that revoked creative assets cannot earn rewards.",
      placement: "reward_center",
      durationSeconds: 15,
      rewardCoins: 7,
      startsAtMs: Date.now() - 1000,
      endsAtMs: Date.now() + 3600000,
      maxClaimsPerMember: 1,
      rewardBudgetCoins: 70,
      mediaId,
    }));
    campaignId = campaign.campaignId;
    await setCampaignStatus(ownerUid, campaignId, "published");
    const started = await startTimedAdvertisement.run(memberRequest(uid, { campaignId }));
    sessionId = started.sessionId;
    await db.collection("timedAdSessions").doc(sessionId).update({
      eligibleMs: 15000, heartbeatSequence: 0, lastHeartbeatAtMs: Date.now() - 5000,
    });
    await heartbeatTimedAdvertisement.run(memberRequest(uid, {
      sessionId, sequence: 1, foreground: true, visible: true,
    }));
    await mediaRef.update({ status: "pending_security_scan" });
    await assert.rejects(
      () => completeTimedAdvertisement.run(memberRequest(uid, { sessionId })),
      (error) => error && error.code === "failed-precondition",
    );
    const [user, claim, ledger] = await Promise.all([
      userRef.get(),
      db.collection("timedAdRewardClaims").doc(sessionId).get(),
      userRef.collection("walletLedger").doc(`timed_ad_${sessionId}`).get(),
    ]);
    assert.equal(user.data().coins, 0);
    assert.equal(claim.exists, false);
    assert.equal(ledger.exists, false);
    assert.equal((await db.collection("timedAdSessions").doc(sessionId).get()).data().status, "cancelled");
    assert.equal((await db.collection("activeTimedAdSessions").doc(uid).get()).exists, false);
    assert.equal((await db.collection("timedAdCampaigns").doc(campaignId).get()).data().reservedRewardCoins, 0);
  } finally {
    await Promise.all([
      mediaRef.delete().catch(() => undefined),
      userRef.delete().catch(() => undefined),
      ...(campaignId ? [db.collection("timedAdCampaigns").doc(campaignId).delete().catch(() => undefined)] : []),
      ...(sessionId ? [
        db.collection("timedAdSessions").doc(sessionId).delete().catch(() => undefined),
        db.collection("activeTimedAdSessions").doc(uid).delete().catch(() => undefined),
        db.collection("timedAdMemberCounters").doc(`${uid}_${campaignId}`).delete().catch(() => undefined),
      ] : []),
    ]);
  }
});


test("abandoned expired ad sessions release their reserved campaign budget", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const ownerUid = `ad_budget_owner_${tag}`;
  const firstUid = `ad_budget_first_${tag}`;
  const secondUid = `ad_budget_second_${tag}`;
  const firstUser = db.collection("users").doc(firstUid);
  const secondUser = db.collection("users").doc(secondUid);
  let campaignId;
  let firstSessionId;
  let secondSessionId;
  await Promise.all([
    firstUser.set({ coins: 0, profileCompleted: true, accountStatus: "active" }),
    secondUser.set({ coins: 0, profileCompleted: true, accountStatus: "active" }),
  ]);
  try {
    const campaign = await setTimedAdCampaign.run(ownerRequest(ownerUid, {
      title: "Reserved budget campaign",
      sponsorLabel: "Mawdda test sponsor",
      body: "Only one reward can be reserved for this synthetic campaign.",
      placement: "reward_center",
      durationSeconds: 15,
      rewardCoins: 10,
      startsAtMs: Date.now() - 1000,
      endsAtMs: Date.now() + 3600000,
      maxClaimsPerMember: 1,
      rewardBudgetCoins: 10,
    }));
    campaignId = campaign.campaignId;
    await setCampaignStatus(ownerUid, campaignId, "published");
    const first = await startTimedAdvertisement.run(memberRequest(firstUid, { campaignId }));
    firstSessionId = first.sessionId;
    let storedCampaign = await db.collection("timedAdCampaigns").doc(campaignId).get();
    assert.equal(storedCampaign.data().reservedRewardCoins, 10);
    await assert.rejects(
      () => startTimedAdvertisement.run(memberRequest(secondUid, { campaignId })),
      (error) => error && error.code === "failed-precondition",
    );

    await db.collection("timedAdSessions").doc(firstSessionId).update({
      expiresAtMs: Date.now() - 1,
    });
    await runExpiredTimedAdSessionSweep();
    storedCampaign = await db.collection("timedAdCampaigns").doc(campaignId).get();
    assert.equal(storedCampaign.data().reservedRewardCoins, 0);
    assert.equal((await db.collection("timedAdSessions").doc(firstSessionId).get()).data().status, "expired");
    assert.equal((await db.collection("activeTimedAdSessions").doc(firstUid).get()).exists, false);

    const second = await startTimedAdvertisement.run(memberRequest(secondUid, { campaignId }));
    secondSessionId = second.sessionId;
    storedCampaign = await db.collection("timedAdCampaigns").doc(campaignId).get();
    assert.equal(storedCampaign.data().reservedRewardCoins, 10);
    await db.collection("timedAdSessions").doc(secondSessionId).update({
      expiresAtMs: Date.now() - 1,
    });
    await runExpiredTimedAdSessionSweep();
    storedCampaign = await db.collection("timedAdCampaigns").doc(campaignId).get();
    assert.equal(storedCampaign.data().reservedRewardCoins, 0);
  } finally {
    await Promise.all([
      firstUser.delete().catch(() => undefined),
      secondUser.delete().catch(() => undefined),
      ...(campaignId ? [db.collection("timedAdCampaigns").doc(campaignId).delete().catch(() => undefined)] : []),
      ...(firstSessionId ? [
        db.collection("timedAdSessions").doc(firstSessionId).delete().catch(() => undefined),
        db.collection("activeTimedAdSessions").doc(firstUid).delete().catch(() => undefined),
      ] : []),
      ...(secondSessionId ? [
        db.collection("timedAdSessions").doc(secondSessionId).delete().catch(() => undefined),
        db.collection("activeTimedAdSessions").doc(secondUid).delete().catch(() => undefined),
      ] : []),
    ]);
  }
});


test("concurrent members cannot reserve the same final ad reward budget", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const ownerUid = `ad_concurrent_owner_${tag}`;
  const memberUids = [`ad_concurrent_a_${tag}`, `ad_concurrent_b_${tag}`];
  const users = memberUids.map((uid) => db.collection("users").doc(uid));
  let campaignId;
  let winnerUid;
  let winnerSessionId;
  await Promise.all(users.map((ref) => ref.set({
    coins: 0, profileCompleted: true, accountStatus: "active",
  })));
  try {
    const campaign = await setTimedAdCampaign.run(ownerRequest(ownerUid, {
      title: "Concurrent reservation campaign",
      sponsorLabel: "Mawdda test sponsor",
      body: "Two simultaneous members compete for one reserved reward.",
      placement: "reward_center",
      durationSeconds: 15,
      rewardCoins: 10,
      startsAtMs: Date.now() - 1000,
      endsAtMs: Date.now() + 3600000,
      maxClaimsPerMember: 1,
      rewardBudgetCoins: 10,
    }));
    campaignId = campaign.campaignId;
    await setCampaignStatus(ownerUid, campaignId, "published");
    const results = await Promise.allSettled(memberUids.map((uid) =>
      startTimedAdvertisement.run(memberRequest(uid, { campaignId }))));
    const winners = results.map((result, index) => ({ result, index }))
      .filter((entry) => entry.result.status === "fulfilled");
    const losers = results.filter((result) => result.status === "rejected");
    assert.equal(winners.length, 1);
    assert.equal(losers.length, 1);
    assert.equal(losers[0].reason.code, "failed-precondition");
    winnerUid = memberUids[winners[0].index];
    winnerSessionId = winners[0].result.value.sessionId;
    const stored = await db.collection("timedAdCampaigns").doc(campaignId).get();
    assert.equal(stored.data().reservedRewardCoins, 10);
  } finally {
    if (winnerSessionId) {
      await Promise.all([
        db.collection("timedAdSessions").doc(winnerSessionId).delete().catch(() => undefined),
        db.collection("activeTimedAdSessions").doc(winnerUid).delete().catch(() => undefined),
      ]);
    }
    await Promise.all([
      ...users.map((ref) => ref.delete().catch(() => undefined)),
      ...(campaignId ? [db.collection("timedAdCampaigns").doc(campaignId).delete().catch(() => undefined)] : []),
    ]);
  }
});


test("distinct member/campaign pairs with colliding legacy IDs keep independent reward limits", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const uidA = "member_" + tag + "_a";
  const campaignA = "campaign_123456";
  const uidB = "member_" + tag;
  const campaignB = "a_campaign_123456";
  assert.equal(uidA + "_" + campaignA, uidB + "_" + campaignB);
  const users = [db.collection("users").doc(uidA), db.collection("users").doc(uidB)];
  const campaigns = [db.collection("timedAdCampaigns").doc(campaignA), db.collection("timedAdCampaigns").doc(campaignB)];
  const sessions = [];
  const counterIds = [require("../../lib/engagement-rewards").timedAdMemberCounterId(uidA, campaignA), require("../../lib/engagement-rewards").timedAdMemberCounterId(uidB, campaignB)];
  try {
    await Promise.all([...users.map((ref) => ref.set({ coins: 0, profileCompleted: true, accountStatus: "active" })), ...campaigns.map((ref) => ref.set({ title: "Counter collision isolation test", sponsorLabel: "Synthetic CI sponsor", body: "Synthetic campaign used only to verify independent member reward limits.", placement: "reward_center", creativeType: "text", durationSeconds: 15, rewardCoins: 1, startsAtMs: Date.now() - 1000, endsAtMs: Date.now() + 3600000, maxClaimsPerMember: 1, rewardBudgetCoins: 1, spentRewardCoins: 0, reservedRewardCoins: 0, status: "published", version: 1 }))]);
    const started = await Promise.all([startTimedAdvertisement.run(memberRequest(uidA, { campaignId: campaignA })), startTimedAdvertisement.run(memberRequest(uidB, { campaignId: campaignB }))]);
    sessions.push(...started.map((item) => item.sessionId));
    await Promise.all(sessions.map((id) => db.collection("timedAdSessions").doc(id).update({ eligibleMs: 15000, heartbeatSequence: 0, lastHeartbeatAtMs: Date.now() - 5000 })));
    const completed = await Promise.all([completeTimedAdvertisement.run(memberRequest(uidA, { sessionId: sessions[0] })), completeTimedAdvertisement.run(memberRequest(uidB, { sessionId: sessions[1] }))]);
    assert.equal(completed.every((item) => item.completed), true);
    assert.notEqual(counterIds[0], counterIds[1]);
    const [userA, userB, counterA, counterB] = await Promise.all([users[0].get(), users[1].get(), db.collection("timedAdMemberCounters").doc(counterIds[0]).get(), db.collection("timedAdMemberCounters").doc(counterIds[1]).get()]);
    assert.equal(userA.data().coins, 1); assert.equal(userB.data().coins, 1);
    assert.equal(counterA.data().uid, uidA); assert.equal(counterA.data().campaignId, campaignA); assert.equal(counterA.data().claimCount, 1);
    assert.equal(counterB.data().uid, uidB); assert.equal(counterB.data().campaignId, campaignB); assert.equal(counterB.data().claimCount, 1);
  } finally {
    await Promise.all([...users.map((ref) => ref.delete().catch(() => undefined)), ...campaigns.map((ref) => ref.delete().catch(() => undefined)), ...sessions.flatMap((id, index) => [db.collection("timedAdSessions").doc(id).delete().catch(() => undefined), db.collection("timedAdRewardClaims").doc(id).delete().catch(() => undefined), db.collection("activeTimedAdSessions").doc(index === 0 ? uidA : uidB).delete().catch(() => undefined), db.collection("users").doc(index === 0 ? uidA : uidB).collection("walletLedger").doc("timed_ad_" + id).delete().catch(() => undefined)]), ...counterIds.map((id) => db.collection("timedAdMemberCounters").doc(id).delete().catch(() => undefined)), db.collection("timedAdMemberCounters").doc(uidA + "_" + campaignA).delete().catch(() => undefined)]);
  }
});


test("active reward-ad discovery endpoints filter expired campaigns before applying their result limits", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const uid = `ad_discovery_member_${tag}`;
  const userRef = db.collection("users").doc(uid);
  const now = Date.now();
  const expiredCampaigns = Array.from({ length: 101 }, (_, index) =>
    db.collection("timedAdCampaigns").doc(`expired_${tag}_${String(index).padStart(3, "0")}`));
  const eligibleCampaign = db.collection("timedAdCampaigns").doc(`eligible_${tag}`);
  const campaignData = {
    status: "published", placement: "reward_center",
    startsAtMs: now - 60_000, endsAtMs: now - 1_000,
    rewardCoins: 1, rewardBudgetCoins: 100,
    spentRewardCoins: 0, reservedRewardCoins: 0,
  };
  try {
    await userRef.set({ coins: 0, profileCompleted: true, accountStatus: "active" });
    await Promise.all([
      ...expiredCampaigns.map((ref) => ref.set(campaignData)),
      eligibleCampaign.set({ ...campaignData, startsAtMs: now - 1_000, endsAtMs: now + 60_000 }),
    ]);
    const result = await getActiveTimedAdCampaigns.run(memberRequest(uid));
    assert.equal(result.campaigns.some((campaign) => campaign.campaignId === eligibleCampaign.id), true);
    const rewardCenter = await getRewardCenter.run(memberRequest(uid));
    assert.equal(rewardCenter.activeCampaigns.some((campaign) => campaign.campaignId === eligibleCampaign.id), true);
  } finally {
    await Promise.all([
      userRef.delete().catch(() => undefined),
      ...expiredCampaigns.map((ref) => ref.delete().catch(() => undefined)),
      eligibleCampaign.delete().catch(() => undefined),
    ]);
  }
});


test("timed-ad completion cancels a session when its campaign is paused or version changes", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const ownerUid = `ad_pause_owner_${tag}`;
  const uid = `ad_pause_member_${tag}`;
  const userRef = db.collection("users").doc(uid);
  let campaignId;
  let sessionId;
  await userRef.set({ coins: 0, profileCompleted: true, accountStatus: "active" });
  try {
    const campaign = await setTimedAdCampaign.run(ownerRequest(ownerUid, {
      title: "Paused campaign test",
      sponsorLabel: "Mawdda test sponsor",
      body: "A synthetic campaign to verify pause invalidates an active reward session.",
      placement: "reward_center",
      durationSeconds: 15,
      rewardCoins: 9,
      startsAtMs: Date.now() - 1000,
      endsAtMs: Date.now() + 3600000,
      maxClaimsPerMember: 100,
      rewardBudgetCoins: 900,
    }));
    campaignId = campaign.campaignId;
    await setCampaignStatus(ownerUid, campaignId, "published");
    const started = await startTimedAdvertisement.run(memberRequest(uid, { campaignId }));
    sessionId = started.sessionId;
    await db.collection("timedAdSessions").doc(sessionId).update({
      eligibleMs: 15000,
      heartbeatSequence: 0,
      lastHeartbeatAtMs: Date.now() - 5000,
    });
    await heartbeatTimedAdvertisement.run(memberRequest(uid, {
      sessionId, sequence: 1, foreground: true, visible: true,
    }));
    await setCampaignStatus(ownerUid, campaignId, "paused");
    await assert.rejects(
      () => completeTimedAdvertisement.run(memberRequest(uid, { sessionId })),
      (error) => error && error.code === "permission-denied",
    );
    const [user, session, campaignAfter, claim, ledger, active] = await Promise.all([
      userRef.get(),
      db.collection("timedAdSessions").doc(sessionId).get(),
      db.collection("timedAdCampaigns").doc(campaignId).get(),
      db.collection("timedAdRewardClaims").doc(sessionId).get(),
      userRef.collection("walletLedger").doc(`timed_ad_${sessionId}`).get(),
      db.collection("activeTimedAdSessions").doc(uid).get(),
    ]);
    assert.equal(user.data().coins, 0);
    assert.equal(session.data().status, "cancelled");
    assert.equal(campaignAfter.data().reservedRewardCoins, 0);
    assert.equal(claim.exists, false);
    assert.equal(ledger.exists, false);
    assert.equal(active.exists, false);
  } finally {
    await Promise.all([
      userRef.delete().catch(() => undefined),
      ...(campaignId ? [db.collection("timedAdCampaigns").doc(campaignId).delete().catch(() => undefined)] : []),
      ...(sessionId ? [
        db.collection("timedAdSessions").doc(sessionId).delete().catch(() => undefined),
        db.collection("activeTimedAdSessions").doc(uid).delete().catch(() => undefined),
      ] : []),
    ]);
  }
});


test("timed-ad campaign edits and status changes reject stale versions", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const ownerUid = `ad_version_owner_${tag}`;
  let campaignId;
  try {
    const created = await setTimedAdCampaign.run(ownerRequest(ownerUid, {
      title: "Versioned campaign", sponsorLabel: "Synthetic CI sponsor",
      body: "A synthetic campaign for optimistic concurrency regression testing.",
      placement: "reward_center", durationSeconds: 15, rewardCoins: 1,
      startsAtMs: Date.now() - 1000, endsAtMs: Date.now() + 3600000,
      maxClaimsPerMember: 2, rewardBudgetCoins: 10,
    }));
    campaignId = created.campaignId;
    assert.equal(created.version, 1);
    const firstEdit = await setTimedAdCampaign.run(ownerRequest(ownerUid, {
      campaignId, expectedVersion: 1,
      title: "Versioned campaign updated", sponsorLabel: "Synthetic CI sponsor",
      body: "A synthetic campaign for optimistic concurrency regression testing.",
      placement: "reward_center", durationSeconds: 15, rewardCoins: 1,
      startsAtMs: Date.now() - 1000, endsAtMs: Date.now() + 3600000,
      maxClaimsPerMember: 2, rewardBudgetCoins: 10,
    }));
    assert.equal(firstEdit.version, 2);
    await assert.rejects(
      () => setTimedAdCampaign.run(ownerRequest(ownerUid, {
        campaignId, expectedVersion: 1,
        title: "Stale overwrite", sponsorLabel: "Synthetic CI sponsor",
        body: "This stale edit must never overwrite the latest campaign version.",
        placement: "reward_center", durationSeconds: 15, rewardCoins: 1,
        startsAtMs: Date.now() - 1000, endsAtMs: Date.now() + 3600000,
        maxClaimsPerMember: 2, rewardBudgetCoins: 10,
      })),
      (error) => error && error.code === "aborted",
    );
    await setCampaignStatus(ownerUid, campaignId, "published");
    const current = await db.collection("timedAdCampaigns").doc(campaignId).get();
    assert.equal(current.data().version, 3);
    await assert.rejects(
      () => setTimedAdCampaignStatus.run(ownerRequest(ownerUid, {
        campaignId, status: "paused", expectedVersion: 2,
      })),
      (error) => error && error.code === "aborted",
    );
    assert.equal((await db.collection("timedAdCampaigns").doc(campaignId).get()).data().status, "published");
  } finally {
    if (campaignId) await db.collection("timedAdCampaigns").doc(campaignId).delete().catch(() => undefined);
  }
});

test("featured-ad reward policy is owner/MFA managed, versioned and safely disabled until configured", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const ownerUid = `featured_policy_owner_${tag}`;
  const memberUid = `featured_policy_member_${tag}`;
  const policyRef = db.doc("platformSettings/featuredAdRewards");
  const previousPolicy = await policyRef.get();
  try {
    if (previousPolicy.exists) await policyRef.delete();
    const initial = await getOwnerFeaturedAdRewardPolicy.run(ownerRequest(ownerUid));
    assert.equal(initial.policy.enabled, false);
    assert.equal(initial.policy.rewardCoinsPerView, 0);
    assert.equal(initial.policy.maxRewardedViewsPerUtcDay, 0);
    assert.equal(initial.policy.maxRewardCoinsPerUtcDay, 0);
    assert.equal(initial.version, 1);

    const updated = await setOwnerFeaturedAdRewardPolicy.run(ownerRequest(ownerUid, {
      expectedVersion: initial.version,
      policy: {
        ...initial.policy,
        enabled: true,
        rewardCoinsPerView: 5,
        maxRewardedViewsPerUtcDay: 100,
        maxRewardCoinsPerUtcDay: 500,
      },
    }));
    assert.equal(updated.saved, true);
    assert.equal(updated.version, 2);
    assert.equal(updated.policy.rewardCoinsPerView, 5);
    await assert.rejects(
      () => setOwnerFeaturedAdRewardPolicy.run(ownerRequest(ownerUid, {
        expectedVersion: initial.version,
        policy: initial.policy,
      })),
      (error) => error && error.code === "aborted",
    );

    const reread = await getOwnerFeaturedAdRewardPolicy.run(ownerRequest(ownerUid));
    assert.equal(reread.version, 2);
    assert.equal(reread.policy.maxRewardCoinsPerUtcDay, 500);
    await assert.rejects(
      () => getOwnerFeaturedAdRewardPolicy.run(memberRequest(memberUid)),
      (error) => error && error.code === "permission-denied",
    );
    await assert.rejects(
      () => setOwnerFeaturedAdRewardPolicy.run(memberRequest(memberUid, { policy: initial.policy })),
      (error) => error && error.code === "permission-denied",
    );
  } finally {
    if (previousPolicy.exists) await policyRef.set(previousPolicy.data());
    else await policyRef.delete();
  }
});


test("featured campaigns require owner approval and verified finance, then reward an explicit view exactly once", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const ownerUid = `featured_owner_${tag}`;
  const uid = `featured_member_${tag}`;
  const userRef = db.collection("users").doc(uid);
  const campaignRef = db.collection("featuredAdCampaigns").doc();
  const mediaId = `00000000-0000-4000-8000-${tag.replace(/[^0-9]/g, "").padEnd(12, "1").slice(0, 12)}`;
  const mediaRef = db.collection("mediaAssets").doc(mediaId);
  const policyRef = db.doc("platformSettings/featuredAdRewards");
  const previousPolicy = await policyRef.get();
  let sessionId;
  let abandonedSessionId;
  let replacementSessionId;
  let paymentEventId;
  let settlementEventId;
  let refundEventId;
  const baseEvent = {
    campaignId: campaignRef.id,
    note: "Synthetic financial event verified by emulator test.",
    externalReference: `ci-reference-${tag}`,
    evidenceReference: `emulator-evidence://${tag}`,
  };
  try {
    await userRef.set({ coins: 0, profileCompleted: true, accountStatus: "active" });
    await mediaRef.set({
      ownerUid, uploaderRole: "platform_owner", mediaPurpose: "advertisement",
      status: "security_approved", mediaCategory: "image",
      detectedContentType: "image/webp",
    });
    const currentFeaturedPolicy = await getOwnerFeaturedAdRewardPolicy.run(ownerRequest(ownerUid));
    await setOwnerFeaturedAdRewardPolicy.run(ownerRequest(ownerUid, {
      expectedVersion: currentFeaturedPolicy.version,
      policy: {
      enabled: true, rewardCoinsPerView: 5, maxRewardedViewsPerUtcDay: 10,
      maxRewardCoinsPerUtcDay: 50, videoCompletionPercent: 90,
      imageContinuousVisibleMs: 1000,
    } }));
    const saved = await saveFeaturedAdCampaign.run(ownerRequest(ownerUid, {
      title: "Featured integration campaign", sponsorLabel: "Synthetic advertiser",
      body: "A featured campaign used only by the isolated emulator integration suite.",
      startsAtMs: Date.now() - 1000, endsAtMs: Date.now() + 3600000,
      maxRewardedViewsPerMember: 2, rewardBudgetCoins: 100,
      featuredPlacement: "rotation", priorityOrder: 0,
      geographicTargets: ["syria"], mediaId,
    }));
    assert.equal(saved.status, "draft");
    assert.equal(saved.version, 1);
    const ownerCampaigns = await getOwnerFeaturedAdCampaigns.run(ownerRequest(ownerUid));
    assert.equal(ownerCampaigns.campaigns.some((item) => item.campaignId === campaignRef.id), true);
    await setFeaturedAdCampaignStatus.run(ownerRequest(ownerUid, {
      campaignId: campaignRef.id, status: "approved", expectedVersion: 1,
    }));
    const payment = await recordFeaturedAdFinancialEvent.run(ownerRequest(ownerUid, {
      ...baseEvent, action: "payment_received", idempotencyKey: `payment_retry_${tag}`,
      amountMinor: 10000, currency: "USD",
    }));
    paymentEventId = payment.eventId;
    assert.equal(payment.idempotentReplay, false);
    await assert.rejects(
      () => setFeaturedAdCampaignStatus.run(ownerRequest(ownerUid, {
        campaignId: campaignRef.id, status: "published", expectedVersion: 2,
      })),
      (error) => error && error.code === "failed-precondition",
    );
    const replay = await recordFeaturedAdFinancialEvent.run(ownerRequest(ownerUid, {
      ...baseEvent, action: "payment_received", idempotencyKey: `payment_${tag}`,
      amountMinor: 10000, currency: "USD",
    }));
    assert.equal(replay.idempotentReplay, true);
    await assert.rejects(
      () => recordFeaturedAdFinancialEvent.run(ownerRequest(ownerUid, {
        ...baseEvent, action: "payment_received", idempotencyKey: `payment_conflict_${tag}`,
        amountMinor: 9000, currency: "USD",
      })),
      (error) => error && error.code === "already-exists",
    );
    const settlement = await recordFeaturedAdFinancialEvent.run(ownerRequest(ownerUid, {
      ...baseEvent, action: "settlement_reconciled", idempotencyKey: `settlement_${tag}`,
      amountMinor: 10000, currency: "USD",
    }));
    settlementEventId = settlement.eventId;
    assert.equal(settlement.snapshot.reviewStatus, "reconciled");
    await setFeaturedAdCampaignStatus.run(ownerRequest(ownerUid, {
      campaignId: campaignRef.id, status: "published", expectedVersion: 2,
    }));
    const showcase = await getFeaturedAdShowcase.run(memberRequest(uid, { geography: "syria" }));
    assert.equal(showcase.rewardEligible, false);
    assert.equal(showcase.campaigns.some((item) => item.campaignId === campaignRef.id), true);

    const started = await startFeaturedAdSession.run(memberRequest(uid, {
      campaignId: campaignRef.id, geography: "syria",
    }));
    sessionId = started.sessionId;
    await heartbeatFeaturedAdSession.run(memberRequest(uid, {
      sessionId, sequence: 1, foreground: true, visible: true,
    }));
    await new Promise((resolve) => setTimeout(resolve, 1050));
    const heartbeat = await heartbeatFeaturedAdSession.run(memberRequest(uid, {
      sessionId, sequence: 2, foreground: true, visible: true,
    }));
    assert.ok(heartbeat.eligibleMs >= 1000);
    const [completed, duplicate] = await Promise.all([
      completeFeaturedAdSession.run(memberRequest(uid, { sessionId })),
      completeFeaturedAdSession.run(memberRequest(uid, { sessionId })),
    ]);
    assert.equal(completed.completed, true);
    assert.equal([completed, duplicate].filter((item) => item.idempotentReplay === false).length, 1);
    assert.equal([completed, duplicate].filter((item) => item.idempotentReplay === true).length, 1);
    const [user, ledger, history] = await Promise.all([
      userRef.get(), userRef.collection("walletLedger").get(),
      getFeaturedAdRewardHistory.run(memberRequest(uid)),
    ]);
    assert.equal(user.data().coins, 5);
    assert.equal(ledger.docs.filter((doc) => doc.data().type === "featured_ad_reward").length, 1);
    assert.equal(history.claims.length, 1);

    const abandoned = await startFeaturedAdSession.run(memberRequest(uid, {
      campaignId: campaignRef.id, geography: "syria",
    }));
    abandonedSessionId = abandoned.sessionId;
    await db.collection("featuredAdSessions").doc(abandoned.sessionId).update({
      expiresAtMs: Date.now() - 1,
    });
    const replacement = await startFeaturedAdSession.run(memberRequest(uid, {
      campaignId: campaignRef.id, geography: "syria",
    }));
    replacementSessionId = replacement.sessionId;
    assert.notEqual(replacement.sessionId, abandoned.sessionId);
    assert.equal((await db.collection("featuredAdSessions").doc(abandoned.sessionId).get()).data().status, "expired");
    await cancelFeaturedAdSession.run(memberRequest(uid, { sessionId: replacement.sessionId }));
    assert.equal((await campaignRef.get()).data().reservedRewardCoins, 0);

    const refund = await recordFeaturedAdFinancialEvent.run(ownerRequest(ownerUid, {
      ...baseEvent, action: "refund_recorded", idempotencyKey: `refund_${tag}`,
      amountMinor: 1000, currency: "USD",
    }));
    refundEventId = refund.eventId;
    assert.equal(refund.snapshot.paymentStatus, "partially_refunded");
    assert.equal(refund.snapshot.reviewStatus, "needs_review");
    const campaignAfterRefund = await campaignRef.get();
    assert.equal(campaignAfterRefund.data().status, "paused");
    assert.equal(campaignAfterRefund.data().paymentConfirmed, false);
    await assert.rejects(
      () => getOwnerFeaturedAdCampaigns.run(memberRequest(uid)),
      (error) => error && error.code === "permission-denied",
    );
  } finally {
    await Promise.all([
      userRef.delete().catch(() => undefined),
      campaignRef.delete().catch(() => undefined),
      mediaRef.delete().catch(() => undefined),
      ...(sessionId ? [
        db.collection("featuredAdSessions").doc(sessionId).delete().catch(() => undefined),
        db.collection("featuredAdRewardClaims").doc(sessionId).delete().catch(() => undefined),
        db.collection("activeFeaturedAdSessions").doc(uid).delete().catch(() => undefined),
        userRef.collection("walletLedger").doc(`featured_ad_${sessionId}`).delete().catch(() => undefined),
      ] : []),
      ...[abandonedSessionId, replacementSessionId].filter(Boolean)
        .map((id) => db.collection("featuredAdSessions").doc(id).delete().catch(() => undefined)),
      db.collection("featuredAdMemberCounters").where("uid", "==", uid).get()
        .then((snap) => Promise.all(snap.docs.map((doc) => doc.ref.delete()))),
      db.collection("featuredAdDailyCounters").where("uid", "==", uid).get()
        .then((snap) => Promise.all(snap.docs.map((doc) => doc.ref.delete()))),
      ...(paymentEventId ? [
        db.collection("featuredAdFinancialEvents").doc(paymentEventId).delete().catch(() => undefined),
        db.collection("featuredAdFinancialIdempotency").doc(paymentEventId).delete().catch(() => undefined),
      ] : []),
      ...(settlementEventId ? [
        db.collection("featuredAdFinancialEvents").doc(settlementEventId).delete().catch(() => undefined),
        db.collection("featuredAdFinancialIdempotency").doc(settlementEventId).delete().catch(() => undefined),
      ] : []),
      ...(refundEventId ? [
        db.collection("featuredAdFinancialEvents").doc(refundEventId).delete().catch(() => undefined),
        db.collection("featuredAdFinancialIdempotency").doc(refundEventId).delete().catch(() => undefined),
      ] : []),
    ]);
    if (previousPolicy.exists) await policyRef.set(previousPolicy.data());
    else await policyRef.delete();
  }
});


test("featured showcase filters expired campaigns before its bounded result window", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const uid = `featured_discovery_member_${tag}`;
  const userRef = db.collection("users").doc(uid);
  const now = Date.now();
  const expired = Array.from({ length: 101 }, (_, index) =>
    db.collection("featuredAdCampaigns").doc(`featured_expired_${tag}_${String(index).padStart(3, "0")}`));
  const active = db.collection("featuredAdCampaigns").doc(`featured_active_${tag}`);
  const common = {
    status: "published", ownerApproved: true, ownerWithdrawn: false,
    paymentConfirmed: true, creativeApproved: true,
    startsAtMs: now - 60_000, geographicTargets: ["syria"],
    featuredPlacement: "rotation", priorityOrder: 0,
  };
  try {
    await userRef.set({ coins: 0, profileCompleted: true, accountStatus: "active" });
    await Promise.all([
      ...expired.map((ref) => ref.set({ ...common, endsAtMs: now - 1 })),
      active.set({ ...common, endsAtMs: now + 60_000 }),
    ]);
    const result = await getFeaturedAdShowcase.run(memberRequest(uid, { geography: "syria" }));
    assert.equal(result.campaigns.some((item) => item.campaignId === active.id), true);
    assert.equal(result.campaigns.some((item) => item.campaignId.startsWith("featured_expired_")), false);
  } finally {
    await Promise.all([
      userRef.delete().catch(() => undefined),
      ...expired.map((ref) => ref.delete().catch(() => undefined)),
      active.delete().catch(() => undefined),
    ]);
  }
});
