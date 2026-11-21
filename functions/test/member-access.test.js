const test = require("node:test");
const assert = require("node:assert/strict");
const { isMemberAccountInGoodStanding } = require("../lib/member-access");

test("active and legacy profiles are in good standing", () => {
  assert.equal(isMemberAccountInGoodStanding({ accountStatus: "active" }), true);
  assert.equal(isMemberAccountInGoodStanding({}), true);
});

test("suspended, banned, and unknown explicit states fail closed", () => {
  for (const accountStatus of ["suspended", "banned", "pending", "disabled", "unknown"]) {
    assert.equal(isMemberAccountInGoodStanding({ accountStatus }), false);
  }
  assert.equal(isMemberAccountInGoodStanding({ isBanned: true }), false);
  assert.equal(isMemberAccountInGoodStanding({ isSuspended: true }), false);
});

test("malformed member records fail closed", () => {
  assert.equal(isMemberAccountInGoodStanding(null), false);
  assert.equal(isMemberAccountInGoodStanding("active"), false);
  assert.equal(isMemberAccountInGoodStanding([]), false);
});
