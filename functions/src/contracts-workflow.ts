import { createHash } from "node:crypto";

export const CONTRACT_TYPES = [
  "creator_membership",
  "production_supervisor",
  "production_general_supervisor",
  "advertising_general_supervisor",
  "ad_representative_commission",
  "influencer_framework",
  "influencer_campaign",
  "direct_advertiser",
  "legal_administrative_supervisor",
  "signing_delegation",
] as const;

export type ContractType = typeof CONTRACT_TYPES[number];

export const CONTRACT_STATUSES = [
  "draft",
  "legal_review",
  "pending_owner_approval",
  "ready_to_send",
  "awaiting_counterparty_signature",
  "awaiting_company_signature",
  "signed",
  "effective",
  "suspended",
  "expired",
  "renewal_or_amendment",
  "terminated",
  "cancelled",
] as const;

export type ContractStatus = typeof CONTRACT_STATUSES[number];

export interface ContractDraftInput {
  contractType: ContractType;
  title: string;
  counterpartyUid: string;
  counterpartyName: string;
  counterpartyEmail: string;
  body: string;
  currency: string;
  commitmentMinor: number;
  termsVersion: number;
  startsAtMs: number | null;
  endsAtMs: number | null;
  jurisdictionCountry: string | null;
  governingLaw: string | null;
  disputeForum: string | null;
  companyLegalName: string | null;
  companyRepresentativeName: string | null;
  companyRepresentativeCapacity: string | null;
  companyRegistrationReference: string | null;
  parentContractId: string | null;
}

export interface ContractSignatureEvidence {
  side: "counterparty" | "company";
  uid: string;
  email: string;
  emailVerified: boolean;
  accepted: boolean;
  contentHash: string;
  contractVersion: number;
  signedAtMs: number;
  method: "in_app_electronic";
  ownerVerified?: boolean;
  stepUpVerified?: boolean;
}

export interface ContractSigningState {
  status: ContractStatus;
  version: number;
  contentHash: string;
  ownerUid: string;
  counterpartyUid: string;
  counterpartyEmail: string;
  counterpartySignature: ContractSignatureEvidence | null;
  companySignature: ContractSignatureEvidence | null;
}

export class ContractWorkflowError extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = "ContractWorkflowError";
  }
}

function requiredText(value: unknown, min: number, max: number, code: string): string {
  if (typeof value !== "string") throw new ContractWorkflowError(code);
  const result = value.trim();
  if (result.length < min || result.length > max) throw new ContractWorkflowError(code);
  return result;
}

function optionalText(value: unknown, max: number, code: string): string | null {
  if (value === undefined || value === null || value === "") return null;
  return requiredText(value, 1, max, code);
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(record).sort().map((key) => [key, canonicalize(record[key])]),
    );
  }
  return value;
}

export function canonicalContractJson(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

export function computeContractContentHash(value: unknown): string {
  return createHash("sha256").update(canonicalContractJson(value)).digest("hex");
}

export function validateContractDraftInput(value: unknown): ContractDraftInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ContractWorkflowError("CONTRACT_DRAFT_INVALID");
  }
  const input = value as Record<string, unknown>;
  if (!(CONTRACT_TYPES as readonly unknown[]).includes(input.contractType)) {
    throw new ContractWorkflowError("CONTRACT_TYPE_UNSUPPORTED");
  }
  const title = requiredText(input.title, 4, 180, "CONTRACT_TITLE_INVALID");
  const counterpartyUid = requiredText(input.counterpartyUid, 8, 128, "CONTRACT_COUNTERPARTY_UID_INVALID");
  const counterpartyName = requiredText(input.counterpartyName, 2, 180, "CONTRACT_COUNTERPARTY_NAME_INVALID");
  const counterpartyEmail = requiredText(input.counterpartyEmail, 5, 254, "CONTRACT_COUNTERPARTY_EMAIL_INVALID").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(counterpartyEmail)) {
    throw new ContractWorkflowError("CONTRACT_COUNTERPARTY_EMAIL_INVALID");
  }
  const body = requiredText(input.body, 100, 100000, "CONTRACT_BODY_INVALID");
  const currency = requiredText(input.currency, 3, 3, "CONTRACT_CURRENCY_INVALID");
  if (!/^[A-Z]{3}$/.test(currency)) throw new ContractWorkflowError("CONTRACT_CURRENCY_INVALID");
  if (!Number.isSafeInteger(input.commitmentMinor) || (input.commitmentMinor as number) < 0) {
    throw new ContractWorkflowError("CONTRACT_COMMITMENT_INVALID");
  }
  if (!Number.isSafeInteger(input.termsVersion) || (input.termsVersion as number) < 1) {
    throw new ContractWorkflowError("CONTRACT_TERMS_VERSION_INVALID");
  }
  const startsAtMs = input.startsAtMs === undefined || input.startsAtMs === null
    ? null : input.startsAtMs;
  const endsAtMs = input.endsAtMs === undefined || input.endsAtMs === null
    ? null : input.endsAtMs;
  if ((startsAtMs !== null && (!Number.isSafeInteger(startsAtMs) || (startsAtMs as number) < 0)) ||
      (endsAtMs !== null && (!Number.isSafeInteger(endsAtMs) ||
        (startsAtMs !== null && (endsAtMs as number) <= (startsAtMs as number))))) {
    throw new ContractWorkflowError("CONTRACT_DATES_INVALID");
  }
  const parentContractId = optionalText(input.parentContractId, 160, "CONTRACT_PARENT_ID_INVALID");
  return {
    contractType: input.contractType as ContractType,
    title,
    counterpartyUid,
    counterpartyName,
    counterpartyEmail,
    body,
    currency,
    commitmentMinor: input.commitmentMinor as number,
    termsVersion: input.termsVersion as number,
    startsAtMs: startsAtMs as number | null,
    endsAtMs: endsAtMs as number | null,
    jurisdictionCountry: optionalText(input.jurisdictionCountry, 100, "CONTRACT_JURISDICTION_INVALID"),
    governingLaw: optionalText(input.governingLaw, 240, "CONTRACT_GOVERNING_LAW_INVALID"),
    disputeForum: optionalText(input.disputeForum, 300, "CONTRACT_DISPUTE_FORUM_INVALID"),
    companyLegalName: optionalText(input.companyLegalName, 180, "CONTRACT_COMPANY_NAME_INVALID"),
    companyRepresentativeName: optionalText(input.companyRepresentativeName, 180, "CONTRACT_COMPANY_REPRESENTATIVE_INVALID"),
    companyRepresentativeCapacity: optionalText(input.companyRepresentativeCapacity, 180, "CONTRACT_COMPANY_CAPACITY_INVALID"),
    companyRegistrationReference: optionalText(input.companyRegistrationReference, 180, "CONTRACT_COMPANY_REGISTRATION_INVALID"),
    parentContractId,
  };
}

