export const BIOMETRIC_MAX_ATTEMPTS = 3;
export const BIOMETRIC_LOCKOUT_MONTHS = 3;
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

/** Adds calendar months in UTC and clamps month-end dates (Jan 31 + 1 month -> Feb 28/29). */
export function addBiometricCalendarMonths(timestampMs: number, months: number): number {
  if (!Number.isSafeInteger(timestampMs) || timestampMs < 0 ||
      !Number.isSafeInteger(months) || months < 1 || months > 12) {
    throw new Error("BIOMETRIC_TIMESTAMP_INVALID");
  }
  const date = new Date(timestampMs);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return date.getTime();
}

/** Biometric renewal is one calendar month after owner approval. */
export function addBiometricRenewalMonth(timestampMs: number): number {
  return addBiometricCalendarMonths(timestampMs, BIOMETRIC_RENEWAL_INTERVAL_MONTHS);
}

/** A pending request has no timeout: owner inactivity must never auto-reject it. */
export function canSubmitBiometricRequest(
  state: BiometricReviewState | null,
  nowMs: number,
): boolean {
  if (!Number.isSafeInteger(nowMs) || nowMs < 0) return false;
  if (state === null) return true;
  if (state.status === "pending_review") return false;
  if (!Number.isSafeInteger(state.attemptNumber) ||
      state.attemptNumber < 1 || state.attemptNumber > BIOMETRIC_MAX_ATTEMPTS) return false;
  if (state.status === "accepted") {
    return Number.isSafeInteger(state.nextRenewalAtMs) && state.nextRenewalAtMs! <= nowMs;
  }
  if (state.status === "locked") {
    return Number.isSafeInteger(state.lockoutUntilMs) && state.lockoutUntilMs! <= nowMs;
  }
  return state.status === "rejected" &&
    state.attemptNumber < BIOMETRIC_MAX_ATTEMPTS;
}

/**
 * Returns the attempt number for the next request in the current eligibility
 * window. A completed three-attempt lockout starts a fresh three-attempt set
 * only after the full lockout expires; prior request records remain historical.
 */
export function nextBiometricAttemptNumber(
  state: BiometricReviewState | null,
  nowMs: number,
): number {
  if (!Number.isSafeInteger(nowMs) || nowMs < 0) {
    throw new Error("BIOMETRIC_TIMESTAMP_INVALID");
  }
  if (state === null) return 1;
  if (!Number.isSafeInteger(state.attemptNumber) ||
      state.attemptNumber < 1 || state.attemptNumber > BIOMETRIC_MAX_ATTEMPTS) {
    throw new Error("BIOMETRIC_ATTEMPT_STATE_INVALID");
  }
  if (state.status === "pending_review") {
    throw new Error("BIOMETRIC_REQUEST_ALREADY_PENDING");
  }
  if (state.status === "accepted") {
    if (state.nextRenewalAtMs == null || state.nextRenewalAtMs > nowMs) {
      throw new Error("BIOMETRIC_RENEWAL_NOT_DUE");
    }
    return 1;
  }
  if (state.status === "locked") {
    if (state.lockoutUntilMs == null || state.lockoutUntilMs > nowMs) {
      throw new Error("BIOMETRIC_LOCKOUT_ACTIVE");
    }
    return 1;
  }
  if (state.status === "rejected" && state.attemptNumber < BIOMETRIC_MAX_ATTEMPTS) {
    return state.attemptNumber + 1;
  }
  throw new Error("BIOMETRIC_ATTEMPTS_EXHAUSTED");
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
    throw new Error("BIOMETRIC_CRYPTOGRAPHIC_PROOF_REQUIRED");
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
    lockoutUntilMs: addBiometricCalendarMonths(nowMs, BIOMETRIC_LOCKOUT_MONTHS),
    nextRenewalAtMs: null,
  };
}
