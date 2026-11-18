export const BIOMETRIC_MAX_ATTEMPTS = 3;
export const BIOMETRIC_LOCKOUT_MS = 90 * 24 * 60 * 60 * 1000;
export const BIOMETRIC_RENEWAL_INTERVAL_MONTHS = 1;
export const BIOMETRIC_REWARD_BETACOINS = 1500;

export type BiometricRequestStatus =
  | "pending_review"
  | "accepted"
  | "rejected"
  | "locked";

export interface BiometricReviewState {
  status: BiometricRequestStatus;
  attemptNumber: number;
  rewardGranted: boolean;
  lockoutUntilMs: number | null;
  /** Server-calculated next eligible renewal timestamp after acceptance. */
  nextRenewalAtMs?: number | null;
}

export interface BiometricDecision {
  status: "accepted" | "rejected" | "locked";
  rewardCoins: number;
  badgeGranted: boolean;
  remainingAttempts: number;
  lockoutUntilMs: number | null;
  nextRenewalAtMs: number | null;
}

/** Adds one calendar month, clamping month-end dates (e.g. Jan 31 -> Feb 28/29). */
export function addBiometricRenewalMonth(timestampMs: number): number {
  if (!Number.isSafeInteger(timestampMs) || timestampMs < 0) {
    throw new Error("BIOMETRIC_TIMESTAMP_INVALID");
  }
  const date = new Date(timestampMs);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + BIOMETRIC_RENEWAL_INTERVAL_MONTHS);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, lastDay));
  return date.getTime();
}

/** A pending request has no timeout: owner inactivity must never auto-reject it. */
export function canSubmitBiometricRequest(
  state: BiometricReviewState | null,
  nowMs: number,
): boolean {
  if (!Number.isSafeInteger(nowMs) || nowMs < 0) return false;
  if (state === null) return true;
  if (state.status === "pending_review") return false;
  if (state.status === "accepted") {
    return state.nextRenewalAtMs != null && state.nextRenewalAtMs <= nowMs;
  }
  if (state.status === "locked") {
    return state.lockoutUntilMs !== null && state.lockoutUntilMs <= nowMs;
  }
  return state.status === "rejected" &&
    state.attemptNumber < BIOMETRIC_MAX_ATTEMPTS;
}

/** Pure decision policy. Firestore transaction, owner authentication, ledger and deletion remain server responsibilities. */
export function decideBiometricRequest(args: {
  state: BiometricReviewState;
  decision: "accept" | "reject";
  actorIsSuperOwner: boolean;
  nowMs: number;
}): BiometricDecision {
  const { state, decision, actorIsSuperOwner, nowMs } = args;
  if (!actorIsSuperOwner) throw new Error("SUPER_OWNER_ONLY");
  if (!Number.isSafeInteger(nowMs) || nowMs < 0 ||
      state.status !== "pending_review" ||
      !Number.isSafeInteger(state.attemptNumber) ||
      state.attemptNumber < 1 || state.attemptNumber > BIOMETRIC_MAX_ATTEMPTS) {
    throw new Error("BIOMETRIC_REQUEST_NOT_REVIEWABLE");
  }
  if (decision === "accept") {
    if (state.rewardGranted) throw new Error("BIOMETRIC_REWARD_ALREADY_GRANTED");
    return {
      status: "accepted",
      rewardCoins: BIOMETRIC_REWARD_BETACOINS,
      badgeGranted: true,
      remainingAttempts: 0,
      lockoutUntilMs: null,
      nextRenewalAtMs: addBiometricRenewalMonth(nowMs),
    };
  }
  if (decision !== "reject") throw new Error("BIOMETRIC_DECISION_INVALID");
  const remainingAttempts = BIOMETRIC_MAX_ATTEMPTS - state.attemptNumber;
  if (remainingAttempts > 0) {
    return {
      status: "rejected",
      rewardCoins: 0,
      badgeGranted: false,
      remainingAttempts,
      lockoutUntilMs: null,
      nextRenewalAtMs: null,
    };
  }
  return {
    status: "locked",
    rewardCoins: 0,
    badgeGranted: false,
    remainingAttempts: 0,
    lockoutUntilMs: nowMs + BIOMETRIC_LOCKOUT_MS,
    nextRenewalAtMs: null,
  };
}
