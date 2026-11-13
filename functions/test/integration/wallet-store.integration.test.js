const test = require("node:test");
const assert = require("node:assert/strict");
const { getFirestore } = require("firebase-admin/firestore");
const { transferCoins, purchaseStoreItem } = require("../../lib/index");

const db = getFirestore();
const memberRequest = (uid, data) => ({
  data,
  auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
});
const suffix = () => `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

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
