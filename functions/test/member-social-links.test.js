const test = require("node:test");
const assert = require("node:assert/strict");
const {
  validateMemberSocialLinks,
  projectMemberSocialLinks,
  canUpdateMemberSocialLinks,
  canChangeMemberSocialLinkVisibility,
} = require("../lib/member-social-links");

const NOW = 1_800_000_000_000;
const activeProof = (uid) => ({
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

test("accepts only HTTPS URLs on the matching official provider domains", () => {
  assert.deepEqual(validateMemberSocialLinks({
    instagram: "https://www.instagram.com/member/",
    x: "https://x.com/member",
    facebook: "https://facebook.com/member",
    whatsapp: "https://wa.me/49123456789",
  }), {
    instagram: "https://www.instagram.com/member/",
    x: "https://x.com/member",
    facebook: "https://facebook.com/member",
    whatsapp: "https://wa.me/49123456789",
  });
});

test("rejects deceptive hosts, unsafe schemes, credentials and unknown providers", () => {
  for (const url of [
    "http://instagram.com/member",
    "https://instagram.com.attacker.example/member",
    "https://attacker.example/instagram.com",
    "https://user:pass@instagram.com/member",
    "javascript:alert(1)",
    "https://bit.ly/member",
  ]) assert.throws(() => validateMemberSocialLinks({ instagram: url }));
  assert.throws(() => validateMemberSocialLinks({ tiktok: "https://tiktok.com/member" }));
});

test("empty values remove links and malformed stored values are omitted on projection", () => {
  assert.deepEqual(validateMemberSocialLinks({ instagram: "", x: null }), {});
  assert.deepEqual(projectMemberSocialLinks({
    instagram: "https://instagram.com/member",
    facebook: "https://facebook.com.evil.example/member",
    x: "http://x.com/member",
  }), { instagram: "https://instagram.com/member" });
});

test("only the same-account Super Owner manual review permits publishing and revealing links", () => {
  const links = { instagram: "https://www.instagram.com/member/" };
  const empty = {};
  assert.equal(canUpdateMemberSocialLinks(links, activeProof("member-a"), "member-a", NOW), true);
  assert.equal(canUpdateMemberSocialLinks(links, activeProof("member-b"), "member-a", NOW), false);
  assert.equal(canChangeMemberSocialLinkVisibility(false, activeProof("member-a"), "member-a", NOW), true);
  assert.equal(canChangeMemberSocialLinkVisibility(false, activeProof("member-b"), "member-a", NOW), false);
  assert.equal(canChangeMemberSocialLinkVisibility(true, null, "member-a", NOW), true);
  assert.equal(canUpdateMemberSocialLinks(empty, null, "member-a", NOW), true);
});

test("expired, revoked, legacy and incomplete manual-review records deny publication but allow clearing/hiding", () => {
  const links = { instagram: "https://www.instagram.com/member/" };
  const expired = { ...activeProof("member-a"), expiresAt: { toMillis: () => NOW - 1 } };
  const revoked = { ...activeProof("member-a"), revokedAt: { toMillis: () => NOW - 1 } };
  const legacy = { status: "verified", expiresAt: { toMillis: () => NOW + 60_000 } };
  for (const record of [expired, revoked, legacy, null]) {
    assert.equal(canUpdateMemberSocialLinks(links, record, "member-a", NOW), false);
    assert.equal(canChangeMemberSocialLinkVisibility(false, record, "member-a", NOW), false);
    assert.equal(canUpdateMemberSocialLinks({}, record, "member-a", NOW), true);
    assert.equal(canChangeMemberSocialLinkVisibility(true, record, "member-a", NOW), true);
  }
});
