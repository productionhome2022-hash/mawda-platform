const test = require("node:test");
const assert = require("node:assert/strict");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const {
  transferCoins, getOwnerWalletReconciliation, purchaseStoreItem, getOwnerStoreCatalog, setStoreCatalogItem, getAvailableCoinPackages, getOwnerEconomyPricing,
  setOwnerEconomyPricing, createCoinPurchaseRequest, getMyCoinPurchaseRequests,
  setCoinPurchasePaymentInstructions, requestCoinPurchasePaymentVerification, approveCoinPurchaseRequest,
  rejectCoinPurchaseRequest, withdrawCoinPurchaseRequest, listOwnerCoinPurchaseRequests,
  sendOwnerLiveStream,
  deleteDirectMessageForEveryone, deleteRoomMessage,
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
    assert.equal(senderLedger.data().balanceBefore, 5000);
    assert.equal(senderLedger.data().balanceAfter, 4000);
    assert.equal(recipientLedger.data().balanceBefore, 200);
    assert.equal(recipientLedger.data().balanceAfter, 1000);
    assert.equal(transfer.data().senderBalanceBefore, 5000);
    assert.equal(transfer.data().senderBalanceAfter, 4000);
    assert.equal(transfer.data().recipientBalanceBefore, 200);
    assert.equal(transfer.data().recipientBalanceAfter, 1000);
    assert.equal(senderLedger.data().commissionAmount, 200);
    assert.equal(senderLedger.data().recipientUid, recipientUid);
    assert.equal(senderLedger.data().recipientNetAmount, 800);
    assert.equal(recipientLedger.data().amount, 800);
    assert.equal(recipientLedger.data().senderUid, senderUid);
    assert.equal(recipientLedger.data().transferId, transferId);
    assert.equal(platformLedger.data().amount, 200);
    assert.equal(platformLedger.data().transferId, transferId);
    assert.equal(transfer.data().status, "completed");

    const replay = await transferCoins.run(request);
    assert.equal(replay.idempotentReplay, true);
    assert.equal((await senderRef.get()).data().coins, 4000);
    assert.equal((await recipientRef.get()).data().coins, 1000);
    await platformLedgerRef.delete();
    await assert.rejects(
      () => transferCoins.run(request),
      (error) => error && error.code === "failed-precondition",
    );
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

test("coin transfer rejects an ineligible recipient and insufficient sender balance without partial writes", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const senderUid = `eligible_sender_${tag}`;
  const blockedRecipientUid = `blocked_recipient_${tag}`;
  const poorSenderUid = `poor_sender_${tag}`;
  const eligibleRecipientUid = `eligible_recipient_${tag}`;
  const refs = [
    db.collection("users").doc(senderUid),
    db.collection("users").doc(blockedRecipientUid),
    db.collection("users").doc(poorSenderUid),
    db.collection("users").doc(eligibleRecipientUid),
  ];
  await Promise.all([
    refs[0].set({ coins: 1000, accountStatus: "active" }),
    refs[1].set({ coins: 100, accountStatus: "disabled" }),
    refs[2].set({ coins: 10, accountStatus: "active" }),
    refs[3].set({ coins: 50, accountStatus: "active" }),
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
    const failedTransfers = await db.collection("coinTransfers")
      .where("senderUid", "in", [senderUid, poorSenderUid]).get();
    assert.equal(failedTransfers.empty, true);
  } finally {
    await Promise.all([
      ...refs.map((ref) => ref.delete().catch(() => undefined)),
      db.doc("platformSettings/coinTransfers").set({ enabled: false, commissionBps: 0, version: 0 }),
    ]);
  }
});

test("store purchase atomically charges, records receipt and ledger, grants entitlement, and is idempotent", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const uid = `store_member_${tag}`;
  // Use a server-approved purchasable SKU; arbitrary dynamic IDs must fail fulfillment validation.
  const itemId = "vip_monthly";
  const requestId = `purchase_${tag}`;
  const purchaseId = `${uid}_${requestId}`;
  const memberRef = db.collection("users").doc(uid);
  const itemRef = db.collection("storeCatalog").doc(itemId);
  const purchaseRef = db.collection("storePurchases").doc(purchaseId);
  const ledgerRef = memberRef.collection("walletLedger").doc(`store_${purchaseId}`);
  const entitlementRef = memberRef.collection("entitlements").doc(itemId);
  const versionsRef = db.collection("storeCatalogVersions").doc(itemId).collection("versions");
  const previousItem = await itemRef.get();
  const previousVersions = await versionsRef.get();

  await memberRef.set({ coins: 5000, profileCompleted: true, accountStatus: "active" });
  try {
    const firstPublish = await setStoreCatalogItem.run(ownerRequest("store-catalog-owner", {
      itemId, name: "VIP test item", description: "Emulator-only entitlement test",
      category: "vip", priceCoins: 1250, durationDays: 30, sortOrder: 1,
      active: true, purchaseEnabled: true, fulfillmentReady: true,
    }));
    assert.equal(firstPublish.version, 1);
    const secondPublish = await setStoreCatalogItem.run(ownerRequest("store-catalog-owner", {
      itemId, name: "VIP test item", description: "Emulator-only entitlement test",
      category: "vip", priceCoins: 1250, durationDays: 30, sortOrder: 1,
      active: true, purchaseEnabled: true, fulfillmentReady: true,
    }));
    assert.equal(secondPublish.version, 2);
    assert.equal((await itemRef.get()).data().version, 2);
    assert.equal((await versionsRef.doc("1").get()).data().version, 1);
    assert.equal((await versionsRef.doc("2").get()).data().version, 2);
    const request = memberRequest(uid, { itemId, requestId, expectedPriceCoins: 1250, expectedCatalogVersion: 2 });
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
    assert.equal(ledger.data().balanceBefore, 5000);
    assert.equal(ledger.data().balanceAfter, 3750);
    assert.equal(purchase.data().balanceBefore, 5000);
    assert.equal(purchase.data().newBalance, 3750);
    assert.equal(ledger.data().purchaseId, purchaseId);
    assert.equal(entitlement.data().status, "active");
    assert.equal(entitlement.data().category, "vip");
    assert.ok(entitlement.data().expiresAt.toMillis() > Date.now());

    const replay = await purchaseStoreItem.run(request);
    assert.equal(replay.idempotentReplay, true);
    assert.equal((await memberRef.get()).data().coins, 3750);
    await ledgerRef.delete();
    await assert.rejects(
      () => purchaseStoreItem.run(request),
      (error) => error && error.code === "failed-precondition",
    );
    assert.equal((await memberRef.get()).data().coins, 3750);

    await assert.rejects(
      () => purchaseStoreItem.run(memberRequest(uid, {
        itemId, requestId: `another_${tag}`, expectedPriceCoins: 1000, expectedCatalogVersion: 2,
      })),
      (error) => error && error.code === "failed-precondition",
    );
  } finally {
    await Promise.all([
      ledgerRef.delete().catch(() => undefined),
      purchaseRef.delete().catch(() => undefined),
      entitlementRef.delete().catch(() => undefined),
      (async () => {
        await itemRef.delete().catch(() => undefined);
        const versions = await versionsRef.get();
        await Promise.all(versions.docs.map((doc) => doc.ref.delete()));
        if (previousItem.exists) await itemRef.set(previousItem.data());
        await Promise.all(previousVersions.docs.map((doc) => doc.ref.set(doc.data())));
      })(),
      memberRef.delete().catch(() => undefined),
    ]);
  }
});


