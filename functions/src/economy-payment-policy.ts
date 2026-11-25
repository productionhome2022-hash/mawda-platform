export const ECONOMIC_PAYMENT_SERVICES = [
  "coin_purchases",
  "featured_ads",
  "public_ads",
  "influencer_services",
  "store_entitlements",
] as const;

export type EconomicPaymentService = typeof ECONOMIC_PAYMENT_SERVICES[number];

// These are the only manual financial-recording flows with owner-attestation
// and audit paths currently implemented. Featured-ad records do not activate
// campaigns; campaign fulfilment/serving remains a separate owner-controlled step.
// Keep the remaining service switches fail-closed until their full workflows exist.
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

/**
 * Project only the explicit owner-published service policy.
 * Legacy top-level booleans are intentionally ignored: absence of a policy
 * must never enable a payment workflow by implication.
 */
export function projectEconomicPaymentPolicy(stored: unknown): EconomicPaymentPolicy {
  const defaults = {
    coin_purchases: disabledModes(),
    featured_ads: disabledModes(),
    public_ads: disabledModes(),
    influencer_services: disabledModes(),
    store_entitlements: disabledModes(),
  };
  if (stored === undefined || stored === null) return defaults;
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
  return {
    ...defaults,
    ...validateEconomicPaymentPolicy(safeStoredInput),
  };
}
