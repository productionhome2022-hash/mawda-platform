const test = require("node:test");
const assert = require("node:assert/strict");
const { hasPlatformOwnerSession } = require("../lib/owner-access");

test("owner operations require both the owner claim and a second-factor sign-in", () => {
  assert.equal(hasPlatformOwnerSession({
    platformOwner: true,
    firebase: { sign_in_second_factor: "totp" },
  }), true);
  assert.equal(hasPlatformOwnerSession({
    platformOwner: true,
    firebase: { sign_in_second_factor: "" },
  }), false);
  assert.equal(hasPlatformOwnerSession({
    platformOwner: true,
    firebase: { sign_in_provider: "password" },
  }), false);
  assert.equal(hasPlatformOwnerSession({
    platformOwner: false,
    firebase: { sign_in_second_factor: "totp" },
  }), false);
  assert.equal(hasPlatformOwnerSession({ platformOwner: true }), false);
});
