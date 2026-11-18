const test = require("node:test");
const assert = require("node:assert/strict");
const {
  PLATFORM_ROLE_CAPACITY, platformRoleDisplayLabel, nextPermanentRoleOrdinal,
} = require("../lib/platform-role-identities");

test("general Admin sequence is open-ended and monotonic", () => {
  assert.equal(PLATFORM_ROLE_CAPACITY.platform_admin, null);
  assert.equal(nextPermanentRoleOrdinal([1, 2, 7]), 8);
  assert.equal(platformRoleDisplayLabel("platform_admin", 8), "Admin 8");
  assert.equal(platformRoleDisplayLabel("platform_admin", 2, "ar"), "أدمن ٢");
});

test("Admin Media and general production each have five independent seats", () => {
  assert.equal(PLATFORM_ROLE_CAPACITY.ad_general_supervisor, 5);
  assert.equal(PLATFORM_ROLE_CAPACITY.production_general_supervisor, 5);
  assert.equal(platformRoleDisplayLabel("ad_general_supervisor", 1), "Admin Media 1");
  assert.equal(platformRoleDisplayLabel("production_general_supervisor", 5, "ar"), "مشرف إنتاج عام ٥");
  assert.throws(() => platformRoleDisplayLabel("ad_general_supervisor", 6), /CAPACITY_EXCEEDED/);
});

test("Team Production Supervisor is open-ended and distinct", () => {
  assert.equal(PLATFORM_ROLE_CAPACITY.production_supervisor, null);
  assert.equal(platformRoleDisplayLabel("production_supervisor", 12), "Team Production Supervisor 12");
  assert.equal(platformRoleDisplayLabel("production_supervisor", 1, "ar"), "مشرف إنتاج الفريق ١");
});

test("sequence history rejects corrupt ordinals and never reuses removed slots", () => {
  assert.throws(() => nextPermanentRoleOrdinal([1, 0]), /HISTORY_INVALID/);
  assert.equal(nextPermanentRoleOrdinal([1, 2, 4]), 5);
});
