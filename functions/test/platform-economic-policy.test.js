const test = require("node:test");
const assert = require("node:assert/strict");
const { PLATFORM_ECONOMIC_POLICY: policy } = require("../lib/platform-economic-policy.js");

test("Mawdda initial planning profile targets 1,000 MAU and a $10 monthly billable ceiling", () => {
  assert.equal(policy.baselineMonthlyActiveUsers, 1_000);
  assert.equal(policy.monthlyBillableSpendTargetUsd, 10);
  assert.equal(policy.internalOperatingCeilingUsd, 7.5);
  assert.equal(policy.contingencyReserveUsd, 2.5);
  assert.equal(
    policy.internalOperatingCeilingUsd + policy.contingencyReserveUsd,
    policy.monthlyBillableSpendTargetUsd,
  );
  assert.deepEqual(policy.estimatedSpendThresholdsUsd, {
    warning: 5,
    protectMode: 7.5,
    critical: 9,
  });
});

test("planning profile is explicitly not represented as live billing enforcement", () => {
  assert.equal(policy.enforcementStatus, "planning_only");
});

test("Firebase no-cost planning baselines are project-level service allowances", () => {
  assert.equal(policy.noCostPlanningBaselines.firestore.documentReadsPerDay, 50_000);
  assert.equal(policy.noCostPlanningBaselines.firestore.documentWritesPerDay, 20_000);
  assert.equal(policy.noCostPlanningBaselines.firebaseStorageNewBucket.storedGiBMonth, 5);
  assert.equal(policy.noCostPlanningBaselines.firebaseStorageNewBucket.downloadedGiBPerMonth, 100);
  assert.equal(policy.noCostPlanningBaselines.cloudFunctions.invocationsPerMonth, 2_000_000);
});
