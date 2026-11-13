export const MEDIA_QUOTA_POLICY = Object.freeze({
  dailyUploadCount: 100,
  dailyDeclaredBytes: 512 * 1024 * 1024,
  activeQuarantineBytes: 1024 * 1024 * 1024,
  retentionDays: 30,
});

export function validateMediaQuotaUsage(input) {
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

export function mediaRetentionCutoff(nowMs = Date.now()) {
  if (!Number.isSafeInteger(nowMs) || nowMs < 0) throw new TypeError("Invalid clock value.");
  return nowMs - MEDIA_QUOTA_POLICY.retentionDays * 24 * 60 * 60 * 1000;
}

export function isExpiredUploadIntent(createdAtMs, nowMs = Date.now(), ttlMs = 5 * 60 * 1000) {
  return Number.isSafeInteger(createdAtMs) && Number.isSafeInteger(nowMs) &&
    Number.isSafeInteger(ttlMs) && createdAtMs >= 0 && nowMs >= 0 &&
    ttlMs > 0 && nowMs - createdAtMs > ttlMs;
}

export function assertTrustedScannerVerdict(verdict, expected) {
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
