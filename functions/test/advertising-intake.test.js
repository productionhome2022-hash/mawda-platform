const test = require("node:test");
const assert = require("node:assert/strict");
const {
  advertisingIntakeAuditEventId, advertisingIntakeReviewAuditEventId,
  validateAdvertisingIntake,
} = require("../lib/advertising-intake");

const validDirectAdvertiserBudget = {
  kind: "direct_advertiser",
  displayName: "Example business",
  organizationName: null,
  contactPhone: null,
  category: "Retail",
  description: "A sufficiently detailed advertising campaign description.",
  experience: null,
  portfolioUrl: null,
  targetGeographies: ["syria"],
  proposedDuration: "30 days",
  quoteRequested: false,
  proposedBudgetAmount: "125.00",
  currency: "EUR",
  rightsConfirmed: true,
  idempotencyKey: "advertising-intake-key-0001",
};

test("advertising proposal budgets enforce supported currency precision", () => {
  assert.equal(validateAdvertisingIntake(validDirectAdvertiserBudget).currency, "EUR");
  assert.equal(validateAdvertisingIntake({
    ...validDirectAdvertiserBudget, currency: "KWD", proposedBudgetAmount: "125.000",
  }).proposedBudgetAmount, "125.000");
  assert.throws(() => validateAdvertisingIntake({
    ...validDirectAdvertiserBudget, currency: "XXX",
  }), /invalid_budget/);
  assert.throws(() => validateAdvertisingIntake({
    ...validDirectAdvertiserBudget, proposedBudgetAmount: "125.000",
  }), /invalid_budget/);
});

test("advertising intake audit event ID is stable for a request replay", () => {
  const requestId = "request_123456789";
  assert.equal(
    advertisingIntakeAuditEventId(requestId),
    advertisingIntakeAuditEventId(requestId),
  );
  assert.equal(
    advertisingIntakeAuditEventId(requestId),
    "advertising_intake_submitted_request_123456789",
  );
});

test("advertising intake audit event ID rejects unsafe request IDs", () => {
  assert.throws(() => advertisingIntakeAuditEventId(""), /INVALID_ADVERTISING_INTAKE_REQUEST_ID/);
  assert.throws(() => advertisingIntakeAuditEventId("../private"), /INVALID_ADVERTISING_INTAKE_REQUEST_ID/);
});

test("advertising intake review audit IDs are stable and scoped to request version", () => {
  const requestId = "request_123456789";
  assert.equal(
    advertisingIntakeReviewAuditEventId(requestId, 3),
    "advertising_intake_review_request_123456789_3",
  );
  assert.notEqual(
    advertisingIntakeReviewAuditEventId(requestId, 3),
    advertisingIntakeReviewAuditEventId(requestId, 4),
  );
  assert.throws(() => advertisingIntakeReviewAuditEventId(requestId, 0), /INVALID_ADVERTISING_INTAKE_REVIEW_ID/);
});
