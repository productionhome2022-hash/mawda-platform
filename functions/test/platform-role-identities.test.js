const test = require("node:test");
const assert = require("node:assert/strict");
const {
  PLATFORM_ROLE_IDS, PLATFORM_ROLE_CAPACITY, platformRoleCapacity, platformRoleDisplayLabel, nextPermanentRoleOrdinal, assertPlatformRoleCapacity,
} = require("../lib/platform-role-identities");

test("general Admin sequence is open-ended and monotonic", () => {
  assert.equal(PLATFORM_ROLE_IDS.superOwner, "super_admin");
  assert.equal(PLATFORM_ROLE_CAPACITY.platform_admin, null);
  assert.equal(nextPermanentRoleOrdinal("platform_admin", [1, 2, 7]), 8);
  assert.equal(platformRoleDisplayLabel("platform_admin", 8), "Admin 8");
  assert.equal(platformRoleDisplayLabel("platform_admin", 2, "ar"), "أدمن ٢");
});

test("fixed specialist teams have independently enforced seat capacities", () => {
  assert.equal(PLATFORM_ROLE_CAPACITY.ad_general_supervisor, 5);
  assert.equal(PLATFORM_ROLE_CAPACITY.production_general_supervisor, 5);
  assert.equal(PLATFORM_ROLE_CAPACITY.production_quality_reviewer, 5);
  assert.equal(PLATFORM_ROLE_CAPACITY.legal_administrative_supervisor, 4);
  assert.equal(platformRoleDisplayLabel("ad_general_supervisor", 1), "Admin Media 1");
  assert.equal(platformRoleDisplayLabel("production_general_supervisor", 5, "ar"), "المشرف العام للإنتاج ٥");
  assert.equal(platformRoleDisplayLabel("production_quality_reviewer", 5), "Production Quality Reviewer 5");
  assert.equal(platformRoleDisplayLabel("legal_administrative_supervisor", 4), "Legal and Administrative Supervisor 4");
  assert.throws(() => platformRoleDisplayLabel("ad_general_supervisor", 6), /CAPACITY_EXCEEDED/);
  assert.throws(() => platformRoleDisplayLabel("legal_administrative_supervisor", 5), /CAPACITY_EXCEEDED/);
});

test("Team Production Supervisor is open-ended and distinct", () => {
  assert.equal(PLATFORM_ROLE_CAPACITY.production_supervisor, null);
  assert.equal(platformRoleDisplayLabel("production_supervisor", 12), "Team Production Supervisor");
  assert.equal(platformRoleDisplayLabel("production_supervisor", 1, "ar"), "مشرف إنتاج الفريق");
});

test("role seat capacity guard enforces fixed teams and owner-configurable general production capacity", () => {
  assert.doesNotThrow(() => assertPlatformRoleCapacity("ad_general_supervisor", 5));
  assert.doesNotThrow(() => assertPlatformRoleCapacity("production_general_supervisor", 5));
  assert.doesNotThrow(() => assertPlatformRoleCapacity("production_quality_reviewer", 5));
  assert.doesNotThrow(() => assertPlatformRoleCapacity("legal_administrative_supervisor", 4));
  assert.throws(() => assertPlatformRoleCapacity("ad_general_supervisor", 6), /CAPACITY_EXCEEDED/);
  assert.throws(() => assertPlatformRoleCapacity("production_quality_reviewer", 6), /CAPACITY_EXCEEDED/);
  assert.throws(() => assertPlatformRoleCapacity("legal_administrative_supervisor", 5), /CAPACITY_EXCEEDED/);
  assert.throws(() => assertPlatformRoleCapacity("production_general_supervisor", 6), /CAPACITY_EXCEEDED/);
  assert.equal(platformRoleCapacity("production_general_supervisor", 8), 8);
  assert.doesNotThrow(() => assertPlatformRoleCapacity("production_general_supervisor", 8, 8));
  assert.throws(() => platformRoleCapacity("ad_general_supervisor", 6), /OVERRIDE_INVALID/);
  assert.throws(() => platformRoleCapacity("production_general_supervisor", 4), /OVERRIDE_INVALID/);
  assert.doesNotThrow(() => assertPlatformRoleCapacity("platform_admin", 1000));
  assert.doesNotThrow(() => assertPlatformRoleCapacity("production_supervisor", 1000));
  assert.throws(() => assertPlatformRoleCapacity("platform_admin", -1), /ACTIVE_COUNT_INVALID/);
});

test("Admin N sequence is permanent while fixed five-seat numbering reuse remains unresolved", () => {
  assert.throws(() => nextPermanentRoleOrdinal("platform_admin", [1, 0]), /HISTORY_INVALID/);
  assert.equal(nextPermanentRoleOrdinal("platform_admin", [1, 2, 4]), 5);
  assert.throws(
    () => nextPermanentRoleOrdinal("ad_general_supervisor", [1, 2]),
    /SEQUENCE_POLICY_NOT_APPROVED/,
  );
  assert.throws(
    () => nextPermanentRoleOrdinal("production_general_supervisor", [1, 2]),
    /SEQUENCE_POLICY_NOT_APPROVED/,
  );
});
