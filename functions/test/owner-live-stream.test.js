const test = require("node:test");
const assert = require("node:assert/strict");
const { validateOwnerLiveStreamInput } = require("../lib/owner-live-stream");

const valid = (overrides = {}) => ({
  requestId: "stream_req_123", scope: "direct", targetId: "a".repeat(64),
  url: "https://www.youtube.com/watch?v=abc123", title: "Live match",
  description: "Official public stream", ...overrides,
});

test("accepts HTTPS owner stream links and classifies known official provider domains", () => {
  const youtube = validateOwnerLiveStreamInput(valid());
  assert.equal(youtube.provider, "youtube");
  assert.equal(youtube.hostname, "www.youtube.com");
  assert.equal(validateOwnerLiveStreamInput(valid({url:"https://www.tiktok.com/@creator/live"})).provider, "tiktok");
  assert.equal(validateOwnerLiveStreamInput(valid({url:"https://example.org/watch/live"})).provider, "other");
});

test("rejects unsafe schemes, credentials, local/IP hosts, nonstandard ports and shorteners", () => {
  for (const url of [
    "http://example.com/live",
    "javascript:alert(1)",
    "https://user:pass@example.com/live",
    "https://localhost/live",
    "https://127.0.0.1/live",
    "https://192.168.1.20/live",
    "https://[::1]/live",
    "https://example.com:8443/live",
    "https://bit.ly/stream",
    "https://service.local/live",
  ]) assert.throws(() => validateOwnerLiveStreamInput(valid({url})));
});

test("rejects malformed, overlong and control-character URLs and unbounded text", () => {
  assert.throws(() => validateOwnerLiveStreamInput(valid({url:"not a url"})));
  assert.throws(() => validateOwnerLiveStreamInput(valid({url:"https://example.com/\nstream"})));
  assert.throws(() => validateOwnerLiveStreamInput(valid({title:"x".repeat(121)})));
  assert.throws(() => validateOwnerLiveStreamInput(valid({description:"x".repeat(501)})));
  assert.throws(() => validateOwnerLiveStreamInput({...valid(), arbitrary:"field"}));
});
