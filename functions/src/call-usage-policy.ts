export interface CallUsagePolicy {
  active: boolean;
  quotaWindowMs: number;
  audioCallsPerWindow: number | null;
  videoCallsPerWindow: number | null;
  maxCallDurationMs: number | null;
}

export function validateCallUsagePolicy(value: unknown): CallUsagePolicy {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("CALL_USAGE_POLICY_INVALID");
  }
  const input = value as Record<string, unknown>;
  const validateLimit = (value: unknown): number | null => {
    if (value === null) return null;
    if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0 ||
        value > 1000000) throw new Error("CALL_USAGE_LIMIT_INVALID");
    return value;
  };
  if (typeof input.active !== "boolean" ||
      typeof input.quotaWindowMs !== "number" ||
      !Number.isSafeInteger(input.quotaWindowMs) ||
      input.quotaWindowMs < 60000 || input.quotaWindowMs > 365 * 24 * 60 * 60 * 1000) {
    throw new Error("CALL_USAGE_POLICY_INVALID");
  }
  const maxCallDurationMs = input.maxCallDurationMs === null
    ? null : validateLimit(input.maxCallDurationMs);
  if (maxCallDurationMs !== null && (maxCallDurationMs < 60000 ||
      maxCallDurationMs > 24 * 60 * 60 * 1000)) {
    throw new Error("CALL_MAX_DURATION_INVALID");
  }
  return {
    active: input.active,
    quotaWindowMs: input.quotaWindowMs,
    audioCallsPerWindow: validateLimit(input.audioCallsPerWindow),
    videoCallsPerWindow: validateLimit(input.videoCallsPerWindow),
    maxCallDurationMs,
  };
}

export function callModeQuotaLimit(policy: CallUsagePolicy, mode: "audio" | "video"): number | null {
  if (mode !== "audio" && mode !== "video") throw new Error("CALL_MODE_INVALID");
  return mode === "audio" ? policy.audioCallsPerWindow : policy.videoCallsPerWindow;
}

export function callMaxDurationEnd(nowMs: number, policy: CallUsagePolicy): number | null {
  if (!Number.isSafeInteger(nowMs) || nowMs < 0) throw new Error("CALL_TIME_INVALID");
  return policy.maxCallDurationMs === null ? null : nowMs + policy.maxCallDurationMs;
}
