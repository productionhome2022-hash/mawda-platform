const test = require("node:test");
const assert = require("node:assert/strict");
const { getFirestore } = require("firebase-admin/firestore");
const {
  setTimedAdCampaign, recordFeaturedAdFinancialEvent,
} = require("../../lib/index");

const db = getFirestore();
const ownerRequest = (uid, data) => ({
  data, auth: { uid, token: {
    platformOwner: true, platformOwnerUid: uid,
    auth_time: Math.floor(Date.now() / 1000),
    firebase: { sign_in_second_factor: "phone" },
  } },
});
const memberRequest = (uid, data) => ({
  data, auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
});
const suffix = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

test("advertiser financial events are owner-only, immutable, multi-receipt and idempotent", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const ownerUid = `ad_finance_owner_${tag}`;
  const campaignId = `ad_campaign_${tag}`;
  const economyRef = db.doc("platformSettings/economyPricing");
  const previousEconomy = await economyRef.get();
  const previousEconomyData = previousEconomy.exists ? previousEconomy.data() : null;
  const campaignRef = db.collection("timedAdCampaigns").doc(campaignId);
  const financialRef = db.collection("featuredAdFinancials").doc(campaignId);
  const versionRef = db.collection("featuredAdFinancialVersions").doc(campaignId).collection("versions");
  const campaignVersionRef = db.collection("timedAdCampaignVersions").doc(campaignId).collection("versions");
  const eventRef = financialRef.collection("events");
  const campaignInput = {
    campaignId,
    title: "Test sponsored campaign",
    sponsorLabel: "Test advertiser",
    body: "Test-only campaign description.",
    placement: "reward_center",
    durationSeconds: 30,
    rewardCoins: 10,
    startsAtMs: Date.now() - 1000,
    endsAtMs: Date.now() + 24 * 60 * 60 * 1000,
    maxClaimsPerMember: 2,
    rewardBudgetCoins: 1000,
  };
  const base = {
    campaignId, note: "Verified against advertiser statement.",
    evidenceReference: "workspace-evidence://approved/receipt-01",
  };
  const paymentPolicy = {
    coin_purchases: { manualEnabled: false, automatedEnabled: false },
    featured_ads: { manualEnabled: true, automatedEnabled: false },
    public_ads: { manualEnabled: false, automatedEnabled: false },
    influencer_services: { manualEnabled: false, automatedEnabled: false },
    store_entitlements: { manualEnabled: false, automatedEnabled: false },
  };
  try {
    await economyRef.set({
      ...(previousEconomyData ?? {
        coinPackages: [], adPrices: [], customCoinRequestBounds: null,
        version: 1, manualCoinPurchasesEnabled: false,
        automatedCoinCheckoutEnabled: false, realMoneyCheckoutEnabled: false,
      }),
      paymentPolicy,
    });
    const firstCampaign = await setTimedAdCampaign.run(ownerRequest(ownerUid, campaignInput));
    assert.equal(firstCampaign.version, 1);
    const firstCampaignSnapshot = await campaignVersionRef.doc("1").get();
    assert.equal(firstCampaignSnapshot.exists, true);
    const secondCampaign = await setTimedAdCampaign.run(ownerRequest(ownerUid, {
      ...campaignInput, title: "Updated sponsored campaign",
    }));
    assert.equal(secondCampaign.version, 2);
    const secondCampaignSnapshot = await campaignVersionRef.doc("2").get();
    assert.equal(secondCampaignSnapshot.exists, true);
    assert.equal(secondCampaignSnapshot.data().title, "Updated sponsored campaign");
    assert.equal((await campaignVersionRef.doc("1").get()).data().title, campaignInput.title);
    const payment = {
      ...base, action: "payment_received",
      idempotencyKey: `payment_key_${tag}`,
      externalReference: `bank_receipt_1_${tag}`,
      amountMinor: 10000, currency: "EUR",
    };
    const first = await recordFeaturedAdFinancialEvent.run(ownerRequest(ownerUid, payment));
    assert.equal(first.idempotentReplay, false);
    assert.equal(first.snapshot.receivedMinor, 10000);
    const firstEvent = (await eventRef.doc(first.eventId).get()).data();
    assert.equal(firstEvent.receivedMinor, 10000);
    assert.equal(firstEvent.refundedMinor, 0);
    assert.equal(firstEvent.reconciledMinor, 0);
    assert.equal(firstEvent.reviewStatus, "in_review");
    assert.equal(firstEvent.paymentStatus, "paid");
    const replay = await recordFeaturedAdFinancialEvent.run(ownerRequest(ownerUid, payment));
    assert.equal(replay.idempotentReplay, true);
    assert.equal((await campaignRef.get()).data().status, "draft");
    const paymentAuditRef = db.collection("adminAuditLogs").doc(`featured_ad_finance_${first.eventId}`);
    const paymentVersionRef = versionRef.doc(String(first.version));
    const savedPaymentAudit = (await paymentAuditRef.get()).data();
    const savedPaymentVersion = (await paymentVersionRef.get()).data();
    await paymentAuditRef.delete();
    await assert.rejects(
      () => recordFeaturedAdFinancialEvent.run(ownerRequest(ownerUid, payment)),
      (error) => error && error.code === "failed-precondition",
    );
    await paymentAuditRef.set(savedPaymentAudit);
    await paymentVersionRef.delete();
    await assert.rejects(
      () => recordFeaturedAdFinancialEvent.run(ownerRequest(ownerUid, payment)),
      (error) => error && error.code === "failed-precondition",
    );
    await paymentVersionRef.set(savedPaymentVersion);

    const secondPayment = {
      ...payment, idempotencyKey: `payment_key_2_${tag}`,
      externalReference: `bank_receipt_2_${tag}`, amountMinor: 5000,
    };
    const second = await recordFeaturedAdFinancialEvent.run(ownerRequest(ownerUid, secondPayment));
    assert.equal(second.snapshot.receivedMinor, 15000);
    assert.equal(second.version, 2);

    await assert.rejects(
      () => recordFeaturedAdFinancialEvent.run(memberRequest(`member_${tag}`, payment)),
      (error) => error && error.code === "permission-denied",
    );

    const refund = await recordFeaturedAdFinancialEvent.run(ownerRequest(ownerUid, {
      ...base, action: "refund_recorded",
      idempotencyKey: `refund_key_${tag}`,
      externalReference: `bank_refund_${tag}`,
      amountMinor: 1000, currency: "EUR",
    }));
    assert.equal(refund.snapshot.refundedMinor, 1000);
    const settlement = await recordFeaturedAdFinancialEvent.run(ownerRequest(ownerUid, {
      ...base, action: "settlement_reconciled",
      idempotencyKey: `settlement_key_${tag}`,
      externalReference: `bank_settlement_${tag}`,
      amountMinor: 14000, currency: "EUR",
    }));
    assert.equal(settlement.snapshot.reconciledMinor, 14000);
    assert.equal(settlement.snapshot.reviewStatus, "reconciled");

    const snapshot = await financialRef.get();
    assert.equal(snapshot.data().receivedMinor, 15000);
    assert.equal(snapshot.data().refundedMinor, 1000);
    assert.equal(snapshot.data().version, 4);
    assert.equal((await versionRef.get()).size, 4);
    assert.equal((await campaignRef.get()).data().status, "draft");
    await economyRef.set({ ...((await economyRef.get()).data() ?? {}), paymentPolicy: {
      ...paymentPolicy,
      featured_ads: { manualEnabled: false, automatedEnabled: false },
    } });
    await assert.rejects(
      () => recordFeaturedAdFinancialEvent.run(ownerRequest(ownerUid, {
        ...base, action: "payment_received",
        idempotencyKey: `disabled_payment_${tag}`,
        externalReference: `disabled_receipt_${tag}`,
        amountMinor: 100, currency: "EUR",
      })),
      (error) => error && error.code === "failed-precondition",
    );
  } finally {
    const [events, versions, audits] = await Promise.all([
      eventRef.get(), versionRef.get(),
      db.collection("adminAuditLogs").where("campaignId", "==", campaignId).get(),
    ]);
    await Promise.all([
      ...events.docs.map((doc) => doc.ref.delete()),
      ...versions.docs.map((doc) => doc.ref.delete()),
      ...((await campaignVersionRef.get()).docs.map((doc) => doc.ref.delete())),
      ...audits.docs.map((doc) => doc.ref.delete()),
      financialRef.delete().catch(() => undefined),
      campaignRef.delete().catch(() => undefined),
      campaignVersionRef.doc("1").delete().catch(() => undefined),
    ]);
    if (previousEconomyData) await economyRef.set(previousEconomyData);
    else await economyRef.delete().catch(() => undefined);
  }
});
