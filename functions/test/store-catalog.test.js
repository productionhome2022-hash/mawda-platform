const { DEFAULT_STORE_CATALOG } = require("../lib/default-store-catalog");
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
    version: null,
    internalCost: 999999,
    paymentSecret: "must-not-leak",
  }), {
    itemId: "vip-30",
    active: true,
    name: "VIP لمدة شهر",
    description: "شارة VIP وامتيازات الملف المعتمدة.",
    category: "vip",
    priceCoins: 2500,
    durationDays: 30,
    sortOrder: 2,
    version: null,
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
  assert.equal(projectStoreCatalogItem("custom-duration", {
    active: true, name: "ميزة", description: "", category: "feature",
    priceCoins: 100, durationDays: 2,
  }).durationDays, 2);
  assert.equal(projectStoreCatalogItem("maximum-duration", {
    active: true, name: "ميزة", description: "", category: "feature",
    priceCoins: 100, durationDays: 3650,
  }).durationDays, 3650);
  assert.equal(projectStoreCatalogItem("too-long-duration", {
    active: true, name: "ميزة", description: "", category: "feature",
    priceCoins: 100, durationDays: 3651,
  }), null);
  const { validateStoreCatalogItemInput } = require("../lib/store-catalog");
  for (const durationDays of [2, 14, 365, 3650]) {
    assert.equal(validateStoreCatalogItemInput({
      itemId: "vip_monthly", name: "عنصر", description: "عنصر تجريبي.",
      category: "vip", priceCoins: 100, durationDays, active: true,
    }).durationDays, durationDays);
  }
  assert.throws(() => validateStoreCatalogItemInput({
    itemId: "vip_monthly", name: "عنصر", description: "عنصر تجريبي.",
    category: "vip", priceCoins: 100, durationDays: 3651, active: true,
  }), /INVALID_STORE_ITEM_FIELDS/);
});


test("owner catalog input requires safe identifiers, prices, category and publication state", () => {
  const { validateStoreCatalogItemInput } = require("../lib/store-catalog");
  assert.deepEqual(validateStoreCatalogItemInput({
    itemId: "vip_monthly",
    name: "VIP لمدة شهر",
    description: "عضوية شهرية.",
    category: "vip",
    priceCoins: 2500,
    durationDays: 30,
    sortOrder: 3,
    active: true,
  }), {
    itemId: "vip_monthly",
    name: "VIP لمدة شهر",
    description: "عضوية شهرية.",
    category: "vip",
    priceCoins: 2500,
    durationDays: 30,
    sortOrder: 3,
    version: null,
    purchaseEnabled: false,
    fulfillmentReady: true,
    active: true,
  });
  assert.throws(() => validateStoreCatalogItemInput({
    itemId: "../bad", name: "عنصر", description: "", category: "vip",
    priceCoins: 100, active: true,
  }));
  assert.throws(() => validateStoreCatalogItemInput({
    itemId: "vip_monthly", name: "عنصر", description: "", category: "vip",
    priceCoins: 0, active: true,
  }));
  assert.throws(() => validateStoreCatalogItemInput({
    itemId: "vip_monthly", name: "عنصر", description: "", category: "vip",
    priceCoins: 100, active: true, purchaseEnabled: "yes",
  }), /INVALID_STORE_PURCHASE_ENABLED/);
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
    active: true, version: 1, itemId: "vip_monthly", category: "vip", priceCoins: 500,
    purchaseEnabled: true, fulfillmentReady: true,
  }), true);
  assert.equal(isStoreItemPurchasable({
    active: true, itemId: "profile_theme_30d", category: "theme", purchaseEnabled: true, fulfillmentReady: false,
  }), false);
  assert.equal(isStoreItemPurchasable({
    active: true, version: 1, itemId: "profile_theme_30d", category: "theme", priceCoins: 500,
    purchaseEnabled: true, fulfillmentReady: true,
  }), true);
  assert.equal(isStoreItemPurchasable({
    active: true, itemId: "avatar_frame_30d", category: "vip", purchaseEnabled: true, fulfillmentReady: true,
  }), false);
  assert.equal(isStoreItemPurchasable({
    active: false, purchaseEnabled: true, fulfillmentReady: true,
  }), false);
});


test("only shipped premium profile consumers can be explicitly enabled for purchase", () => {
  const { validateStoreCatalogItemInput, projectStoreCatalogItem, isStoreItemPurchasable } = require("../lib/store-catalog");
  const ready = [
    ["vip_monthly", "vip"],
    ["title_custom", "title"],
    ["badge_special", "badge"],
    ["avatar_frame_30d", "frame"],
    ["username_color_30d", "username_style"],
    ["username_animated_30d", "username_style"],
    ["profile_analytics_30d", "analytics"],
    ["profile_layout_30d", "profile_layout"],
    ["profile_pin_30d", "profile_layout"],
    ["discovery_boost_7d", "boost"],
    ["profile_theme_30d", "theme"],
    ["visitor_greeting_30d", "greeting"],
    ["voice_call_24h", "voice_call"], ["voice_call_7d", "voice_call"], ["voice_call_30d", "voice_call"],
    ["video_call_24h", "video_call"], ["video_call_7d", "video_call"], ["video_call_30d", "video_call"],
  ];
  for (const [itemId, category] of ready) {
    const item = validateStoreCatalogItemInput({
      itemId,
      name: "عنصر مميز",
      description: "استحقاق ملف شخصي.",
      category,
      version: 1,
      priceCoins: 500,
      durationDays: 30,
      sortOrder: 1,
      active: true,
      purchaseEnabled: true,
    });
    assert.equal(item.purchaseEnabled, true, itemId);
    assert.equal(item.fulfillmentReady, true, itemId);
    assert.equal(isStoreItemPurchasable(item), true, itemId);
  }
  assert.throws(() => validateStoreCatalogItemInput({
    itemId: "hide_coins_30d",
    name: "إخفاء الرصيد",
    description: "إخفاء الرصيد.",
    category: "privacy",
    priceCoins: 500,
    durationDays: 30,
    sortOrder: 1,
    active: true,
    purchaseEnabled: true,
  }), /STORE_FULFILLMENT_NOT_READY/);
  const tampered = projectStoreCatalogItem("avatar_frame_30d", {
    active: true,
    name: "إطار",
    description: "إطار رمزي.",
    category: "frame",
    priceCoins: 500,
    purchaseEnabled: true,
    fulfillmentReady: true,
  });
  assert.equal(tampered.purchaseEnabled, true);
  assert.equal(tampered.fulfillmentReady, true);
});


