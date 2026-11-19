const test = require("node:test");
const assert = require("node:assert/strict");
const { hasActiveBiometricVerification } = require("../lib/biometric-verification");

const NOW = 1_800_000_000_000;

test("manual owner review and local OS prompts are not challenge-bound cryptographic proof", () => {
  assert.equal(hasActiveBiometricVerification({
    status: "verified",
    verificationMethod: "owner_manual_review",
    reviewedBySuperOwner: true,
    reviewRequestId: "review_request_123",
    expiresAt: { toMillis: () => NOW + 60_000 },
  }, NOW), false);
  assert.equal(hasActiveBiometricVerification({
    status: "verified",
    verificationMethod: "local_os_biometric_prompt",
    expiresAt: { toMillis: () => NOW + 60_000 },
  }, NOW), false);
});

test("all biometric privileges remain fail-closed until the cryptographic verifier is implemented", () => {
  assert.equal(hasActiveBiometricVerification({
    status: "verified",
    expiresAt: new Date(NOW + 60_000),
  }, NOW), false);
  assert.equal(hasActiveBiometricVerification({
    status: "verified",
    verificationMethod: "challenge_bound_key_attestation",
    proofVerifiedByServer: true,
    challengeId: "challenge_12345678",
    deviceKeyId: "device_key_12345678",
    attestationDigest: "a".repeat(64),
    expiresAt: { toMillis: () => NOW + 60_000 },
  }, NOW), false);
  assert.equal(hasActiveBiometricVerification({ status: "verified" }, NOW), false);
  assert.equal(hasActiveBiometricVerification(null, NOW), false);
  assert.equal(hasActiveBiometricVerification("verified", NOW), false);
});