test("owner catalog publication fails closed on a corrupt prior version", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const itemId = `version_corrupt_${tag}`;
  const itemRef = db.collection("storeCatalog").doc(itemId);
  await itemRef.set({
    itemId, version: "not-a-version", name: "Version fixture",
    description: "Corrupt version must not be overwritten.",
    category: "vip", priceCoins: 100, durationDays: 30,
    sortOrder: 1, active: true, purchaseEnabled: false, fulfillmentReady: true,
  });
  try {
    await assert.rejects(
      () => setStoreCatalogItem.run(ownerRequest("store-catalog-owner", {
        itemId, name: "Version fixture", description: "Corrupt version must not be overwritten.",
        category: "vip", priceCoins: 100, durationDays: 30,
        sortOrder: 1, active: true, purchaseEnabled: false,
      })),
      (error) => error && error.code === "failed-precondition",
    );
    assert.equal((await itemRef.get()).data().version, "not-a-version");
  } finally {
    await itemRef.delete().catch(() => undefined);
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
  ]);
  for (const [itemId, price] of expected) {
    const item = items.find((entry) => entry.itemId === itemId);
    assert.ok(item, `missing starter catalog item: ${itemId}`);
    assert.equal(item.priceCoins, price);
    const implemented = !["hide_coins_30d", "ghost_mode_7d"].includes(itemId);
    assert.equal(item.active, implemented);
    assert.equal(item.purchaseEnabled, false);
    assert.equal(item.fulfillmentReady, implemented);
  }
});


