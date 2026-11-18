import test from "node:test";
import assert from "node:assert/strict";
import {
  CAPACITY_MEDIA_DEFAULTS,
  projectCapacityMediaPolicy,
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
