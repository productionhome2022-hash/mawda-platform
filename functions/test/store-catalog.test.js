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
    active: true,
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

test("store durations are owner-configurable across the supported range", () => {
  const base = {
    active: true, name: "مدة تجريبية", description: "اختبار مدد الاستحقاق.",
    category: "vip", priceCoins: 100,
  };
  for (const durationDays of [1, 2, 7, 14, 30, 45, 365, 3650]) {
    assert.equal(projectStoreCatalogItem("valid_duration", {
      ...base, durationDays,
    }).durationDays, durationDays);
  }
  for (const durationDays of [0, -1, 3651, 1.5]) {
    assert.equal(projectStoreCatalogItem("invalid_duration", {
      ...base, durationDays,
    }), null, String(durationDays));
  }
  assert.equal(projectStoreCatalogItem("permanent_item", base).durationDays, undefined);
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
    active: true, itemId: "vip_monthly", category: "vip", purchaseEnabled: true, fulfillmentReady: true,
  }), true);
  assert.equal(isStoreItemPurchasable({
    active: true, itemId: "profile_theme_30d", category: "theme", purchaseEnabled: true, fulfillmentReady: false,
  }), false);
  assert.equal(isStoreItemPurchasable({
    active: true, itemId: "profile_theme_30d", category: "theme", purchaseEnabled: true, fulfillmentReady: true,
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
    ["ghost_mode_7d", "privacy"],
  ];
  for (const [itemId, category] of ready) {
    const item = validateStoreCatalogItemInput({
      itemId,
      name: "عنصر مميز",
      description: "استحقاق ملف شخصي.",
      category,
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


test("voice and video call plans are fully connected to call entitlement fulfillment", () => {
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
    const purchasable = validateStoreCatalogItemInput({
      itemId, name: "خطة مكالمات تجريبية", description: "تتطلب استحقاق الطرفين.",
      category, priceCoins, durationDays, active: true, purchaseEnabled: true,
    });
    assert.equal(purchasable.fulfillmentReady, true, itemId);
    assert.equal(purchasable.purchaseEnabled, true, itemId);
    assert.equal(isStoreItemPurchasable(purchasable), true, itemId);
  }
});


test("owner-authored store entitlements accept flexible positive durations", () => {
  const item = validateStoreCatalogItemInput({
    itemId: "media_saver_7d", active: false, name: "Media Saver",
    description: "Test fixture", category: "media_saver",
    priceCoins: 200, durationDays: 43, sortOrder: 10,
    purchaseEnabled: false,
  });
  assert.equal(item.durationDays, 43);
});

test("store entitlements reject non-positive or excessive durations", () => {
  for (const durationDays of [0, -1, 3651, 1.5]) {
    assert.throws(() => validateStoreCatalogItemInput({
      itemId: "media_saver_7d", active: false, name: "Media Saver",
      description: "Test fixture", category: "media_saver",
      priceCoins: 200, durationDays, sortOrder: 10,
      purchaseEnabled: false,
    }), /INVALID_STORE_ITEM_FIELDS/);
  }
});
