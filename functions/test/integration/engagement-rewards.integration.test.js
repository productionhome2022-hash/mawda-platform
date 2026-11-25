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
  cancelTimedAdvertisement,
  getMyTimedAdRewardHistory,
  getOwnerTimedAdCampaignReport,
  recordFeaturedAdFinancialEvent,
} = require("../../lib/index");

const db = getFirestore();
const { utcRewardPeriod } = require("../../lib/engagement-rewards");
const suffix = () => `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
async function cleanupTimedCampaign(campaignId) {
  const versions = await db.collection("timedAdCampaignVersions").doc(campaignId)
    .collection("versions").get();
  await Promise.all(versions.docs.map((doc) => doc.ref.delete()));
  await db.collection("timedAdCampaigns").doc(campaignId).delete().catch(() => undefined);
}
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
      () => setTimedAdCampaignStatus.run(ownerRequest(ownerUid, { campaignId, status: "published" })),
      (error) => error && error.code === "failed-precondition",
    );
    await db.collection("timedAdCampaigns").doc(campaignId).update({
      placement: "reward_center", creativeType: "video",
    });
    await assert.rejects(
      () => setTimedAdCampaignStatus.run(ownerRequest(ownerUid, { campaignId, status: "published" })),
      (error) => error && error.code === "failed-precondition",
    );
    await db.collection("timedAdCampaigns").doc(campaignId).update({ creativeType: "text" });
    await setTimedAdCampaignStatus.run(ownerRequest(ownerUid, {
      campaignId, status: "published",
    }));
    const active = await getActiveTimedAdCampaigns.run(memberRequest(uid));
    assert.equal(active.campaigns.some((item) => item.campaignId === campaignId), true);

    const started = await startTimedAdvertisement.run(memberRequest(uid, { campaignId }));
    sessionId = started.sessionId;
    // Archiving prevents new sessions but does not strand a session already in progress.
    await setTimedAdCampaignStatus.run(ownerRequest(ownerUid, { campaignId, status: "archived" }));
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
        cleanupTimedCampaign(campaignId),
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
      () => setTimedAdCampaignStatus.run(ownerRequest(ownerUid, { campaignId, status: "published" })),
      (error) => error && error.code === "failed-precondition",
    );
    await mediaRef.update({ status: "security_approved" });
    await setTimedAdCampaignStatus.run(ownerRequest(ownerUid, { campaignId, status: "published" }));
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
      ...(campaignId ? [cleanupTimedCampaign(campaignId)] : []),
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
    await setTimedAdCampaignStatus.run(ownerRequest(ownerUid, { campaignId, status: "published" }));
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
      ...(campaignId ? [cleanupTimedCampaign(campaignId)] : []),
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
    await setTimedAdCampaignStatus.run(ownerRequest(ownerUid, { campaignId, status: "published" }));
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
      ...(campaignId ? [cleanupTimedCampaign(campaignId)] : []),
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
    await setTimedAdCampaignStatus.run(ownerRequest(ownerUid, { campaignId, status: "published" }));
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
      ...(campaignId ? [cleanupTimedCampaign(campaignId)] : []),
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
  // Sort expired/future documents before the eligible campaign so a query
  // that applies its limit before server-side time filtering would hide it.
  const expiredCampaigns = Array.from({ length: 101 }, (_, index) =>
    db.collection("timedAdCampaigns").doc(`a_expired_${tag}_${String(index).padStart(3, "0")}`));
  const futureCampaigns = Array.from({ length: 101 }, (_, index) =>
    db.collection("timedAdCampaigns").doc(`b_future_${tag}_${String(index).padStart(3, "0")}`));
  const eligibleCampaign = db.collection("timedAdCampaigns").doc(`z_eligible_${tag}`);
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
      ...futureCampaigns.map((ref) => ref.set({
        ...campaignData, startsAtMs: now + 60_000, endsAtMs: now + 120_000,
      })),
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
      ...futureCampaigns.map((ref) => ref.delete().catch(() => undefined)),
      eligibleCampaign.delete().catch(() => undefined),
    ]);
  }
});


test("standard ads are geographically filtered and featured inventory is rejected from the timed-ad pipeline", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const ownerUid = `separated_ads_owner_${tag}`;
  const syriaUid = `separated_ads_syria_${tag}`;
  const egyptUid = `separated_ads_egypt_${tag}`;
  const syriaUser = db.collection("users").doc(syriaUid);
  const egyptUser = db.collection("users").doc(egyptUid);
  let standardCampaignId;
  await Promise.all([
    syriaUser.set({ coins: 0, profileCompleted: true, accountStatus: "active", country: "سوريا", region: "الشرق الأوسط" }),
    egyptUser.set({ coins: 0, profileCompleted: true, accountStatus: "active", country: "مصر", region: "شمال أفريقيا" }),
  ]);
  try {
    const standard = await setTimedAdCampaign.run(ownerRequest(ownerUid, {
      title: "Standard geographic campaign",
      sponsorLabel: "Verified standard sponsor",
      body: "This synthetic standard advertisement targets Syria only.",
      placement: "reward_center",
      adType: "standard",
      geographicTargets: ["syria"],
      durationSeconds: 15,
      rewardCoins: 2,
      startsAtMs: Date.now() - 1000,
      endsAtMs: Date.now() + 3600000,
      maxClaimsPerMember: 10,
      rewardBudgetCoins: 100,
    }));
    standardCampaignId = standard.campaignId;
    await setTimedAdCampaignStatus.run(ownerRequest(ownerUid, {
      campaignId: standardCampaignId, status: "published",
    }));
    const [syriaAds, egyptAds] = await Promise.all([
      getActiveTimedAdCampaigns.run(memberRequest(syriaUid, {
        adType: "standard", geographicTarget: "syria",
      })),
      getActiveTimedAdCampaigns.run(memberRequest(egyptUid, {
        adType: "standard", geographicTarget: "syria",
      })),
    ]);
    assert.equal(syriaAds.campaigns.some((item) => item.campaignId === standardCampaignId), true);
    assert.equal(egyptAds.campaigns.some((item) => item.campaignId === standardCampaignId), false);

    await assert.rejects(
      () => getActiveTimedAdCampaigns.run(memberRequest(egyptUid, { adType: "featured" })),
      (error) => error && error.code === "failed-precondition",
      "featured discovery must use its independent inventory and API",
    );
    await assert.rejects(
      () => setTimedAdCampaign.run(ownerRequest(ownerUid, {
        title: "Must not enter timed-ad inventory",
        sponsorLabel: "Featured sponsor",
        body: "This featured campaign must use the separate lifecycle.",
        placement: "home",
        adType: "featured",
      })),
      (error) => error && error.code === "failed-precondition",
      "featured campaigns must not be created in the standard timed-ad collection",
    );
    await assert.rejects(
      () => startTimedAdvertisement.run(memberRequest(syriaUid, {
        campaignId: standardCampaignId, adType: "featured",
      })),
      (error) => error && error.code === "failed-precondition",
      "featured inventory must never be rewarded through the timed-ad session",
    );
    const counters = await db.collection("timedAdMemberCounters")
      .where("campaignId", "==", standardCampaignId).get();
    assert.equal(counters.size, 0);
  } finally {
    if (standardCampaignId) {
      const versions = await db.collection("timedAdCampaignVersions")
        .doc(standardCampaignId).collection("versions").get();
      await Promise.all(versions.docs.map((doc) => doc.ref.delete()));
      await db.collection("timedAdCampaigns").doc(standardCampaignId).delete().catch(() => undefined);
    }
    await Promise.all([syriaUser.delete().catch(() => undefined), egyptUser.delete().catch(() => undefined)]);
  }
});


test("timed-ad daily claim and coin caps cancel without wallet credit or counter mutation", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const scenarios = [
    { name: "claim-limit", claimCount: 10, rewardCoins: 0, expectSuccess: false },
    { name: "coin-limit", claimCount: 0, rewardCoins: 20, expectSuccess: false },
    { name: "exact-boundary", claimCount: 9, rewardCoins: 19, expectSuccess: true },
  ];
  for (const scenario of scenarios) {
    const tag = suffix();
    const ownerUid = `ad_cap_owner_${scenario.name}_${tag}`;
    const uid = `ad_cap_member_${scenario.name}_${tag}`;
    const userRef = db.collection("users").doc(uid);
    const dailyPeriod = utcRewardPeriod("daily", Date.now());
    const dailyRef = db.collection("timedAdMemberDailyCounters").doc(`${uid}_${dailyPeriod}`);
    let campaignId;
    let sessionId;
    await userRef.set({ coins: 25, profileCompleted: true, accountStatus: "active" });
    try {
      const created = await setTimedAdCampaign.run(ownerRequest(ownerUid, {
        title: "Daily cap test campaign",
        sponsorLabel: "Mawdda test sponsor",
        body: "Synthetic campaign for exact daily reward cap enforcement.",
        placement: "reward_center",
        durationSeconds: 15,
        rewardCoins: 1,
        startsAtMs: Date.now() - 60000,
        endsAtMs: Date.now() + 3600000,
        maxClaimsPerMember: 3,
        rewardBudgetCoins: 100,
      }));
      campaignId = created.campaignId;
      await db.collection("timedAdCampaigns").doc(campaignId).update({ creativeType: "text" });
      await setTimedAdCampaignStatus.run(ownerRequest(ownerUid, { campaignId, status: "published" }));
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
      await dailyRef.set({
        uid, period: dailyPeriod,
        claimCount: scenario.claimCount,
        rewardCoins: scenario.rewardCoins,
      });

      if (scenario.expectSuccess) {
        const completed = await completeTimedAdvertisement.run(memberRequest(uid, { sessionId }));
        assert.equal(completed.completed, true);
        assert.equal(completed.amountCoins, 1);
      } else {
        await assert.rejects(
          () => completeTimedAdvertisement.run(memberRequest(uid, { sessionId })),
          (error) => error && error.code === "resource-exhausted",
        );
      }
      const [user, session, campaign, claim, ledger, daily] = await Promise.all([
        userRef.get(),
        db.collection("timedAdSessions").doc(sessionId).get(),
        db.collection("timedAdCampaigns").doc(campaignId).get(),
        db.collection("timedAdRewardClaims").doc(sessionId).get(),
        userRef.collection("walletLedger").doc(`timed_ad_${sessionId}`).get(),
        dailyRef.get(),
      ]);
      assert.equal(user.data().coins, scenario.expectSuccess ? 26 : 25);
      assert.equal(session.data().status, scenario.expectSuccess ? "completed" : "cancelled");
      assert.equal(campaign.data().reservedRewardCoins, 0);
      assert.equal(claim.exists, scenario.expectSuccess);
      assert.equal(ledger.exists, scenario.expectSuccess);
      assert.equal(daily.data().claimCount, scenario.expectSuccess ? 10 : scenario.claimCount);
      assert.equal(daily.data().rewardCoins, scenario.expectSuccess ? 20 : scenario.rewardCoins);
    } finally {
      await Promise.all([
        sessionId ? db.collection("timedAdSessions").doc(sessionId).delete().catch(() => undefined) : Promise.resolve(),
        sessionId ? db.collection("timedAdRewardClaims").doc(sessionId).delete().catch(() => undefined) : Promise.resolve(),
        sessionId ? userRef.collection("walletLedger").doc(`timed_ad_${sessionId}`).delete().catch(() => undefined) : Promise.resolve(),
        db.collection("activeTimedAdSessions").doc(uid).delete().catch(() => undefined),
        dailyRef.delete().catch(() => undefined),
        userRef.delete().catch(() => undefined),
      ]);
      if (campaignId) await cleanupTimedCampaign(campaignId);
    }
  }
});
