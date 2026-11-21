const test = require("node:test");
const assert = require("node:assert/strict");
const {
  validateContractDraftInput,
  validateContractReadyForSignature,
  computeContractContentHash,
  canTransitionContractStatus,
  assertContractStatusTransition,
  applyContractSignature,
  canMakeContractEffective,
  ContractWorkflowError,
} = require("../lib/contracts-workflow");

const validDraft = () => validateContractDraftInput({
  contractType: "influencer_campaign",
  title: "Influencer campaign — Spring launch",
  counterpartyUid: "creator_uid_0001",
  counterpartyName: "Creator One",
  counterpartyEmail: "CREATOR@example.com",
  body: "This is a sufficiently detailed contract body containing the campaign scope, delivery obligations, payment terms, rights and termination conditions.",
  currency: "EUR",
  commitmentMinor: 25000,
  termsVersion: 1,
  startsAtMs: 1000,
  endsAtMs: 2000,
  jurisdictionCountry: "Syria",
  governingLaw: "Applicable law to be reviewed by licensed counsel",
  disputeForum: "Competent court to be confirmed by counsel",
  companyLegalName: "Production Home Company",
  companyRepresentativeName: "Authorized representative",
  companyRepresentativeCapacity: "Legally authorized signatory",
  companyRegistrationReference: "verified-company-record",
});

test("contract draft validation normalizes counterparty email and rejects invalid money and terms", () => {
  const draft = validDraft();
  assert.equal(draft.counterpartyEmail, "creator@example.com");
  assert.equal(draft.commitmentMinor, 25000);
  assert.throws(() => validateContractDraftInput({
    ...draft, currency: "EURO",
  }), /CONTRACT_CURRENCY_INVALID/);
  assert.throws(() => validateContractDraftInput({
    ...draft, commitmentMinor: 1.5,
  }), /CONTRACT_COMMITMENT_INVALID/);
  assert.throws(() => validateContractDraftInput({
    ...draft, endsAtMs: 999,
  }), /CONTRACT_DATES_INVALID/);
});

test("contract cannot be sent before company identity, governing law and forum are complete", () => {
  const incomplete = validateContractDraftInput({
    contractType: "direct_advertiser",
    title: "Direct advertiser contract",
    counterpartyUid: "advertiser_uid_01",
    counterpartyName: "Advertiser",
    counterpartyEmail: "advertiser@example.com",
    body: "This is a sufficiently detailed contract body containing the campaign scope, delivery obligations, payment terms, rights and termination conditions.",
    currency: "EUR",
    commitmentMinor: 0,
    termsVersion: 1,
  });
  assert.throws(
    () => validateContractReadyForSignature(incomplete),
    /CONTRACT_LEGAL_IDENTITY_INCOMPLETE/,
  );
  assert.doesNotThrow(() => validateContractReadyForSignature(validDraft()));
});

test("contract content hash is deterministic regardless of object key order", () => {
  assert.equal(
    computeContractContentHash({ title: "A", terms: { z: 1, a: 2 } }),
    computeContractContentHash({ terms: { a: 2, z: 1 }, title: "A" }),
  );
});

test("contract lifecycle forbids bypassing legal review and signature states", () => {
  assert.equal(canTransitionContractStatus("draft", "legal_review"), true);
  assert.equal(canTransitionContractStatus("draft", "effective"), false);
  assert.equal(canTransitionContractStatus("awaiting_counterparty_signature", "effective"), false);
  assert.equal(canTransitionContractStatus("effective", "terminated"), true);
  assert.throws(
    () => assertContractStatusTransition("draft", "effective"),
    /CONTRACT_STATUS_TRANSITION_FORBIDDEN/,
  );
});

test("counterparty signature requires verified matching identity and exact immutable version/hash", () => {
  const hash = "a".repeat(64);
  const state = {
    status: "awaiting_counterparty_signature",
    version: 3,
    contentHash: hash,
    ownerUid: "owner_uid_0001",
    counterpartyUid: "creator_uid_0001",
    counterpartyEmail: "creator@example.com",
    counterpartySignature: null,
    companySignature: null,
  };
  const signature = {
    side: "counterparty",
    uid: "creator_uid_0001",
    email: "creator@example.com",
    emailVerified: true,
    accepted: true,
    contentHash: hash,
    contractVersion: 3,
    signedAtMs: 5000,
    method: "in_app_electronic",
  };
  const next = applyContractSignature(state, signature);
  assert.equal(next.status, "awaiting_company_signature");
  assert.throws(
    () => applyContractSignature(state, { ...signature, emailVerified: false }),
    /CONTRACT_SIGNATURE_EVIDENCE_INVALID/,
  );
  assert.throws(
    () => applyContractSignature(state, { ...signature, uid: "another_uid_001" }),
    /CONTRACT_COUNTERPARTY_SIGNATURE_NOT_AUTHORIZED/,
  );
  assert.throws(
    () => applyContractSignature(state, { ...signature, contractVersion: 2 }),
    /CONTRACT_SIGNATURE_EVIDENCE_INVALID/,
  );
});

test("company signature requires owner verification and step-up authentication", () => {
  const hash = "b".repeat(64);
  const state = {
    status: "awaiting_company_signature",
    version: 1,
    contentHash: hash,
    ownerUid: "owner_uid_0001",
    counterpartyUid: "creator_uid_0001",
    counterpartyEmail: "creator@example.com",
    counterpartySignature: {
      side: "counterparty",
      uid: "creator_uid_0001",
      email: "creator@example.com",
      emailVerified: true,
      accepted: true,
      contentHash: hash,
      contractVersion: 1,
      signedAtMs: 100,
      method: "in_app_electronic",
    },
    companySignature: null,
  };
  const signature = {
    side: "company",
    uid: "owner_uid_0001",
    email: "owner@example.com",
    emailVerified: true,
    accepted: true,
    contentHash: hash,
    contractVersion: 1,
    signedAtMs: 200,
    method: "in_app_electronic",
    ownerVerified: true,
    stepUpVerified: true,
  };
  assert.equal(applyContractSignature(state, signature).status, "signed");
  assert.throws(
    () => applyContractSignature(state, { ...signature, stepUpVerified: false }),
    /CONTRACT_COMPANY_SIGNATURE_NOT_AUTHORIZED/,
  );
});

test("a contract becomes effective only after both matching signatures", () => {
  const hash = "c".repeat(64);
  const counterparty = {
    side: "counterparty",
    uid: "creator_uid_0001",
    email: "creator@example.com",
    emailVerified: true,
    accepted: true,
    contentHash: hash,
    contractVersion: 1,
    signedAtMs: 100,
    method: "in_app_electronic",
  };
  const company = {
    side: "company",
    uid: "owner_uid_0001",
    email: "owner@example.com",
    emailVerified: true,
    accepted: true,
    contentHash: hash,
    contractVersion: 1,
    signedAtMs: 200,
    method: "in_app_electronic",
    ownerVerified: true,
    stepUpVerified: true,
  };
  const signed = {
    status: "signed",
    version: 1,
    contentHash: hash,
    ownerUid: "owner_uid_0001",
    counterpartyUid: "creator_uid_0001",
    counterpartyEmail: "creator@example.com",
    counterpartySignature: counterparty,
    companySignature: company,
  };
  assert.equal(canMakeContractEffective(signed), true);
  assert.equal(canMakeContractEffective({ ...signed, contentHash: "d".repeat(64) }), false);
  assert.equal(canMakeContractEffective({ ...signed, companySignature: null }), false);
});
