import { MEDIA_QUOTA_LIMITS } from "./media-quota";

export const MEDIA_QUOTA_POLICY = Object.freeze({
  dailyUploadCount: MEDIA_QUOTA_LIMITS.maxDailyUploads,
  dailyDeclaredBytes: MEDIA_QUOTA_LIMITS.maxDailyBytes,
  activeQuarantineBytes: MEDIA_QUOTA_LIMITS.maxActiveBytes,
});

export interface MediaQuotaUsage {
  uploadCount: number;
  declaredBytes: number;
  activeBytes: number;
  nextBytes: number;
}

export type MediaQuotaBlockReason =
  | "DAILY_UPLOAD_COUNT"
  | "DAILY_BYTES"
  | "ACTIVE_QUARANTINE_BYTES";

export function validateMediaQuotaUsage(input: MediaQuotaUsage): MediaQuotaBlockReason | null {
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

export function isExpiredUploadIntent(
  createdAtMs: number,
  nowMs = Date.now(),
  ttlMs = 5 * 60 * 1000,
): boolean {
  return Number.isSafeInteger(createdAtMs) && Number.isSafeInteger(nowMs) &&
    Number.isSafeInteger(ttlMs) && createdAtMs >= 0 && nowMs >= 0 &&
    ttlMs > 0 && nowMs - createdAtMs > ttlMs;
}

export interface TrustedScannerVerdict {
  provider: string;
  objectGeneration: string;
  sha256: string;
  verdict: "clean" | "malicious" | "error";
  scannedAtMs: number;
}

export interface ExpectedScannerEvidence {
  provider: string;
  objectGeneration: string;
  sha256: string;
  nowMs: number;
}

export function assertTrustedScannerVerdict(
  verdict: TrustedScannerVerdict | null | undefined,
  expected: ExpectedScannerEvidence,
): boolean {
  if (!verdict || typeof verdict !== "object" ||
      verdict.provider !== expected.provider ||
      verdict.objectGeneration !== expected.objectGeneration ||
      verdict.sha256 !== expected.sha256 ||
      !/^[a-f0-9]{64}$/.test(verdict.sha256) ||
      !["clean", "malicious", "error"].includes(verdict.verdict) ||
      !Number.isSafeInteger(verdict.scannedAtMs) ||
      Math.abs(expected.nowMs - verdict.scannedAtMs) > 10 * 60 * 1000) {
    return false;
  }
  return true;
}
