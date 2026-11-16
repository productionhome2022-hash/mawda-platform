const test = require("node:test");
const assert = require("node:assert/strict");
const {
  validateCallRequest,
  canTransitionCall,
  validateCallSignal,
  CALL_RING_TIMEOUT_MS,
  CALL_SIGNAL_MAX_AGE_MS,
  CALL_SIGNAL_MAX_PER_CALLER,
} = require("../lib/call-signaling");

test("call requests accept only bounded identifiers, supported scopes and media modes", () => {
  assert.deepEqual(validateCallRequest({
    callId: "call_request_123456", scope: "direct", targetId: "chat_123", mode: "video",
  }), { callId: "call_request_123456", scope: "direct", targetId: "chat_123", mode: "video" });
  for (const value of [
    null, {}, { callId: "short", scope: "direct", targetId: "chat_123", mode: "audio" },
    { callId: "call_request_123456", scope: "unknown", targetId: "chat_123", mode: "audio" },
    { callId: "call_request_123456", scope: "direct", targetId: "chat_123", mode: "screen" },
  ]) assert.throws(() => validateCallRequest(value), /INVALID_CALL_REQUEST/);
});

test("call state transitions enforce caller/callee authority and terminal states", () => {
  const members = ["caller", "callee"];
  assert.equal(canTransitionCall("ringing", "accepted", "callee", "caller", members), true);
  assert.equal(canTransitionCall("ringing", "accepted", "caller", "caller", members), false);
  assert.equal(canTransitionCall("ringing", "cancelled", "caller", "caller", members), true);
  assert.equal(canTransitionCall("ringing", "cancelled", "callee", "caller", members), false);
  assert.equal(canTransitionCall("accepted", "ended", "callee", "caller", members), true);
  assert.equal(canTransitionCall("ended", "accepted", "callee", "caller", members), false);
  assert.equal(canTransitionCall("ringing", "rejected", "outsider", "caller", members), false);
});

test("signaling payloads are bounded JSON objects with monotonic sequence inputs", () => {
  assert.deepEqual(validateCallSignal({
    kind: "offer", payload: JSON.stringify({ type: "offer", sdp: "v=0" }), sequence: 0,
  }), { kind: "offer", payload: JSON.stringify({ type: "offer", sdp: "v=0" }), sequence: 0 });
  for (const value of [
    null, { kind: "candidate", payload: "{}", sequence: 0 },
    { kind: "offer", payload: "not-json", sequence: 0 },
    { kind: "ice", payload: JSON.stringify([]), sequence: 0 },
    { kind: "answer", payload: "{}", sequence: -1 },
    { kind: "ice", payload: "x".repeat(65537), sequence: 1 },
  ]) assert.throws(() => validateCallSignal(value), /INVALID_CALL_SIGNAL/);
});

test("call policy exposes conservative server-enforced expiry and signaling bounds", () => {
  assert.equal(CALL_RING_TIMEOUT_MS, 45_000);
  assert.equal(CALL_SIGNAL_MAX_AGE_MS, 120_000);
  assert.equal(CALL_SIGNAL_MAX_PER_CALLER, 256);
});
