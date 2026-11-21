const test = require("node:test");
const assert = require("node:assert/strict");
const { hasPlatformOwnerSession } = require("../lib/owner-access");

const now = 1_800_000_000;
const validOwnerToken = {
  platformOwner: true,
  platformOwnerUid: "owner-uid",
  auth_time: now - 60,
  firebase: { sign_in_second_factor: "totp" },
};

test("owner operations require owner claim, second factor and recent authentication", () => {
  assert.equal(hasPlatformOwnerSession(validOwnerToken, now), true);
  assert.equal(hasPlatformOwnerSession(validOwnerToken, now, "owner-uid"), true);
  assert.equal(hasPlatformOwnerSession(validOwnerToken, now, "different-owner"), false);
  assert.equal(hasPlatformOwnerSession({ ...validOwnerToken, auth_time: now - 900 }, now), true);
  assert.equal(hasPlatformOwnerSession({ ...validOwnerToken, auth_time: now }, now), true);
  assert.equal(hasPlatformOwnerSession({ ...validOwnerToken, auth_time: now - 901 }, now), false);
  assert.equal(hasPlatformOwnerSession({ ...validOwnerToken, auth_time: now + 1 }, now), false);
  assert.equal(hasPlatformOwnerSession({ ...validOwnerToken, auth_time: undefined }, now), false);
  assert.equal(hasPlatformOwnerSession({
    ...validOwnerToken,
    firebase: { sign_in_second_factor: "" },
  }, now), false);
  assert.equal(hasPlatformOwnerSession({
    ...validOwnerToken,
    firebase: { sign_in_provider: "password" },
  }, now), false);
  assert.equal(hasPlatformOwnerSession({ ...validOwnerToken, platformOwner: false }, now), false);
  assert.equal(hasPlatformOwnerSession({ platformOwner: true }, now), false);
  assert.equal(hasPlatformOwnerSession({ ...validOwnerToken, firebase: [] }, now), false);
  assert.equal(hasPlatformOwnerSession({ ...validOwnerToken, firebase: null }, now), false);
});
