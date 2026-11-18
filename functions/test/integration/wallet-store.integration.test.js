const test = require("node:test");
const assert = require("node:assert/strict");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const {
  transferCoins, purchaseStoreItem, giftStoreEntitlement, getMyStoreGiftHistory, getOwnerStoreCatalog, setStoreCatalogItem, getOwnerEconomyPricing, getAvailableCoinPackages,
  setOwnerEconomyPricing, createCoinPurchaseRequest, getMyCoinPurchaseRequests,
  setCoinPurchasePaymentInstructions, approveCoinPurchaseRequest,
  rejectCoinPurchaseRequest, withdrawCoinPurchaseRequest, listOwnerCoinPurchaseRequests,
  completeFeaturedAdViewingSession,
  sendOwnerLiveStream,
  deleteDirectMessageForEveryone, deleteRoomMessage, startCall, endCall,
} = require("../../lib/index");
const { createDirectChatId } = require("../../lib/direct-chat-id");

const db = getFirestore();
const memberRequest = (uid, data) => ({
  data,
  auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
});
const suffix = () => `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
const ownerRequest = (uid = "store-catalog-owner", data = {}) => ({
  data,
  auth: { uid, token: {
    platformOwner: true, platformOwnerUid: uid, auth_time: Math.floor(Date.now() / 1000),
    firebase: { sign_in_second_factor: "phone" },
  } },
});

test("coin package offers and purchase requests fail closed without owner-configured pricing", async () => {
  const settingsRef = db.doc("platformSettings/economyPricing");
  const priorSettings = await settingsRef.get();
  const uid = `unconfigured-package-${suffix()}`;
  const userRef = db.collection("users").doc(uid);
  await userRef.set({ profileCompleted: true, accountStatus: "active", coins: 0 });
  try {
    await settingsRef.delete();
    const catalogue = await getAvailableCoinPackages.run({});
    assert.deepEqual(catalogue.packages, []);
    assert.equal(catalogue.manualPurchasesEnabled, false);
    await assert.rejects(
      () => createCoinPurchaseRequest.run(memberRequest(uid, {
        requestId: `request_${suffix()}`, kind: "package", packageId: "coins_1000",
      })),
      (error) => error && error.code === "failed-precondition",
    );
  } finally {
    await Promise.all([
      userRef.delete().catch(() => undefined),
      priorSettings.exists ? settingsRef.set(priorSettings.data()) : Promise.resolve(),
    ]);
  }
});

test("client-reported featured-ad progress cannot mint wallet rewards without trusted server evidence", async () => {
  const uid = `featured_reward_spoof_${suffix()}`;
  const sessionId = require("node:crypto").randomUUID();
  const campaignId = `featured_campaign_${suffix()}`;
  const userRef = db.collection("users").doc(uid);
  const sessionRef = db.collection("featuredAdViewingSessions").doc(sessionId);
  const campaignRef = db.collection("featuredAdCampaigns").doc(campaignId);
  const policyRef = db.doc("platformSettings/featuredAdRewardPolicy");
  const priorPolicy = await policyRef.get();
  await Promise.all([
    userRef.set({ profileCompleted: true, accountStatus: "active", coins: 0 }),
    campaignRef.set({
      status: "published", ownerApproved: true, ownerWithdrawn: false,
      paymentConfirmed: true, creativeApproved: true,
      startsAtMs: Date.now() - 1000, endsAtMs: Date.now() + 60_000,
      geographicTargets: ["syria"], rewardBudgetCoins: 100,
      spentRewardCoins: 0, rewardCoinsPerView: 2,
    }),
    sessionRef.set({
      uid, campaignId, geography: "syria", creativeType: "video",
      status: "active", rewardClaimed: false,
      // Forged client heartbeat telemetry must never authorize a wallet credit.
      foregroundVisible: true, visibleMs: 120_000,
      continuousVisibleMs: 120_000, progressPercent: 100,
      serverValidatedVisibility: false, serverValidatedPlayback: false,
      serverValidatedContinuousVisibleMs: 0, serverValidatedProgressPercent: 0,
    }),
    policyRef.set({
      version: 1,
      policy: {
        enabled: true, rewardCoinsPerView: 2,
        maxRewardedViewsPerUtcDay: 10, maxRewardCoinsPerUtcDay: 20,
        maxRewardsPerCampaignRolling24h: 3,
        sameCampaignWindowMs: 24 * 60 * 60 * 1000,
        videoCompletionPercent: 90, imageContinuousVisibleMs: 10_000,
      },
    }),
  ]);
  try {
    const result = await completeFeaturedAdViewingSession.run(memberRequest(uid, { sessionId }));
    assert.equal(result.rewarded, false);
    assert.equal(result.amountCoins, 0);
    assert.equal(result.reason, "foreground_evidence_missing");
    assert.equal((await userRef.get()).data().coins, 0);
    assert.equal((await userRef.collection("walletLedger").get()).empty, true);
    assert.equal((await sessionRef.get()).data().status, "completed_no_reward");
  } finally {
    await Promise.all([
      db.recursiveDelete(userRef).catch(() => undefined),
      db.recursiveDelete(sessionRef).catch(() => undefined),
      db.recursiveDelete(campaignRef).catch(() => undefined),
      priorPolicy.exists ? policyRef.set(priorPolicy.data()) : policyRef.delete().catch(() => undefined),
    ]);
  }
});

test("coin transfer atomically writes both wallet ledgers and platform commission; retries are idempotent", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const senderUid = `sender_${tag}`;
  const recipientUid = `recipient_${tag}`;
  const requestId = `transfer_${tag}`;
  const transferId = `${senderUid}_${requestId}`;
  const senderRef = db.collection("users").doc(senderUid);
  const recipientRef = db.collection("users").doc(recipientUid);
  const settingsRef = db.doc("platformSettings/coinTransfers");
  const transferRef = db.collection("coinTransfers").doc(transferId);
  const senderLedgerRef = senderRef.collection("walletLedger").doc(transferId);
  const recipientLedgerRef = recipientRef.collection("walletLedger").doc(transferId);
  const recipientGiftHistoryRef = recipientRef.collection("coinTransferGiftHistory").doc(transferId);
  const recipientNotificationRef = recipientRef.collection("notifications").doc("coin_transfer_" + transferId);
  const platformLedgerRef = db.collection("platformWalletLedger").doc(transferId);

  await Promise.all([
    senderRef.set({ coins: 5000, profileCompleted: true, accountStatus: "active" }),
    recipientRef.set({ coins: 200, profileCompleted: true, accountStatus: "active" }),
    settingsRef.set({ enabled: true, commissionBps: 2000, version: 1 }),
  ]);

  try {
    const request = memberRequest(senderUid, {
      recipientUid, amount: 1000, requestId, expectedCommissionBps: 2000,
    });
    const concurrentResults = await Promise.all([
      transferCoins.run(request),
      transferCoins.run(request),
    ]);
    assert.equal(concurrentResults.filter((value) => value.idempotentReplay === false).length, 1);
    assert.equal(concurrentResults.filter((value) => value.idempotentReplay === true).length, 1);
    const result = concurrentResults.find((value) => value.idempotentReplay === false);
    assert.ok(result);
    assert.equal(result.grossAmount, 1000);
    assert.equal(result.commissionAmount, 200);
    assert.equal(result.netAmount, 800);

    const [sender, recipient, senderLedger, recipientLedger, platformLedger, transfer] =
      await Promise.all([
        senderRef.get(), recipientRef.get(), senderLedgerRef.get(),
        recipientLedgerRef.get(), platformLedgerRef.get(), transferRef.get(),
      ]);
    assert.equal(sender.data().coins, 4000);
    assert.equal(recipient.data().coins, 1000);
    assert.equal(senderLedger.data().amount, -1000);
    assert.equal(senderLedger.data().commissionAmount, 200);
    assert.equal(senderLedger.data().recipientUid, recipientUid);
    assert.equal(senderLedger.data().recipientNetAmount, 800);
    assert.equal(recipientLedger.data().amount, 800);
    assert.equal(recipientLedger.data().senderUid, senderUid);
    assert.equal(recipientLedger.data().transferId, transferId);
    const [giftHistory, giftNotification] = await Promise.all([
      recipientGiftHistoryRef.get(), recipientNotificationRef.get(),
    ]);
    assert.equal(giftHistory.data().coins, 800);
    assert.equal(giftHistory.data().senderUid, senderUid);
    assert.equal(giftNotification.data().type, "coin_transfer_gift_received");
    assert.equal(platformLedger.data().amount, 200);
    assert.equal(platformLedger.data().transferId, transferId);
    assert.equal(transfer.data().status, "completed");

    const replay = await transferCoins.run(request);
    assert.equal(replay.idempotentReplay, true);
    assert.equal((await senderRef.get()).data().coins, 4000);
    assert.equal((await recipientRef.get()).data().coins, 1000);

    await assert.rejects(
      () => transferCoins.run(memberRequest(senderUid, {
        recipientUid, amount: 1000, requestId: `other_${tag}`, expectedCommissionBps: 1500,
      })),
      (error) => error && error.code === "failed-precondition",
    );
  } finally {
    await Promise.all([
      senderLedgerRef.delete().catch(() => undefined),
      recipientLedgerRef.delete().catch(() => undefined),
      recipientGiftHistoryRef.delete().catch(() => undefined),
      recipientNotificationRef.delete().catch(() => undefined),
      platformLedgerRef.delete().catch(() => undefined),
      transferRef.delete().catch(() => undefined),
      senderRef.delete().catch(() => undefined),
      recipientRef.delete().catch(() => undefined),
      // Restore shared test setting to a disabled state, not a production value.
      settingsRef.set({ enabled: false, commissionBps: 0, version: 0 }),
    ]);
  }
});

test("coin transfer rejects a suspended account and leaves both balances unchanged", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const senderUid = `suspended_sender_${tag}`;
  const recipientUid = `active_recipient_${tag}`;
  const senderRef = db.collection("users").doc(senderUid);
  const recipientRef = db.collection("users").doc(recipientUid);
  await Promise.all([
    senderRef.set({ coins: 1000, isSuspended: true }),
    recipientRef.set({ coins: 100 }),
    db.doc("platformSettings/coinTransfers").set({ enabled: true, commissionBps: 1000 }),
  ]);
  try {
    await assert.rejects(
      () => transferCoins.run(memberRequest(senderUid, {
        recipientUid, amount: 100, requestId: `suspended_${tag}`, expectedCommissionBps: 1000,
      })),
      (error) => error && error.code === "permission-denied",
    );
    assert.equal((await senderRef.get()).data().coins, 1000);
    assert.equal((await recipientRef.get()).data().coins, 100);
  } finally {
    await Promise.all([
      senderRef.delete().catch(() => undefined),
      recipientRef.delete().catch(() => undefined),
      db.doc("platformSettings/coinTransfers").set({ enabled: false, commissionBps: 0, version: 0 }),
    ]);
  }
});

test("coin transfer rejects suspended, guest and insufficient-balance accounts without partial writes", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const senderUid = `eligible_sender_${tag}`;
  const blockedRecipientUid = `blocked_recipient_${tag}`;
  const poorSenderUid = `poor_sender_${tag}`;
  const eligibleRecipientUid = `eligible_recipient_${tag}`;
  const guestRecipientUid = `guest_recipient_${tag}`;
  const refs = [
    db.collection("users").doc(senderUid),
    db.collection("users").doc(blockedRecipientUid),
    db.collection("users").doc(poorSenderUid),
    db.collection("users").doc(eligibleRecipientUid),
    db.collection("users").doc(guestRecipientUid),
  ];
  const guestProfileRef = db.collection("guestProfiles").doc(guestRecipientUid);
  await Promise.all([
    refs[0].set({ coins: 1000, accountStatus: "active" }),
    refs[1].set({ coins: 100, accountStatus: "disabled" }),
    refs[2].set({ coins: 10, accountStatus: "active" }),
    refs[3].set({ coins: 50, accountStatus: "active" }),
    refs[4].set({ coins: 25, accountStatus: "active" }),
    guestProfileRef.set({ guestUid: guestRecipientUid }),
    db.doc("platformSettings/coinTransfers").set({ enabled: true, commissionBps: 1000 }),
  ]);
  try {
    await assert.rejects(
      () => transferCoins.run(memberRequest(senderUid, {
        recipientUid: blockedRecipientUid, amount: 100,
        requestId: `blocked_recipient_${tag}`, expectedCommissionBps: 1000,
      })),
      (error) => error && error.code === "permission-denied",
    );
    await assert.rejects(
      () => transferCoins.run(memberRequest(senderUid, {
        recipientUid: guestRecipientUid, amount: 100,
        requestId: `guest_recipient_${tag}`, expectedCommissionBps: 1000,
      })),
      (error) => error && error.code === "permission-denied",
    );
    await assert.rejects(
      () => transferCoins.run(memberRequest(poorSenderUid, {
        recipientUid: eligibleRecipientUid, amount: 100,
        requestId: `insufficient_${tag}`, expectedCommissionBps: 1000,
      })),
      (error) => error && error.code === "failed-precondition",
    );
    assert.equal((await refs[0].get()).data().coins, 1000);
    assert.equal((await refs[1].get()).data().coins, 100);
    assert.equal((await refs[2].get()).data().coins, 10);
    assert.equal((await refs[3].get()).data().coins, 50);
    assert.equal((await refs[4].get()).data().coins, 25);
    const failedTransfers = await db.collection("coinTransfers")
      .where("senderUid", "in", [senderUid, poorSenderUid]).get();
    assert.equal(failedTransfers.empty, true);
  } finally {
    await Promise.all([
      ...refs.map((ref) => ref.delete().catch(() => undefined)),
      guestProfileRef.delete().catch(() => undefined),
      db.doc("platformSettings/coinTransfers").set({ enabled: false, commissionBps: 0, version: 0 }),
    ]);
  }
});

test("store purchase atomically charges, records receipt and ledger, grants entitlement, and is idempotent", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const uid = `store_member_${tag}`;
  const itemId = "vip_monthly";
  const requestId = `purchase_${tag}`;
  const purchaseId = `${uid}_${requestId}`;
  const memberRef = db.collection("users").doc(uid);
  const itemRef = db.collection("storeCatalog").doc(itemId);
  const purchaseRef = db.collection("storePurchases").doc(purchaseId);
  const ledgerRef = memberRef.collection("walletLedger").doc(`store_${purchaseId}`);
  const entitlementRef = memberRef.collection("entitlements").doc(itemId);

  await Promise.all([
    memberRef.set({ coins: 5000, profileCompleted: true, accountStatus: "active" }),
    itemRef.set({
      name: "VIP test item", description: "Emulator-only entitlement test",
      category: "vip", priceCoins: 1250, durationDays: 30, sortOrder: 1,
      active: true, purchaseEnabled: true, fulfillmentReady: true,
    }),
  ]);
  try {
    const request = memberRequest(uid, { itemId, requestId, expectedPriceCoins: 1250 });
    const result = await purchaseStoreItem.run(request);
    assert.equal(result.priceCoins, 1250);
    assert.equal(result.newBalance, 3750);
    assert.equal(result.idempotentReplay, false);

    const [member, purchase, ledger, entitlement] = await Promise.all([
      memberRef.get(), purchaseRef.get(), ledgerRef.get(), entitlementRef.get(),
    ]);
    assert.equal(member.data().coins, 3750);
    assert.equal(purchase.data().status, "completed");
    assert.equal(purchase.data().priceCoins, 1250);
    assert.equal(ledger.data().amount, -1250);
    assert.equal(ledger.data().purchaseId, purchaseId);
    assert.equal(entitlement.data().status, "active");
    assert.equal(entitlement.data().category, "vip");
    assert.ok(entitlement.data().expiresAt.toMillis() > Date.now());

    const replay = await purchaseStoreItem.run(request);
    assert.equal(replay.idempotentReplay, true);
    assert.equal((await memberRef.get()).data().coins, 3750);

    // A receipt without its immutable debit ledger is an integrity failure,
    // not a successful idempotent replay.
    await ledgerRef.delete();
    await assert.rejects(
      () => purchaseStoreItem.run(request),
      (error) => error && error.code === "failed-precondition",
    );
    assert.equal((await memberRef.get()).data().coins, 3750);

    await assert.rejects(
      () => purchaseStoreItem.run(memberRequest(uid, {
        itemId, requestId: `another_${tag}`, expectedPriceCoins: 1000,
      })),
      (error) => error && error.code === "failed-precondition",
    );
  } finally {
    await Promise.all([
      ledgerRef.delete().catch(() => undefined),
      purchaseRef.delete().catch(() => undefined),
      entitlementRef.delete().catch(() => undefined),
      itemRef.delete().catch(() => undefined),
      memberRef.delete().catch(() => undefined),
    ]);
  }
});


test("store entitlement gifting atomically debits giver, grants recipient, records history and is idempotent", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  assert.ok(process.env.FIREBASE_AUTH_EMULATOR_HOST, "Auth emulator is required");
  const tag = suffix();
  const giverUid = `gift_giver_${tag}`;
  const recipientUid = `gift_recipient_${tag}`;
  const itemId = "vip_monthly";
  const requestId = `gift_${tag}`;
  const giftId = require("node:crypto").createHash("sha256")
    .update(`mawdda-store-gift-v1:${giverUid}:${requestId}`).digest("hex");
  const auth = getAuth();
  await auth.createUser({ uid: recipientUid, email: `${recipientUid}@example.test`, password: "EmulatorOnly-123456!" });
  const giverRef = db.collection("users").doc(giverUid);
  const recipientRef = db.collection("users").doc(recipientUid);
  const itemRef = db.collection("storeCatalog").doc(itemId);
  const giftRef = db.collection("storeGifts").doc(giftId);
  const giverLedgerRef = giverRef.collection("walletLedger").doc(`gift_${giftId}`);
  const recipientHistoryRef = recipientRef.collection("giftHistory").doc(giftId);
  const notificationRef = recipientRef.collection("notifications").doc(`gift_${giftId}`);
  const entitlementRef = recipientRef.collection("entitlements").doc(itemId);
  await Promise.all([
    giverRef.set({ coins: 3000, profileCompleted: true, accountStatus: "active" }),
    recipientRef.set({ coins: 10, profileCompleted: true, accountStatus: "active" }),
    itemRef.set({
      name: "VIP gift", description: "Emulator-only gift entitlement",
      category: "vip", priceCoins: 1250, durationDays: 30, sortOrder: 1,
      active: true, purchaseEnabled: true, fulfillmentReady: true,
    }),
  ]);
  try {
    const request = memberRequest(giverUid, {
      itemId, recipientUid, requestId, expectedPriceCoins: 1250,
    });
    const concurrent = await Promise.all([
      giftStoreEntitlement.run(request),
      giftStoreEntitlement.run(request),
    ]);
    assert.equal(concurrent.filter((value) => value.idempotentReplay === false).length, 1);
    assert.equal(concurrent.filter((value) => value.idempotentReplay === true).length, 1);
    assert.equal((await giverRef.get()).data().coins, 1750);
    assert.equal((await recipientRef.get()).data().coins, 10);
    assert.equal((await giftRef.get()).data().status, "completed");
    assert.equal((await giverLedgerRef.get()).data().amount, -1250);
    assert.equal((await giverLedgerRef.get()).data().type, "store_gift");
    assert.equal((await recipientHistoryRef.get()).data().status, "received");
    assert.equal((await notificationRef.get()).data().type, "store_gift_received");
    assert.equal((await entitlementRef.get()).data().giftedByUid, giverUid);
    assert.ok((await entitlementRef.get()).data().expiresAt.toMillis() > Date.now());
    const replay = await giftStoreEntitlement.run(request);
    assert.equal(replay.idempotentReplay, true);
    assert.equal((await giverRef.get()).data().coins, 1750);
    const history = await getMyStoreGiftHistory.run(memberRequest(recipientUid, {}));
    assert.equal(history.entries.some((entry) => entry.giftId === giftId && entry.giftKind === "store_feature"), true);
    await giverLedgerRef.update({ amount: -1 });
    await assert.rejects(
      () => giftStoreEntitlement.run(request),
      (error) => error && error.code === "failed-precondition",
    );
    await assert.rejects(
      () => giftStoreEntitlement.run(memberRequest(giverUid, {
        itemId, recipientUid: giverUid, requestId: `self_${tag}`, expectedPriceCoins: 1250,
      })),
      (error) => error && error.code === "failed-precondition",
    );
  } finally {
    await Promise.all([
      giverLedgerRef.delete().catch(() => undefined),
      recipientHistoryRef.delete().catch(() => undefined),
      notificationRef.delete().catch(() => undefined),
      giftRef.delete().catch(() => undefined),
      entitlementRef.delete().catch(() => undefined),
      itemRef.delete().catch(() => undefined),
      giverRef.delete().catch(() => undefined),
      recipientRef.delete().catch(() => undefined),
      auth.deleteUser(recipientUid).catch(() => undefined),
    ]);
  }
});

test("owner-approved coin package gifts credit only the recipient with an immutable ledger", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  assert.ok(process.env.FIREBASE_AUTH_EMULATOR_HOST, "Auth emulator is required");
  const tag = suffix();
  const requesterUid = `coin_gift_sender_${tag}`;
  const recipientUid = `coin_gift_recipient_${tag}`;
  const requestId = `coin_gift_${tag}`;
  const auth = getAuth();
  await auth.createUser({ uid: recipientUid, email: `${recipientUid}@example.test`, password: "EmulatorOnly-123456!" });
  const requesterRef = db.collection("users").doc(requesterUid);
  const recipientRef = db.collection("users").doc(recipientUid);
  const requestRef = db.collection("coinPurchaseRequests").doc(`${requesterUid}_${requestId}`);
  const ledgerRef = recipientRef.collection("walletLedger").doc(`coin_purchase_${requestId}`);
  const giftRef = db.collection("coinPackageGifts").doc(`${requesterUid}_${requestId}`);
  const historyRef = recipientRef.collection("coinPackageGiftHistory").doc(requestId);
  const notificationRef = recipientRef.collection("notifications").doc(`coin_package_gift_${requestId}`);
  const auditRef = db.collection("adminAuditLogs").doc(`coin_purchase_approval_${requesterUid}_${requestId}`);
  const settingsRef = db.doc("platformSettings/economyPricing");
  const priorSettings = await settingsRef.get();
  const chatId = createDirectChatId("store-catalog-owner", requesterUid);
  const chatRef = db.collection("directChats").doc(chatId);
  const messageId = require("node:crypto").createHash("sha256")
    .update(`coin-purchase:${requesterUid}:${requestId}:1`).digest("hex");
  const messageRef = chatRef.collection("messages").doc(messageId);
  const packageSnapshot = {
    packageId: "gift_test_1000", name: "اختبار باقة الهدية",
    coins: 1000, priceMinor: 299, currency: "EUR", active: true,
  };
  await Promise.all([
    requesterRef.set({ coins: 25, profileCompleted: true, accountStatus: "active" }),
    recipientRef.set({ coins: 100, profileCompleted: true, accountStatus: "active" }),
    settingsRef.set({
      manualCoinPurchasesEnabled: true, automatedCoinCheckoutEnabled: false,
      coinPackages: [packageSnapshot],
    }, { merge: true }),
  ]);
  try {
    const created = await createCoinPurchaseRequest.run(memberRequest(requesterUid, {
      requestId, kind: "package", packageId: packageSnapshot.packageId, giftRecipientUid: recipientUid,
    }));
    assert.equal(created.status, "pending_owner_contact");
    await setCoinPurchasePaymentInstructions.run(ownerRequest("store-catalog-owner", {
      requesterUid, requestId, instructions: "إتمام الدفع للاختبار المحلي",
      agreedCoins: packageSnapshot.coins, agreedPriceMinor: packageSnapshot.priceMinor, currency: "EUR",
    }));
    const approved = await approveCoinPurchaseRequest.run(ownerRequest("store-catalog-owner", {
      requesterUid, requestId, externalPaymentVerified: true,
      externalPaymentReference: `emulator-payment-${tag}`,
      verificationNote: "تم التحقق من عملية الدفع الاختبارية محلياً",
    }));
    assert.equal(approved.status, "approved");
    assert.equal(approved.creditedToUid, recipientUid);
    assert.equal((await requesterRef.get()).data().coins, 25);
    assert.equal((await recipientRef.get()).data().coins, 1100);
    assert.equal((await ledgerRef.get()).data().type, "coin_package_gift_credit");
    assert.equal((await giftRef.get()).data().status, "credited");
    assert.equal((await historyRef.get()).data().coins, 1000);
    assert.equal((await notificationRef.get()).data().type, "coin_package_gift_received");
    assert.equal((await requestRef.get()).data().creditedToUid, recipientUid);
    const replay = await approveCoinPurchaseRequest.run(ownerRequest("store-catalog-owner", {
      requesterUid, requestId, externalPaymentVerified: true,
      externalPaymentReference: `emulator-payment-${tag}`,
      verificationNote: "تم التحقق من عملية الدفع الاختبارية محلياً",
    }));
    assert.equal(replay.idempotentReplay, true);
    assert.equal((await recipientRef.get()).data().coins, 1100);
    const history = await getMyStoreGiftHistory.run(memberRequest(recipientUid, {}));
    assert.equal(history.entries.some((entry) => entry.giftId === giftRef.id && entry.giftKind === "coin_package"), true);
  } finally {
    await Promise.all([
      requestRef.delete().catch(() => undefined),
      ledgerRef.delete().catch(() => undefined),
      giftRef.delete().catch(() => undefined),
      historyRef.delete().catch(() => undefined),
      notificationRef.delete().catch(() => undefined),
      auditRef.delete().catch(() => undefined),
      messageRef.delete().catch(() => undefined),
      chatRef.delete().catch(() => undefined),
      requesterRef.delete().catch(() => undefined),
      recipientRef.delete().catch(() => undefined),
      auth.deleteUser(recipientUid).catch(() => undefined),
      priorSettings.exists ? settingsRef.set(priorSettings.data()) : settingsRef.delete().catch(() => undefined),
    ]);
  }
});

test("owner catalog seeds approved features as ready while keeping purchases disabled", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const result = await getOwnerStoreCatalog.run(ownerRequest());
  const items = result.items;
  const expected = new Map([
    ["vip_monthly", 5000], ["title_custom", 800], ["badge_special", 1200],
    ["avatar_frame_30d", 2500], ["username_color_30d", 1200],
    ["username_animated_30d", 3000], ["profile_analytics_30d", 1800],
    ["profile_layout_30d", 3500], ["profile_pin_30d", 900],
    ["discovery_boost_7d", 1500], ["profile_theme_30d", 2000],
    ["visitor_greeting_30d", 1000], ["hide_coins_30d", 1000], ["ghost_mode_7d", 1800],
    ["media_saver_7d", 200], ["voice_call_24h", 100], ["voice_call_7d", 500], ["voice_call_30d", 1500], ["video_call_24h", 250], ["video_call_7d", 1250], ["video_call_30d", 3750],
  ]);
  for (const [itemId, price] of expected) {
    const item = items.find((entry) => entry.itemId === itemId);
    assert.ok(item, `missing starter catalog item: ${itemId}`);
    assert.equal(item.priceCoins, price);
    const implemented = itemId !== "hide_coins_30d";
    assert.equal(item.active, implemented);
    assert.equal(item.purchaseEnabled, false);
    assert.equal(item.fulfillmentReady, implemented);
  }
});


test("owner economy pricing starts empty and only exposes owner-authored prices after explicit save", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const settingsRef = db.doc("platformSettings/economyPricing");
  const previous = await settingsRef.get();
  const previousData = previous.exists ? previous.data() : null;
  try {
    await settingsRef.delete();
    const empty = await getOwnerEconomyPricing.run(ownerRequest());
    assert.equal(empty.configured, false);
    assert.equal(empty.version, 0);
    assert.deepEqual(empty.coinPackages, []);
    assert.deepEqual(empty.adPrices, []);
    assert.equal(empty.manualCoinPurchasesEnabled, false);
    assert.equal((await getAvailableCoinPackages.run({})).packages.length, 0);

    const packages = [{
      packageId: "test_coins_1000", name: "باقة اختبار", coins: 1000,
      priceMinor: 100, currency: "EUR", active: true,
    }];
    const ads = [{
      placementId: "test_banner", name: "موضع اختبار", billingModel: "cpm",
      priceMinor: 200, currency: "EUR", active: true,
    }];
    const saved = await setOwnerEconomyPricing.run(ownerRequest("store-catalog-owner", {
      coinPackages: packages, adPrices: ads,
      manualCoinPurchasesEnabled: false, expectedVersion: empty.version,
    }));
    assert.equal(saved.saved, true);
    assert.equal(saved.realMoneyCheckoutEnabled, false);
    assert.equal((await getAvailableCoinPackages.run({})).packages.length, 0);

    const readback = await getOwnerEconomyPricing.run(ownerRequest());
    assert.equal(readback.version, saved.version);
    assert.equal(readback.coinPackages[0].priceMinor, 100);
    assert.equal(readback.manualCoinPurchasesEnabled, false);

    const enabled = await setOwnerEconomyPricing.run(ownerRequest("store-catalog-owner", {
      coinPackages: [{ ...packages[0], priceMinor: 110 }],
      adPrices: ads, manualCoinPurchasesEnabled: true,
      expectedVersion: readback.version,
    }));
    assert.equal(enabled.version, readback.version + 1);
    assert.equal((await getAvailableCoinPackages.run({})).packages[0].priceMinor, 110);

    await assert.rejects(
      () => setOwnerEconomyPricing.run(memberRequest("not_owner", {
        coinPackages: packages, adPrices: ads,
        manualCoinPurchasesEnabled: false, expectedVersion: enabled.version,
      })),
      (error) => error && error.code === "permission-denied",
    );
    await assert.rejects(
      () => setOwnerEconomyPricing.run(ownerRequest("store-catalog-owner", {
        coinPackages: packages, adPrices: ads,
        manualCoinPurchasesEnabled: false, expectedVersion: readback.version,
      })),
      (error) => error && error.code === "aborted",
    );
  } finally {
    if (previousData) await settingsRef.set(previousData);
    else await settingsRef.delete().catch(() => undefined);
  }
});

test("owner authority is bound to the single canonical owner UID", async () => {
  const mismatched = ownerRequest("different-owner", {});
  mismatched.auth.token.platformOwnerUid = "canonical-owner";
  await assert.rejects(
    () => listOwnerCoinPurchaseRequests.run(mismatched),
    (error) => error && error.code === "permission-denied",
  );
  const missing = ownerRequest("legacy-owner", {});
  delete missing.auth.token.platformOwnerUid;
  await assert.rejects(
    () => listOwnerCoinPurchaseRequests.run(missing),
    (error) => error && error.code === "permission-denied",
  );
});

test("manual coin package request issues no coins until owner verifies external payment; approval is atomic and idempotent", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const uid = `manual_coin_member_${tag}`;
  const requestId = `manual_${tag}`;
  const requestDoc = db.collection("coinPurchaseRequests").doc(`${uid}_${requestId}`);
  const userRef = db.collection("users").doc(uid);
  const ledgerRef = userRef.collection("walletLedger").doc(`coin_purchase_${requestId}`);
  const settingsRef = db.doc("platformSettings/economyPricing");
  await Promise.all([
    userRef.set({ coins: 40, profileCompleted: true, accountStatus: "active" }),
    settingsRef.set({
      coinPackages: [{ packageId: "test_pack", name: "Test package", coins: 900,
        priceMinor: 500, currency: "EUR", active: true }],
      adPrices: [{ placementId: "test_ad", name: "Test ad", billingModel: "daily",
        priceMinor: 100, currency: "EUR", active: true }],
      manualCoinPurchasesEnabled: true, automatedCoinCheckoutEnabled: false, version: 1,
    }),
  ]);
  try {
    const member = memberRequest(uid, { requestId, kind: "package", packageId: "test_pack" });
    const created = await createCoinPurchaseRequest.run(member);
    assert.equal(created.status, "pending_owner_contact");
    const memberRequests = await getMyCoinPurchaseRequests.run(member);
    assert.equal(memberRequests.requests.length, 1);
    assert.equal(memberRequests.requests[0].requestId, requestId);
    assert.equal((await userRef.get()).data().coins, 40);
    assert.equal((await requestDoc.get()).data().status, "pending_owner_contact");

    const instructionResult = await setCoinPurchasePaymentInstructions.run(ownerRequest("manual-owner", {
      requesterUid: uid, requestId, instructions: "يرجى التواصل مع المالك لإتمام التحويل البنكي",
      agreedCoins: 900, agreedPriceMinor: 500, currency: "EUR",
    }));
    assert.equal((await requestDoc.get()).data().status, "payment_instructions_sent");
    assert.ok(instructionResult.chatId);
    const chatMessages = await db.collection("directChats").doc(instructionResult.chatId)
      .collection("messages").get();
    assert.equal(chatMessages.size, 1);
    assert.equal(chatMessages.docs[0].data().isPlatformOwnerMessage, true);
    assert.match(chatMessages.docs[0].data().text, /تعليمات الدفع/);
    assert.equal((await userRef.get()).data().coins, 40);

    const approvalInput = {
      requesterUid: uid, requestId, externalPaymentVerified: true,
      externalPaymentReference: `verified-${tag}`,
      verificationNote: "تحقق المالك يدوياً من وصول المبلغ إلى الحساب الخارجي",
    };
    const approved = await approveCoinPurchaseRequest.run(ownerRequest("manual-owner", approvalInput));
    assert.equal(approved.status, "approved");
    assert.equal(approved.newBalance, 940);
    assert.equal(approved.idempotentReplay, false);
    const [user, ledger, purchase] = await Promise.all([
      userRef.get(), ledgerRef.get(), requestDoc.get(),
    ]);
    assert.equal(user.data().coins, 940);
    assert.equal(ledger.data().amount, 900);
    assert.equal(ledger.data().type, "coin_purchase_manual_credit");
    assert.equal(ledger.data().externalPaymentReference, `verified-${tag}`);
    assert.equal(purchase.data().status, "approved");

    const replay = await approveCoinPurchaseRequest.run(ownerRequest("manual-owner", approvalInput));
    assert.equal(replay.idempotentReplay, true);
    assert.equal((await userRef.get()).data().coins, 940);
    assert.equal((await db.collection("adminAuditLogs")
      .doc(`coin_purchase_approval_${uid}_${requestId}`).get()).exists, true);
  } finally {
    await Promise.all([
      ledgerRef.delete().catch(() => undefined),
      requestDoc.delete().catch(() => undefined),
      userRef.delete().catch(() => undefined),
      settingsRef.delete().catch(() => undefined),
    ]);
  }
});

test("custom coin request is negotiated manually and a withdrawn request cannot be credited", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const uid = `manual_custom_member_${tag}`;
  const requestId = `custom_${tag}`;
  const requestDoc = db.collection("coinPurchaseRequests").doc(`${uid}_${requestId}`);
  const userRef = db.collection("users").doc(uid);
  await Promise.all([
    userRef.set({ coins: 25, profileCompleted: true, accountStatus: "active" }),
    db.doc("platformSettings/economyPricing").set({
      coinPackages: [{ packageId: "test_pack", name: "Test package", coins: 900,
        priceMinor: 500, currency: "EUR", active: true }],
      adPrices: [{ placementId: "test_ad", name: "Test ad", billingModel: "daily",
        priceMinor: 100, currency: "EUR", active: true }],
      manualCoinPurchasesEnabled: true, automatedCoinCheckoutEnabled: false, version: 1,
    }),
  ]);
  try {
    await createCoinPurchaseRequest.run(memberRequest(uid, {
      requestId, kind: "custom", requestedCoins: 12345,
    }));
    assert.equal((await requestDoc.get()).data().requestedCoins, 12345);
    assert.equal((await userRef.get()).data().coins, 25);
    await withdrawCoinPurchaseRequest.run(memberRequest(uid, { requestId }));
    assert.equal((await requestDoc.get()).data().status, "withdrawn");
    await assert.rejects(
      () => approveCoinPurchaseRequest.run(ownerRequest("manual-owner", {
        requesterUid: uid, requestId, externalPaymentVerified: true,
        externalPaymentReference: "external-ref-123",
        verificationNote: "تم التحقق يدوياً من التحويل",
      })),
      (error) => error && error.code === "failed-precondition",
    );
    assert.equal((await userRef.get()).data().coins, 25);
    assert.equal((await db.collection("users").doc(uid).collection("walletLedger").get()).empty, true);
  } finally {
    await Promise.all([requestDoc.delete().catch(() => undefined), userRef.delete().catch(() => undefined), db.doc("platformSettings/economyPricing").delete().catch(() => undefined)]);
  }
});


test("owner live streams are scoped to owner direct chats or active rooms and are idempotent", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const ownerUid = `live_owner_${tag}`;
  const memberUid = `live_member_${tag}`;
  const chatId = createDirectChatId(ownerUid, memberUid);
  const chatRef = db.collection("directChats").doc(chatId);
  const memberRef = db.collection("users").doc(memberUid);
  const directRequestId = `live_direct_${tag}`;
  const directMessageId = require("node:crypto").createHash("sha256")
    .update("owner-live-stream:" + ownerUid + ":direct:" + chatId + ":" + directRequestId).digest("hex");
  await Promise.all([
    chatRef.set({ participantUids: [ownerUid, memberUid].sort(), createdAt: new Date() }),
    memberRef.set({ profileCompleted: true, accountStatus: "active", coins: 0 }),
  ]);
  try {
    const directInput = {
      requestId: directRequestId, scope: "direct", targetId: chatId,
      url: "https://www.youtube.com/watch?v=abc123", title: "بث المباراة",
      description: "رابط بث رسمي",
    };
    const sent = await sendOwnerLiveStream.run(ownerRequest(ownerUid, directInput));
    assert.equal(sent.idempotentReplay, false);
    assert.equal(sent.provider, "youtube");
    const messageRef = chatRef.collection("messages").doc(directMessageId);
    const message = await messageRef.get();
    assert.equal(message.data().type, "live_stream");
    assert.equal(message.data().isPlatformOwnerMessage, true);
    assert.equal(message.data().liveStream.hostname, "www.youtube.com");
    const replay = await sendOwnerLiveStream.run(ownerRequest(ownerUid, directInput));
    assert.equal(replay.idempotentReplay, true);
    await deleteDirectMessageForEveryone.run(ownerRequest(ownerUid, { chatId, messageId: directMessageId }));
    assert.equal((await messageRef.get()).exists, false);
    await assert.rejects(
      () => sendOwnerLiveStream.run(memberRequest(memberUid, directInput)),
      (error) => error && error.code === "permission-denied",
    );

    const publicRoomId = `public_live_${tag}`;
    const publicRoomRef = db.collection("rooms").doc(publicRoomId);
    await publicRoomRef.set({ kind: "public", status: "active", ownerUid: memberUid });
    const publicRequestId = `live_room_${tag}`;
    const publicResult = await sendOwnerLiveStream.run(ownerRequest(ownerUid, {
      requestId: publicRequestId, scope: "room", targetId: publicRoomId,
      url: "https://www.tiktok.com/@channel/live", title: "بث عام",
    }));
    assert.equal(publicResult.scope, "room");
    assert.equal(publicResult.provider, "tiktok");
    const publicMessages = await publicRoomRef.collection("messages").get();
    assert.equal(publicMessages.size, 1);
    assert.equal(publicMessages.docs[0].data().type, "live_stream");
    await deleteRoomMessage.run(ownerRequest(ownerUid, {
      roomId: publicRoomId, messageId: publicMessages.docs[0].id,
    }));
    assert.equal((await publicRoomRef.collection("messages").doc(publicMessages.docs[0].id).get()).exists, false);

    const rentedRoomId = `rented_live_${tag}`;
    const rentalId = `rental_live_${tag}`;
    const future = require("firebase-admin/firestore").Timestamp.fromMillis(Date.now() + 60 * 60 * 1000);
    await Promise.all([
      db.collection("rooms").doc(rentedRoomId).set({
        kind: "private", isRented: true, rentalId, status: "active", expiresAt: future,
      }),
      db.collection("roomRentals").doc(rentalId).set({
        roomId: rentedRoomId, ownerUid: memberUid, status: "active", expiresAt: future,
      }),
    ]);
    const rented = await sendOwnerLiveStream.run(ownerRequest(ownerUid, {
      requestId: `live_private_${tag}`, scope: "room", targetId: rentedRoomId,
      url: "https://example.org/official-stream", title: "بث خاص",
    }));
    assert.equal(rented.idempotentReplay, false);

    await db.collection("rooms").doc(`closed_${tag}`).set({
      kind: "public", status: "closed",
    });
    await assert.rejects(
      () => sendOwnerLiveStream.run(ownerRequest(ownerUid, {
        requestId: `closed_stream_${tag}`, scope: "room", targetId: `closed_${tag}`,
        url: "https://example.org/live",
      })),
      (error) => error && error.code === "failed-precondition",
    );
    const expiredRoomId = `expired_room_${tag}`;
    const expiredRentalId = `expired_rental_${tag}`;
    const past = require("firebase-admin/firestore").Timestamp.fromMillis(Date.now() - 1000);
    await Promise.all([
      db.collection("rooms").doc(expiredRoomId).set({
        kind: "private", isRented: true, rentalId: expiredRentalId, status: "active", expiresAt: past,
      }),
      db.collection("roomRentals").doc(expiredRentalId).set({
        roomId: expiredRoomId, ownerUid: memberUid, status: "active", expiresAt: past,
      }),
    ]);
    await assert.rejects(
      () => sendOwnerLiveStream.run(ownerRequest(ownerUid, {
        requestId: `expired_stream_${tag}`, scope: "room", targetId: expiredRoomId,
        url: "https://example.org/live",
      })),
      (error) => error && error.code === "failed-precondition",
    );
    await assert.rejects(
      () => sendOwnerLiveStream.run(ownerRequest(ownerUid, {
        requestId: `unsafe_stream_${tag}`, scope: "room", targetId: publicRoomId,
        url: "http://127.0.0.1/private",
      })),
      (error) => error && error.code === "invalid-argument",
    );
    assert.equal((await db.collection("adminAuditLogs").doc("owner_live_stream_" + directMessageId).get()).exists, true);
  } finally {
    await Promise.all([
      chatRef.delete().catch(() => undefined), memberRef.delete().catch(() => undefined),
      db.collection("rooms").doc(`public_live_${tag}`).delete().catch(() => undefined),
      db.collection("rooms").doc(`rented_live_${tag}`).delete().catch(() => undefined),
      db.collection("roomRentals").doc(`rental_live_${tag}`).delete().catch(() => undefined),
      db.collection("rooms").doc(`closed_${tag}`).delete().catch(() => undefined),
      db.collection("rooms").doc(`expired_room_${tag}`).delete().catch(() => undefined),
      db.collection("roomRentals").doc(`expired_rental_${tag}`).delete().catch(() => undefined),
    ]);
  }
});


test("every shipped premium store category charges once and grants its matching entitlement", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const { projectStoreEntitlementFeatures } = require("../../lib/store-purchase");
  const tag = suffix();
  const uid = `premium_store_member_${tag}`;
  const memberRef = db.collection("users").doc(uid);
  const items = [
    ["vip_monthly", "vip", 30],
    ["title_custom", "title", 30],
    ["badge_special", "badge", 30],
    ["avatar_frame_30d", "frame", 30],
    ["username_color_30d", "username_style", 30],
    ["username_animated_30d", "username_style", 30],
    ["profile_analytics_30d", "analytics", 30],
    ["profile_layout_30d", "profile_layout", 30],
    ["profile_pin_30d", "profile_layout", 30],
    ["discovery_boost_7d", "boost", 7],
    ["profile_theme_30d", "theme", 30],
    ["visitor_greeting_30d", "greeting", 30],
  ];
  const priceCoins = 100;
  const purchaseRefs = [];
  const ledgerRefs = [];
  const entitlementRefs = [];
  const catalogRefs = items.map(([itemId]) => db.collection("storeCatalog").doc(itemId));

  await memberRef.set({
    coins: 10000,
    profileCompleted: true,
    accountStatus: "active",
  });

  try {
    await Promise.all(items.map(([itemId, category, durationDays], index) =>
      setStoreCatalogItem.run(ownerRequest("store-catalog-owner", {
        itemId,
        name: `ميزة ${itemId}`,
        description: "اختبار تكامل لاستحقاق متجر مميز.",
        category,
        priceCoins,
        durationDays,
        sortOrder: index + 1,
        active: true,
        purchaseEnabled: true,
      })),
    ));

    for (const [index, [itemId]] of items.entries()) {
      const requestId = `premium_${tag}_${index}`;
      const purchaseId = `${uid}_${requestId}`;
      const purchaseRef = db.collection("storePurchases").doc(purchaseId);
      const ledgerRef = memberRef.collection("walletLedger").doc(`store_${purchaseId}`);
      const entitlementRef = memberRef.collection("entitlements").doc(itemId);
      purchaseRefs.push(purchaseRef);
      ledgerRefs.push(ledgerRef);
      entitlementRefs.push(entitlementRef);

      const result = await purchaseStoreItem.run(memberRequest(uid, {
        itemId,
        requestId,
        expectedPriceCoins: priceCoins,
      }));
      assert.equal(result.idempotentReplay, false, itemId);
      assert.equal(result.newBalance, 10000 - ((index + 1) * priceCoins), itemId);

      const [purchase, ledger, entitlement] = await Promise.all([
        purchaseRef.get(),
        ledgerRef.get(),
        entitlementRef.get(),
      ]);
      assert.equal(purchase.data().status, "completed", itemId);
      assert.equal(ledger.data().amount, -priceCoins, itemId);
      assert.equal(entitlement.data().status, "active", itemId);
      assert.equal(entitlement.data().itemId, itemId, itemId);

      const replay = await purchaseStoreItem.run(memberRequest(uid, {
        itemId,
        requestId,
        expectedPriceCoins: priceCoins,
      }));
      assert.equal(replay.idempotentReplay, true, itemId);
      assert.equal((await memberRef.get()).data().coins, 10000 - ((index + 1) * priceCoins), itemId);
    }

    const entitlementSnapshots = await Promise.all(entitlementRefs.map((ref) => ref.get()));
    const projected = projectStoreEntitlementFeatures(
      entitlementSnapshots.map((snapshot) => snapshot.data()),
    );
    assert.equal(projected.vipActive, true);
    assert.equal(projected.activeTitle, "ميزة title_custom");
    assert.deepEqual(
      new Set(projected.activeFeatures.map((feature) => feature.itemId)),
      new Set(items.map(([itemId]) => itemId)),
    );

    const member = (await memberRef.get()).data();
    assert.equal(member.pinnedProfileSection, "interests");
    assert.ok(member.discoveryBoostExpiresAt.toMillis() > Date.now());

    const disabledPrivacyItem = db.collection("storeCatalog").doc("hide_coins_30d");
    await assert.rejects(
      () => setStoreCatalogItem.run(ownerRequest("store-catalog-owner", {
        itemId: "hide_coins_30d",
        name: "إخفاء الرصيد",
        description: "ميزة خصوصية غير مفعلة.",
        category: "privacy",
        priceCoins,
        durationDays: 30,
        sortOrder: 99,
        active: true,
        purchaseEnabled: true,
      })),
      (error) => error && error.code === "invalid-argument",
    );
    await setStoreCatalogItem.run(ownerRequest("store-catalog-owner", {
      itemId: "hide_coins_30d",
      name: "إخفاء الرصيد",
      description: "ميزة خصوصية غير مفعلة.",
      category: "privacy",
      priceCoins,
      durationDays: 30,
      sortOrder: 99,
      active: true,
      purchaseEnabled: false,
    }));
    await assert.rejects(
      () => purchaseStoreItem.run(memberRequest(uid, {
        itemId: "hide_coins_30d",
        requestId: `privacy_${tag}`,
        expectedPriceCoins: priceCoins,
      })),
      (error) => error && error.code === "failed-precondition",
    );
    assert.equal((await memberRef.get()).data().coins, 10000 - (items.length * priceCoins));
    await disabledPrivacyItem.delete();
  } finally {
    await Promise.all([
      ...purchaseRefs.map((ref) => ref.delete().catch(() => undefined)),
      ...ledgerRefs.map((ref) => ref.delete().catch(() => undefined)),
      ...entitlementRefs.map((ref) => ref.delete().catch(() => undefined)),
      ...catalogRefs.map((ref) => ref.delete().catch(() => undefined)),
      db.collection("storeCatalog").doc("hide_coins_30d").delete().catch(() => undefined),
      db.recursiveDelete(memberRef).catch(() => undefined),
    ]);
  }
});


test("call entitlement SKUs can be purchased through the central store and immediately authorize both-party call creation", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const callerUid = "call_store_caller_" + tag;
  const calleeUid = "call_store_callee_" + tag;
  const chatId = "call_store_chat_" + tag;
  const callId = "call_store_session_" + tag;
  const callerRef = db.collection("users").doc(callerUid);
  const calleeRef = db.collection("users").doc(calleeUid);
  const chatRef = db.collection("directChats").doc(chatId);
  const itemRef = db.collection("storeCatalog").doc("voice_call_24h");
  await Promise.all([
    callerRef.set({ coins: 500, profileCompleted: true, accountStatus: "active", age: 29 }),
    calleeRef.set({ coins: 500, profileCompleted: true, accountStatus: "active", age: 31 }),
    chatRef.set({ participantUids: [callerUid, calleeUid].sort() }),
    itemRef.set({
      itemId: "voice_call_24h", name: "مكالمات صوتية 24 ساعة",
      description: "اختبار تكامل", category: "voice_call", priceCoins: 100,
      durationDays: 1, sortOrder: 1, active: true,
      purchaseEnabled: true, fulfillmentReady: true,
    }),
  ]);
  try {
    await purchaseStoreItem.run(memberRequest(callerUid, {
      itemId: "voice_call_24h", requestId: "call_purchase_" + tag + "_a", expectedPriceCoins: 100,
    }));
    await purchaseStoreItem.run(memberRequest(calleeUid, {
      itemId: "voice_call_24h", requestId: "call_purchase_" + tag + "_b", expectedPriceCoins: 100,
    }));
    const started = await startCall.run(memberRequest(callerUid, {
      callId, scope: "direct", targetId: chatId, mode: "audio",
    }));
    assert.equal(started.status, "ringing");
    await endCall.run(memberRequest(callerUid, { callId }));
  } finally {
    await Promise.all([
      db.recursiveDelete(callerRef).catch(() => undefined),
      db.recursiveDelete(calleeRef).catch(() => undefined),
      db.recursiveDelete(chatRef).catch(() => undefined),
      db.recursiveDelete(itemRef).catch(() => undefined),
      db.recursiveDelete(db.collection("callSessions").doc(callId)).catch(() => undefined),
      db.recursiveDelete(db.collection("activeCallMemberLocks").doc(callerUid)).catch(() => undefined),
      db.recursiveDelete(db.collection("activeCallMemberLocks").doc(calleeUid)).catch(() => undefined),
    ]);
  }
});
