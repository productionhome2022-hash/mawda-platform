import { createHash } from "node:crypto";

export const BIOMETRIC_VERIFICATION_CYCLE_DAYS = 30;
export const BIOMETRIC_VERIFICATION_REWARD_COINS = 1_500;
export const BIOMETRIC_VERIFICATION_CYCLE_MS =
  BIOMETRIC_VERIFICATION_CYCLE_DAYS * 24 * 60 * 60 * 1000;

export interface BiometricVerificationCycle {
  cycleId: string;
  uid: string;
  sequence: number;
  status: "pending" | "rewarded" | "expired" | "revoked";
  startedAtMs: number;
  expiresAtMs: number;
}

/**
 * Creates a deterministic, server-clocked reward cycle.
 * This records completion of the OS-local prompt workflow; it is not
 * cryptographic proof of a person's civil identity or biometric liveness.
 */
export function createBiometricVerificationCycle(input: {
  uid: string;
  sequence: number;
  serverNowMs: number;
}): BiometricVerificationCycle {
  const uid = input.uid.trim();
  if (!uid || uid.length > 128 ||
      !Number.isSafeInteger(input.sequence) || input.sequence < 1 ||
      !Number.isSafeInteger(input.serverNowMs) || input.serverNowMs < 0) {
    throw new Error("INVALID_BIOMETRIC_CYCLE_INPUT");
  }
  const cycleId = createHash("sha256")
    .update("mawdda-biometric-local-prompt-v1|" + uid + "|" + input.sequence)
    .digest("hex");
  return {
    cycleId,
    uid,
    sequence: input.sequence,
    status: "pending",
    startedAtMs: input.serverNowMs,
    expiresAtMs: input.serverNowMs + BIOMETRIC_VERIFICATION_CYCLE_MS,
  };
}

export function isBiometricVerificationDue(
  lastVerifiedAtMs: number,
  serverNowMs: number,
): boolean {
  if (!Number.isSafeInteger(lastVerifiedAtMs) || lastVerifiedAtMs < 0 ||
      !Number.isSafeInteger(serverNowMs) || serverNowMs < 0) {
    throw new Error("INVALID_BIOMETRIC_VERIFICATION_CLOCK");
  }
  return serverNowMs >= lastVerifiedAtMs + BIOMETRIC_VERIFICATION_CYCLE_MS;
}

export function biometricVerificationRewardLedgerId(cycleId: string): string {
  if (!/^[a-f0-9]{64}$/.test(cycleId)) {
    throw new Error("INVALID_BIOMETRIC_CYCLE_ID");
  }
  return "biometric_verification_" + cycleId;
}
