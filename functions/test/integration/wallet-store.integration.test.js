const test = require("node:test");
const assert = require("node:assert/strict");
const { getFirestore } = require("firebase-admin/firestore");
const { transferCoins, purchaseStoreItem, getOwnerStoreCatalog, getOwnerEconomyPricing, setOwnerEconomyPricing } = require("../../lib/index");

const db = getFirestore();
const memberRequest = (uid, data) => ({
  data,
  auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
});
const suffix = () => `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
const ownerRequest = () => ({
  data: {},
  auth: { uid: "store-catalog-owner", token: {
    platformOwner: true, auth_time: Math.floor(Date.now() / 1000),
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
  const itemId = `vip_${tag.replace(/[^a-z0-9]/gi, "").slice(0, 20)}`;
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


test("owner catalog seeds editable starter prices without enabling unimplemented purchases", async () => {
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
    assert.equal(item.active, false);
    assert.equal(item.purchaseEnabled, false);
    assert.equal(item.fulfillmentReady, false);
  }
});


test("owner economy prices seed safely and can be edited without enabling real-money checkout", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const settingsRef = db.doc("platformSettings/economyPricing");
  const previous = await settingsRef.get();
  const previousData = previous.exists ? previous.data() : null;
  try {
    const seeded = await getOwnerEconomyPricing.run(ownerRequest());
    assert.equal(seeded.realMoneyCheckoutEnabled, false);
    assert.equal(seeded.coinPackages.length, 5);
    assert.equal(seeded.adPrices.length, 4);
    assert.equal(seeded.coinPackages[0].priceMinor, 99);
    const updatedPackages = seeded.coinPackages.map((p) =>
      p.packageId === "coins_1000" ? { ...p, priceMinor: 109 } : p);
    const saved = await setOwnerEconomyPricing.run(ownerRequest("store-catalog-owner", {
      coinPackages: updatedPackages, adPrices: seeded.adPrices,
    }));
    assert.equal(saved.saved, true);
    assert.equal(saved.realMoneyCheckoutEnabled, false);
    const readback = await getOwnerEconomyPricing.run(ownerRequest());
    assert.equal(readback.version, saved.version);
    assert.equal(readback.coinPackages.find((p) => p.packageId === "coins_1000").priceMinor, 109);
    await assert.rejects(
      () => setOwnerEconomyPricing.run(memberRequest("not_owner", {
        coinPackages: updatedPackages, adPrices: seeded.adPrices,
      })),
      (error) => error && error.code === "permission-denied",
    );
  } finally {
    if (previousData) await settingsRef.set(previousData);
    else await settingsRef.delete().catch(() => undefined);
  }
});
