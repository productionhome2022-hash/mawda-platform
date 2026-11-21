export const AD_INTAKE_GEOGRAPHIES = [
  "all_arab_countries", "syria", "lebanon_palestine", "iraq_jordan", "gcc",
  "egypt", "tunisia_libya_sudan", "algeria_morocco", "europe_turkey",
  "asia_middle_east",
] as const;

export type AdvertisingIntakeKind = "representative_application" | "direct_advertiser";
export type AdvertisingIntakePayload = {
  kind: AdvertisingIntakeKind;
  displayName: string;
  organizationName: string | null;
  contactPhone: string | null;
  category: string;
  description: string;
  experience: string | null;
  portfolioUrl: string | null;
  targetGeographies: string[];
  proposedDuration: string;
  quoteRequested: boolean;
  proposedBudgetAmount: string | null;
  currency: string | null;
  rightsConfirmed: true;
  idempotencyKey: string;
};

export class AdvertisingIntakeValidationError extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = "AdvertisingIntakeValidationError";
  }
}

function text(value: unknown, min: number, max: number, code: string): string {
  if (typeof value !== "string") throw new AdvertisingIntakeValidationError(code);
  const result = value.trim();
  if (result.length < min || result.length > max) throw new AdvertisingIntakeValidationError(code);
  return result;
}
function optional(value: unknown, max: number, code: string): string | null {
  if (value === undefined || value === null || value === "") return null;
  return text(value, 1, max, code);
}
function httpsUrl(value: unknown): string {
  const raw = text(value, 10, 2048, "invalid_portfolio_url");
  let parsed: URL;
  try { parsed = new URL(raw); } catch { throw new AdvertisingIntakeValidationError("invalid_portfolio_url"); }
  const host = parsed.hostname.toLowerCase().replace(/\.$/, "");
  if (parsed.protocol !== "https:" || parsed.username || parsed.password ||
      !host.includes(".") || host === "localhost" || host.endsWith(".local") ||
      host.endsWith(".internal") || /^\d{1,3}(\.\d{1,3}){3}$/.test(host) ||
      host.includes(":")) {
    throw new AdvertisingIntakeValidationError("unsafe_portfolio_url");
  }
  return parsed.toString();
}

export function validateAdvertisingIntake(value: unknown): AdvertisingIntakePayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AdvertisingIntakeValidationError("invalid_request");
  }
  const data = value as Record<string, unknown>;
  if (data.kind !== "representative_application" && data.kind !== "direct_advertiser") {
    throw new AdvertisingIntakeValidationError("invalid_kind");
  }
  const kind = data.kind;
  const displayName = text(data.displayName, 2, 120, "invalid_display_name");
  const organizationName = optional(data.organizationName, 180, "invalid_organization_name");
  const contactPhone = optional(data.contactPhone, 40, "invalid_contact_phone");
  const category = text(data.category, 2, 100, "invalid_category");
  const description = text(data.description, 30, 5000, "invalid_description");
  const experience = kind === "representative_application"
    ? text(data.experience, 20, 3000, "invalid_experience") : null;
  const portfolioUrl = data.portfolioUrl ? httpsUrl(data.portfolioUrl) : null;
  if (kind === "representative_application" && !portfolioUrl) {
    throw new AdvertisingIntakeValidationError("portfolio_required");
  }
  if (data.rightsConfirmed !== true) throw new AdvertisingIntakeValidationError("rights_confirmation_required");
  if (!Array.isArray(data.targetGeographies) || data.targetGeographies.length < 1 ||
      data.targetGeographies.length > AD_INTAKE_GEOGRAPHIES.length) {
    throw new AdvertisingIntakeValidationError("invalid_target_geographies");
  }
  const targetGeographies = data.targetGeographies.map((item) =>
    text(item, 2, 80, "invalid_target_geographies"));
  if (new Set(targetGeographies).size !== targetGeographies.length ||
      targetGeographies.some((item) => !(AD_INTAKE_GEOGRAPHIES as readonly string[]).includes(item))) {
    throw new AdvertisingIntakeValidationError("unsupported_target_geography");
  }
  const proposedDuration = text(data.proposedDuration, 2, 120, "invalid_duration");
  if (typeof data.quoteRequested !== "boolean") throw new AdvertisingIntakeValidationError("invalid_quote_choice");
  let proposedBudgetAmount: string | null = null;
  let currency: string | null = null;
  if (data.quoteRequested === true) {
    if (data.proposedBudgetAmount != null || data.currency != null) {
      throw new AdvertisingIntakeValidationError("quote_and_budget_are_mutually_exclusive");
    }
  } else {
    if (typeof data.proposedBudgetAmount !== "string" ||
        !/^(?:0|[1-9]\d{0,11})(?:\.\d{1,4})?$/.test(data.proposedBudgetAmount) ||
        Number(data.proposedBudgetAmount) <= 0 || typeof data.currency !== "string" ||
        !/^[A-Z]{3}$/.test(data.currency)) {
      throw new AdvertisingIntakeValidationError("invalid_budget");
    }
    proposedBudgetAmount = data.proposedBudgetAmount;
    currency = data.currency;
  }
  const idempotencyKey = text(data.idempotencyKey, 16, 100, "invalid_idempotency_key");
  if (!/^[A-Za-z0-9_-]{16,100}$/.test(idempotencyKey)) {
    throw new AdvertisingIntakeValidationError("invalid_idempotency_key");
  }
  return {
    kind, displayName, organizationName, contactPhone, category, description,
    experience, portfolioUrl, targetGeographies, proposedDuration,
    quoteRequested: data.quoteRequested, proposedBudgetAmount, currency,
    rightsConfirmed: true, idempotencyKey,
  };
}
/** Stable audit document ID lets a retry repair a post-commit audit failure. */
export function advertisingIntakeAuditEventId(requestId: string): string {
  if (typeof requestId !== "string" || !/^[A-Za-z0-9_-]{1,150}$/.test(requestId)) {
    throw new Error("INVALID_ADVERTISING_INTAKE_REQUEST_ID");
  }
  return "advertising_intake_submitted_" + requestId;
}
/** Stable per-version audit ID makes owner review replay-safe and auditable. */
export function advertisingIntakeReviewAuditEventId(requestId: string, expectedVersion: number): string {
  if (typeof requestId !== "string" || !/^[A-Za-z0-9_-]{16,100}$/.test(requestId) ||
      !Number.isSafeInteger(expectedVersion) || expectedVersion < 1) {
    throw new Error("INVALID_ADVERTISING_INTAKE_REVIEW_ID");
  }
  return "advertising_intake_review_" + requestId + "_" + String(expectedVersion);
}
