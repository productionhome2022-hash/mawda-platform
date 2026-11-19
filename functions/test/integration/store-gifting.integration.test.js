const test = require("node:test");
const assert = require("node:assert/strict");
const { getFirestore } = require("firebase-admin/firestore");
const { createHash } = require("node:crypto");
const { setStoreCatalogItem, giftStoreItem } = require("../../lib/index");

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

test("store gift debits sender and grants recipient once with immutable terms", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const senderUid = `gift_sender_${tag}`;
  const recipientUid = `gift_recipient_${tag}`;
  const itemId = "vip_monthly";
  const requestId = `gift_req_${tag}`;
  const itemRef = db.collection("storeCatalog").doc(itemId);
  const versionsRef = db.collection("storeCatalogVersions").doc(itemId).collection("versions");
  const previousItem = await itemRef.get();
  const previousVersions = await versionsRef.get();
  const senderRef = db.collection("users").doc(senderUid);
  const recipientRef = db.collection("users").doc(recipientUid);
  const entitlementRef = recipientRef.collection("entitlements").doc(itemId);
  const giftId = createHash("sha256").update(
    `mawdda-store-gift-v1:${senderUid}:${requestId}`,
  ).digest("hex");
  const giftRef = db.collection("storeGifts").doc(giftId);
  const ledgerRef = senderRef.collection("walletLedger").doc(`store_gift_${giftId}`);
  const auditRef = db.collection("adminAuditLogs").doc(`store_gift_${giftId}`);

  await Promise.all([
    senderRef.set({ profileCompleted: true, accountStatus: "active", coins: 2000 }),
    recipientRef.set({
      profileCompleted: true, accountStatus: "active", coins: 300,
    }),
  ]);
  try {
    const saved = await setStoreCatalogItem.run(ownerRequest("gift-catalog-owner", {
      itemId, name: "عضوية VIP", description: "استحقاق تجريبي للإهداء.",
      category: "vip", priceCoins: 500, durationDays: 7,
      sortOrder: 1, active: true, purchaseEnabled: true,
    }));
    const giftInput = {
      recipientUid, itemId, requestId,
      expectedPriceCoins: 500, expectedCatalogVersion: saved.version,
    };
    const first = await giftStoreItem.run(memberRequest(senderUid, giftInput));
    assert.equal(first.idempotentReplay, false);
    assert.equal(first.priceCoins, 500);
    assert.equal((await senderRef.get()).data().coins, 1500);
    assert.equal((await recipientRef.get()).data().coins, 300,
      "gift recipient is not charged");
    const entitlement = await entitlementRef.get();
    assert.equal(entitlement.data().giftedByUid, senderUid);
    assert.equal(entitlement.data().catalogVersion, saved.version);
    assert.equal(entitlement.data().expiresAt.toMillis(), first.expiresAt);
    const ledger = await ledgerRef.get();
    assert.equal(ledger.data().type, "store_gift_purchase");
    assert.equal(ledger.data().amount, -500);

    const replay = await giftStoreItem.run(memberRequest(senderUid, giftInput));
    assert.equal(replay.idempotentReplay, true);
    assert.equal((await senderRef.get()).data().coins, 1500);
    await assert.rejects(
      () => giftStoreItem.run(memberRequest(senderUid, {
        ...giftInput, recipientUid: `different_${recipientUid}`,
      })),
      (error) => error && error.code === "already-exists",
    );
  } finally {
    await Promise.all([
      giftRef.delete().catch(() => undefined),
      ledgerRef.delete().catch(() => undefined),
      auditRef.delete().catch(() => undefined),
      entitlementRef.delete().catch(() => undefined),
      senderRef.delete().catch(() => undefined),
      recipientRef.delete().catch(() => undefined),
      (async () => {
        await itemRef.delete().catch(() => undefined);
        const versions = await versionsRef.get();
        await Promise.all(versions.docs.map((doc) => doc.ref.delete()));
        if (previousItem.exists) await itemRef.set(previousItem.data());
        await Promise.all(previousVersions.docs.map((doc) => doc.ref.set(doc.data())));
      })(),
    ]);
  }
});
