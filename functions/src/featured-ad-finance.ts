import { createHash } from "node:crypto";

export type FeaturedAdFinancialAction =
  | "payment_received"
  | "refund_recorded"
  | "settlement_reconciled"
  | "review_completed";

export interface FeaturedAdFinancialEventInput {
  campaignId: string;
  action: FeaturedAdFinancialAction;
  idempotencyKey: string;
  amountMinor: number | null;
  currency: string | null;
  externalReference: string | null;
  evidenceReference: string | null;
  note: string;
  reviewOutcome: "approved" | "needs_attention" | null;
}

export interface FeaturedAdFinancialSnapshot {
  currency: string | null;
  receivedMinor: number;
  refundedMinor: number;
  reconciledMinor: number;
  reviewStatus: "not_reviewed" | "in_review" | "reconciled" | "needs_review";
  paymentStatus: "unpaid" | "paid" | "partially_refunded" | "refunded";
}

export class FeaturedAdFinancialValidationError extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = "FeaturedAdFinancialValidationError";
  }
}

function requiredText(value: unknown, min: number, max: number, code: string): string {
  if (typeof value !== "string") throw new FeaturedAdFinancialValidationError(code);
  const result = value.trim();
  if (result.length < min || result.length > max) throw new FeaturedAdFinancialValidationError(code);
  return result;
}

export function validateFeaturedAdFinancialEvent(value: unknown): FeaturedAdFinancialEventInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new FeaturedAdFinancialValidationError("invalid_financial_event");
  }
  const input = value as Record<string, unknown>;
  const campaignId = requiredText(input.campaignId, 8, 80, "invalid_campaign_id");
  if (!/^[A-Za-z0-9_-]{8,80}$/.test(campaignId)) {
    throw new FeaturedAdFinancialValidationError("invalid_campaign_id");
  }
  const action = input.action;
  if (action !== "payment_received" && action !== "refund_recorded" &&
      action !== "settlement_reconciled" && action !== "review_completed") {
    throw new FeaturedAdFinancialValidationError("invalid_financial_action");
  }
  const idempotencyKey = requiredText(input.idempotencyKey, 16, 100, "invalid_idempotency_key");
  if (!/^[A-Za-z0-9_-]{16,100}$/.test(idempotencyKey)) {
    throw new FeaturedAdFinancialValidationError("invalid_idempotency_key");
  }
  const note = requiredText(input.note, 5, 1500, "invalid_financial_note");
  const externalReference = requiredText(input.externalReference, 3, 160, "invalid_external_reference");
  const evidenceReference = input.evidenceReference == null
    ? null : requiredText(input.evidenceReference, 3, 500, "invalid_evidence_reference");
  const amountMinor = input.amountMinor == null ? null : input.amountMinor;
  const currency = input.currency == null ? null : input.currency;
  const reviewOutcome = input.reviewOutcome == null ? null : input.reviewOutcome;
  if (action === "review_completed") {
    if (amountMinor !== null || currency !== null || reviewOutcome !== "approved" && reviewOutcome !== "needs_attention") {
      throw new FeaturedAdFinancialValidationError("invalid_review_decision");
    }
  } else {
    if (typeof amountMinor !== "number" || !Number.isSafeInteger(amountMinor) ||
        amountMinor < 1 || amountMinor > Number.MAX_SAFE_INTEGER ||
        typeof currency !== "string" || !/^[A-Z]{3}$/.test(currency) ||
        reviewOutcome !== null) {
      throw new FeaturedAdFinancialValidationError("invalid_financial_amount");
    }
  }
  if ((action === "refund_recorded" || action === "payment_received") && evidenceReference === null) {
    throw new FeaturedAdFinancialValidationError("financial_evidence_required");
  }
  return {
    campaignId, action, idempotencyKey, amountMinor, currency,
    externalReference, evidenceReference, note, reviewOutcome: reviewOutcome as FeaturedAdFinancialEventInput["reviewOutcome"],
  };
}