test("voice and video call plans have shipped server fulfillment but remain unpublished by default", () => {
  const { validateStoreCatalogItemInput, isStoreItemPurchasable } = require("../lib/store-catalog");
  const plans = [
    ["voice_call_24h", "voice_call", 100, 1],
    ["voice_call_7d", "voice_call", 500, 7],
    ["voice_call_30d", "voice_call", 1500, 30],
    ["video_call_24h", "video_call", 250, 1],
    ["video_call_7d", "video_call", 1250, 7],
    ["video_call_30d", "video_call", 3750, 30],
  ];
  for (const [itemId, category, priceCoins, durationDays] of plans) {
    const item = validateStoreCatalogItemInput({
      itemId, name: "خطة مكالمات تجريبية", description: "تتطلب استحقاق الطرفين.",
      category, priceCoins, durationDays, active: false, purchaseEnabled: false,
    });
    assert.equal(item.fulfillmentReady, true, itemId);
    assert.equal(item.purchaseEnabled, false, itemId);
    assert.equal(isStoreItemPurchasable(item), false, itemId);
    // Persisted catalog records receive a positive version from setStoreCatalogItem.
    const published = validateStoreCatalogItemInput({
      itemId, name: "خطة مكالمات تجريبية", description: "تتطلب استحقاق الطرفين.",
      category, version: 1, priceCoins, durationDays, active: true, purchaseEnabled: true,
    });
    assert.equal(published.fulfillmentReady, true, itemId);
    assert.equal(isStoreItemPurchasable(published), true, itemId);
  }
});

test("unpriced owner catalog drafts remain displayable but cannot be purchased", () => {
  const { validateStoreCatalogItemInput, projectStoreCatalogItem, isStoreItemPurchasable } = require("../lib/store-catalog");
  const draft = validateStoreCatalogItemInput({
    itemId: "vip_monthly", name: "VIP", description: "امتيازات العضوية.",
    category: "vip", priceCoins: null, sortOrder: 1, active: true, purchaseEnabled: false,
  });
  assert.equal(draft.priceCoins, null);
  assert.equal(draft.purchaseEnabled, false);
  assert.equal(isStoreItemPurchasable(draft), false);
  assert.equal(projectStoreCatalogItem("vip_monthly", {
    ...draft, purchaseEnabled: true, fulfillmentReady: true,
  }), null);
  assert.throws(() => validateStoreCatalogItemInput({
    itemId: "vip_monthly", name: "VIP", description: "امتيازات العضوية.",
    category: "vip", priceCoins: null, sortOrder: 1, active: true, purchaseEnabled: true,
  }), /STORE_PRICE_NOT_CONFIGURED/);
});

test("store duration may be omitted or explicitly cleared by the owner", () => {
  const { validateStoreCatalogItemInput } = require("../lib/store-catalog");
  const item = validateStoreCatalogItemInput({
    itemId: "vip_monthly", name: "VIP", description: "امتيازات العضوية.",
    category: "vip", priceCoins: 500, durationDays: null,
    sortOrder: 1, active: true, purchaseEnabled: false,
  });
  assert.equal(Object.hasOwn(item, "durationDays"), false);
});


test("Super Owner may configure custom product durations within the safe ten-year ceiling", () => {
  const { validateStoreCatalogItemInput } = require("../lib/store-catalog");
  const base = {
    itemId: "vip_monthly", name: "VIP مخصص", description: "مدة قابلة للتعديل من المالك.",
    category: "vip", priceCoins: 900, sortOrder: 1, active: true, purchaseEnabled: false,
  };
  assert.equal(validateStoreCatalogItemInput({ ...base, durationDays: 3650 }).durationDays, 3650);
  assert.throws(() => validateStoreCatalogItemInput({ ...base, durationDays: 3651 }), /INVALID_STORE_ITEM_FIELDS/);
});


test("every seeded shop item has a provisional price and any temporary term is bounded", () => {
  assert.ok(DEFAULT_STORE_CATALOG.length > 0);
  const ids = new Set();
  for (const item of DEFAULT_STORE_CATALOG) {
    assert.ok(!ids.has(item.itemId), item.itemId);
    ids.add(item.itemId);
    assert.ok(Number.isSafeInteger(item.priceCoins) && item.priceCoins > 0, item.itemId);
    if (item.durationDays !== undefined) {
      assert.ok(Number.isSafeInteger(item.durationDays), item.itemId);
      assert.ok(item.durationDays >= 1 && item.durationDays <= 3650, item.itemId);
    }
  }
});
