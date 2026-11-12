const test = require("node:test");
const assert = require("node:assert/strict");
const {
  canEditMemberSocialLinks,
  canExposeMemberSocialLinks,
} = require("../lib/member-social-links-access");

const NOW = 1_800_000_000_000;
const active = {
  status: "verified",
  expiresAt: { toMillis: () => NOW + 60_000 },
};

test("only the same authenticated member with a completed profile and active biometric lease can edit links", () => {
  assert.equal(canEditMemberSocialLinks("member-a", "member-a", true, active, NOW), true);
  assert.equal(canEditMemberSocialLinks("member-b", "member-a", true, active, NOW), false);
  assert.equal(canEditMemberSocialLinks("", "member-a", true, active, NOW), false);
  assert.equal(canEditMemberSocialLinks("member-a", "member-a", false, active, NOW), false);
});

test("expired, revoked, pending, malformed and missing biometric records deny link editing", () => {
  const denied = [
    { status: "verified", expiresAt: { toMillis: () => NOW - 1 } },
    { status: "verified", expiresAt: active.expiresAt, revokedAt: { toMillis: () => NOW - 1 } },
    { status: "pending", expiresAt: active.expiresAt },
    { status: "verified" },
    null,
  ];
  for (const record of denied) {
    assert.equal(canEditMemberSocialLinks("member-a", "member-a", true, record, NOW), false);
  }
});

test("profile links are visible only for completed profiles with active non-revoked verification", () => {
  assert.equal(canExposeMemberSocialLinks(true, active, NOW), true);
  assert.equal(canExposeMemberSocialLinks(false, active, NOW), false);
  assert.equal(canExposeMemberSocialLinks(true, {
    status: "verified",
    expiresAt: { toMillis: () => NOW - 1 },
  }, NOW), false);
  assert.equal(canExposeMemberSocialLinks(true, {
    status: "verified",
    expiresAt: active.expiresAt,
    revokedAt: new Date(NOW - 1),
  }, NOW), false);
});
