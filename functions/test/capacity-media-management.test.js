const test = require("node:test");
const assert = require("node:assert/strict");
const {
  CAPACITY_MEDIA_DEFAULTS,
  projectCapacityMediaPolicy,
  validateCapacityMediaQuotaInput,
} = require("../lib/capacity-media-management");

test("capacity planning tier is 1,000 and active-member basis uses authenticated app heartbeats", () => {
  assert.equal(CAPACITY_MEDIA_DEFAULTS.capacityTierSize, 1_000);
  assert.equal(CAPACITY_MEDIA_DEFAULTS.activeMemberBasis, "authenticated_app_heartbeat_120s");
  assert.equal(CAPACITY_MEDIA_DEFAULTS.enforcementMode, "observe_only");
  assert.equal(CAPACITY_MEDIA_DEFAULTS.coreServicesExemptFromQuota, true);
});

test("monthly media quotas remain unset until the owner configures them", () => {
  assert.deepEqual(CAPACITY_MEDIA_DEFAULTS.monthlyMediaQuotas, {
    uploadBytesPerMember: null,
    downloadBytesPerMember: null,
    storageBytesPerMember: null,
    processingMinutesPerMember: null,
  });
});

test("owner quota input accepts positive safe integers and explicit null", () => {
  assert.deepEqual(validateCapacityMediaQuotaInput({
    uploadBytesPerMember: 1_000_000,
    downloadBytesPerMember: null,
    storageBytesPerMember: 2_000_000,
    processingMinutesPerMember: 30,
  }), {
    uploadBytesPerMember: 1_000_000,
    downloadBytesPerMember: null,
    storageBytesPerMember: 2_000_000,
    processingMinutesPerMember: 30,
  });
});

test("owner quota input rejects zero, fractions, unsafe integers and unknown fields", () => {
  for (const value of [
    { uploadBytesPerMember: 0 },
    { uploadBytesPerMember: 1.5 },
    { uploadBytesPerMember: Number.MAX_SAFE_INTEGER + 1 },
    { inventedQuota: 10 },
  ]) assert.throws(() => validateCapacityMediaQuotaInput(value));
});

test("projected policy can never enable enforcement or remove core-service protection", () => {
  const policy = projectCapacityMediaPolicy({
    uploadBytesPerMember: 1,
    downloadBytesPerMember: null,
    storageBytesPerMember: null,
    processingMinutesPerMember: null,
  });
  assert.equal(policy.enforcementMode, "observe_only");
  assert.equal(policy.activeMemberBasis, "authenticated_app_heartbeat_120s");
  assert.equal(policy.coreServicesExemptFromQuota, true);
});


test("capacity measurement projects every available meter and rounds active members into 1,000-member tiers", () => {
  const { projectCapacityMediaMeasurement } = require("../lib/capacity-media-management");
  const measured = projectCapacityMediaMeasurement({
    monthUtc: "2026-11",
    meterExists: true,
    monthlyUploadBytes: 10_000,
    finalizedUploadCount: 7,
    concurrentActiveMembers: 1_001,
    monthlyDownloadBytes: 20_000,
    retainedStorageBytes: 30_000,
    processingMinutes: 45,
  });
  assert.deepEqual(measured, {
    status: "partial",
    monthUtc: "2026-11",
    monthlyUploadBytes: 10_000,
    finalizedUploadCount: 7,
    concurrentActiveMembers: 1_001,
    capacityTierCount: 2,
    monthlyDownloadBytes: 20_000,
    retainedStorageBytes: 30_000,
    processingMinutes: 45,
  });
});

test("capacity measurement preserves unknowns instead of fabricating zero usage", () => {
  const { projectCapacityMediaMeasurement } = require("../lib/capacity-media-management");
  const measured = projectCapacityMediaMeasurement({
    monthUtc: "2026-11",
    meterExists: true,
    monthlyUploadBytes: 0,
    finalizedUploadCount: "unknown",
    concurrentActiveMembers: null,
    monthlyDownloadBytes: -1,
    retainedStorageBytes: Number.MAX_SAFE_INTEGER + 1,
    processingMinutes: 0.5,
  });
  assert.equal(measured.monthlyUploadBytes, 0);
  assert.equal(measured.finalizedUploadCount, null);
  assert.equal(measured.concurrentActiveMembers, null);
  assert.equal(measured.capacityTierCount, null);
  assert.equal(measured.monthlyDownloadBytes, null);
  assert.equal(measured.retainedStorageBytes, null);
  assert.equal(measured.processingMinutes, null);
});

test("active-member heartbeats are projected independently of monthly upload-meter existence", () => {
  const { projectCapacityMediaMeasurement } = require("../lib/capacity-media-management");
  const measured = projectCapacityMediaMeasurement({
    monthUtc: "2026-11",
    meterExists: false,
    monthlyUploadBytes: null,
    finalizedUploadCount: null,
    concurrentActiveMembers: 1001,
  });
  assert.equal(measured.status, "partial");
  assert.equal(measured.concurrentActiveMembers, 1001);
  assert.equal(measured.capacityTierCount, 2);
  assert.equal(measured.monthlyUploadBytes, null);
});
