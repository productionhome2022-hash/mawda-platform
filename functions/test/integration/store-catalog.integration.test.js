const test = require("node:test");
const assert = require("node:assert/strict");
const { getFirestore } = require("firebase-admin/firestore");
const { getOwnerStoreCatalog, setStoreCatalogItem } = require("../../lib/index");

const db = getFirestore();
const ownerRequest = (uid, data = {}) => ({
  data,
  auth: { uid, token: { platformOwner: true, platformOwnerUid: uid,
    auth_time: Math.floor(Date.now() / 1000), firebase: { sign_in_second_factor: "phone" } } },
});

test("store catalog owner edits are version-checked and atomically audited", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const suffix = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const uid = `store_owner_${suffix}`;
  const itemId = `test_item_${suffix}`;
  const itemRef = db.collection("storeCatalog").doc(itemId);
  const input = {
    itemId, name: "Test store item", description: "Owner-configurable test fixture.",
    category: "feature", priceCoins: 321, durationDays: 13,
    sortOrder: 999, active: false, purchaseEnabled: false,
  };
  try {
    const created = await setStoreCatalogItem.run(ownerRequest(uid, {
      ...input, expectedVersion: 0,
    }));
    assert.equal(created.version, 1);
    const ownerCatalog = await getOwnerStoreCatalog.run(ownerRequest(uid));
    const saved = ownerCatalog.items.find((entry) => entry.itemId === itemId);
    assert.equal(saved.version, 1);
    assert.equal(saved.durationDays, 13);
    assert.equal(saved.active, false);
    const seededSuggestion = ownerCatalog.items.find((entry) => entry.itemId === "vip_monthly");
    assert.equal(seededSuggestion.active, false);
    assert.equal(seededSuggestion.purchaseEnabled, false,
      "seeded engineering price suggestions must not become member offers");
    await assert.rejects(
      () => setStoreCatalogItem.run(ownerRequest(uid, {
        ...input, priceCoins: 400, expectedVersion: 0,
      })),
      (error) => error && error.code === "aborted",
    );
    const audit = await db.collection("adminAuditLogs")
      .where("itemId", "==", itemId).where("action", "==", "store_catalog_item_created").get();
    assert.equal(audit.size, 1);
    assert.equal(audit.docs[0].data().nextValues.priceCoins, 321);
  } finally {
    const audit = await db.collection("adminAuditLogs").where("itemId", "==", itemId).get();
    await Promise.all([
      itemRef.delete().catch(() => undefined),
      ...audit.docs.map((doc) => doc.ref.delete().catch(() => undefined)),
    ]);
  }
});
