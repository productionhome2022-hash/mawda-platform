const test = require("node:test");
const assert = require("node:assert/strict");
const {
  validateMemberSocialLinks,
  projectMemberSocialLinks,
  canUpdateMemberSocialLinks,
  canChangeMemberSocialLinkVisibility,
} = require("../lib/member-social-links");

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
  ]) {
    assert.throws(() => validateMemberSocialLinks({ instagram: url }));
  }
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


test("expired or revoked members may clear links but cannot publish links", () => {
  const links = { instagram: "https://www.instagram.com/member/" };
  const empty = {};
  const expired = { status: "verified", expiresAt: { toMillis: () => 1_700_000_000_000 } };
  const revoked = {
    status: "verified",
    expiresAt: { toMillis: () => 1_900_000_000_000 },
    revokedAt: { toMillis: () => 1_700_000_000_000 },
  };
  assert.equal(canUpdateMemberSocialLinks(empty, expired, 1_800_000_000_000), true);
  assert.equal(canUpdateMemberSocialLinks(empty, revoked, 1_800_000_000_000), true);
  assert.equal(canUpdateMemberSocialLinks(links, expired, 1_800_000_000_000), false);
  assert.equal(canUpdateMemberSocialLinks(links, revoked, 1_800_000_000_000), false);
  assert.equal(canUpdateMemberSocialLinks(links, {
    status: "verified",
    expiresAt: { toMillis: () => 1_900_000_000_000 },
  }, 1_800_000_000_000), true);
});


test("a member may hide a link after verification expires, but revealing it requires an active lease", () => {
  const expired = { status: "verified", expiresAt: { toMillis: () => 1_700_000_000_000 } };
  const active = { status: "verified", expiresAt: { toMillis: () => 1_900_000_000_000 } };
  const now = 1_800_000_000_000;
  assert.equal(canChangeMemberSocialLinkVisibility(true, expired, now), true);
  assert.equal(canChangeMemberSocialLinkVisibility(true, null, now), true);
  assert.equal(canChangeMemberSocialLinkVisibility(false, expired, now), false);
  assert.equal(canChangeMemberSocialLinkVisibility(false, null, now), false);
  assert.equal(canChangeMemberSocialLinkVisibility(false, active, now), true);
});
