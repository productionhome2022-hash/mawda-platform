const test = require("node:test");
const assert = require("node:assert/strict");
const { projectStoreCatalogItem } = require("../lib/store-catalog");

test("projects only active catalog items with safe display fields", () => {
  assert.deepEqual(projectStoreCatalogItem("vip-30", {
    active: true,
    name: "VIP لمدة شهر",
    description: "شارة VIP وامتيازات الملف المعتمدة.",
    category: "vip",
    priceCoins: 2500,
    durationDays: 30,
    sortOrder: 2,
    internalCost: 999999,
    paymentSecret: "must-not-leak",
  }), {
    itemId: "vip-30",
    name: "VIP لمدة شهر",
    description: "شارة VIP وامتيازات الملف المعتمدة.",
    category: "vip",
    priceCoins: 2500,
    durationDays: 30,
    sortOrder: 2,
    purchaseEnabled: false,
    fulfillmentReady: false,
  });
});

test("rejects unpublished, malformed, and unsafe-price items", () => {
  assert.equal(projectStoreCatalogItem("hidden", { active: false }), null);
  assert.equal(projectStoreCatalogItem("bad-name", {
    active: true, name: "x", description: "", category: "feature", priceCoins: 1,
  }), null);
  assert.equal(projectStoreCatalogItem("bad-price", {
    active: true, name: "ميزة", description: "", category: "feature", priceCoins: -1,
  }), null);
  assert.equal(projectStoreCatalogItem("bad-category", {
    active: true, name: "ميزة", description: "", category: "admin", priceCoins: 100,
  }), null);
  assert.equal(projectStoreCatalogItem("bad-duration", {
    active: true, name: "ميزة", description: "", category: "feature",
    priceCoins: 100, durationDays: 0,
  }), null);
});


test("owner catalog input requires safe identifiers, prices, category and publication state", () => {
  const { validateStoreCatalogItemInput } = require("../lib/store-catalog");
  assert.deepEqual(validateStoreCatalogItemInput({
    itemId: "vip-month",
    name: "VIP لمدة شهر",
    description: "عضوية شهرية.",
    category: "vip",
    priceCoins: 2500,
    durationDays: 30,
    sortOrder: 3,
    active: true,
  }), {
    itemId: "vip-month",
    name: "VIP لمدة شهر",
    description: "عضوية شهرية.",
    category: "vip",
    priceCoins: 2500,
    durationDays: 30,
    sortOrder: 3,
    purchaseEnabled: false,
    fulfillmentReady: false,
    active: true,
  });
  assert.throws(() => validateStoreCatalogItemInput({
    itemId: "../bad", name: "عنصر", description: "", category: "vip",
    priceCoins: 100, active: true,
  }));
  assert.throws(() => validateStoreCatalogItemInput({
    itemId: "vip-month", name: "عنصر", description: "", category: "vip",
    priceCoins: 0, active: true,
  }));
});


test("store charging stays disabled until fulfillment is explicitly ready", () => {
  const { isStoreItemPurchasable } = require("../lib/store-catalog");
  assert.equal(isStoreItemPurchasable({
    active: true, purchaseEnabled: false, fulfillmentReady: false,
  }), false);
  assert.equal(isStoreItemPurchasable({
    active: true, purchaseEnabled: true, fulfillmentReady: false,
  }), false);
  assert.equal(isStoreItemPurchasable({
    active: true, purchaseEnabled: true, fulfillmentReady: true,
  }), true);
  assert.equal(isStoreItemPurchasable({
    active: false, purchaseEnabled: true, fulfillmentReady: true,
  }), false);
});
