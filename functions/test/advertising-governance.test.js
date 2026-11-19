const test = require("node:test");
const assert = require("node:assert/strict");
const {
  validateSpecializedRoleGrant, hasAdvertisingPermission,
  canSignUnderDelegation, validateProductionRoomRoster,
  canPublishProductionAchievement, specializedRoleGrantId,
} = require("../lib/advertising-governance");

const activeGrant = () => validateSpecializedRoleGrant({
  uid: "member_uid_0001",
  role: "ad_general_supervisor",
  permissions: ["advertising.requests.review", "advertising.rooms.observe_assigned"],
  resourceScopes: ["campaign:campaign_123", "room:room_123"],
  status: "active", startsAtMs: 100, endsAtMs: 1000, version: 1,
});

test("specialized roles cannot contain platform, finance or owner override permissions", () => {
  assert.throws(() => validateSpecializedRoleGrant({
    uid: "member_uid_0001", role: "ad_general_supervisor",
    permissions: ["platform.admin"], resourceScopes: ["campaign:campaign_123"],
    status: "active", startsAtMs: 100, endsAtMs: 1000, version: 1,
  }), /SPECIALIZED_PERMISSION_FORBIDDEN/);
  assert.throws(() => validateSpecializedRoleGrant({
    uid: "member_uid_0001", role: "ad_general_supervisor",
    permissions: ["advertising.commission.set"], resourceScopes: ["campaign:campaign_123"],
    status: "active", startsAtMs: 100, endsAtMs: 1000, version: 1,
  }), /SPECIALIZED_PERMISSION_FORBIDDEN/);
});

test("Admin Media cannot receive delegated contract-signing authority", () => {
  assert.throws(() => validateSpecializedRoleGrant({
    uid: "member_uid_0001", role: "ad_general_supervisor",
    permissions: ["contracts.sign_delegated"],
    resourceScopes: ["contract:contract_123"],
    status: "active", startsAtMs: 100, endsAtMs: 1000, version: 1,
  }), /SPECIALIZED_ROLE_PERMISSION_BOUNDARY_VIOLATION/);
});

test("representative, quality-review and legal-supervisor grants fail closed until their own matrices are approved", () => {
  for (const role of [
    "ad_representative",
    "production_quality_reviewer",
    "legal_administrative_supervisor",
  ]) {
    assert.throws(() => validateSpecializedRoleGrant({
      uid: "member_uid_0001", role,
      permissions: ["advertising.requests.review"],
      resourceScopes: ["campaign:campaign_123"],
      status: "active", startsAtMs: 100, endsAtMs: 1000, version: 1,
    }), /SPECIALIZED_ROLE_PERMISSION_MATRIX_NOT_CONFIGURED/);
  }
});

test("Admin Media cannot receive production permissions", () => {
  assert.throws(() => validateSpecializedRoleGrant({
    uid: "member_uid_0001", role: "ad_general_supervisor",
    permissions: ["production.tasks.manage_assigned"],
    resourceScopes: ["room:room_123"],
    status: "active", startsAtMs: 100, endsAtMs: 1000, version: 1,
  }), /SPECIALIZED_ROLE_PERMISSION_BOUNDARY_VIOLATION/);
});

test("general production supervisors cannot receive advertising permissions", () => {
  assert.throws(() => validateSpecializedRoleGrant({
    uid: "member_uid_0001", role: "production_general_supervisor",
    permissions: ["advertising.requests.review"],
    resourceScopes: ["campaign:campaign_123"],
    status: "active", startsAtMs: 100, endsAtMs: 1000, version: 1,
  }), /SPECIALIZED_ROLE_PERMISSION_BOUNDARY_VIOLATION/);
});

test("Team Production Supervisor is limited to assigned-team operational permissions", () => {
  assert.doesNotThrow(() => validateSpecializedRoleGrant({
    uid: "member_uid_0001", role: "production_supervisor",
    permissions: ["production.tasks.manage_assigned", "production.reviews.write"],
    resourceScopes: ["team:team_123", "room:room_123"],
    status: "active", startsAtMs: 100, endsAtMs: 1000, version: 1,
  }));
  assert.throws(() => validateSpecializedRoleGrant({
    uid: "member_uid_0001", role: "production_supervisor",
    permissions: ["production.rooms.create"],
    resourceScopes: ["team:team_123"],
    status: "active", startsAtMs: 100, endsAtMs: 1000, version: 1,
  }), /SPECIALIZED_ROLE_PERMISSION_BOUNDARY_VIOLATION/);
  assert.throws(() => validateSpecializedRoleGrant({
    uid: "member_uid_0001", role: "production_supervisor",
    permissions: ["advertising.requests.review"],
    resourceScopes: ["campaign:campaign_123"],
    status: "active", startsAtMs: 100, endsAtMs: 1000, version: 1,
  }), /SPECIALIZED_ROLE_PERMISSION_BOUNDARY_VIOLATION/);
});

