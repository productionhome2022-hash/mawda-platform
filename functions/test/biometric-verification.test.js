const test = require("node:test");
const assert = require("node:assert/strict");
const { hasActiveBiometricVerification } = require("../lib/biometric-verification");

const NOW = 1_800_000_000_000;
const futureTimestamp = { toMillis: () => NOW + 60_000 };

test("verified biometric record with future expiry is eligible", () => {
  assert.equal(hasActiveBiometricVerification({
    status: "verified",
    expiresAt: futureTimestamp,
  }, NOW), true);
});

test("expired, revoked, pending, and failed biometric records are ineligible", () => {
  assert.equal(hasActiveBiometricVerification({
    status: "verified",
    expiresAt: { toMillis: () => NOW - 1 },
  }, NOW), false);
  assert.equal(hasActiveBiometricVerification({
    status: "verified",
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

test("client-asserted local OS prompt is not trusted as biometric verification", () => {
  assert.equal(hasActiveBiometricVerification({
    status: "verified",
    verificationMethod: "local_os_biometric_prompt",
    expiresAt: futureTimestamp,
  }, NOW), false);
  assert.equal(hasActiveBiometricVerification({
    status: "verified",
    trustModel: "client_claim_after_local_os_prompt",
    expiresAt: futureTimestamp,
  }, NOW), false);
});

test("bare verified status or missing/invalid expiry fails closed", () => {
  assert.equal(hasActiveBiometricVerification({ status: "verified" }, NOW), false);
  assert.equal(hasActiveBiometricVerification({
    status: "verified",
    expiresAt: "2099-01-01",
  }, NOW), false);
  assert.equal(hasActiveBiometricVerification(null, NOW), false);
  assert.equal(hasActiveBiometricVerification("verified", NOW), false);
});

test("Date and Firestore-like Timestamp expiry are supported", () => {
  assert.equal(hasActiveBiometricVerification({
    status: "verified",
    expiresAt: new Date(NOW + 60_000),
  }, NOW), true);
  assert.equal(hasActiveBiometricVerification({
    status: "verified",
    expiresAt: { toMillis: () => Number.NaN },
  }, NOW), false);
  assert.equal(hasActiveBiometricVerification({
    status: "verified",
    expiresAt: { toMillis: () => { throw new Error("invalid timestamp"); } },
  }, NOW), false);
});