/** A draft may be incomplete; no contract can be sent for signature until its legal identity and forum are supplied. */
export function validateContractReadyForSignature(input: ContractDraftInput): void {
  if (!input.jurisdictionCountry || !input.governingLaw || !input.disputeForum ||
      !input.companyLegalName || !input.companyRepresentativeName ||
      !input.companyRepresentativeCapacity || !input.companyRegistrationReference) {
    throw new ContractWorkflowError("CONTRACT_LEGAL_IDENTITY_INCOMPLETE");
  }
}

const ALLOWED_TRANSITIONS: Record<ContractStatus, readonly ContractStatus[]> = {
  draft: ["legal_review", "cancelled"],
  legal_review: ["draft", "pending_owner_approval", "cancelled"],
  pending_owner_approval: ["legal_review", "ready_to_send", "cancelled"],
  ready_to_send: ["awaiting_counterparty_signature", "cancelled"],
  awaiting_counterparty_signature: ["cancelled"],
  awaiting_company_signature: ["cancelled"],
  signed: ["effective", "cancelled"],
  effective: ["suspended", "expired", "renewal_or_amendment", "terminated"],
  suspended: ["effective", "terminated"],
  expired: ["renewal_or_amendment", "terminated"],
  renewal_or_amendment: [],
  terminated: [],
  cancelled: [],
};

export function canTransitionContractStatus(
  from: ContractStatus,
  to: ContractStatus,
): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) === true;
}

export function assertContractStatusTransition(
  from: ContractStatus,
  to: ContractStatus,
): void {
  if (!canTransitionContractStatus(from, to)) {
    throw new ContractWorkflowError("CONTRACT_STATUS_TRANSITION_FORBIDDEN");
  }
}

export function validateContractSignature(
  state: ContractSigningState,
  evidence: ContractSignatureEvidence,
): void {
  if (!evidence || typeof evidence !== "object" ||
      !["counterparty", "company"].includes(evidence.side) ||
      typeof evidence.uid !== "string" || evidence.uid.length < 8 ||
      typeof evidence.email !== "string" || evidence.email.length < 5 ||
      evidence.emailVerified !== true || evidence.accepted !== true ||
      evidence.method !== "in_app_electronic" ||
      !Number.isSafeInteger(evidence.signedAtMs) || evidence.signedAtMs < 0 ||
      evidence.contractVersion !== state.version ||
      evidence.contentHash !== state.contentHash ||
      !/^[a-f0-9]{64}$/.test(evidence.contentHash)) {
    throw new ContractWorkflowError("CONTRACT_SIGNATURE_EVIDENCE_INVALID");
  }

  if (evidence.side === "counterparty") {
    if (state.status !== "awaiting_counterparty_signature" ||
        evidence.uid !== state.counterpartyUid ||
        evidence.email.toLowerCase() !== state.counterpartyEmail.toLowerCase()) {
      throw new ContractWorkflowError("CONTRACT_COUNTERPARTY_SIGNATURE_NOT_AUTHORIZED");
    }
    return;
  }

  if (state.status !== "awaiting_company_signature" ||
      evidence.uid !== state.ownerUid ||
      evidence.ownerVerified !== true ||
      evidence.stepUpVerified !== true) {
    throw new ContractWorkflowError("CONTRACT_COMPANY_SIGNATURE_NOT_AUTHORIZED");
  }
}

export function applyContractSignature(
  state: ContractSigningState,
  evidence: ContractSignatureEvidence,
): ContractSigningState {
  validateContractSignature(state, evidence);
  if (evidence.side === "counterparty") {
    if (state.counterpartySignature) throw new ContractWorkflowError("CONTRACT_SIGNATURE_ALREADY_RECORDED");
    return {
      ...state,
      status: "awaiting_company_signature",
      counterpartySignature: evidence,
    };
  }
  if (state.companySignature) throw new ContractWorkflowError("CONTRACT_SIGNATURE_ALREADY_RECORDED");
  return {
    ...state,
    status: "signed",
    companySignature: evidence,
  };
}

export function canMakeContractEffective(state: ContractSigningState): boolean {
  const counterparty = state.counterpartySignature;
  const company = state.companySignature;
  return state.status === "signed" &&
    counterparty !== null && company !== null &&
    counterparty.contractVersion === state.version &&
    company.contractVersion === state.version &&
    counterparty.contentHash === state.contentHash &&
    company.contentHash === state.contentHash &&
    counterparty.accepted === true && company.accepted === true &&
    company.ownerVerified === true && company.stepUpVerified === true;
}
