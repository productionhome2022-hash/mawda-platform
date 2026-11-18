export type CoinPackage = {
  packageId: string; name: string; coins: number; priceMinor: number;
  currency: "EUR"; active: boolean;
};
export type AdPrice = {
  placementId: string; name: string; billingModel: "cpm" | "cpc" | "daily";
  priceMinor: number; currency: "EUR"; active: boolean;
};
export function validateCoinPackages(value: unknown): CoinPackage[] {
  if (!Array.isArray(value) || value.length > 30) throw new Error("INVALID_COIN_PACKAGES");
  const ids = new Set<string>();
  return value.map((raw) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("INVALID_COIN_PACKAGE");
    const p = raw as Record<string, unknown>;
    if (typeof p.packageId !== "string" || !/^[a-z0-9][a-z0-9_-]{2,40}$/.test(p.packageId) || ids.has(p.packageId)) throw new Error("INVALID_COIN_PACKAGE_ID");
    ids.add(p.packageId);
    if (typeof p.name !== "string" || p.name.trim().length < 3 || p.name.trim().length > 80 ||
        !Number.isSafeInteger(p.coins) || (p.coins as number) < 1 || (p.coins as number) > 1000000000 ||
        !Number.isSafeInteger(p.priceMinor) || (p.priceMinor as number) < 1 || (p.priceMinor as number) > 100000000 ||
        p.currency !== "EUR" || typeof p.active !== "boolean") throw new Error("INVALID_COIN_PACKAGE_FIELDS");
    return { packageId: p.packageId, name: p.name.trim(), coins: p.coins as number,
      priceMinor: p.priceMinor as number, currency: "EUR", active: p.active };
  });
}
export function validateAdPrices(value: unknown): AdPrice[] {
  if (!Array.isArray(value) || value.length > 30) throw new Error("INVALID_AD_PRICES");
  const ids = new Set<string>();
  return value.map((raw) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("INVALID_AD_PRICE");
    const p = raw as Record<string, unknown>;
    if (typeof p.placementId !== "string" || !/^[a-z0-9][a-z0-9_-]{2,40}$/.test(p.placementId) || ids.has(p.placementId)) throw new Error("INVALID_AD_PLACEMENT_ID");
    ids.add(p.placementId);
    if (typeof p.name !== "string" || p.name.trim().length < 3 || p.name.trim().length > 80 ||
        !["cpm", "cpc", "daily"].includes(String(p.billingModel)) ||
        !Number.isSafeInteger(p.priceMinor) || (p.priceMinor as number) < 1 || (p.priceMinor as number) > 100000000 ||
        p.currency !== "EUR" || typeof p.active !== "boolean") throw new Error("INVALID_AD_PRICE_FIELDS");
    return { placementId: p.placementId, name: p.name.trim(), billingModel: p.billingModel as AdPrice["billingModel"],
      priceMinor: p.priceMinor as number, currency: "EUR", active: p.active };
  });
}
