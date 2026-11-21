const test = require("node:test");
const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const { getFirestore } = require("firebase-admin/firestore");
const {
  grantStoreEntitlement,
  bulkGrantStoreEntitlements,
  getMyEntitlementGrantHistory,
  purchaseStoreItem,
} = require("../../lib/index");

const db = getFirestore();
const suffix = () => `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
const memberRequest = (uid, data = {}) => ({ data, auth: { uid, token: { firebase: { sign_in_provider: "password" } } } });
const ownerRequest = (uid, data) => ({
  data,
  auth: { uid, token: {
    platformOwner: true,
    platformOwnerUid: uid,
    auth_time: Math.floor(Date.now() / 1000),
    firebase: { sign_in_second_factor: "phone" },
  } },
});
const makeGrantId = (requestId, uid) =>
  createHash("sha256").update(`mawdda-owner-grant-v1:${requestId}:${uid}`).digest("hex");

test("owner free grant is MFA-gated, audited, coin-neutral, idempotent and repeatable", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const ownerUid = `grant_owner_${tag}`;
  const memberUid = `grant_member_${tag}`;
  const itemId = "vip_monthly";
  const requestId = `owner_grant_${tag}`;
  const grantId = makeGrantId(requestId, memberUid);
  const secondRequestId = `owner_grant_again_${tag}`;
  const secondGrantId = makeGrantId(secondRequestId, memberUid);
  const memberRef = db.collection("users").doc(memberUid);
  const itemRef = db.collection("storeCatalog").doc(itemId);
  const entitlementRef = memberRef.collection("entitlements").doc(itemId);
  const grantRef = db.collection("ownerEntitlementGrants").doc(grantId);
  const ledgerRef = memberRef.collection("entitlementGrantLedger").doc(grantId);
  const auditRef = db.collection("adminAuditLogs").doc(`owner_entitlement_grant_${grantId}`);
  const secondGrantRef = db.collection("ownerEntitlementGrants").doc(secondGrantId);
  const secondLedgerRef = memberRef.collection("entitlementGrantLedger").doc(secondGrantId);
  const secondAuditRef = db.collection("adminAuditLogs").doc(`owner_entitlement_grant_${secondGrantId}`);

  await Promise.all([
    memberRef.set({ uid: memberUid, profileCompleted: true, accountStatus: "active", coins: 4321 }),
    itemRef.set({
      itemId, name: "VIP", description: "Owner free-grant integration fixture",
      category: "vip", version: 1, priceCoins: 900, durationDays: 30, sortOrder: 1,
      active: true, purchaseEnabled: true, fulfillmentReady: true,
    }),
  ]);

  try {
    const before = Date.now();
    const input = {
      memberUid, itemId, requestId, durationHours: 24,
      reason: "Approved owner goodwill grant",
    };
    const first = await grantStoreEntitlement.run(ownerRequest(ownerUid, input));
    assert.equal(first.status, "granted");
    assert.equal(first.idempotentReplay, false);
    assert.ok(first.expiresAt >= before + 24 * 60 * 60 * 1000 - 5000);
    assert.ok(first.expiresAt <= Date.now() + 24 * 60 * 60 * 1000 + 5000);

    const [member, entitlement, grant, ledger, audit] = await Promise.all([
      memberRef.get(), entitlementRef.get(), grantRef.get(), ledgerRef.get(), auditRef.get(),
    ]);
    assert.equal(member.data().coins, 4321, "free entitlement grants never debit coins");
    assert.equal(entitlement.data().status, "active");
    assert.equal(entitlement.data().grantSource, "platform_owner");
    assert.equal(entitlement.data().grantId, grantId);
    assert.equal(grant.data().status, "granted");
    assert.equal(ledger.data().type, "owner_entitlement_grant");
    assert.equal(audit.data().action, "owner_entitlement_granted");
    assert.equal((await memberRef.collection("walletLedger").get()).size, 0);

    const replay = await grantStoreEntitlement.run(ownerRequest(ownerUid, input));
    assert.equal(replay.idempotentReplay, true);
    assert.equal(replay.expiresAt, first.expiresAt);
    assert.equal((await entitlementRef.get()).data().expiresAt.toMillis(), first.expiresAt);

    const second = await grantStoreEntitlement.run(ownerRequest(ownerUid, {
      ...input, requestId: secondRequestId, durationHours: 24,
    }));
    assert.equal(second.idempotentReplay, false);
    assert.ok(second.expiresAt >= first.expiresAt + 24 * 60 * 60 * 1000 - 1000);
    assert.equal((await memberRef.get()).data().coins, 4321);

    // Expire the current grant and purchase the same item. Replaying the first
    // grant must not overwrite the newer paid entitlement.
    await entitlementRef.update({ expiresAt: new Date(Date.now() - 1000) });
    await itemRef.update({ purchaseEnabled: true });
    const purchaseRequestId = `purchase_after_grant_${tag}`;
    const purchaseId = `${memberUid}_${purchaseRequestId}`;
    const purchaseLedgerRef = memberRef.collection("walletLedger").doc(`store_${purchaseId}`);
    const purchase = await purchaseStoreItem.run(memberRequest(memberUid, {
      itemId, requestId: purchaseRequestId, expectedPriceCoins: 900,
    }));
    assert.equal(purchase.idempotentReplay, false);
    assert.equal(purchase.newBalance, 3421);
    assert.equal((await entitlementRef.get()).data().purchaseId, purchaseId);

    const replayAfterPurchase = await grantStoreEntitlement.run(ownerRequest(ownerUid, input));
    assert.equal(replayAfterPurchase.idempotentReplay, true);
    assert.equal((await entitlementRef.get()).data().purchaseId, purchaseId);
    assert.equal((await memberRef.get()).data().coins, 3421);

    await auditRef.delete();
    await assert.rejects(
      () => grantStoreEntitlement.run(ownerRequest(ownerUid, input)),
      (error) => error && error.code === "failed-precondition",
    );
    assert.equal((await entitlementRef.get()).data().purchaseId, purchaseId);

    const history = await getMyEntitlementGrantHistory.run(memberRequest(memberUid));
    assert.equal(history.entries.length, 2);
    assert.ok(history.entries.every((entry) => entry.itemId === itemId));
    assert.ok(history.entries.every((entry) => !("reason" in entry) && !("actorUid" in entry)));
  } finally {
    await Promise.all([
      db.recursiveDelete(memberRef).catch(() => undefined),
      itemRef.delete().catch(() => undefined),
      grantRef.delete().catch(() => undefined),
      ledgerRef.delete().catch(() => undefined),
      auditRef.delete().catch(() => undefined),
      db.collection("storePurchases").doc(`${memberUid}_purchase_after_grant_${tag}`).delete().catch(() => undefined),
      memberRef.collection("walletLedger").doc(`store_${memberUid}_purchase_after_grant_${tag}`).delete().catch(() => undefined),
      secondGrantRef.delete().catch(() => undefined),
      secondLedgerRef.delete().catch(() => undefined),
      secondAuditRef.delete().catch(() => undefined),
    ]);
  }
});

test("bulk owner grants report partial failures and safely replay successful targets", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const ownerUid = `bulk_grant_owner_${tag}`;
  const memberA = `bulk_grant_a_${tag}`;
  const memberB = `bulk_grant_b_${tag}`;
  const missing = `bulk_grant_missing_${tag}`;
  const itemId = "title_custom";
  const requestId = `bulk_grant_${tag}`;
  const memberRefs = [db.collection("users").doc(memberA), db.collection("users").doc(memberB)];
  const itemRef = db.collection("storeCatalog").doc(itemId);
  const targetUids = [memberA, memberB, missing];
  const grantIds = targetUids.map((uid) => makeGrantId(requestId, uid));

  await Promise.all([
    memberRefs[0].set({ uid: memberA, accountStatus: "active", coins: 100 }),
    memberRefs[1].set({ uid: memberB, accountStatus: "active", coins: 200 }),
    itemRef.set({
      itemId, name: "Custom title", description: "Bulk owner free-grant fixture",
      category: "title", priceCoins: 100, durationDays: 30, sortOrder: 2,
      active: true, purchaseEnabled: false, fulfillmentReady: true,
    }),
  ]);

  try {
    const input = {
      targetUids, itemId, requestId, durationHours: 168,
      reason: "Approved bulk owner grant",
    };
    const first = await bulkGrantStoreEntitlements.run(ownerRequest(ownerUid, input));
    assert.equal(first.total, 3);
    assert.equal(first.granted, 2);
    assert.equal(first.failed, 1);
    assert.equal(first.replayed, 0);
    assert.deepEqual(first.results.map((result) => result.status), ["granted", "granted", "failed"]);
    assert.equal(first.results[2].errorCode, "not-found");

    const replay = await bulkGrantStoreEntitlements.run(ownerRequest(ownerUid, input));
    assert.equal(replay.granted, 2);
    assert.equal(replay.replayed, 2);
    assert.equal(replay.failed, 1);
    assert.equal((await memberRefs[0].get()).data().coins, 100);
    assert.equal((await memberRefs[1].get()).data().coins, 200);
    assert.equal((await memberRefs[0].collection("entitlementGrantLedger").get()).size, 1);
    assert.equal((await memberRefs[1].collection("entitlementGrantLedger").get()).size, 1);
  } finally {
    await Promise.all([
      ...memberRefs.map((ref) => db.recursiveDelete(ref).catch(() => undefined)),
      itemRef.delete().catch(() => undefined),
      ...grantIds.map((id) => db.collection("ownerEntitlementGrants").doc(id).delete().catch(() => undefined)),
      ...grantIds.map((id) => db.collection("adminAuditLogs").doc(`owner_entitlement_grant_${id}`).delete().catch(() => undefined)),
    ]);
  }
});

test("bulk owner grant rejects duplicate target IDs and unsupported duration values", async () => {
  const ownerUid = `bulk_validation_owner_${suffix()}`;
  const base = {
    itemId: "vip_monthly", requestId: `invalid_grant_${suffix()}`,
    durationHours: 24, reason: "Approved test reason",
  };
  await assert.rejects(
    () => bulkGrantStoreEntitlements.run(ownerRequest(ownerUid, { ...base, targetUids: ["same", "same"] })),
    (error) => error && error.code === "invalid-argument",
  );
  await assert.rejects(
    () => grantStoreEntitlement.run(ownerRequest(ownerUid, { ...base, memberUid: "member", durationHours: 48 })),
    (error) => error && error.code === "invalid-argument",
  );
  await assert.rejects(
    () => grantStoreEntitlement.run(ownerRequest(ownerUid, { ...base, memberUid: "bad/member" })),
    (error) => error && error.code === "invalid-argument",
  );
});
