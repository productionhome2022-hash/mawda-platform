export const CAPACITY_MEDIA_DEFAULTS = Object.freeze({
  schemaVersion: 1,
  capacityTierSize: 1_000,
  // Authenticated app heartbeat; a member is active while seen in the last 120 seconds.
  activeMemberBasis: "authenticated_app_heartbeat_120s",
  enforcementMode: "observe_only",
  coreServicesExemptFromQuota: true,
  monthlyMediaQuotas: Object.freeze({
    uploadBytesPerMember: null,
    downloadBytesPerMember: null,
    storageBytesPerMember: null,
    processingMinutesPerMember: null,
  }),
} as const);

export type CapacityMediaQuotaKey =
  | "uploadBytesPerMember"
  | "downloadBytesPerMember"
  | "storageBytesPerMember"
  | "processingMinutesPerMember";

export type CapacityMediaPolicy = {
  schemaVersion: 1;
  capacityTierSize: 1_000;
  activeMemberBasis: "authenticated_app_heartbeat_120s";
  enforcementMode: "observe_only";
  coreServicesExemptFromQuota: true;
  monthlyMediaQuotas: Record<CapacityMediaQuotaKey, number | null>;
};

export function validateCapacityMediaQuotaInput(value: unknown): CapacityMediaPolicy["monthlyMediaQuotas"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("INVALID_MEDIA_QUOTA_POLICY");
  }
  const input = value as Record<string, unknown>;
  const keys: CapacityMediaQuotaKey[] = [
    "uploadBytesPerMember",
    "downloadBytesPerMember",
    "storageBytesPerMember",
    "processingMinutesPerMember",
  ];
  if (Object.keys(input).some((key) => !keys.includes(key as CapacityMediaQuotaKey))) {
    throw new Error("UNKNOWN_MEDIA_QUOTA_FIELD");
  }
  const result = {} as CapacityMediaPolicy["monthlyMediaQuotas"];
  for (const key of keys) {
    const amount = input[key] ?? null;
    if (amount !== null && (!Number.isSafeInteger(amount) || (amount as number) <= 0)) {
      throw new Error("INVALID_MEDIA_QUOTA_VALUE");
    }
    result[key] = amount as number | null;
  }
  return result;
}

export function projectCapacityMediaPolicy(
  monthlyMediaQuotas: CapacityMediaPolicy["monthlyMediaQuotas"],
): CapacityMediaPolicy {
  return {
    schemaVersion: 1,
    capacityTierSize: 1_000,
    activeMemberBasis: "authenticated_app_heartbeat_120s",
    enforcementMode: "observe_only",
    coreServicesExemptFromQuota: true,
    monthlyMediaQuotas: { ...monthlyMediaQuotas },
  };
}

export type CapacityMediaMeasurement = {
  status: "partial" | "not_started";
  monthUtc: string;
  monthlyUploadBytes: number | null;
  finalizedUploadCount: number | null;
  concurrentActiveMembers: number | null;
  capacityTierCount: number | null;
  monthlyDownloadBytes: number | null;
  retainedStorageBytes: number | null;
  processingMinutes: number | null;
};

/** Missing or malformed meter values are never projected as real zero usage. */
export function projectCapacityMediaMeasurement(input: {
  monthUtc: string;
  meterExists: boolean;
  monthlyUploadBytes: unknown;
  finalizedUploadCount: unknown;
  concurrentActiveMembers?: unknown;
  monthlyDownloadBytes?: unknown;
  retainedStorageBytes?: unknown;
  processingMinutes?: unknown;
}): CapacityMediaMeasurement {
  if (!/^\d{4}-\d{2}$/.test(input.monthUtc)) {
    throw new Error("INVALID_CAPACITY_MEDIA_MEASUREMENT_MONTH");
  }
  const safeNonNegativeInteger = (value: unknown): number | null =>
    typeof value === "number" && Number.isSafeInteger(value) && value >= 0
      ? value
      : null;
  const activeMembers = safeNonNegativeInteger(input.concurrentActiveMembers);
  const meterStarted = input.meterExists || activeMembers !== null;
  return {
    status: meterStarted ? "partial" : "not_started",
    monthUtc: input.monthUtc,
    monthlyUploadBytes: input.meterExists ? safeNonNegativeInteger(input.monthlyUploadBytes) : null,
    finalizedUploadCount: input.meterExists ? safeNonNegativeInteger(input.finalizedUploadCount) : null,
    concurrentActiveMembers: activeMembers,
    // Capacity tiers are rounded up in blocks of 1,000; unknown is never reported as zero.
    capacityTierCount: activeMembers !== null
      ? Math.ceil(activeMembers / 1_000)
      : null,
    monthlyDownloadBytes: input.meterExists ? safeNonNegativeInteger(input.monthlyDownloadBytes) : null,
    retainedStorageBytes: input.meterExists ? safeNonNegativeInteger(input.retainedStorageBytes) : null,
    processingMinutes: input.meterExists ? safeNonNegativeInteger(input.processingMinutes) : null,
  };
}
