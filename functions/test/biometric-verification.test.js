const test = require("node:test");
const assert = require("node:assert/strict");
const { hasActiveBiometricVerification } = require("../lib/biometric-verification");

const NOW = 1_800_000_000_000;
const futureTimestamp = { toMillis: () => NOW + 60_000 };

test("verified biometric record with future expiry is eligible", () => {
  assert.equal(hasActiveBiometricVerification({
    status: "verified",
    verificationMethod: "owner_manual_review",
    reviewedBySuperOwner: true,
    reviewRequestId: "owner-review-request-001",
    expiresAt: futureTimestamp,
  }, NOW), true);
});

test("expired, revoked, pending, and failed biometric records are ineligible", () => {
  assert.equal(hasActiveBiometricVerification({
    status: "verified",
    verificationMethod: "owner_manual_review",
    reviewedBySuperOwner: true,
    reviewRequestId: "owner-review-request-001",
    expiresAt: { toMillis: () => NOW - 1 },
  }, NOW), false);
  assert.equal(hasActiveBiometricVerification({
    status: "verified",
    verificationMethod: "owner_manual_review",
    reviewedBySuperOwner: true,
    reviewRequestId: "owner-review-request-001",
    expiresAt: futureTimestamp,
    revokedAt: { toMillis: () => NOW - 100 },
  }, NOW), false);
  assert.equal(hasActiveBiometricVerification({
    status: "pending",
    expiresAt: futureTimestamp,
  }, NOW), false);
  assert.equal(hasActiveBiometricVerification({
    status: "failed",
    expiresAt: futureTimestamp,
  }, NOW), false);
});

test("verified status without an explicit Super Owner manual-review record fails closed", () => {
  assert.equal(hasActiveBiometricVerification({
    status: "verified",
    expiresAt: futureTimestamp,
  }, NOW), false);
  assert.equal(hasActiveBiometricVerification({
    status: "verified",
    verificationMethod: "owner_manual_review",
    reviewRequestId: "owner-review-request-001",
    expiresAt: futureTimestamp,
  }, NOW), false);
});

test("client-asserted local OS prompt is not trusted as biometric verification", () => {
  assert.equal(hasActiveBiometricVerification({
    status: "verified",
    verificationMethod: "owner_manual_review",
    reviewedBySuperOwner: true,
    reviewRequestId: "owner-review-request-001",
    verificationMethod: "local_os_biometric_prompt",
    expiresAt: futureTimestamp,
  }, NOW), false);
  assert.equal(hasActiveBiometricVerification({
    status: "verified",
    verificationMethod: "owner_manual_review",
    reviewedBySuperOwner: true,
    reviewRequestId: "owner-review-request-001",
    trustModel: "client_claim_after_local_os_prompt",
    expiresAt: futureTimestamp,
  }, NOW), false);
});

test("bare verified status or missing/invalid expiry fails closed", () => {
  assert.equal(hasActiveBiometricVerification({ status: "verified" }, NOW), false);
  assert.equal(hasActiveBiometricVerification({
    status: "verified",
    verificationMethod: "owner_manual_review",
    reviewedBySuperOwner: true,
    reviewRequestId: "owner-review-request-001",
    expiresAt: "2099-01-01",
  }, NOW), false);
  assert.equal(hasActiveBiometricVerification(null, NOW), false);
  assert.equal(hasActiveBiometricVerification("verified", NOW), false);
});

test("Date and Firestore-like Timestamp expiry are supported", () => {
  assert.equal(hasActiveBiometricVerification({
    status: "verified",
    verificationMethod: "owner_manual_review",
    reviewedBySuperOwner: true,
    reviewRequestId: "owner-review-request-001",
    expiresAt: new Date(NOW + 60_000),
  }, NOW), true);
  assert.equal(hasActiveBiometricVerification({
    status: "verified",
    verificationMethod: "owner_manual_review",
    reviewedBySuperOwner: true,
    reviewRequestId: "owner-review-request-001",
    expiresAt: { toMillis: () => Number.NaN },
  }, NOW), false);
  assert.equal(hasActiveBiometricVerification({
    status: "verified",
    verificationMethod: "owner_manual_review",
    reviewedBySuperOwner: true,
    reviewRequestId: "owner-review-request-001",
    expiresAt: { toMillis: () => { throw new Error("invalid timestamp"); } },
  }, NOW), false);
});
