const test = require("node:test");
const assert = require("node:assert/strict");
const {
  CAPACITY_MEDIA_DEFAULTS,
  projectCapacityMediaPolicy,
  validateCapacityMediaQuotaInput,
} = require("../lib/capacity-media-management");

test("capacity planning tier is 1,000 while the active-member measurement basis stays disconnected", () => {
  assert.equal(CAPACITY_MEDIA_DEFAULTS.capacityTierSize, 1_000);
  assert.equal(CAPACITY_MEDIA_DEFAULTS.activeMemberBasis, "not_connected");
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
  assert.equal(policy.activeMemberBasis, "not_connected");
  assert.equal(policy.coreServicesExemptFromQuota, true);
});
