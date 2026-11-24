import test from "node:test";
import assert from "node:assert/strict";
import {
  CAPACITY_MEDIA_DEFAULTS,
  projectCapacityMediaPolicy,
  projectCapacityMediaMeasurement,
  validateCapacityMediaQuotaInput,
} from "../src/capacity-media-management.ts";

test("capacity tiers use concurrent active sessions in groups of 1,000", () => {
  assert.equal(CAPACITY_MEDIA_DEFAULTS.capacityTierSize, 1_000);
  assert.equal(CAPACITY_MEDIA_DEFAULTS.activeMemberBasis, "concurrent_active_sessions");
  assert.equal(CAPACITY_MEDIA_DEFAULTS.enforcementMode, "observe_only");
  assert.equal(CAPACITY_MEDIA_DEFAULTS.coreServicesExemptFromQuota, true);
});

test("monthly media quotas remain unset until owner configures them", () => {
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
  ]) {
    assert.throws(() => validateCapacityMediaQuotaInput(value));
  }
});

test("projected policy cannot enable enforcement or remove core-service protection", () => {
  const policy = projectCapacityMediaPolicy({
    uploadBytesPerMember: 1,
    downloadBytesPerMember: null,
    storageBytesPerMember: null,
    processingMinutesPerMember: null,
  });
  assert.equal(policy.enforcementMode, "observe_only");
  assert.equal(policy.coreServicesExemptFromQuota, true);
});


test("missing capacity meter is not projected as zero usage", () => {
  assert.deepEqual(projectCapacityMediaMeasurement({
    monthUtc: "2026-11", meterExists: false,
    monthlyUploadBytes: 0, finalizedUploadCount: 0,
  }), {
    status: "not_started", monthUtc: "2026-11",
    monthlyUploadBytes: null, finalizedUploadCount: null,
    concurrentActiveMembers: null, capacityTierCount: null,
    monthlyDownloadBytes: null, retainedStorageBytes: null, processingMinutes: null,
  });
});

test("existing capacity meter exposes only valid non-negative safe integers", () => {
  const measurement = projectCapacityMediaMeasurement({
    monthUtc: "2026-11", meterExists: true,
    monthlyUploadBytes: 1024, finalizedUploadCount: 3,
  });
  assert.equal(measurement.status, "partial");
  assert.equal(measurement.monthlyUploadBytes, 1024);
  assert.equal(measurement.finalizedUploadCount, 3);
  const malformed = projectCapacityMediaMeasurement({
    monthUtc: "2026-11", meterExists: true,
    monthlyUploadBytes: -1, finalizedUploadCount: Number.MAX_SAFE_INTEGER + 1,
  });
  assert.equal(malformed.monthlyUploadBytes, null);
  assert.equal(malformed.finalizedUploadCount, null);
});

test("capacity measurement rejects a malformed UTC month key", () => {
  assert.throws(() => projectCapacityMediaMeasurement({
    monthUtc: "November-2026", meterExists: false,
    monthlyUploadBytes: null, finalizedUploadCount: null,
  }));
});
