export const CURRENCY_MINOR_UNIT_EXPONENTS: Readonly<Record<string, number>> = {
  AED: 2, AUD: 2, CAD: 2, CHF: 2, DZD: 2, EGP: 2, EUR: 2, GBP: 2,
  LBP: 2, MAD: 2, NZD: 2, QAR: 2, SAR: 2, SDG: 2, SYP: 2, TRY: 2, USD: 2,
  BHD: 3, IQD: 3, JOD: 3, KWD: 3, LYD: 3, OMR: 3, TND: 3,
  JPY: 0, KRW: 0, VND: 0,
};

export function currencyExponentForCode(value: unknown): number | null {
  if (typeof value !== "string" || !/^[A-Z]{3}$/.test(value)) return null;
  return Object.prototype.hasOwnProperty.call(CURRENCY_MINOR_UNIT_EXPONENTS, value)
    ? CURRENCY_MINOR_UNIT_EXPONENTS[value] : null;
}

/** Validates a positive decimal amount against the selected currency's exact minor-unit precision. */
export function isValidPositiveCurrencyAmount(value: unknown, currency: unknown): boolean {
  const exponent = currencyExponentForCode(currency);
  if (exponent === null || typeof value !== "string") return false;
  const match = /^(?:0|[1-9]\d{0,11})(?:\.(\d{1,4}))?$/.exec(value);
  if (!match || (match[1]?.length ?? 0) > exponent) return false;
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0;
}

export type CoinPackage = {
  packageId: string; name: string; coins: number; priceMinor: number;
  currency: string; currencyExponent: number; active: boolean;
};
export type AdPrice = {
  placementId: string; name: string; billingModel: "cpm" | "cpc" | "daily";
  priceMinor: number; currency: string; currencyExponent: number; active: boolean;
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
        currencyExponentForCode(p.currency) === null || typeof p.active !== "boolean") throw new Error("INVALID_COIN_PACKAGE_FIELDS");
    return { packageId: p.packageId, name: p.name.trim(), coins: p.coins as number,
      priceMinor: p.priceMinor as number, currency: p.currency as string,
      currencyExponent: currencyExponentForCode(p.currency) as number, active: p.active };
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
        currencyExponentForCode(p.currency) === null || typeof p.active !== "boolean") throw new Error("INVALID_AD_PRICE_FIELDS");
    return { placementId: p.placementId, name: p.name.trim(), billingModel: p.billingModel as AdPrice["billingModel"],
      priceMinor: p.priceMinor as number, currency: p.currency as string,
      currencyExponent: currencyExponentForCode(p.currency) as number, active: p.active };
  });
}


export type BilateralCallTariffs = {
  audioTotalCoinsPerMinute: number | null;
  videoTotalCoinsPerMinute: number | null;
};

/**
 * Owner-authored combined per-minute tariffs. Null means deliberately
 * unconfigured/disabled. A configured bilateral total must be a positive,
 * safe, even integer so the server can split it exactly 50/50.
 */
export function validateBilateralCallTariffs(value: unknown): BilateralCallTariffs {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("INVALID_CALL_TARIFFS");
  }
  const data = value as Record<string, unknown>;
  if (Object.keys(data).some((key) =>
    !["audioTotalCoinsPerMinute", "videoTotalCoinsPerMinute"].includes(key))) {
    throw new Error("INVALID_CALL_TARIFFS");
  }
  const validateOne = (amount: unknown): number | null => {
    if (amount === null) return null;
    if (typeof amount !== "number" || !Number.isSafeInteger(amount) ||
        amount <= 0 || amount % 2 !== 0) {
      throw new Error("INVALID_BILATERAL_CALL_TARIFF");
    }
    return amount;
  };
  return {
    audioTotalCoinsPerMinute: validateOne(data.audioTotalCoinsPerMinute),
    videoTotalCoinsPerMinute: validateOne(data.videoTotalCoinsPerMinute),
  };
}


export type EmailVerificationRewardPolicy = {
  enabled: boolean;
  rewardCoins: number;
  cycleDays: number;
};

export function defaultEmailVerificationRewardPolicy(): EmailVerificationRewardPolicy {
  return { enabled: false, rewardCoins: 0, cycleDays: 90 };
}

export function validateEmailVerificationRewardPolicy(value: unknown): EmailVerificationRewardPolicy {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("INVALID_EMAIL_VERIFICATION_REWARD_POLICY");
  }
  const data = value as Record<string, unknown>;
  if (Object.keys(data).some((key) => !["enabled", "rewardCoins", "cycleDays"].includes(key)) ||
      typeof data.enabled !== "boolean" ||
      !Number.isSafeInteger(data.rewardCoins) || (data.rewardCoins as number) < 0 ||
      (data.rewardCoins as number) > 1000000 ||
      !Number.isSafeInteger(data.cycleDays) || (data.cycleDays as number) < 1 ||
      (data.cycleDays as number) > 3650 ||
      (data.enabled && (data.rewardCoins as number) < 1)) {
    throw new Error("INVALID_EMAIL_VERIFICATION_REWARD_POLICY");
  }
  return {
    enabled: data.enabled,
    rewardCoins: data.rewardCoins as number,
    cycleDays: data.cycleDays as number,
  };
}