export function applyFeaturedAdFinancialEvent(
  current: FeaturedAdFinancialSnapshot,
  event: FeaturedAdFinancialEventInput,
): FeaturedAdFinancialSnapshot {
  const safe = (value: number): number => {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new FeaturedAdFinancialValidationError("financial_snapshot_corrupt");
    }
    return value;
  };
  const receivedMinor = safe(current.receivedMinor);
  const refundedMinor = safe(current.refundedMinor);
  const reconciledMinor = safe(current.reconciledMinor);
  const netReceived = receivedMinor - refundedMinor;
  if (refundedMinor > receivedMinor) {
    throw new FeaturedAdFinancialValidationError("financial_snapshot_inconsistent");
  }
  if (event.action === "payment_received") {
    if (current.currency !== null && current.currency !== event.currency) {
      throw new FeaturedAdFinancialValidationError("payment_currency_conflict");
    }
    const nextReceivedMinor = receivedMinor + event.amountMinor!;
    if (!Number.isSafeInteger(nextReceivedMinor) || nextReceivedMinor < receivedMinor) {
      throw new FeaturedAdFinancialValidationError("financial_snapshot_corrupt");
    }
    const nextNetReceived = nextReceivedMinor - refundedMinor;
    return {
      currency: event.currency,
      receivedMinor: nextReceivedMinor,
      refundedMinor,
      reconciledMinor,
      reviewStatus: "in_review",
      paymentStatus: refundedMinor === 0 ? "paid" : nextNetReceived === 0 ? "refunded" : "partially_refunded",
    };
  }
  if (event.action === "refund_recorded") {
    if (current.currency !== event.currency || receivedMinor === 0 ||
        event.amountMinor! > netReceived) {
      throw new FeaturedAdFinancialValidationError("refund_exceeds_unrefunded_receipt");
    }
    const nextRefunded = refundedMinor + event.amountMinor!;
    const nextNetReceived = receivedMinor - nextRefunded;
    return {
      currency: current.currency,
      receivedMinor,
      refundedMinor: nextRefunded,
      // Reconciliation is the currently matched net balance, not a cash transfer.
      // A refund reduces that matched balance and forces a fresh owner review.
      reconciledMinor: Math.min(reconciledMinor, nextNetReceived),
      reviewStatus: "needs_review",
      paymentStatus: nextRefunded === receivedMinor ? "refunded" : "partially_refunded",
    };
  }
  if (event.action === "settlement_reconciled") {
    if (current.currency !== event.currency || receivedMinor === 0 ||
        reconciledMinor > netReceived || event.amountMinor! > netReceived - reconciledMinor) {
      throw new FeaturedAdFinancialValidationError("settlement_exceeds_unreconciled_balance");
    }
    const nextReconciled = reconciledMinor + event.amountMinor!;
    return {
      currency: current.currency,
      receivedMinor,
      refundedMinor,
      reconciledMinor: nextReconciled,
      reviewStatus: nextReconciled === netReceived ? "reconciled" : "in_review",
      paymentStatus: current.paymentStatus,
    };
  }
  if (event.reviewOutcome === "needs_attention") {
    return { ...current, reviewStatus: "needs_review" };
  }
  if (receivedMinor === 0 || refundedMinor > receivedMinor || reconciledMinor > netReceived) {
    throw new FeaturedAdFinancialValidationError("financial_review_cannot_be_approved");
  }
  return {
    ...current,
    reviewStatus: reconciledMinor === netReceived ? "reconciled" : "in_review",
  };
}

/** Hash the external reference so arbitrary client text never becomes a Firestore document path. */
export function featuredAdFinancialIdempotencyId(
  campaignId: string,
  action: FeaturedAdFinancialAction,
  externalReference: string,
): string {
  if (!/^[A-Za-z0-9_-]{8,80}$/.test(campaignId) ||
      !["payment_received", "refund_recorded", "settlement_reconciled", "review_completed"].includes(action) ||
      typeof externalReference !== "string" || externalReference.length < 3 || externalReference.length > 160) {
    throw new FeaturedAdFinancialValidationError("invalid_idempotency_identity");
  }
  // The external statement/reference is stable across app retries and devices.
  return createHash("sha256").update(campaignId + ":" + action + ":" + externalReference).digest("hex");
}

export function defaultFeaturedAdFinancialSnapshot(): FeaturedAdFinancialSnapshot {
  return {
    currency: null, receivedMinor: 0, refundedMinor: 0, reconciledMinor: 0,
    reviewStatus: "not_reviewed", paymentStatus: "unpaid",
  };
}
