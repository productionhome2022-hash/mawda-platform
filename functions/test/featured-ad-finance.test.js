const test = require("node:test");
const assert = require("node:assert/strict");
const {
  validateFeaturedAdFinancialEvent,
  applyFeaturedAdFinancialEvent,
  featuredAdFinancialIdempotencyId,
  defaultFeaturedAdFinancialSnapshot,
} = require("../lib/featured-ad-finance");

const base = {
  campaignId: "featured_campaign_01",
  idempotencyKey: "finance_operation_0001",
  note: "Verified against the source statement.",
  externalReference: "bank-ref-2026-001",
  evidenceReference: "secure-evidence://receipt/001",
};

test("validates owner-recorded payment, refund, settlement and review events", () => {
  assert.equal(validateFeaturedAdFinancialEvent({
    ...base, action: "payment_received", amountMinor: 12500, currency: "USD",
  }).amountMinor, 12500);
  assert.equal(validateFeaturedAdFinancialEvent({
    ...base, action: "refund_recorded", amountMinor: 2500, currency: "USD",
  }).action, "refund_recorded");
  assert.equal(validateFeaturedAdFinancialEvent({
    ...base, action: "settlement_reconciled", amountMinor: 10000, currency: "USD",
  }).action, "settlement_reconciled");
  assert.equal(validateFeaturedAdFinancialEvent({
    ...base, action: "review_completed", reviewOutcome: "approved",
  }).reviewOutcome, "approved");
});

test("rejects unsafe amounts, currency, references and missing refund evidence", () => {
  assert.throws(() => validateFeaturedAdFinancialEvent({
    ...base, action: "payment_received", amountMinor: 1.5, currency: "USD",
  }));
  assert.throws(() => validateFeaturedAdFinancialEvent({
    ...base, action: "payment_received", amountMinor: 1, currency: "US",
  }));
  assert.throws(() => validateFeaturedAdFinancialEvent({
    ...base, action: "refund_recorded", amountMinor: 1, currency: "USD", evidenceReference: null,
  }));
});

test("records payment, partial refund and settlement without allowing over-refunds", () => {
  const empty = defaultFeaturedAdFinancialSnapshot();
  const payment = validateFeaturedAdFinancialEvent({
    ...base, action: "payment_received", amountMinor: 10000, currency: "USD",
  });
  const paid = applyFeaturedAdFinancialEvent(empty, payment);
  assert.equal(paid.receivedMinor, 10000);
  const refund = validateFeaturedAdFinancialEvent({
    ...base, idempotencyKey: "finance_operation_0002", action: "refund_recorded",
    amountMinor: 2000, currency: "USD",
  });
  const partiallyRefunded = applyFeaturedAdFinancialEvent(paid, refund);
  assert.equal(partiallyRefunded.refundedMinor, 2000);
  assert.equal(partiallyRefunded.paymentStatus, "partially_refunded");
  assert.throws(() => applyFeaturedAdFinancialEvent(partiallyRefunded, validateFeaturedAdFinancialEvent({
    ...base, idempotencyKey: "finance_operation_0006", action: "refund_recorded",
    amountMinor: 8001, currency: "USD",
  })), /refund_exceeds_unrefunded_receipt/);
  const settlement = validateFeaturedAdFinancialEvent({
    ...base, idempotencyKey: "finance_operation_0003", action: "settlement_reconciled",
    amountMinor: 8000, currency: "USD",
  });
  const reconciled = applyFeaturedAdFinancialEvent(partiallyRefunded, settlement);
  assert.equal(reconciled.reconciledMinor, 8000);
  assert.equal(reconciled.reviewStatus, "reconciled");
  const laterRefund = applyFeaturedAdFinancialEvent(reconciled, validateFeaturedAdFinancialEvent({
    ...base, idempotencyKey: "finance_operation_0004", action: "refund_recorded",
    amountMinor: 1, currency: "USD",
  }));
  assert.equal(laterRefund.reviewStatus, "needs_review");
  assert.equal(laterRefund.reconciledMinor, 7999);
  const reviewed = applyFeaturedAdFinancialEvent(laterRefund, validateFeaturedAdFinancialEvent({
    ...base, idempotencyKey: "finance_operation_0005", action: "review_completed",
    reviewOutcome: "approved",
  }));
  assert.equal(reviewed.reviewStatus, "reconciled");
});

test("supports multiple owner-recorded receipts while keeping one currency", () => {
  const first = applyFeaturedAdFinancialEvent(defaultFeaturedAdFinancialSnapshot(),
    validateFeaturedAdFinancialEvent({
      ...base, action: "payment_received", amountMinor: 10000, currency: "CHF",
    }));
  const second = applyFeaturedAdFinancialEvent(first,
    validateFeaturedAdFinancialEvent({
      ...base, idempotencyKey: "finance_operation_0100",
      externalReference: "bank-ref-2026-002",
      action: "payment_received", amountMinor: 5000, currency: "CHF",
    }));
  assert.equal(second.receivedMinor, 15000);
  assert.equal(second.paymentStatus, "paid");
  assert.throws(() => applyFeaturedAdFinancialEvent(second,
    validateFeaturedAdFinancialEvent({
      ...base, idempotencyKey: "finance_operation_0101",
      externalReference: "bank-ref-2026-003",
      action: "payment_received", amountMinor: 5000, currency: "EUR",
    })), /payment_currency_conflict/);
});

test("reopens review after refund changes a previously reconciled balance", () => {
  const initial = { currency: "USD", receivedMinor: 5000, refundedMinor: 0, reconciledMinor: 5000,
    reviewStatus: "reconciled", paymentStatus: "paid" };
  const refund = validateFeaturedAdFinancialEvent({
    ...base, action: "refund_recorded", amountMinor: 1000, currency: "USD",
  });
  const next = applyFeaturedAdFinancialEvent(initial, refund);
  assert.equal(next.reviewStatus, "needs_review");
});

test("idempotency document identity is stable and opaque", () => {
  const first = featuredAdFinancialIdempotencyId("featured_campaign_01", "payment_received", "bank-ref-2026-001");
  assert.equal(first, featuredAdFinancialIdempotencyId("featured_campaign_01", "payment_received", "bank-ref-2026-001"));
  assert.match(first, /^[a-f0-9]{64}$/);
});


test("revalidates runtime events at the transition boundary", () => {
  const empty = defaultFeaturedAdFinancialSnapshot();
  assert.throws(() => applyFeaturedAdFinancialEvent(empty, {
    ...base, action: "payment_received", amountMinor: 1.25, currency: "USD",
  }), /invalid_financial_amount/);
  assert.throws(() => applyFeaturedAdFinancialEvent(empty, {
    ...base, action: "payment_received", amountMinor: Number.MAX_SAFE_INTEGER + 1, currency: "USD",
  }), /invalid_financial_amount/);
});

test("rejects corrupted snapshots before applying financial events", () => {
  const corrupt = {
    currency: "USD", receivedMinor: 1000, refundedMinor: 0, reconciledMinor: 0,
    reviewStatus: "in_review", paymentStatus: "refunded",
  };
  const event = validateFeaturedAdFinancialEvent({
    ...base, idempotencyKey: "finance_operation_0099", action: "refund_recorded",
    amountMinor: 100, currency: "USD",
  });
  assert.throws(() => applyFeaturedAdFinancialEvent(corrupt, event), /financial_snapshot_corrupt/);
});
