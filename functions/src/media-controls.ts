export const MEDIA_QUOTA_POLICY = Object.freeze({
  dailyUploadCount: 100,
  dailyDeclaredBytes: 512 * 1024 * 1024,
  activeQuarantineBytes: 1024 * 1024 * 1024,
});

export function validateMediaQuotaUsage(input: { uploadCount: number; declaredBytes: number; activeBytes: number; nextBytes: number }): string | null {
  const { uploadCount, declaredBytes, activeBytes, nextBytes } = input;
  for (const value of [uploadCount, declaredBytes, activeBytes, nextBytes]) {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new TypeError("Quota counters must be non-negative safe integers.");
    }
  }
  if (uploadCount >= MEDIA_QUOTA_POLICY.dailyUploadCount) return "DAILY_UPLOAD_COUNT";
  if (declaredBytes + nextBytes > MEDIA_QUOTA_POLICY.dailyDeclaredBytes) return "DAILY_BYTES";
  if (activeBytes + nextBytes > MEDIA_QUOTA_POLICY.activeQuarantineBytes) return "ACTIVE_QUARANTINE_BYTES";
  return null;
}

export function isExpiredUploadIntent(createdAtMs: number, nowMs: number = Date.now(), ttlMs: number = 5 * 60 * 1000): boolean {
  return Number.isSafeInteger(createdAtMs) && Number.isSafeInteger(nowMs) &&
    Number.isSafeInteger(ttlMs) && createdAtMs >= 0 && nowMs >= 0 &&
    ttlMs > 0 && nowMs - createdAtMs > ttlMs;
}

export function assertTrustedScannerVerdict(
  verdict: { provider: string; objectGeneration: string; sha256: string; verdict: string; scannedAtMs: number } | null | undefined,
  expected: { provider: string; objectGeneration: string; sha256: string; nowMs: number },
): boolean {
  if (!verdict || typeof verdict !== "object" ||
      verdict.provider !== expected.provider ||
      verdict.objectGeneration !== expected.objectGeneration ||
      verdict.sha256 !== expected.sha256 ||
      !/^[a-f0-9]{64}$/.test(verdict.sha256 ?? "") ||
      !["clean", "malicious", "error"].includes(verdict.verdict) ||
      !Number.isSafeInteger(verdict.scannedAtMs) ||
      Math.abs(expected.nowMs - verdict.scannedAtMs) > 10 * 60 * 1000) {
    return false;
  }
  return true;
}
