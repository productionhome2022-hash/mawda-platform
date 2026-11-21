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
  permissions: ["advertising.requests.view_assigned", "advertising.workspace.message_representatives"],
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

test("permissions require exact UID, permission, active time and resource scope", () => {
  const grants = [activeGrant()];
  const base = { ownerVerified: false, grants, uid: "member_uid_0001",
    permission: "advertising.requests.view_assigned", resourceScope: "campaign:campaign_123", nowMs: 200 };
  assert.equal(hasAdvertisingPermission(base), true);
  assert.equal(hasAdvertisingPermission({ ...base, resourceScope: "campaign:other" }), false);
  assert.equal(hasAdvertisingPermission({ ...base, uid: "other_uid_0001" }), false);
  assert.equal(hasAdvertisingPermission({ ...base, nowMs: 1000 }), false);
  assert.equal(hasAdvertisingPermission({ ...base, permission: "advertising.campaign.publish" }), false);
});

test("owner verified authority is distinct from specialized grants", () => {
  assert.equal(hasAdvertisingPermission({
    ownerVerified: true, grants: [], uid: "owner_uid_0001",
    permission: "advertising.campaign.publish", resourceScope: "campaign:x", nowMs: 200,
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


test("specialized grant rejects unknown permissions, wildcard scopes and duplicate values", () => {
  const valid = {
    uid: "member_uid_0001", role: "ad_general_supervisor",
    permissions: ["advertising.requests.view_assigned"],
    resourceScopes: ["campaign:campaign_123"],
    status: "active", startsAtMs: 100, endsAtMs: 1000, version: 1,
  };
  assert.throws(() => validateSpecializedRoleGrant({
    ...valid, permissions: ["advertising.not_a_real_permission"],
  }), /SPECIALIZED_PERMISSION_FORBIDDEN/);
  assert.throws(() => validateSpecializedRoleGrant({
    ...valid, resourceScopes: ["*"],
  }), /SPECIALIZED_SCOPE_INVALID/);
  assert.throws(() => validateSpecializedRoleGrant({
    ...valid, permissions: ["advertising.requests.view_assigned", "advertising.requests.view_assigned"],
  }), /SPECIALIZED_PERMISSION_DUPLICATE/);
  assert.throws(() => validateSpecializedRoleGrant({
    ...valid, resourceScopes: ["campaign:campaign_123", "campaign:campaign_123"],
  }), /SPECIALIZED_SCOPE_DUPLICATE/);
});

test("specialized grant scope checks are exact and inactive grants fail closed", () => {
  const grant = activeGrant();
  const base = {
    ownerVerified: false, grants: [grant], uid: "member_uid_0001",
    permission: "advertising.requests.view_assigned", resourceScope: "campaign:campaign_123", nowMs: 200,
  };
  assert.equal(hasAdvertisingPermission({ ...base, resourceScope: "campaign:campaign_123:child" }), false);
  assert.equal(hasAdvertisingPermission({ ...base, grants: [{ ...grant, status: "suspended" }] }), false);
  assert.equal(hasAdvertisingPermission({ ...base, grants: [{ ...grant, startsAtMs: 201 }] }), false);
});

test("specialized grant rejects non-canonical and control-character resource scopes", () => {
  const valid = {
    uid: "member_uid_0001", role: "ad_general_supervisor",
    permissions: ["advertising.requests.view_assigned"],
    resourceScopes: ["campaign:campaign_123"],
    status: "active", startsAtMs: 100, endsAtMs: 1000, version: 1,
  };
  assert.throws(() => validateSpecializedRoleGrant({
    ...valid, resourceScopes: [" campaign:campaign_123"],
  }), /SPECIALIZED_SCOPE_INVALID/);
  assert.throws(() => validateSpecializedRoleGrant({
    ...valid, resourceScopes: ["campaign:campaign_123 "],
  }), /SPECIALIZED_SCOPE_INVALID/);
  assert.throws(() => validateSpecializedRoleGrant({
    ...valid, resourceScopes: ["campaign:campaign_123\x00"],
  }), /SPECIALIZED_SCOPE_INVALID/);
});

test("resource scopes reject surrounding whitespace and control characters", () => {
  const base = {
    uid: "member_uid_0001",
    role: "ad_general_supervisor",
    permissions: ["advertising.requests.view_assigned"],
    status: "active",
    startsAtMs: 100,
    endsAtMs: 1000,
    version: 1,
  };
  for (const resourceScope of [" campaign:campaign_123", "campaign:campaign_123 ", "campaign:\u0000x", "campaign:\nroom"]) {
    assert.throws(() => validateSpecializedRoleGrant({
      ...base, resourceScopes: [resourceScope],
    }), /SPECIALIZED_SCOPE_INVALID/);
  }
});


test("owner permission delta adds and partially revokes only selected capabilities", () => {
  const { applySpecializedPermissionDelta } = require("../lib/advertising-governance");
  const grant = activeGrant();
  const changed = applySpecializedPermissionDelta(grant, {
    add: ["advertising.requests.assign"],
    remove: ["advertising.requests.view_assigned"],
  });
  assert.deepEqual(changed.permissions, [
    "advertising.workspace.message_representatives",
    "advertising.requests.assign",
  ]);
  assert.deepEqual(changed.resourceScopes, grant.resourceScopes);
  assert.equal(changed.uid, grant.uid);
  assert.equal(changed.role, grant.role);
  assert.equal(changed.version, grant.version);
  assert.equal(changed.status, grant.status);
});

test("owner permission delta rejects escalation, duplicates and removal of the final permission", () => {
  const { applySpecializedPermissionDelta } = require("../lib/advertising-governance");
  const grant = activeGrant();
  assert.throws(() => applySpecializedPermissionDelta(grant, {
    add: ["platform.owner"],
  }), /SPECIALIZED_PERMISSION_ADD_INVALID/);
  assert.throws(() => applySpecializedPermissionDelta(grant, {
    add: ["advertising.requests.assign", "advertising.requests.assign"],
  }), /SPECIALIZED_PERMISSION_ADD_INVALID/);
  assert.throws(() => applySpecializedPermissionDelta(grant, {
    remove: ["advertising.requests.view_assigned", "advertising.workspace.message_representatives"],
  }), /SPECIALIZED_PERMISSION_EMPTY_GRANT/);
  assert.throws(() => applySpecializedPermissionDelta(grant, {
    remove: ["advertising.campaign.publish"],
  }), /SPECIALIZED_PERMISSION_REMOVE_INVALID/);
});


test("permission evaluator fails closed for malformed persisted grants", () => {
  const valid = activeGrant();
  const base = {
    ownerVerified: false,
    uid: "member_uid_0001",
    permission: "advertising.requests.view_assigned",
    resourceScope: "campaign:campaign_123",
    nowMs: 200,
  };
  assert.equal(hasAdvertisingPermission({
    ...base,
    grants: [{ ...valid, status: "active", permissions: ["platform.owner"] }],
  }), false);
  assert.equal(hasAdvertisingPermission({
    ...base,
    grants: [{ ...valid, uid: "attacker_uid_0001" }],
  }), false);
  assert.equal(hasAdvertisingPermission({
    ...base,
    grants: [{ ...valid, resourceScopes: ["*"] }],
  }), false);
  assert.equal(hasAdvertisingPermission({
    ...base,
    grants: [{ ...valid, status: "revoked" }],
  }), false);
  assert.equal(hasAdvertisingPermission({
    ...base,
    grants: [null, {}, valid],
  }), true);
  assert.equal(hasAdvertisingPermission({
    ...base,
    grants: valid,
  }), false);
});




test("specialized roles cannot receive permissions from another role family", () => {
  const base = {
    uid: "member_uid_0001",
    resourceScopes: ["resource:assigned_001"],
    status: "active",
    startsAtMs: 100,
    endsAtMs: 1000,
    version: 1,
  };
  assert.throws(() => validateSpecializedRoleGrant({
    ...base, role: "ad_general_supervisor", permissions: ["production.tasks.manage_assigned"],
  }), /SPECIALIZED_PERMISSION_ROLE_MISMATCH/);
  assert.throws(() => validateSpecializedRoleGrant({
    ...base, role: "production_supervisor", permissions: ["advertising.requests.view_assigned"],
  }), /SPECIALIZED_PERMISSION_ROLE_MISMATCH/);
  assert.throws(() => validateSpecializedRoleGrant({
    ...base, role: "production_quality_reviewer", permissions: ["production.rooms.create"],
  }), /SPECIALIZED_PERMISSION_ROLE_MISMATCH/);
  assert.doesNotThrow(() => validateSpecializedRoleGrant({
    ...base, role: "legal_administrative_supervisor",
    permissions: ["contracts.drafts.review", "contracts.route_to_owner", "contracts.archive.read"],
  }));
  assert.throws(() => validateSpecializedRoleGrant({
    ...base, role: "legal_administrative_supervisor", permissions: ["contracts.sign_delegated"],
  }), /SPECIALIZED_PERMISSION_FORBIDDEN/);
  assert.throws(() => validateSpecializedRoleGrant({
    ...base, role: "legal_administrative_supervisor", permissions: ["contracts.drafts.create"],
  }), /SPECIALIZED_PERMISSION_FORBIDDEN/);
  assert.throws(() => validateSpecializedRoleGrant({
    ...base, role: "ad_representative", permissions: ["advertising.requests.view_assigned"],
  }), /SPECIALIZED_GRANT_INVALID/);
});

test("permission deltas cannot cross the assigned role's capability family", () => {
  const { applySpecializedPermissionDelta } = require("../lib/advertising-governance");
  assert.throws(() => applySpecializedPermissionDelta(activeGrant(), {
    add: ["production.tasks.manage_assigned"],
  }), /SPECIALIZED_PERMISSION_ROLE_MISMATCH/);
});

test("delegated signing fails closed for malformed persisted delegation records", () => {
  const valid = {
    delegateUid: "legal_uid_0001", contractTypes: ["advertiser_direct"],
    maxCommitmentMinor: 50000, currency: "EUR", startsAtMs: 100, endsAtMs: 500,
    active: true, ownerCoSignatureRequired: false, delegationVersion: 2,
  };
  const base = {
    delegation: valid, delegateUid: "legal_uid_0001", contractType: "advertiser_direct",
    commitmentMinor: 30000, currency: "EUR", nowMs: 200, ownerCoSignaturePresent: false,
  };
  assert.equal(canSignUnderDelegation(base), true);
  assert.equal(canSignUnderDelegation({ ...base, delegation: { ...valid, contractTypes: null } }), false);
  assert.equal(canSignUnderDelegation({ ...base, delegation: { ...valid, maxCommitmentMinor: "50000" } }), false);
  assert.equal(canSignUnderDelegation({ ...base, delegation: { ...valid, currency: "eur" } }), false);
  assert.equal(canSignUnderDelegation({ ...base, delegation: { ...valid, endsAtMs: 100 } }), false);
  assert.equal(canSignUnderDelegation({ ...base, delegation: { ...valid, active: "true" } }), false);
  assert.equal(canSignUnderDelegation({ ...base, delegation: { ...valid, ownerCoSignatureRequired: true } }), false);
  assert.equal(canSignUnderDelegation({ ...base, commitmentMinor: Number.MAX_SAFE_INTEGER + 1 }), false);
});


test("permission evaluator rejects malformed owner flags and malformed context before owner bypass", () => {
  const validOwnerContext = {
    ownerVerified: true,
    grants: [],
    uid: "owner_uid_0001",
    permission: "advertising.campaign.publish",
    resourceScope: "campaign:campaign_123",
    nowMs: 200,
  };
  assert.equal(hasAdvertisingPermission(validOwnerContext), true);
  assert.equal(hasAdvertisingPermission({ ...validOwnerContext, ownerVerified: "true" }), false);
  assert.equal(hasAdvertisingPermission({ ...validOwnerContext, permission: "platform.root" }), false);
  assert.equal(hasAdvertisingPermission({ ...validOwnerContext, resourceScope: " campaign:campaign_123" }), false);
  assert.equal(hasAdvertisingPermission({ ...validOwnerContext, uid: "short" }), false);
});


test("delegated signing rejects null or malformed argument containers without throwing", () => {
  assert.equal(canSignUnderDelegation(null), false);
  assert.equal(canSignUnderDelegation(undefined), false);
  assert.equal(canSignUnderDelegation({ delegation: [] }), false);
});

test("production roster rejects padded, control-character and malformed member identifiers", () => {
  for (const uid of [" member_000001", "member_000001 ", "member_0000\n1", "member/000001"]) {
    assert.throws(() => validateProductionRoomRoster({
      teamMemberUids: [uid],
      privilegedObserverUids: [],
    }), /PRODUCTION_ROSTER_INVALID/);
  }
});

test("public achievement approval fails closed for null and non-boolean approval evidence", () => {
  assert.equal(canPublishProductionAchievement(null), false);
  assert.equal(canPublishProductionAchievement(undefined), false);
  const valid = {
    ownerVerified: true,
    ownerApprovalRecorded: true,
    rightsCleared: true,
    participantDisclosureCleared: true,
  };
  assert.equal(canPublishProductionAchievement({ ...valid, ownerVerified: "true" }), false);
  assert.equal(canPublishProductionAchievement({ ...valid, rightsCleared: 1 }), false);
});
