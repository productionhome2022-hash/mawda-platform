const test = require("node:test");
const assert = require("node:assert/strict");
const {
  CreatorProposalValidationError,
  validateCreatorProposalInput,
} = require("../lib/creator-proposals");

const base = {
  creatorDisplayName: "Creator",
  creatorCategory: "video_creator",
  platformName: "YouTube",
  sourceType: "external_url",
  contentUrl: "https://www.example.com/channel/creator",
  proposalTitle: "Creator collaboration",
  proposalDescription: "A proposal for review by Mawdda administration.",
  audienceDescription: "Arabic-speaking audience interested in technology.",
  proposedDuration: "To be agreed",
  targetGeographies: ["syria", "all_arab_countries"],
  quoteRequested: true,
  rightsConfirmed: true,
  idempotencyKey: "creator-proposal-key-0001",
};

test("validates an external creator proposal without treating it as campaign approval", () => {
  const result = validateCreatorProposalInput(base);
  assert.equal(result.sourceType, "external_url");
  assert.equal(result.contentUrl, "https://www.example.com/channel/creator");
  assert.equal(result.quoteRequested, true);
  assert.equal(result.proposedBudgetAmount, null);
});

test("accepts a written proposal with a proposed budget and currency", () => {
  const result = validateCreatorProposalInput({
    ...base,
    sourceType: "written_proposal",
    contentUrl: undefined,
    platformName: undefined,
    quoteRequested: false,
    proposedBudgetAmount: "125.00",
    currency: "EUR",
  });
  assert.equal(result.sourceType, "written_proposal");
  assert.equal(result.proposedBudgetAmount, "125.00");
  assert.equal(result.currency, "EUR");
});

test("rejects insecure, credential-bearing and local URLs", () => {
  for (const contentUrl of [
    "http://www.example.com/ad",
    "https://user:pass@www.example.com/ad",
    "https://localhost/ad",
    "https://127.0.0.1/ad",
    "https://service.internal/ad",
    "javascript:alert(1)",
  ]) {
    assert.throws(
      () => validateCreatorProposalInput({ ...base, contentUrl }),
      CreatorProposalValidationError,
    );
  }
});

test("requires an explicit rights declaration", () => {
  assert.throws(
    () => validateCreatorProposalInput({ ...base, rightsConfirmed: false }),
    /rights_confirmation_required/,
  );
});

test("requires an explicit quote-or-budget choice", () => {
  assert.throws(
    () => validateCreatorProposalInput({ ...base, quoteRequested: undefined }),
    /invalid_quote_choice/,
  );
});

test("requires exactly one of quote request or proposed budget", () => {
  assert.throws(
    () => validateCreatorProposalInput({
      ...base,
      proposedBudgetAmount: "10.00",
      currency: "EUR",
    }),
    /quote_and_budget_are_mutually_exclusive/,
  );
  assert.throws(
    () => validateCreatorProposalInput({
      ...base,
      quoteRequested: false,
    }),
    /invalid_proposed_budget/,
  );
});

test("rejects empty, duplicate or oversized geographic targets", () => {
  for (const targetGeographies of [[], ["syria", "syria"], Array(11).fill("region")]) {
    assert.throws(
      () => validateCreatorProposalInput({ ...base, targetGeographies }),
      CreatorProposalValidationError,
    );
  }
});

test("accepts only the approved geographic proposal scopes", () => {
  assert.throws(
    () => validateCreatorProposalInput({ ...base, targetGeographies: ["unknown_region"] }),
    /unsupported_target_geography/,
  );
});

test("requires a unique request idempotency key with a safe format", () => {
  assert.throws(
    () => validateCreatorProposalInput({ ...base, idempotencyKey: "bad/key" }),
    /invalid_idempotency_key/,
  );
});

test("does not accept unsupported upload mode until secure media binding is integrated", () => {
  assert.throws(
    () => validateCreatorProposalInput({ ...base, sourceType: "uploaded_media" }),
    /invalid_source_type/,
  );
});
