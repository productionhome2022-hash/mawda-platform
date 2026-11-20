const test = require("node:test");
const assert = require("node:assert/strict");
const {
  canEditMemberSocialLinks,
  canExposeMemberSocialLinks,
} = require("../lib/member-social-links-access");

const NOW = 1_800_000_000_000;
const active = (uid) => ({
  status: "verified",
  verificationMethod: "server_verified_device_attestation",
  trustModel: "challenge_bound_device_key",
  expiresAt: { toMillis: () => NOW + 60_000 },
  serverProof: {
    status: "verified",
    provider: "ios_app_attest",
    accountUid: uid,
    deviceKeyId: "device_key_identifier_123456",
    challengeId: "server_challenge_identifier_123456",
    proofDigest: "b".repeat(64),
    signatureVerified: true,
    attestationVerified: true,
    nonceConsumed: true,
    verifiedAt: { toMillis: () => NOW - 10_000 },
    nonceConsumedAt: { toMillis: () => NOW - 9_000 },
  },
});

test("only the same authenticated member with completed profile and same-account proof can edit links", () => {
  assert.equal(canEditMemberSocialLinks("member-a", "member-a", true, { instagram: "https://www.instagram.com/member" }, active("member-a"), NOW), true);
  assert.equal(canEditMemberSocialLinks("member-b", "member-a", true, {}, active("member-a"), NOW), false);
  assert.equal(canEditMemberSocialLinks("", "member-a", true, {}, active("member-a"), NOW), false);
  assert.equal(canEditMemberSocialLinks("member-a", "member-a", false, {}, active("member-a"), NOW), false);
});

test("expired, revoked, pending, malformed, missing and cross-account proof denies link editing", () => {
  const valid = active("member-a");
  const denied = [
    { ...valid, expiresAt: { toMillis: () => NOW - 1 } },
    { ...valid, revokedAt: { toMillis: () => NOW - 1 } },
    { status: "pending", expiresAt: valid.expiresAt },
    { status: "verified", expiresAt: valid.expiresAt },
    { ...valid, serverProof: { ...valid.serverProof, accountUid: "member-b" } },
    null,
  ];
  for (const record of denied) {
    assert.equal(canEditMemberSocialLinks("member-a", "member-a", true, { instagram: "https://www.instagram.com/member" }, record, NOW), false);
  }
});

test("profile links require completed profile and proof bound to the profile account", () => {
  assert.equal(canExposeMemberSocialLinks(true, "member-a", active("member-a"), NOW), true);
  assert.equal(canExposeMemberSocialLinks(false, "member-a", active("member-a"), NOW), false);
  assert.equal(canExposeMemberSocialLinks(true, "member-a", active("member-b"), NOW), false);
  assert.equal(canExposeMemberSocialLinks(true, "member-a", {
    ...active("member-a"), expiresAt: { toMillis: () => NOW - 1 },
  }, NOW), false);
});

test("members may clear links after expiry or revocation", () => {
  assert.equal(canEditMemberSocialLinks("member-a", "member-a", true, {}, null, NOW), true);
  assert.equal(canEditMemberSocialLinks("member-a", "member-a", true, {}, {
    status: "verified", expiresAt: { toMillis: () => NOW - 1 },
  }, NOW), true);
});
