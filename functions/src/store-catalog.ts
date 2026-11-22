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
  voice_call_24h: "voice_call",
  voice_call_7d: "voice_call",
  voice_call_30d: "voice_call",
  video_call_24h: "video_call",
  video_call_7d: "video_call",
  video_call_30d: "video_call",
  media_saver_24h: "media_saver",
  media_saver_7d: "media_saver",
  media_saver_30d: "media_saver",
};

const MEDIA_SAVER_ITEM_DURATIONS: Record<string, number> = {
  media_saver_24h: 1,
  media_saver_7d: 7,
  media_saver_30d: 30,
};

function isStoreFulfillmentReady(itemId: string, category: string): boolean {
  return FULFILLMENT_READY_ITEM_CATEGORIES[itemId] === category;
}

export type StoreCatalogItem = {
  itemId: string;
  version: number | null;
  active: boolean;
  name: string;
  description: string;
  category: string;
  priceCoins: number | null;
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
      !["feature", "avatar", "theme", "title", "vip", "analytics", "discovery", "badge", "frame", "username_style", "profile_layout", "boost", "greeting", "privacy", "media_saver", "voice_call", "video_call"].includes(data.category)) {
    return null;
  }
  const version = data.version ?? null;
  if (version !== null && (!Number.isSafeInteger(version) || (version as number) < 1)) return null;
  const priceCoins = data.priceCoins ?? null;
  if (priceCoins !== null &&
      (typeof priceCoins !== "number" || !Number.isSafeInteger(priceCoins) || priceCoins <= 0)) {
    return null;
  }
  if (data.purchaseEnabled === true && priceCoins === null) return null;
  const durationDays = data.durationDays ?? null;
  if (durationDays !== null &&
      (typeof durationDays !== "number" || !Number.isSafeInteger(durationDays) ||
       (durationDays < 1 || durationDays > 3650))) {
    return null;
  }
  const requiredMediaSaverDuration = MEDIA_SAVER_ITEM_DURATIONS[itemId];
  if (requiredMediaSaverDuration !== undefined && durationDays !== requiredMediaSaverDuration) {
    return null;
  }
  const sortOrder = typeof data.sortOrder === "number" &&
      Number.isSafeInteger(data.sortOrder) ? data.sortOrder : 1000;
  const fulfillmentReady =
    isStoreFulfillmentReady(itemId, data.category) &&
    data.fulfillmentReady === true;
  return {
    itemId,
    version: version as number | null,
    active: true,
    name: data.name.trim(),
    description: data.description.trim(),
    category: data.category,
    priceCoins,
    ...(durationDays !== null ? { durationDays } : {}),
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
  // Project fields without enabling charging first. Owner input validation below
  // must return the precise missing-price / fulfillment error instead of collapsing
  // it into INVALID_STORE_ITEM_FIELDS.
  const projected = projectStoreCatalogItem(itemId, {
    ...value,
    active: true,
    purchaseEnabled: false,
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
  if (purchaseEnabled && projected.priceCoins === null) {
    throw new Error("STORE_PRICE_NOT_CONFIGURED");
  }
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
export function isStoreItemPurchasable(
  value: unknown,
): value is StoreCatalogItem & { version: number; priceCoins: number } {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  return typeof item.itemId === "string" &&
    isStoreFulfillmentReady(item.itemId, String(item.category)) &&
    item.active === true &&
    Number.isSafeInteger(item.version) && (item.version as number) > 0 &&
    item.purchaseEnabled === true &&
    item.fulfillmentReady === true &&
    typeof item.priceCoins === "number" &&
    Number.isSafeInteger(item.priceCoins) &&
    item.priceCoins > 0;
}