test("permissions require exact UID, permission, active time and resource scope", () => {
  const grants = [activeGrant()];
  const base = { ownerVerified: false, grants, uid: "member_uid_0001",
    permission: "advertising.requests.review", resourceScope: "campaign:campaign_123", nowMs: 200 };
  assert.equal(hasAdvertisingPermission(base), true);
  assert.equal(hasAdvertisingPermission({ ...base, resourceScope: "campaign:other" }), false);
  assert.equal(hasAdvertisingPermission({ ...base, uid: "other_uid_0001" }), false);
  assert.equal(hasAdvertisingPermission({ ...base, nowMs: 1000 }), false);
  assert.equal(hasAdvertisingPermission({ ...base, permission: "advertising.campaigns.publish" }), false);
});

test("owner verified authority is distinct from specialized grants", () => {
  assert.equal(hasAdvertisingPermission({
    ownerVerified: true, grants: [], uid: "owner_uid_0001",
    permission: "advertising.campaigns.publish", resourceScope: "campaign:x", nowMs: 200,
  }), true);
});

test("delegated contract signing requires a live exact-scope delegation", () => {
  const delegation = {
    delegateUid: "legal_uid_0001", contractTypes: ["advertiser_direct"],
    maxCommitmentMinor: 50000, currency: "EUR", startsAtMs: 100, endsAtMs: 500,
    active: true, ownerCoSignatureRequired: true, delegationVersion: 2,
  };
  const args = { delegation, delegateUid: "legal_uid_0001", contractType: "advertiser_direct",
    commitmentMinor: 30000, currency: "EUR", nowMs: 200, ownerCoSignaturePresent: false };
  assert.equal(canSignUnderDelegation(args), false);
  assert.equal(canSignUnderDelegation({ ...args, ownerCoSignaturePresent: true }), true);
  assert.equal(canSignUnderDelegation({ ...args, commitmentMinor: 60000, ownerCoSignaturePresent: true }), false);
  assert.equal(canSignUnderDelegation({ ...args, contractType: "influencer", ownerCoSignaturePresent: true }), false);
  assert.equal(canSignUnderDelegation({ ...args, nowMs: 500, ownerCoSignaturePresent: true }), false);
});

test("production roster caps team at five and keeps privileged observers outside it", () => {
  assert.deepEqual(validateProductionRoomRoster({
    teamMemberUids: ["producer_0001", "member_0001", "member_0002"],
    privilegedObserverUids: ["owner_uid_0001", "supervisor_0001"],
  }).privilegedObserverUids, ["owner_uid_0001", "supervisor_0001"]);
  assert.throws(() => validateProductionRoomRoster({
    teamMemberUids: ["producer_0001", "memb_000001", "memb_000002", "memb_000003", "memb_000004", "memb_000005"],
    privilegedObserverUids: [],
  }), /PRODUCTION_ROSTER_INVALID/);
  assert.throws(() => validateProductionRoomRoster({
    teamMemberUids: ["member_000001"], privilegedObserverUids: ["member_000001"],
  }), /PRODUCTION_ROSTER_INVALID/);
});

test("public achievement requires independent owner approval and rights/disclosure clearance", () => {
  const valid = { ownerVerified: true, ownerApprovalRecorded: true, rightsCleared: true, participantDisclosureCleared: true };
  assert.equal(canPublishProductionAchievement(valid), true);
  assert.equal(canPublishProductionAchievement({ ...valid, ownerApprovalRecorded: false }), false);
  assert.equal(canPublishProductionAchievement({ ...valid, rightsCleared: false }), false);
});


test("specialized grant identity is stable across scope updates and distinct by role", () => {
  const original = specializedRoleGrantId("member_uid_0001", "ad_general_supervisor");
  const sameRole = specializedRoleGrantId("member_uid_0001", "ad_general_supervisor");
  const anotherRole = specializedRoleGrantId("member_uid_0001", "production_supervisor");
  assert.equal(original, sameRole);
  assert.notEqual(original, anotherRole);
  assert.throws(() => specializedRoleGrantId("short", "ad_general_supervisor"), /SPECIALIZED_GRANT_ID_INVALID/);
});

test("specialized role grants cannot be saved with an empty permission list", () => {
  assert.throws(() => validateSpecializedRoleGrant({
    uid: "member_uid_0001", role: "ad_general_supervisor", permissions: [],
    resourceScopes: ["campaign:campaign_123"], status: "active",
    startsAtMs: 100, endsAtMs: 1000, version: 1,
  }), /SPECIALIZED_GRANT_INVALID/);
});
