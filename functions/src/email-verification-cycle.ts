import { createHash } from "node:crypto";

export type EmailVerificationCycleStatus = "pending" | "verified" | "rewarded" | "expired" | "revoked";

export interface EmailVerificationCycle {
  cycleId: string;
  uid: string;
  email: string;
  sequence: number;
  status: EmailVerificationCycleStatus;
  startedAtMs: number;
  expiresAtMs: number;
}

/** Deterministic identity prevents duplicate cycles for the same member/email/sequence. */
export function createEmailVerificationCycle(input: {
  uid: string;
  email: string;
  sequence: number;
  serverNowMs: number;
  cycleDays: number;
}): EmailVerificationCycle {
  const uid = input.uid.trim();
  const email = input.email.trim().toLowerCase();
  if (!uid || uid.length > 128 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("INVALID_MEMBER_OR_EMAIL");
  }
  if (!Number.isSafeInteger(input.sequence) || input.sequence < 1 ||
      !Number.isSafeInteger(input.serverNowMs) || input.serverNowMs < 0 ||
      !Number.isSafeInteger(input.cycleDays) || input.cycleDays < 1 || input.cycleDays > 3650) {
    throw new Error("INVALID_CYCLE_CLOCK_OR_SEQUENCE");
  }
  const cycleId = createHash("sha256")
    .update("mawda-email-verification-v1|" + uid + "|" + email + "|" + input.sequence)
    .digest("hex");
  return {
    cycleId, uid, email, sequence: input.sequence, status: "pending",
    startedAtMs: input.serverNowMs,
    expiresAtMs: input.serverNowMs + input.cycleDays * 24 * 60 * 60 * 1000,
  };
}

export function isEmailVerificationCycleDue(lastVerifiedAtMs: number, serverNowMs: number, cycleDays: number): boolean {
  if (!Number.isSafeInteger(lastVerifiedAtMs) || lastVerifiedAtMs < 0 ||
      !Number.isSafeInteger(serverNowMs) || serverNowMs < 0 ||
      !Number.isSafeInteger(cycleDays) || cycleDays < 1 || cycleDays > 3650) {
    throw new Error("INVALID_VERIFICATION_CLOCK");
  }
  return serverNowMs >= lastVerifiedAtMs + cycleDays * 24 * 60 * 60 * 1000;
}

/** Confirmation requires the same normalized address and a live, unused cycle. */
export function canRewardEmailVerificationCycle(input: {
  cycle: EmailVerificationCycle;
  currentEmail: string;
  authEmailVerified: boolean;
  serverNowMs: number;
}): boolean {
  const { cycle } = input;
  if (cycle.status !== "pending" || !input.authEmailVerified ||
      !Number.isSafeInteger(input.serverNowMs) || input.serverNowMs < 0 ||
      input.serverNowMs >= cycle.expiresAtMs) return false;
  return typeof input.currentEmail === "string" &&
    input.currentEmail.trim().toLowerCase() === cycle.email;
}

export function emailVerificationRewardLedgerId(cycleId: string): string {
  if (!/^[a-f0-9]{64}$/.test(cycleId)) throw new Error("INVALID_EMAIL_CYCLE_ID");
  return "email_verification_" + cycleId;
}
