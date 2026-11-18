export const ECONOMIC_PAYMENT_SERVICES = [
  "coin_purchases",
  "featured_ads",
  "public_ads",
  "influencer_services",
  "store_entitlements",
] as const;

export type EconomicPaymentService = typeof ECONOMIC_PAYMENT_SERVICES[number];

// These are the only manual-payment flows whose request, owner-attestation,
// ledger/fulfilment and audit paths currently exist end-to-end. Keep the
// remaining service switches fail-closed until their workflows are integrated.
export const MANUAL_PAYMENT_READY_SERVICES = [
  "coin_purchases",
  "featured_ads",
] as const;
export interface EconomicPaymentModes {
  manualEnabled: boolean;
  automatedEnabled: false;
}
export type EconomicPaymentPolicy = Record<EconomicPaymentService, EconomicPaymentModes>;

export class EconomicPaymentPolicyError extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = "EconomicPaymentPolicyError";
  }
}

function disabledModes(): EconomicPaymentModes {
  return { manualEnabled: false, automatedEnabled: false };
}

/**
 * Validate the owner-configurable per-service payment switches.
 * Automated checkout intentionally fails closed until a provider adapter,
 * signed webhook verification, reconciliation and owner activation exist.
 */
export function validateEconomicPaymentPolicy(value: unknown): EconomicPaymentPolicy {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new EconomicPaymentPolicyError("PAYMENT_POLICY_INVALID");
  }
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some((key) => !(ECONOMIC_PAYMENT_SERVICES as readonly string[]).includes(key))) {
    throw new EconomicPaymentPolicyError("PAYMENT_POLICY_UNKNOWN_SERVICE");
  }
  const result = {} as EconomicPaymentPolicy;
  for (const service of ECONOMIC_PAYMENT_SERVICES) {
    const raw = input[service];
    if (raw === undefined) {
      result[service] = disabledModes();
      continue;
    }
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      throw new EconomicPaymentPolicyError("PAYMENT_MODE_INVALID");
    }
    const mode = raw as Record<string, unknown>;
    if (Object.keys(mode).some((key) => key !== "manualEnabled" && key !== "automatedEnabled") ||
        typeof mode.manualEnabled !== "boolean" ||
        mode.automatedEnabled !== undefined && mode.automatedEnabled !== false) {
      throw new EconomicPaymentPolicyError("PAYMENT_MODE_INVALID");
    }
    if (mode.manualEnabled &&
        !(MANUAL_PAYMENT_READY_SERVICES as readonly string[]).includes(service)) {
      throw new EconomicPaymentPolicyError("MANUAL_PAYMENT_WORKFLOW_NOT_READY");
    }
    result[service] = {
      manualEnabled: mode.manualEnabled,
      automatedEnabled: false,
    };
  }
  return result;
}

/** Legacy fields seed missing service modes only; explicit per-service policy always wins. */
export function projectEconomicPaymentPolicy(
  stored: unknown,
  legacy: { manualCoinPurchasesEnabled?: unknown; manualFeaturedAdsEnabled?: unknown } = {},
): EconomicPaymentPolicy {
  const defaults = {
    coin_purchases: { manualEnabled: legacy.manualCoinPurchasesEnabled === true, automatedEnabled: false as const },
    featured_ads: { manualEnabled: legacy.manualFeaturedAdsEnabled === true, automatedEnabled: false as const },
    public_ads: disabledModes(),
    influencer_services: disabledModes(),
    store_entitlements: disabledModes(),
  };
  if (stored === undefined || stored === null) return defaults;
  // Old UI builds could persist switches before their service workflows existed.
  // Project those legacy values as disabled, then let the owner save the safe state.
  const storedInput = stored as Record<string, unknown>;
  const safeStoredInput = { ...storedInput };
  for (const service of ECONOMIC_PAYMENT_SERVICES) {
    if (!(MANUAL_PAYMENT_READY_SERVICES as readonly string[]).includes(service) &&
        safeStoredInput[service] && typeof safeStoredInput[service] === "object") {
      safeStoredInput[service] = {
        ...(safeStoredInput[service] as Record<string, unknown>),
        manualEnabled: false,
        automatedEnabled: false,
      };
    }
  }
  const validated = validateEconomicPaymentPolicy(safeStoredInput);
  return {
    ...defaults,
    ...validated,
    // A stored explicit policy takes precedence; legacy flags only seed absent policy.
    coin_purchases: stored && typeof stored === "object" &&
      Object.prototype.hasOwnProperty.call(stored, "coin_purchases")
      ? validated.coin_purchases : defaults.coin_purchases,
    featured_ads: stored && typeof stored === "object" &&
      Object.prototype.hasOwnProperty.call(stored, "featured_ads")
      ? validated.featured_ads : defaults.featured_ads,
  };
}
