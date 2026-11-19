const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  ADVERTISING_GENERAL_SUPERVISOR_LIMIT,
  ADVERTISING_SUPERVISOR_PERMISSIONS,
  normalizeAdvertisingSupervisorPermissions,
  assertAdvertisingSupervisorCapacity,
  isOwnerOnlyAdvertisingAction,
  canPerformAdvertisingAction,
  canActivateAdvertisingRepresentative,
  canPublishAdvertisingCampaign,
  canOwnerEmergencyWithdrawAdvertisingCampaign,
} = require("../lib/advertising-permissions");

test("advertising supervisor capacity is five and does not count representatives", () => {
  assert.equal(ADVERTISING_GENERAL_SUPERVISOR_LIMIT, 5);
  assert.doesNotThrow(() => assertAdvertisingSupervisorCapacity(0));
  assert.doesNotThrow(() => assertAdvertisingSupervisorCapacity(4));
  assert.throws(() => assertAdvertisingSupervisorCapacity(5), /CAPACITY_REACHED/);
  assert.throws(() => assertAdvertisingSupervisorCapacity(-1), /INVALID_ADVERTISING_SUPERVISOR_COUNT/);
  assert.throws(() => assertAdvertisingSupervisorCapacity(6), /INVALID_ADVERTISING_SUPERVISOR_COUNT/);
});

test("supervisor permissions are validated, unique, and deny unknown capabilities", () => {
  assert.deepEqual(normalizeAdvertisingSupervisorPermissions([
    "advertising.requests.view_all",
    "advertising.campaign.publish",
  ]), [
    "advertising.requests.view_all",
    "advertising.campaign.publish",
  ]);
  assert.throws(() => normalizeAdvertisingSupervisorPermissions(["platform.owner"]), /NOT_ALLOWED/);
  assert.throws(() => normalizeAdvertisingSupervisorPermissions([
    "advertising.campaign.publish",
    "advertising.campaign.publish",
  ]), /DUPLICATE/);
  assert.throws(() => normalizeAdvertisingSupervisorPermissions("advertising.campaign.publish"), /INVALID/);
});

test("commission, payment, finance, owner countersignature and emergency withdrawal are owner-only", () => {
  for (const action of [
    "advertising.commission.set_per_ad",
    "advertising.payment.confirm_received",
    "advertising.finance.view_ledger",
    "advertising.campaign.owner_emergency_withdraw",
    "advertising.supervisors.manage",
    "advertising.agreements.company_countersign",
  ]) {
    assert.equal(isOwnerOnlyAdvertisingAction(action), true);
    assert.equal(canPerformAdvertisingAction({
      actorRole: "general_supervisor",
      action,
      supervisorPermissions: [action],
    }), false);
    assert.equal(canPerformAdvertisingAction({ actorRole: "owner", action }), true);
  }
  assert.equal(canOwnerEmergencyWithdrawAdvertisingCampaign("owner"), true);
  assert.equal(canOwnerEmergencyWithdrawAdvertisingCampaign("general_supervisor"), false);
});

test("supervisor can publish only when explicitly granted and every owner-controlled gate is satisfied", () => {
  const base = {
    actorRole: "general_supervisor",
    supervisorPermissions: ["advertising.campaign.publish"],
    ownerBlocked: false,
    finalTermsOwnerApproved: true,
    perAdCommissionSetByOwner: true,
    representativeAcceptedCommission: true,
    paymentConfirmedByOwner: true,
  };
  assert.equal(canPublishAdvertisingCampaign(base), true);
  assert.equal(canPublishAdvertisingCampaign({
    ...base, supervisorPermissions: [],
  }), false);
  assert.equal(canPublishAdvertisingCampaign({
    ...base, ownerBlocked: true,
  }), false);
  assert.equal(canPublishAdvertisingCampaign({
    ...base, finalTermsOwnerApproved: false,
  }), false);
  assert.equal(canPublishAdvertisingCampaign({
    ...base, perAdCommissionSetByOwner: false,
  }), false);
  assert.equal(canPublishAdvertisingCampaign({
    ...base, representativeAcceptedCommission: false,
  }), false);
  assert.equal(canPublishAdvertisingCampaign({
    ...base, paymentConfirmedByOwner: false,
  }), false);
});

test("representatives and ordinary members cannot perform supervisor actions", () => {
  for (const actorRole of ["representative", "member"]) {
    assert.equal(canPerformAdvertisingAction({
      actorRole,
      action: "advertising.requests.view_all",
      supervisorPermissions: ["advertising.requests.view_all"],
    }), false);
  }
});


test("delegated permission catalogue exactly matches the approved specification", () => {
  const specificationPath = path.resolve(__dirname, "../../docs/ADVERTISING_MEDIA_WORKSPACE_SPEC.md");
  const specification = fs.readFileSync(specificationPath, "utf8");
  const section = specification.split("## 3. Delegated permission catalogue")[1]?.split("## 4.")[0];
  assert.ok(section, "approved delegated permission catalogue section must exist");
  const approved = [...section.matchAll(/^[ \t]*-[ \t]+(advertising\.[a-z_.]+)(?:[ \t]+.*)?$/gm)]
    .map((match) => match[1]).sort();
  const implemented = [...ADVERTISING_SUPERVISOR_PERMISSIONS].sort();
  assert.equal(new Set(approved).size, approved.length, "specification must not duplicate permission keys");
  assert.equal(new Set(implemented).size, implemented.length, "implementation must not duplicate permission keys");
  assert.deepEqual(implemented, approved);
});


test("representative activation always requires Owner countersignature", () => {
  assert.equal(canActivateAdvertisingRepresentative({
    actorRole: "owner",
    ownerCountersignaturePresent: false,
  }), false);
  assert.equal(canActivateAdvertisingRepresentative({
    actorRole: "owner",
    ownerCountersignaturePresent: true,
  }), true);
  assert.equal(canActivateAdvertisingRepresentative({
    actorRole: "general_supervisor",
    supervisorPermissions: ["advertising.representatives.activate"],
    ownerCountersignaturePresent: false,
  }), false);
  assert.equal(canActivateAdvertisingRepresentative({
    actorRole: "general_supervisor",
    supervisorPermissions: ["advertising.representatives.activate"],
    ownerCountersignaturePresent: true,
  }), true);
  assert.equal(canActivateAdvertisingRepresentative({
    actorRole: "general_supervisor",
    supervisorPermissions: [],
    ownerCountersignaturePresent: true,
  }), false);
  assert.equal(canActivateAdvertisingRepresentative({
    actorRole: "representative",
    supervisorPermissions: ["advertising.representatives.activate"],
    ownerCountersignaturePresent: true,
  }), false);
});
