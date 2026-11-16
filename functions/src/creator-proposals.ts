import { isIP } from "node:net";

export type CreatorProposalSourceType = "external_url" | "written_proposal";

export const CREATOR_PROPOSAL_GEOGRAPHIES = [
  "all_arab_countries",
  "syria",
  "lebanon_palestine",
  "iraq_jordan",
  "gcc",
  "egypt",
  "tunisia_libya_sudan",
  "algeria_morocco",
  "europe_turkey",
  "asia_middle_east",
] as const;

export type CreatorProposalPayload = {
  creatorDisplayName: string;
  creatorCategory: string;
  platformName: string | null;
  sourceType: CreatorProposalSourceType;
  contentUrl: string | null;
  proposalTitle: string;
  proposalDescription: string;
  audienceDescription: string | null;
  proposedDuration: string;
  targetGeographies: string[];
  quoteRequested: boolean;
  proposedBudgetAmount: string | null;
  currency: string | null;
  rightsConfirmed: true;
  idempotencyKey: string;
};

export class CreatorProposalValidationError extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = "CreatorProposalValidationError";
  }
}

function requiredText(value: unknown, max: number, code: string): string {
  if (typeof value !== "string") throw new CreatorProposalValidationError(code);
  const normalized = value.trim();
  if (!normalized || normalized.length > max) throw new CreatorProposalValidationError(code);
  return normalized;
}

function optionalText(value: unknown, max: number, code: string): string | null {
  if (value === undefined || value === null || value === "") return null;
  return requiredText(value, max, code);
}

function validatePublicHttpsUrl(value: unknown): string {
  const raw = requiredText(value, 2048, "invalid_content_url");
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new CreatorProposalValidationError("invalid_content_url");
  }
  const hostname = parsed.hostname.toLowerCase().replace(/\.$/, "");
  if (
    parsed.protocol !== "https:" ||
    parsed.username.length > 0 ||
    parsed.password.length > 0 ||
    !hostname.includes(".") ||
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    isIP(hostname) !== 0
  ) {
    throw new CreatorProposalValidationError("unsafe_content_url");
  }
  return parsed.toString();
}

/**
 * Validates creator-submitted proposal data only. This function does not fetch
 * external URLs, verify ownership/usage rights, approve content or authorize
 * publication. Those remain separate server-side review gates.
 */
export function validateCreatorProposalInput(input: unknown): CreatorProposalPayload {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new CreatorProposalValidationError("invalid_request");
  }
  const data = input as Record<string, unknown>;
  const sourceType = data.sourceType;
  if (sourceType !== "external_url" && sourceType !== "written_proposal") {
    throw new CreatorProposalValidationError("invalid_source_type");
  }

  const creatorDisplayName = requiredText(data.creatorDisplayName, 100, "invalid_creator_name");
  const creatorCategory = requiredText(data.creatorCategory, 80, "invalid_creator_category");
  const proposalTitle = requiredText(data.proposalTitle, 140, "invalid_proposal_title");
  const proposalDescription = requiredText(data.proposalDescription, 5000, "invalid_proposal_description");
  const proposedDuration = requiredText(data.proposedDuration, 120, "invalid_proposed_duration");
  const audienceDescription = optionalText(data.audienceDescription, 1200, "invalid_audience_description");
  const targetGeographiesRaw = data.targetGeographies;
  if (!Array.isArray(targetGeographiesRaw) || targetGeographiesRaw.length < 1 ||
      targetGeographiesRaw.length > 10) {
    throw new CreatorProposalValidationError("invalid_target_geographies");
  }
  const targetGeographies = [...new Set(targetGeographiesRaw.map((item) =>
    requiredText(item, 80, "invalid_target_geographies"),
  ))];
  if (targetGeographies.some((item) =>
    !(CREATOR_PROPOSAL_GEOGRAPHIES as readonly string[]).includes(item),
  )) {
    throw new CreatorProposalValidationError("unsupported_target_geography");
  }
  if (targetGeographies.length !== targetGeographiesRaw.length) {
    throw new CreatorProposalValidationError("duplicate_target_geography");
  }

  if (typeof data.quoteRequested !== "boolean") {
    throw new CreatorProposalValidationError("invalid_quote_choice");
  }
  const quoteRequested = data.quoteRequested;
  let proposedBudgetAmount: string | null = null;
  let currency: string | null = null;
  if (quoteRequested) {
    if (data.proposedBudgetAmount !== undefined && data.proposedBudgetAmount !== null ||
        data.currency !== undefined && data.currency !== null) {
      throw new CreatorProposalValidationError("quote_and_budget_are_mutually_exclusive");
    }
  } else {
    if (typeof data.proposedBudgetAmount !== "string" ||
        !/^(?:0|[1-9]\d{0,11})(?:\.\d{1,4})?$/.test(data.proposedBudgetAmount) ||
        Number(data.proposedBudgetAmount) <= 0 ||
        typeof data.currency !== "string" ||
        !/^[A-Z]{3}$/.test(data.currency)) {
      throw new CreatorProposalValidationError("invalid_proposed_budget");
    }
    proposedBudgetAmount = data.proposedBudgetAmount;
    currency = data.currency;
  }

  if (data.rightsConfirmed !== true) {
    throw new CreatorProposalValidationError("rights_confirmation_required");
  }

  const contentUrl = sourceType === "external_url"
    ? validatePublicHttpsUrl(data.contentUrl)
    : null;
  const platformName = sourceType === "external_url"
    ? requiredText(data.platformName, 80, "invalid_platform_name")
    : optionalText(data.platformName, 80, "invalid_platform_name");
  const idempotencyKey = requiredText(data.idempotencyKey, 100, "invalid_idempotency_key");
  if (!/^[A-Za-z0-9_-]{16,100}$/.test(idempotencyKey)) {
    throw new CreatorProposalValidationError("invalid_idempotency_key");
  }

  return {
    creatorDisplayName,
    creatorCategory,
    platformName,
    sourceType,
    contentUrl,
    proposalTitle,
    proposalDescription,
    audienceDescription,
    proposedDuration,
    targetGeographies,
    quoteRequested,
    proposedBudgetAmount,
    currency,
    rightsConfirmed: true,
    idempotencyKey,
  };
}
