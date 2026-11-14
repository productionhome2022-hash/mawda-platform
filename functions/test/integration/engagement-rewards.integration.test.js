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
  startTimedAdvertisement,
  getActiveTimedAdSession,
  getTimedAdCreativeUrl,
  heartbeatTimedAdvertisement,
  completeTimedAdvertisement,
  runExpiredTimedAdSessionSweep,
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
      ...(campaignId ? [db.collection("timedAdCampaigns").doc(campaignId).delete().catch(() => undefined)] : []),
    ]);
  }
});
