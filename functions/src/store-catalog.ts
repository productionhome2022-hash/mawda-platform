export type StoreCatalogItem = {
  itemId: string;
  name: string;
  description: string;
  category: string;
  priceCoins: number;
  durationDays?: number;
  sortOrder: number;
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
      !["feature", "avatar", "theme", "title", "vip", "analytics", "discovery"].includes(data.category)) {
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
  return {
    itemId,
    name: data.name.trim(),
    description: data.description.trim(),
    category: data.category,
    priceCoins: data.priceCoins,
    ...(typeof durationDays === "number" ? { durationDays } : {}),
    sortOrder,
  };
}
