const test = require("node:test");
const assert = require("node:assert/strict");
const { hasActiveBiometricVerification } = require("../lib/biometric-verification");

const NOW = 1_800_000_000_000;
const activeProof = (uid) => ({
  status: "verified",
  verificationMethod: "server_verified_device_attestation",
  trustModel: "challenge_bound_device_key",
  expiresAt: { toMillis: () => NOW + 60_000 },
  serverProof: {
    status: "verified",
    provider: "android_play_integrity",
    accountUid: uid,
    deviceKeyId: "device_key_identifier_123456",
    challengeId: "server_challenge_identifier_123456",
    proofDigest: "a".repeat(64),
    signatureVerified: true,
    attestationVerified: true,
    nonceConsumed: true,
    verifiedAt: { toMillis: () => NOW - 10_000 },
    nonceConsumedAt: { toMillis: () => NOW - 9_000 },
  },
});

test("only server-verified challenge-bound proof for the same account is eligible", () => {
  assert.equal(hasActiveBiometricVerification(activeProof("member_uid_0001"), "member_uid_0001", NOW), true);
  assert.equal(hasActiveBiometricVerification(activeProof("other_member_0001"), "member_uid_0001", NOW), false);
});

test("legacy verified status and local OS prompt claims fail closed", () => {
  assert.equal(hasActiveBiometricVerification({ status: "verified", expiresAt: { toMillis: () => NOW + 60_000 } }, "member_uid_0001", NOW), false);
  assert.equal(hasActiveBiometricVerification({
    ...activeProof("member_uid_0001"), verificationMethod: "local_os_biometric_prompt",
  }, "member_uid_0001", NOW), false);
  assert.equal(hasActiveBiometricVerification({
    ...activeProof("member_uid_0001"), trustModel: "client_claim_after_local_os_prompt",
  }, "member_uid_0001", NOW), false);
});

test("missing, malformed, expired, revoked and future-dated proof fails closed", () => {
  const base = activeProof("member_uid_0001");
  const denied = [
    null, "verified", { status: "verified" },
    { ...base, expiresAt: { toMillis: () => NOW - 1 } },
    { ...base, revokedAt: { toMillis: () => NOW - 1 } },
    { ...base, serverProof: { ...base.serverProof, signatureVerified: false } },
    { ...base, serverProof: { ...base.serverProof, attestationVerified: false } },
    { ...base, serverProof: { ...base.serverProof, nonceConsumed: false } },
    { ...base, serverProof: { ...base.serverProof, proofDigest: "bad" } },
    { ...base, serverProof: { ...base.serverProof, challengeId: "" } },
    { ...base, serverProof: { ...base.serverProof, verifiedAt: { toMillis: () => NOW + 1 } } },
    { ...base, serverProof: { ...base.serverProof, nonceConsumedAt: { toMillis: () => NOW - 20_000 } } },
    { ...base, serverProof: { ...base.serverProof, provider: "unknown_provider" } },
  ];
  for (const value of denied) {
    assert.equal(hasActiveBiometricVerification(value, "member_uid_0001", NOW), false);
  }
  assert.equal(hasActiveBiometricVerification(base, "", NOW), false);
  assert.equal(hasActiveBiometricVerification(base, "member_uid_0001", Number.NaN), false);
});
