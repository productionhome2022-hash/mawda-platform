const FULFILLMENT_READY_ITEM_CATEGORIES: Record<string, string> = {
  vip_monthly: "vip",
  title_custom: "title",
  badge_special: "badge",
  avatar_frame_30d: "frame",
  username_color_30d: "username_style",
  username_animated_30d: "username_style",
  profile_analytics_30d: "analytics",
  profile_layout_30d: "profile_layout",
  profile_pin_30d: "profile_layout",
  discovery_boost_7d: "boost",
  profile_theme_30d: "theme",
  visitor_greeting_30d: "greeting",
};

function isStoreFulfillmentReady(itemId: string, category: string): boolean {
  return FULFILLMENT_READY_ITEM_CATEGORIES[itemId] === category;
}

export type StoreCatalogItem = {
  itemId: string;
  active: boolean;
  name: string;
  description: string;
  category: string;
  priceCoins: number;
  durationDays?: number;
  sortOrder: number;
  purchaseEnabled: boolean;
  fulfillmentReady: boolean;
};

/** Projects only published, display-safe catalog fields. */
export function projectStoreCatalogItem(
  itemId: string,
  data: Record<string, unknown>,
): StoreCatalogItem | null {
  if (data.active !== true) return null;
  if (typeof data.name !== "string" || data.name.trim().length < 2 || data.name.trim().length > 80) {
    return null;
  }
  if (typeof data.description !== "string" || data.description.length > 500) return null;
  if (typeof data.category !== "string" ||
      !["feature", "avatar", "theme", "title", "vip", "analytics", "discovery", "badge", "frame", "username_style", "profile_layout", "boost", "greeting", "privacy"].includes(data.category)) {
    return null;
  }
  if (typeof data.priceCoins !== "number" ||
      !Number.isSafeInteger(data.priceCoins) ||
      data.priceCoins <= 0) {
    return null;
  }
  const durationDays = data.durationDays;
  if (durationDays !== undefined &&
      (typeof durationDays !== "number" || !Number.isSafeInteger(durationDays) ||
       durationDays < 1 || durationDays > 3650)) {
    return null;
  }
  const sortOrder = typeof data.sortOrder === "number" &&
      Number.isSafeInteger(data.sortOrder) ? data.sortOrder : 1000;
  const fulfillmentReady =
    isStoreFulfillmentReady(itemId, data.category) &&
    data.fulfillmentReady === true;
  return {
    itemId,
    active: true,
    name: data.name.trim(),
    description: data.description.trim(),
    category: data.category,
    priceCoins: data.priceCoins,
    ...(typeof durationDays === "number" ? { durationDays } : {}),
    sortOrder,
    purchaseEnabled: fulfillmentReady && data.purchaseEnabled === true,
    fulfillmentReady,
  };
}


export type ValidatedStoreCatalogInput = StoreCatalogItem & { active: boolean };

/** Validates the complete owner-authored catalog record before persistence. */
export function validateStoreCatalogItemInput(input: unknown): ValidatedStoreCatalogInput {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("INVALID_STORE_ITEM");
  }
  const value = input as Record<string, unknown>;
  const itemId = value.itemId;
  if (typeof itemId !== "string" || !/^[a-z0-9][a-z0-9_-]{2,63}$/.test(itemId)) {
    throw new Error("INVALID_STORE_ITEM_ID");
  }
  if (typeof value.active !== "boolean") throw new Error("INVALID_STORE_ACTIVE");
  if (value.purchaseEnabled !== undefined && typeof value.purchaseEnabled !== "boolean") {
    throw new Error("INVALID_STORE_PURCHASE_ENABLED");
  }
  const projected = projectStoreCatalogItem(itemId, {
    ...value,
    active: true,
  });
  if (!projected) throw new Error("INVALID_STORE_ITEM_FIELDS");
  const sortOrder = value.sortOrder === undefined ? 1000 : value.sortOrder;
  if (typeof sortOrder !== "number" || !Number.isSafeInteger(sortOrder) ||
      sortOrder < -100000 || sortOrder > 100000) {
    throw new Error("INVALID_STORE_SORT_ORDER");
  }
  // Only item IDs with a shipped, server-authorized profile consumer may be enabled.
  // Privacy add-ons remain fail-closed until their visibility semantics are implemented.
  const fulfillmentReady = isStoreFulfillmentReady(projected.itemId, projected.category);
  const purchaseEnabled = value.purchaseEnabled === true;
  if (purchaseEnabled && !fulfillmentReady) {
    throw new Error("STORE_FULFILLMENT_NOT_READY");
  }
  return {
    ...projected,
    active: value.active,
    sortOrder,
    purchaseEnabled,
    fulfillmentReady,
  };
}


/** Charging is denied unless the catalog entry is published and fulfillment is explicitly ready. */
export function isStoreItemPurchasable(value: unknown): boolean {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  return typeof item.itemId === "string" &&
    isStoreFulfillmentReady(item.itemId, String(item.category)) &&
    item.active === true &&
    item.purchaseEnabled === true &&
    item.fulfillmentReady === true;
}
