const test = require("node:test");
const assert = require("node:assert/strict");
const { assertMessageLinksAllowed } = require("../lib/link-policy");

test("ordinary room members cannot send any links", () => {
  assert.throws(() => assertMessageLinksAllowed("See https://youtube.com/watch?v=1", false), /MESSAGE_LINK_NOT_ALLOWED/);
  assert.throws(() => assertMessageLinksAllowed("visit example.com", false), /MESSAGE_LINK_NOT_ALLOWED/);
});

test("approved roles and private chats can use only approved HTTPS platform hosts", () => {
  assert.doesNotThrow(() => assertMessageLinksAllowed("https://www.youtube.com/watch?v=1", true));
  assert.doesNotThrow(() => assertMessageLinksAllowed("https://youtu.be/abc", true));
  assert.doesNotThrow(() => assertMessageLinksAllowed("https://www.instagram.com/reel/abc", true));
  assert.doesNotThrow(() => assertMessageLinksAllowed("https://www.facebook.com/page", true));
  assert.doesNotThrow(() => assertMessageLinksAllowed("https://fb.watch/abc", true));
});

test("rejects unapproved domains, deceptive hosts, credentials and insecure schemes", () => {
  for (const value of [
    "https://youtube.com.evil.example/path",
    "https://youtube.com.evil.com/path",
    "https://bit.ly/example",
    "http://youtube.com/watch?v=1",
    "https://user:pass@youtube.com/watch?v=1",
  ]) assert.throws(() => assertMessageLinksAllowed(value, true), /MESSAGE_LINK_NOT_ALLOWED/);
});

test("rejects common dot obfuscation", () => {
  assert.throws(() => assertMessageLinksAllowed("youtube[.]com/watch", true), /MESSAGE_LINK_NOT_ALLOWED/);
  assert.throws(() => assertMessageLinksAllowed("instagram dot com/reel", true), /MESSAGE_LINK_NOT_ALLOWED/);
});

test("platform owner may send links to any domain using safe web schemes", () => {
  assert.doesNotThrow(() => assertMessageLinksAllowed("https://example.org/path", false, true));
  assert.doesNotThrow(() => assertMessageLinksAllowed("http://news.example.net", false, true));
  assert.throws(() => assertMessageLinksAllowed("javascript:alert(1)", false, true), /MESSAGE_LINK_NOT_ALLOWED/);
  assert.throws(() => assertMessageLinksAllowed("https://user:pass@example.org", false, true), /MESSAGE_LINK_NOT_ALLOWED/);
});
