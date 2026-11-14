export const ATTENDANCE_REWARD_TYPES = ["hourly", "daily", "weekly"] as const;
export type AttendanceRewardType = typeof ATTENDANCE_REWARD_TYPES[number];

export interface AttendanceRewardRule {
  enabled: boolean;
  amountCoins: number;
}

export type AttendanceRewardPolicy = Record<AttendanceRewardType, AttendanceRewardRule>;

export interface TimedAdCampaignInput {
  title: string;
  sponsorLabel: string;
  body: string;
  placement: "reward_center" | "home";
  durationSeconds: number;
  rewardCoins: number;
  startsAtMs: number;
  endsAtMs: number;
  maxClaimsPerMember: number;
  rewardBudgetCoins: number;
}

const MAX_REWARD_COINS = 100_000;
const MAX_AD_DURATION_SECONDS = 15 * 60;
const MAX_AD_BUDGET_COINS = 100_000_000;

export function validateAttendanceRewardPolicy(value: unknown): AttendanceRewardPolicy {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("ATTENDANCE_POLICY_INVALID");
  }
  const input = value as Record<string, unknown>;
  const result = {} as AttendanceRewardPolicy;
  for (const type of ATTENDANCE_REWARD_TYPES) {
    const rule = input[type];
    if (!rule || typeof rule !== "object" || Array.isArray(rule)) {
      throw new Error("ATTENDANCE_RULE_INVALID");
    }
    const candidate = rule as Record<string, unknown>;
    if (typeof candidate.enabled !== "boolean" ||
        typeof candidate.amountCoins !== "number" ||
        !Number.isSafeInteger(candidate.amountCoins) ||
        candidate.amountCoins < 0 || candidate.amountCoins > MAX_REWARD_COINS ||
        (candidate.enabled && candidate.amountCoins < 1)) {
      throw new Error("ATTENDANCE_RULE_INVALID");
    }
    result[type] = { enabled: candidate.enabled, amountCoins: candidate.amountCoins };
  }
  return result;
}

export function defaultAttendanceRewardPolicy(): AttendanceRewardPolicy {
  return {
    hourly: { enabled: false, amountCoins: 0 },
    daily: { enabled: false, amountCoins: 0 },
    weekly: { enabled: false, amountCoins: 0 },
  };
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** UTC-only periods prevent device timezone and DST changes from multiplying claims. */
export function utcRewardPeriod(type: AttendanceRewardType, nowMs: number): string {
  if (!Number.isSafeInteger(nowMs) || nowMs < 0) throw new Error("REWARD_TIME_INVALID");
  const date = new Date(nowMs);
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  if (type === "hourly") return `${year}${month}${day}T${pad(date.getUTCHours())}`;
  if (type === "daily") return `${year}${month}${day}`;

  // ISO-8601 week number and week-year, calculated in UTC.
  const isoDay = date.getUTCDay() || 7;
  const thursday = new Date(Date.UTC(year, date.getUTCMonth(), date.getUTCDate() + 4 - isoDay));
  const weekYear = thursday.getUTCFullYear();
  const firstThursday = new Date(Date.UTC(weekYear, 0, 4));
  const firstIsoDay = firstThursday.getUTCDay() || 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() + 4 - firstIsoDay);
  const week = 1 + Math.round((thursday.getTime() - firstThursday.getTime()) / 604800000);
  return `${weekYear}-W${pad(week)}`;
}

export function validateTimedAdCampaignInput(value: unknown): TimedAdCampaignInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("AD_CAMPAIGN_INVALID");
  }
  const input = value as Record<string, unknown>;
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const sponsorLabel = typeof input.sponsorLabel === "string" ? input.sponsorLabel.trim() : "";
  const body = typeof input.body === "string" ? input.body.trim() : "";
  const placement = input.placement;
  const durationSeconds = input.durationSeconds;
  const rewardCoins = input.rewardCoins;
  const startsAtMs = input.startsAtMs;
  const endsAtMs = input.endsAtMs;
  const maxClaimsPerMember = input.maxClaimsPerMember;
  const rewardBudgetCoins = input.rewardBudgetCoins;

  if (title.length < 3 || title.length > 80 ||
      sponsorLabel.length < 2 || sponsorLabel.length > 60 ||
      body.length < 10 || body.length > 1200 ||
      (placement !== "reward_center" && placement !== "home") ||
      typeof durationSeconds !== "number" || !Number.isSafeInteger(durationSeconds) ||
      durationSeconds < 15 || durationSeconds > MAX_AD_DURATION_SECONDS ||
      typeof rewardCoins !== "number" || !Number.isSafeInteger(rewardCoins) ||
      rewardCoins < 0 || rewardCoins > MAX_REWARD_COINS ||
      typeof startsAtMs !== "number" || !Number.isSafeInteger(startsAtMs) || startsAtMs < 0 ||
      typeof endsAtMs !== "number" || !Number.isSafeInteger(endsAtMs) || endsAtMs <= startsAtMs ||
      typeof maxClaimsPerMember !== "number" || !Number.isSafeInteger(maxClaimsPerMember) ||
      maxClaimsPerMember < 1 || maxClaimsPerMember > 100 ||
      typeof rewardBudgetCoins !== "number" || !Number.isSafeInteger(rewardBudgetCoins) ||
      rewardBudgetCoins < rewardCoins || rewardBudgetCoins > MAX_AD_BUDGET_COINS) {
    throw new Error("AD_CAMPAIGN_INVALID");
  }
  return {
    title, sponsorLabel, body,
    placement,
    durationSeconds,
    rewardCoins,
    startsAtMs,
    endsAtMs,
    maxClaimsPerMember,
    rewardBudgetCoins,
  };
}

export const AD_HEARTBEAT_MAX_GAP_MS = 15_000;

/** Only short, sequential foreground intervals may add eligible viewing time. */
export function eligibleHeartbeatDelta(
  previousHeartbeatAtMs: number | null,
  nowMs: number,
  sequence: number,
  expectedSequence: number,
  foreground: boolean,
  visible: boolean,
): { deltaMs: number; nextHeartbeatAtMs: number | null; nextSequence: number; paused: boolean } {
  if (!Number.isSafeInteger(nowMs) || nowMs < 0 ||
      !Number.isSafeInteger(sequence) || sequence < 1 ||
      sequence !== expectedSequence) {
    throw new Error("AD_HEARTBEAT_SEQUENCE_INVALID");
  }
  if (!foreground || !visible) {
    return { deltaMs: 0, nextHeartbeatAtMs: null, nextSequence: sequence + 1, paused: true };
  }
  if (previousHeartbeatAtMs === null) {
    return { deltaMs: 0, nextHeartbeatAtMs: nowMs, nextSequence: sequence + 1, paused: false };
  }
  const elapsed = nowMs - previousHeartbeatAtMs;
  if (elapsed <= 0) throw new Error("AD_HEARTBEAT_TIME_INVALID");
  if (elapsed > AD_HEARTBEAT_MAX_GAP_MS) {
    // A missed/late heartbeat earns no time; a fresh foreground interval must begin.
    return { deltaMs: 0, nextHeartbeatAtMs: nowMs, nextSequence: sequence + 1, paused: true };
  }
  return { deltaMs: elapsed, nextHeartbeatAtMs: nowMs, nextSequence: sequence + 1, paused: false };
}
