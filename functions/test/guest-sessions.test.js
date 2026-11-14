const test = require("node:test");
const assert = require("node:assert/strict");
const { Timestamp } = require("firebase-admin/firestore");
const { isGuestSessionActive } = require("../lib/guest-sessions");

test("guest session expires at the exact server expiry boundary", () => {
  const now = 1_800_000_000_000;
  const session = { status: "active", expiresAt: Timestamp.fromMillis(now + 1) };
  assert.equal(isGuestSessionActive(session, now), true);
  assert.equal(isGuestSessionActive(session, now + 1), false);
});

test("guest session rejects missing, ended and malformed expiry records", () => {
  assert.equal(isGuestSessionActive(undefined, 100), false);
  assert.equal(isGuestSessionActive({ status: "ended", expiresAt: Timestamp.fromMillis(200) }, 100), false);
  assert.equal(isGuestSessionActive({ status: "active", expiresAt: "tomorrow" }, 100), false);
});
