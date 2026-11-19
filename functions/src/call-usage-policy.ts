export interface CallUsagePolicy {
  active: boolean;
  quotaWindowMs: number;
  audioCallsPerWindow: number | null;
  videoCallsPerWindow: number | null;
  maxCallDurationMs: number | null;
}

/** Fixed group-call durations for the current release; pricing never changes these. */
export const GROUP_AUDIO_CALL_DURATION_MS = 5 * 60 * 1000;
export const GROUP_VIDEO_CALL_DURATION_MS = 3 * 60 * 1000;

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

/**
 * Direct calls retain their existing owner-configured duration policy.
 * Group-room calls use immutable release constants: audio 5m, video 3m.
 * No pricing policy field is consulted when calculating the deadline.
 */
export function callMaxDurationEnd(
  nowMs: number,
  policy: CallUsagePolicy,
  scope: "direct" | "room" = "direct",
  mode?: "audio" | "video",
): number | null {
  if (!Number.isSafeInteger(nowMs) || nowMs < 0) throw new Error("CALL_TIME_INVALID");
  if (scope === "room") {
    if (mode === "audio") return nowMs + GROUP_AUDIO_CALL_DURATION_MS;
    if (mode === "video") return nowMs + GROUP_VIDEO_CALL_DURATION_MS;
    throw new Error("CALL_MODE_INVALID");
  }
  if (scope !== "direct") throw new Error("CALL_SCOPE_INVALID");
  return policy.maxCallDurationMs === null ? null : nowMs + policy.maxCallDurationMs;
}
