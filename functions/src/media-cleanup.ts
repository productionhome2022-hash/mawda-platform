export const MEDIA_UPLOAD_CLEANUP_GRACE_MS = 30 * 60 * 1000;

export function uploadIntentIsEligibleForCleanup(
  expiresAtMs: number,
  nowMs = Date.now(),
  graceMs = MEDIA_UPLOAD_CLEANUP_GRACE_MS,
): boolean {
  if (!Number.isSafeInteger(expiresAtMs) || expiresAtMs < 0 ||
      !Number.isSafeInteger(nowMs) || nowMs < 0 ||
      !Number.isSafeInteger(graceMs) || graceMs < 0) {
    throw new Error("Invalid media cleanup clock or grace period.");
  }
  return expiresAtMs <= nowMs - graceMs;
}
