const test = require("node:test");
const assert = require("node:assert/strict");
const { validateMemberSocialLinks, projectMemberSocialLinks } = require("../lib/member-social-links");

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
