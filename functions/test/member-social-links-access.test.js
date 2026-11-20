const test = require("node:test");
const assert = require("node:assert/strict");
const {
  canEditMemberSocialLinks,
  canExposeMemberSocialLinks,
} = require("../lib/member-social-links-access");

const NOW = 1_800_000_000_000;
const active = (uid) => ({
  status: "verified",
  verificationMethod: "super_owner_manual_review",
  trustModel: "server_authoritative_owner_decision",
  reviewerRole: "super_owner",
  reviewerMfaVerified: true,
  decision: "accepted",
  reviewerUid: "super_owner_uid_0001",
  reviewRequestId: "review_request_identifier_123456",
  accountUid: uid,
  acceptedAt: { toMillis: () => NOW - 10_000 },
  reviewerMfaAt: { toMillis: () => NOW - 11_000 },
  expiresAt: { toMillis: () => NOW + 60_000 },
});

test("only the same authenticated member with completed profile and Super Owner accepted review can edit links", () => {
  assert.equal(canEditMemberSocialLinks("member-a", "member-a", true, { instagram: "https://www.instagram.com/member" }, active("member-a"), NOW), true);
  assert.equal(canEditMemberSocialLinks("member-b", "member-a", true, {}, active("member-a"), NOW), false);
  assert.equal(canEditMemberSocialLinks("", "member-a", true, {}, active("member-a"), NOW), false);
  assert.equal(canEditMemberSocialLinks("member-a", "member-a", false, {}, active("member-a"), NOW), false);
});

test("expired, revoked, pending, malformed, missing and cross-account review lease denies link editing", () => {
  const valid = active("member-a");
  const denied = [
    { ...valid, expiresAt: { toMillis: () => NOW - 1 } },
    { ...valid, revokedAt: { toMillis: () => NOW - 1 } },
    { status: "pending", expiresAt: valid.expiresAt },
    { status: "verified", expiresAt: valid.expiresAt },
    { ...valid, accountUid: "member-b" },
    null,
  ];
  for (const record of denied) {
    assert.equal(canEditMemberSocialLinks("member-a", "member-a", true, { instagram: "https://www.instagram.com/member" }, record, NOW), false);
  }
});

test("profile links require completed profile and Super Owner review bound to the profile account", () => {
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
