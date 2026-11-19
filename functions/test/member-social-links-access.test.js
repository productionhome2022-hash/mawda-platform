const test = require("node:test");
const assert = require("node:assert/strict");
const {
  canEditMemberSocialLinks,
  canExposeMemberSocialLinks,
} = require("../lib/member-social-links-access");

const NOW = 1_800_000_000_000;
const manualReview = {
  status: "verified",
  verificationMethod: "owner_manual_review",
  reviewedBySuperOwner: true,
  reviewRequestId: "review_request_123",
  expiresAt: { toMillis: () => NOW + 60_000 },
};

test("only the same authenticated member with a completed profile can clear links; publishing remains proof-gated", () => {
  assert.equal(canEditMemberSocialLinks("member-a", "member-a", true, {}, manualReview, NOW), true);
  assert.equal(canEditMemberSocialLinks("member-a", "member-a", true, { instagram: "https://www.instagram.com/member" }, manualReview, NOW), false);
  assert.equal(canEditMemberSocialLinks("member-b", "member-a", true, {}, manualReview, NOW), false);
  assert.equal(canEditMemberSocialLinks("", "member-a", true, {}, manualReview, NOW), false);
  assert.equal(canEditMemberSocialLinks("member-a", "member-a", false, {}, manualReview, NOW), false);
});

test("expired, revoked, pending, malformed and missing biometric records deny link editing", () => {
  const denied = [
    { status: "verified", expiresAt: { toMillis: () => NOW - 1 } },
    { status: "verified", expiresAt: manualReview.expiresAt, revokedAt: { toMillis: () => NOW - 1 } },
    { status: "pending", expiresAt: manualReview.expiresAt },
    { status: "verified" },
    null,
  ];
  for (const record of denied) {
    assert.equal(canEditMemberSocialLinks("member-a", "member-a", true, { instagram: "https://www.instagram.com/member" }, record, NOW), false);
  }
});

test("profile links remain hidden until challenge-bound cryptographic proof is implemented", () => {
  assert.equal(canExposeMemberSocialLinks(true, manualReview, NOW), false);
  assert.equal(canExposeMemberSocialLinks(false, active, NOW), false);
  assert.equal(canExposeMemberSocialLinks(true, {
    status: "verified",
    expiresAt: { toMillis: () => NOW - 1 },
  }, NOW), false);
  assert.equal(canExposeMemberSocialLinks(true, {
    status: "verified",
    expiresAt: manualReview.expiresAt,
    revokedAt: new Date(NOW - 1),
  }, NOW), false);
});


test("members may clear existing links after expiry or revocation", () => {
  assert.equal(canEditMemberSocialLinks("member-a", "member-a", true, {}, null, NOW), true);
  assert.equal(canEditMemberSocialLinks("member-a", "member-a", true, {}, {
    status: "verified",
    expiresAt: { toMillis: () => NOW - 1 },
  }, NOW), true);
});
