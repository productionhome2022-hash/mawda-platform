const test = require("node:test");
const assert = require("node:assert/strict");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const { createHash } = require("node:crypto");
const { setStoreCatalogItem, giftStoreItem } = require("../../lib/index");

const db = getFirestore();
const auth = getAuth();
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
  const otherRecipientUid = `gift_other_recipient_${tag}`;
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
    await auth.createUser({ uid: recipientUid, email: `${recipientUid}@example.test`, emailVerified: true });
    const saved = await setStoreCatalogItem.run(ownerRequest("gift-catalog-owner", {
      itemId, name: "عضوية VIP", description: "استحقاق تجريبي للإهداء.",
      category: "vip", priceCoins: 500, durationDays: 7,
      sortOrder: 1, active: true, purchaseEnabled: true,
    }));
    const catalogSnapshot = await versionsRef.doc(String(saved.version)).get();
    assert.equal(catalogSnapshot.exists, true);
    assert.equal(catalogSnapshot.data().itemId, itemId);
    assert.equal(catalogSnapshot.data().priceCoins, 500);
    assert.equal(catalogSnapshot.data().version, saved.version);
    const giftInput = {
      recipientUid, itemId, requestId,
      expectedPriceCoins: 500, expectedCatalogVersion: saved.version,
    };
    // Race two identical requests to exercise Firestore transaction retries:
    // exactly one request may debit the sender; the other must resolve as a replay.
    const concurrentResults = await Promise.all([
      giftStoreItem.run(memberRequest(senderUid, giftInput)),
      giftStoreItem.run(memberRequest(senderUid, giftInput)),
    ]);
    assert.equal(concurrentResults.length, 2);
    assert.equal(concurrentResults.filter((result) => result.idempotentReplay === false).length, 1);
    assert.equal(concurrentResults.filter((result) => result.idempotentReplay === true).length, 1);
    const first = concurrentResults.find((result) => result.idempotentReplay === false);
    assert.ok(first);
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
        ...giftInput, recipientUid: otherRecipientUid,
      })),
      (error) => error && error.code === "already-exists",
    );
    await assert.rejects(
      () => giftStoreItem.run(memberRequest(senderUid, {
        recipientUid, itemId, requestId: `missing_version_${tag}`,
        expectedPriceCoins: 500,
      })),
      (error) => error && error.code === "invalid-argument",
    );

    const updated = await setStoreCatalogItem.run(ownerRequest("gift-catalog-owner", {
      itemId, name: "عضوية VIP", description: "إصدار أحدث لاختبار السعر.",
      category: "vip", priceCoins: 600, durationDays: 14,
      sortOrder: 1, active: true, purchaseEnabled: true,
    }));
    assert.ok(updated.version > saved.version);

    await assert.rejects(
      () => giftStoreItem.run(memberRequest(senderUid, {
        recipientUid, itemId, requestId: `stale_version_${tag}`,
        expectedPriceCoins: 500, expectedCatalogVersion: saved.version,
      })),
      (error) => error && error.code === "failed-precondition",
    );
    await assert.rejects(
      () => giftStoreItem.run(memberRequest(senderUid, {
        recipientUid, itemId: "unknown_sku",
        requestId: `unknown_sku_${tag}`,
        expectedPriceCoins: 600, expectedCatalogVersion: updated.version,
      })),
      (error) => error && error.code === "failed-precondition",
    );
    await assert.rejects(
      () => giftStoreItem.run(memberRequest(senderUid, {
        recipientUid, itemId, requestId: `stale_price_${tag}`,
        expectedPriceCoins: 500, expectedCatalogVersion: updated.version,
      })),
      (error) => error && error.code === "failed-precondition",
    );
    assert.equal((await senderRef.get()).data().coins, 1500,
      "malformed, unknown-SKU, stale-version and stale-price requests must not debit the sender");
    assert.equal((await db.collection("storeGifts").where("senderUid", "==", senderUid).get()).size, 1,
      "rejected requests must not create additional gift receipts");

  } finally {
    await Promise.all([
      giftRef.delete().catch(() => undefined),
      ledgerRef.delete().catch(() => undefined),
      auditRef.delete().catch(() => undefined),
      auth.deleteUser(recipientUid).catch(() => undefined),
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


test("store gift preserves permanent entitlements and rejects ineligible recipients", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const senderUid = `gift_permanent_sender_${tag}`;
  const recipientUid = `gift_permanent_recipient_${tag}`;
  const blockedRecipientUid = `gift_suspended_recipient_${tag}`;
  const itemId = "vip_monthly";
  const requestId = `giftperm_req_${tag}`;
  const itemRef = db.collection("storeCatalog").doc(itemId);
  const versionsRef = db.collection("storeCatalogVersions").doc(itemId).collection("versions");
  const senderRef = db.collection("users").doc(senderUid);
  const recipientRef = db.collection("users").doc(recipientUid);
  const blockedRecipientRef = db.collection("users").doc(blockedRecipientUid);
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
      profileCompleted: true, accountStatus: "active", coins: 50,
    }),
    blockedRecipientRef.set({
      profileCompleted: true, accountStatus: "suspended", coins: 50,
    }),
    blockedUsernameRef.set({ uid: blockedRecipientUid, username: blockedUsername }),
  ]);
  try {
    await Promise.all([
      auth.createUser({ uid: recipientUid, email: `${recipientUid}@example.test`, emailVerified: true }),
      auth.createUser({ uid: blockedRecipientUid, email: `${blockedRecipientUid}@example.test`, emailVerified: true }),
    ]);
    const saved = await setStoreCatalogItem.run(ownerRequest("gift-permanent-catalog-owner", {
      itemId, name: "عضوية دائمة", description: "استحقاق دائم للاختبار.",
      category: "vip", priceCoins: 700, durationDays: null,
      sortOrder: 1, active: true, purchaseEnabled: true,
    }));
    const result = await giftStoreItem.run(memberRequest(senderUid, {
      recipientUid, itemId, requestId,
      expectedPriceCoins: 700, expectedCatalogVersion: saved.version,
    }));
    assert.equal(result.idempotentReplay, false);
    assert.equal(result.priceCoins, 700);
    assert.equal(result.expiresAt, null);
    assert.equal((await senderRef.get()).data().coins, 1300);
    assert.equal((await recipientRef.get()).data().coins, 50);
    const entitlement = await entitlementRef.get();
    assert.equal(entitlement.data().status, "active");
    assert.equal(entitlement.data().expiresAt, null);
    assert.equal(entitlement.data().catalogVersion, saved.version);
    const gift = await giftRef.get();
    assert.equal(gift.data().expiresAt, null);
    assert.equal(gift.data().durationDays, null);
    const ledger = await ledgerRef.get();
    assert.equal(ledger.data().amount, -700);
    assert.equal(ledger.data().recipientUid, recipientUid);
    const replay = await giftStoreItem.run(memberRequest(senderUid, {
      recipientUid, itemId, requestId,
      expectedPriceCoins: 700, expectedCatalogVersion: saved.version,
    }));
    assert.equal(replay.idempotentReplay, true);
    await assert.rejects(
      () => giftStoreItem.run(memberRequest(senderUid, {
        recipientUid: blockedRecipientUid, itemId,
        requestId: `blocked_req_${tag}`,
        expectedPriceCoins: 700, expectedCatalogVersion: saved.version,
      })),
      (error) => error && error.code === "failed-precondition",
    );
    assert.equal((await senderRef.get()).data().coins, 1300,
      "an ineligible recipient must not cause a sender debit");
    assert.equal((await db.collection("storeGifts").where("senderUid", "==", senderUid).get()).size, 1);
  } finally {
    await Promise.all([
      giftRef.delete().catch(() => undefined),
      ledgerRef.delete().catch(() => undefined),
      auditRef.delete().catch(() => undefined),
      auth.deleteUser(recipientUid).catch(() => undefined),
      auth.deleteUser(blockedRecipientUid).catch(() => undefined),
      entitlementRef.delete().catch(() => undefined),
      senderRef.delete().catch(() => undefined),
      recipientRef.delete().catch(() => undefined),
      blockedRecipientRef.delete().catch(() => undefined),
      itemRef.delete().catch(() => undefined),
      (async () => {
        const versions = await versionsRef.get();
        await Promise.all(versions.docs.map((doc) => doc.ref.delete()));
      })(),
    ]);
  }
});
