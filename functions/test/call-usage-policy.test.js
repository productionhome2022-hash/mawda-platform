const test = require("node:test");
const assert = require("node:assert/strict");
const {
  validateCallUsagePolicy, callModeQuotaLimit, callMaxDurationEnd,
} = require("../lib/call-usage-policy");

const policy = {
  active: true,
  quotaWindowMs: 86400000,
  audioCallsPerWindow: 5,
  videoCallsPerWindow: 3,
  maxCallDurationMs: 300000,
};

test("validates owner-set call quotas and duration without supplying defaults", () => {
  assert.deepEqual(validateCallUsagePolicy(policy), policy);
  assert.throws(() => validateCallUsagePolicy(undefined), /CALL_USAGE_POLICY_INVALID/);
  assert.throws(() => validateCallUsagePolicy({ ...policy, audioCallsPerWindow: -1 }));
  assert.throws(() => validateCallUsagePolicy({ ...policy, quotaWindowMs: 1 }));
  assert.throws(() => validateCallUsagePolicy({ ...policy, maxCallDurationMs: 1000 }));
});

test("owner can disable a call mode or leave its quota unlimited", () => {
  const configured = validateCallUsagePolicy({
    ...policy, audioCallsPerWindow: 0, videoCallsPerWindow: null,
    maxCallDurationMs: null,
  });
  assert.equal(callModeQuotaLimit(configured, "audio"), 0);
  assert.equal(callModeQuotaLimit(configured, "video"), null);
  assert.equal(callMaxDurationEnd(1000, configured), null);
  assert.throws(() => callModeQuotaLimit(configured, "other"));
});

test("duration expiry is derived only from the policy snapshot", () => {
  assert.equal(callMaxDurationEnd(1000, validateCallUsagePolicy(policy)), 301000);
  assert.equal(callMaxDurationEnd(1000, validateCallUsagePolicy({
    ...policy, maxCallDurationMs: null,
  })), null);
});
