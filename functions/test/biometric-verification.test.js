const test = require("node:test");
const assert = require("node:assert/strict");
const { hasActiveBiometricVerification } = require("../lib/biometric-verification");

const NOW = 1_800_000_000_000;
const acceptedReview = (uid) => ({
  status: "verified",
  verificationMethod: "super_owner_manual_review",
  trustModel: "server_authoritative_owner_decision",
  reviewerRole: "super_owner",
  reviewerMfaVerified: true,
  decision: "accepted",
  reviewerUid: "super_owner_uid_0001",
  reviewRequestId: "review_request_identifier_123456",
  acceptedAt: { toMillis: () => NOW - 10_000 },
  reviewerMfaAt: { toMillis: () => NOW - 11_000 },
  expiresAt: { toMillis: () => NOW + 60_000 },
  accountUid: uid,
});

test("only an accepted Super Owner manual review for the same account is eligible", () => {
  assert.equal(hasActiveBiometricVerification(acceptedReview("member_uid_0001"), "member_uid_0001", NOW), true);
  assert.equal(hasActiveBiometricVerification(acceptedReview("other_member_0001"), "member_uid_0001", NOW), false);
});

test("legacy flags and provider-attestation-only records do not qualify as manual review", () => {
  assert.equal(hasActiveBiometricVerification({ status: "verified", expiresAt: { toMillis: () => NOW + 60_000 } }, "member_uid_0001", NOW), false);
  assert.equal(hasActiveBiometricVerification({
    ...acceptedReview("member_uid_0001"),
    verificationMethod: "server_verified_device_attestation",
  }, "member_uid_0001", NOW), false);
  assert.equal(hasActiveBiometricVerification({
    ...acceptedReview("member_uid_0001"),
    trustModel: "challenge_bound_device_key",
  }, "member_uid_0001", NOW), false);
});

test("missing, malformed, expired, revoked, forged and future-dated review records fail closed", () => {
  const base = acceptedReview("member_uid_0001");
  const denied = [
    null, "verified", { status: "verified" },
    { ...base, expiresAt: { toMillis: () => NOW - 1 } },
    { ...base, revokedAt: { toMillis: () => NOW - 1 } },
    { ...base, reviewerRole: "admin" },
    { ...base, reviewerMfaVerified: false },
    { ...base, reviewerUid: "member_uid_0001" },
    { ...base, reviewRequestId: "bad" },
    { ...base, decision: "rejected" },
    { ...base, acceptedAt: { toMillis: () => NOW + 1 } },
    { ...base, reviewerMfaAt: { toMillis: () => NOW + 1 } },
    { ...base, reviewerMfaAt: { toMillis: () => NOW - 20 * 60 * 1000 } },
    { ...base, expiresAt: { toMillis: () => NOW - 20_000 } },
  ];
  for (const value of denied) {
    assert.equal(hasActiveBiometricVerification(value, "member_uid_0001", NOW), false);
  }
  assert.equal(hasActiveBiometricVerification(base, "", NOW), false);
  assert.equal(hasActiveBiometricVerification(base, "member_uid_0001", Number.NaN), false);
});