test("owner economy pricing never seeds commercial defaults and publishes immutable per-service policy versions", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const settingsRef = db.doc("platformSettings/economyPricing");
  const versionCollection = db.collection("platformSettings").doc("economyPricingVersions").collection("versions");
  const previous = await settingsRef.get();
  const previousData = previous.exists ? previous.data() : null;
  const previousVersions = await versionCollection.get();
  const previousAuditQuery = await db.collection("adminAuditLogs")
    .where("actorUid", "==", "store-catalog-owner").get();
  const previousAudit = previousAuditQuery.docs.filter((doc) =>
    doc.data().action === "economy_pricing_updated");
  try {
    await settingsRef.delete().catch(() => undefined);
    const oldVersions = await versionCollection.get();
    await Promise.all(oldVersions.docs.map((doc) => doc.ref.delete()));
    const unconfigured = await getOwnerEconomyPricing.run(ownerRequest());
    assert.equal(unconfigured.configured, false);
    assert.equal(unconfigured.manualCoinPurchasesEnabled, false);
    assert.ok(unconfigured.coinPackages.length > 0, "owner preview exposes provisional experimental coin prices");
    assert.ok(unconfigured.adPrices.length > 0, "owner preview exposes provisional experimental ad prices");
    assert.equal(unconfigured.pricingDefaultsStatus, "experimental_provisional");
    const unavailablePackages = await getAvailableCoinPackages.run();
    assert.equal(unavailablePackages.manualPurchasesEnabled, false);
    assert.deepEqual(unavailablePackages.packages, []);

    const packages = [{ packageId: "owner_pack", name: "Owner package", coins: 1000,
      priceMinor: 12500, currency: "EUR", active: true }];
    const ads = [{ placementId: "owner_ad", name: "Owner ad", billingModel: "daily",
      priceMinor: 1000, currency: "EUR", active: false }];
    const paymentPolicy = {
      coin_purchases: { manualEnabled: true, automatedEnabled: false },
      featured_ads: { manualEnabled: true, automatedEnabled: false },
      public_ads: { manualEnabled: false, automatedEnabled: false },
      influencer_services: { manualEnabled: false, automatedEnabled: false },
      store_entitlements: { manualEnabled: false, automatedEnabled: false },
    };
    const saved = await setOwnerEconomyPricing.run(ownerRequest("store-catalog-owner", {
      coinPackages: packages, adPrices: ads, manualCoinPurchasesEnabled: true,
      paymentPolicy, customCoinRequestBounds: { minCoins: 100, maxCoins: 50000 },
    }));
    assert.equal(saved.version, 1);
    const versionRef = versionCollection.doc("1");
    const versionSnapshot = await versionRef.get();
    assert.equal(versionSnapshot.exists, true);
    assert.equal(versionSnapshot.data().coinPackages[0].currency, "EUR");
    assert.equal(versionSnapshot.data().paymentPolicy.featured_ads.manualEnabled, true);

    const readback = await getOwnerEconomyPricing.run(ownerRequest());
    assert.equal(readback.configured, true);
    assert.equal(readback.version, 1);
    assert.equal(readback.coinPackages[0].priceMinor, 12500);
    assert.equal(readback.coinPackages[0].currencyExponent, 2);
    assert.deepEqual(readback.customCoinRequestBounds, { minCoins: 100, maxCoins: 50000 });
    assert.equal(readback.paymentPolicy.coin_purchases.manualEnabled, true);
    assert.equal(readback.paymentPolicy.featured_ads.manualEnabled, true);
    assert.equal(readback.paymentPolicy.public_ads.manualEnabled, false);
    assert.equal(readback.paymentPolicy.influencer_services.manualEnabled, false);
    assert.equal(readback.paymentPolicy.store_entitlements.manualEnabled, false);
    assert.equal(readback.paymentPolicy.coin_purchases.automatedEnabled, false);

    const available = await getAvailableCoinPackages.run();
    assert.equal(available.manualPurchasesEnabled, true);
    assert.equal(available.automatedCheckoutEnabled, false);
    assert.equal(available.packages.length, 1);
    assert.equal(available.customCoinRequestBounds.maxCoins, 50000);

    await assert.rejects(
      () => setOwnerEconomyPricing.run(memberRequest("not_owner", {
        coinPackages: packages, adPrices: ads, manualCoinPurchasesEnabled: true,
        paymentPolicy,
      })),
      (error) => error && error.code === "permission-denied",
    );
  } finally {
    const currentVersions = await versionCollection.get();
    await Promise.all(currentVersions.docs.map((doc) => doc.ref.delete()));
    await Promise.all(previousVersions.docs.map((doc) => doc.ref.set(doc.data())));
    const currentAuditQuery = await db.collection("adminAuditLogs")
      .where("actorUid", "==", "store-catalog-owner").get();
    const currentAudit = currentAuditQuery.docs.filter((doc) =>
      doc.data().action === "economy_pricing_updated");
    const priorIds = new Set(previousAudit.map((doc) => doc.id));
    await Promise.all(currentAudit.filter((doc) => !priorIds.has(doc.id)).map((doc) => doc.ref.delete()));
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
  const approvalAuditRef = db.collection("adminAuditLogs")
    .doc(`coin_purchase_approval_${uid}_${requestId}`);
  const settingsRef = db.doc("platformSettings/economyPricing");
  await Promise.all([
    userRef.set({ coins: 40, profileCompleted: true, accountStatus: "active" }),
    settingsRef.set({
      coinPackages: [{ packageId: "test_pack", name: "Test package", coins: 900,
        priceMinor: 500, currency: "EUR", active: true }],
      adPrices: [{ placementId: "test_ad", name: "Test ad", billingModel: "daily",
        priceMinor: 100, currency: "EUR", active: true }],
      manualCoinPurchasesEnabled: true,
      paymentPolicy: { coin_purchases: { manualEnabled: true, automatedEnabled: false } },
      automatedCoinCheckoutEnabled: false, version: 1,
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
      expectedInstructionsVersion: 0,
    }));
    assert.equal((await requestDoc.get()).data().status, "payment_instructions_sent");
    assert.equal((await requestDoc.get()).data().paymentPolicySnapshot.manualEnabled, true);
    await assert.rejects(
      () => withdrawCoinPurchaseRequest.run(memberRequest(uid, { requestId })),
      (error) => error && error.code === "failed-precondition",
    );
    await assert.rejects(
      () => setCoinPurchasePaymentInstructions.run(ownerRequest("manual-owner", {
        requesterUid: uid, requestId, instructions: "تعديل ممنوع بعد الإصدار",
        agreedCoins: 900, agreedPriceMinor: 500, currency: "EUR",
        expectedInstructionsVersion: 0,
      })),
      (error) => error && error.code === "failed-precondition",
    );
    const reported = await requestCoinPurchasePaymentVerification.run(memberRequest(uid, {
      requestId, expectedInstructionsVersion: 1,
    }));
    assert.equal(reported.status, "awaiting_payment_verification");
    assert.equal(reported.idempotentReplay, false);
    assert.equal((await userRef.get()).data().coins, 40);
    const reportReplay = await requestCoinPurchasePaymentVerification.run(memberRequest(uid, {
      requestId, expectedInstructionsVersion: 1,
    }));
    assert.equal(reportReplay.idempotentReplay, true);
    const reportAuditRef = db.collection("adminAuditLogs")
      .doc(`coin_purchase_payment_report_${uid}_${requestId}_1`);
    const reportAudit = (await reportAuditRef.get()).data();
    assert.equal(reportAudit.paymentPolicySnapshot.service, "coin_purchases");
    assert.equal(reportAudit.paymentPolicyVersion, 1);
    await reportAuditRef.delete();
    await assert.rejects(
      () => requestCoinPurchasePaymentVerification.run(memberRequest(uid, {
        requestId, expectedInstructionsVersion: 1,
      })),
      (error) => error && error.code === "failed-precondition",
    );
    await reportAuditRef.set(reportAudit);
    const ownerVerificationQueue = await listOwnerCoinPurchaseRequests.run(ownerRequest("manual-owner", {
      status: "awaiting_payment_verification",
    }));
    assert.ok(ownerVerificationQueue.requests.some((entry) => entry.requestId === requestId));
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
    assert.equal(ledger.data().currency, "EUR");
    assert.equal(ledger.data().currencyExponent, 2);
    assert.equal(ledger.data().paymentPolicySnapshot.service, "coin_purchases");
    assert.equal(ledger.data().paymentPolicyVersion, 1);
    assert.equal(purchase.data().status, "approved");

    const replay = await approveCoinPurchaseRequest.run(ownerRequest("manual-owner", approvalInput));
    assert.equal(replay.idempotentReplay, true);
    assert.equal((await userRef.get()).data().coins, 940);
    const approvalAudit = (await approvalAuditRef.get()).data();
    assert.equal(approvalAudit.paymentPolicySnapshot.service, "coin_purchases");
    assert.equal(approvalAudit.paymentPolicyVersion, 1);
    assert.equal(approvalAudit.instructionsVersion, 1);
    await approvalAuditRef.delete();
    await assert.rejects(
      () => approveCoinPurchaseRequest.run(ownerRequest("manual-owner", approvalInput)),
      (error) => error && error.code === "failed-precondition",
    );
    assert.equal((await userRef.get()).data().coins, 940);
  } finally {
    await Promise.all([
      ledgerRef.delete().catch(() => undefined),
      approvalAuditRef.delete().catch(() => undefined),
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
      customCoinRequestBounds: { minCoins: 100, maxCoins: 50000 },
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
    const publishedItems = await Promise.all(items.map(([itemId, category, durationDays], index) =>
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
    assert.deepEqual(publishedItems.map((item) => item.version), items.map(() => 1));

    const vipRepublished = await setStoreCatalogItem.run(ownerRequest("store-catalog-owner", {
      itemId: "vip_monthly",
      name: "ميزة vip_monthly",
      description: "اختبار تكامل لاستحقاق متجر مميز.",
      category: "vip",
      priceCoins,
      durationDays: 30,
      sortOrder: 1,
      active: true,
      purchaseEnabled: true,
    }));
    assert.equal(vipRepublished.version, 2);
    assert.equal((await db.collection("storeCatalog").doc("vip_monthly").get()).data().version, 2);

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
        expectedCatalogVersion: itemId === "vip_monthly" ? 2 : publishedItems[index].version,
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
        expectedCatalogVersion: 1,
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


test("owner wallet reconciliation is read-only and reports unorderable history as incomplete", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const uid = `reconcile_${tag}`;
  const userRef = db.collection("users").doc(uid);
  const ledger = userRef.collection("walletLedger");
  const firstRef = ledger.doc("entry_001");
  const secondRef = ledger.doc("entry_002");
  const unorderedRef = ledger.doc("entry_003");
  await userRef.set({ coins: 1200, profileCompleted: true, accountStatus: "active" });
  await Promise.all([
    firstRef.set({ amount: 1000, balanceBefore: 0, balanceAfter: 1000, createdAt: Timestamp.fromMillis(1000) }),
    secondRef.set({ amount: 200, balanceBefore: 1000, balanceAfter: 1200, createdAt: Timestamp.fromMillis(2000) }),
  ]);
  try {
    const consistent = await getOwnerWalletReconciliation.run(ownerRequest("store-catalog-owner", {
      targetUid: uid,
    }));
    assert.equal(consistent.readOnly, true);
    assert.equal(consistent.scope, "walletLedger");
    assert.equal(consistent.status, "consistent");
    assert.equal(consistent.currentBalance, 1200);
    assert.equal(consistent.computedBalance, 1200);
    assert.equal(consistent.netLedgerDelta, 1200);
    assert.equal(consistent.ledgerEntryCount, 2);
    assert.equal(consistent.truncated, false);

    await assert.rejects(
      () => getOwnerWalletReconciliation.run(memberRequest(uid, { targetUid: uid })),
      (error) => error && error.code === "permission-denied",
    );

    await unorderedRef.set({ amount: 1, balanceBefore: 1200, balanceAfter: 1201 });
    const incomplete = await getOwnerWalletReconciliation.run(ownerRequest("store-catalog-owner", {
      targetUid: uid,
    }));
    assert.equal(incomplete.status, "incomplete");
    assert.equal(incomplete.chronologyIncomplete, true);
    assert.equal(incomplete.unorderableEntryCount, 1);
    assert.equal(incomplete.netLedgerDelta, null);
    assert.equal((await userRef.get()).data().coins, 1200);
    assert.equal((await ledger.get()).size, 3);
  } finally {
    await Promise.all([firstRef.delete(), secondRef.delete(), unorderedRef.delete(), userRef.delete()]);
  }
});



test("store catalog version refuses increment beyond the safe integer boundary", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  // The version boundary must be tested on a real server-approved SKU so the
  // catalog validator reaches the version guard instead of rejecting the fixture ID.
  const itemId = "vip_monthly";
  const itemRef = db.collection("storeCatalog").doc(itemId);
  const versionsRef = db.collection("storeCatalogVersions").doc(itemId).collection("versions");
  const previousItem = await itemRef.get();
  const previousVersions = await versionsRef.get();
  await itemRef.set({
    itemId, name: "Boundary fixture", description: "Emulator-only",
    category: "vip", priceCoins: 1, durationDays: 30, version: Number.MAX_SAFE_INTEGER,
    sortOrder: 1, active: true, purchaseEnabled: true, fulfillmentReady: true,
  });
  try {
    await assert.rejects(
      () => setStoreCatalogItem.run(ownerRequest("store-catalog-owner", {
        itemId, name: "Boundary fixture", description: "Emulator-only",
        category: "vip", priceCoins: 1, durationDays: 30,
        sortOrder: 1, active: true, purchaseEnabled: true, fulfillmentReady: true,
      })),
      (error) => error && error.code === "resource-exhausted",
    );
    assert.equal((await itemRef.get()).data().version, Number.MAX_SAFE_INTEGER);
  } finally {
    await itemRef.delete().catch(() => undefined);
    const currentVersions = await versionsRef.get();
    await Promise.all(currentVersions.docs.map((doc) => doc.ref.delete()));
    if (previousItem.exists) await itemRef.set(previousItem.data());
    await Promise.all(previousVersions.docs.map((doc) => doc.ref.set(doc.data())));
  }
});
