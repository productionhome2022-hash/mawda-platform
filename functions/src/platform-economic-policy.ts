/**
 * Mawdda's initial economic planning envelope.
 *
 * These are approved planning thresholds for a 1,000-MAU baseline.
 * They are NOT a live billing meter, a Google Cloud spend cap, or a hard
 * guarantee of the final invoice. Enforcement requires reconciled billing
 * export + measured resource usage and is intentionally not implied here.
 */
export const PLATFORM_ECONOMIC_POLICY = Object.freeze({
  enforcementStatus: "planning_only",
  baselineMonthlyActiveUsers: 1_000,
  monthlyBillableSpendTargetUsd: 10,
  internalOperatingCeilingUsd: 7.5,
  contingencyReserveUsd: 2.5,
  estimatedSpendThresholdsUsd: Object.freeze({
    warning: 5,
    protectMode: 7.5,
    critical: 9,
  }),
  noCostPlanningBaselines: Object.freeze({
    firestore: Object.freeze({
      storedGiB: 1,
      documentReadsPerDay: 50_000,
      documentWritesPerDay: 20_000,
      networkEgressGiBPerMonth: 10,
    }),
    firebaseStorageNewBucket: Object.freeze({
      storedGiBMonth: 5,
      downloadedGiBPerMonth: 100,
      uploadsPerMonth: 5_000,
      downloadsPerMonth: 50_000,
    }),
    cloudFunctions: Object.freeze({
      invocationsPerMonth: 2_000_000,
      gbSecondsPerMonth: 400_000,
      cpuSecondsPerMonth: 200_000,
      outboundGiBPerMonth: 5,
    }),
    firebaseHosting: Object.freeze({
      storedGiB: 10,
      transferMiBPerDay: 360,
    }),
  }),
} as const);
