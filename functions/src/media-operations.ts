export const MEDIA_QUOTA_POLICY = Object.freeze({
  maxActiveUploads: 5,
  maxDailyReservedBytes: 500 * 1024 * 1024,
});

export interface MediaQuotaSnapshot {
  windowStartMs: number;
  dailyReservedBytes: number;
  activeUploads: number;
}

export function utcDayWindowStart(nowMs: number): number {
  if (!Number.isSafeInteger(nowMs) || nowMs < 0) throw new Error("Invalid quota clock.");
  const date = new Date(nowMs);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/** Pure, deterministic quota reservation policy; persist the returned counters transactionally. */
export function reserveMediaQuota(
  current: Partial<MediaQuotaSnapshot> | undefined,
  requestedBytes: number,
  nowMs = Date.now(),
): MediaQuotaSnapshot {
  if (!Number.isSafeInteger(requestedBytes) || requestedBytes <= 0) {
    throw new Error("Invalid media quota reservation.");
  }
  const windowStartMs = utcDayWindowStart(nowMs);
  const sameWindow = current?.windowStartMs === windowStartMs;
  const dailyReservedBytes = sameWindow && Number.isSafeInteger(current?.dailyReservedBytes)
    ? Number(current?.dailyReservedBytes) : 0;
  const activeUploads = sameWindow && Number.isSafeInteger(current?.activeUploads)
    ? Number(current?.activeUploads) : 0;
  if (activeUploads >= MEDIA_QUOTA_POLICY.maxActiveUploads) {
    throw new Error("MEDIA_QUOTA_ACTIVE_UPLOAD_LIMIT");
  }
  if (dailyReservedBytes + requestedBytes > MEDIA_QUOTA_POLICY.maxDailyReservedBytes) {
    throw new Error("MEDIA_QUOTA_DAILY_BYTES_LIMIT");
  }
  return { windowStartMs, dailyReservedBytes: dailyReservedBytes + requestedBytes, activeUploads: activeUploads + 1 };
}

export function releaseMediaUploadSlot(current: Partial<MediaQuotaSnapshot> | undefined): MediaQuotaSnapshot {
  const windowStartMs = Number.isSafeInteger(current?.windowStartMs) ? Number(current?.windowStartMs) : 0;
  const dailyReservedBytes = Number.isSafeInteger(current?.dailyReservedBytes) ? Number(current?.dailyReservedBytes) : 0;
  const activeUploads = Number.isSafeInteger(current?.activeUploads) ? Number(current?.activeUploads) : 0;
  return { windowStartMs, dailyReservedBytes, activeUploads: Math.max(0, activeUploads - 1) };
}

/** Only a trusted, authenticated clean verdict can move an asset beyond quarantine. */
export function canApproveMediaScan(input: {
  status: unknown;
  verdict: unknown;
  provider: unknown;
  objectGenerationMatches: boolean;
  processingComplete: boolean;
}): boolean {
  return input.status === "pending_security_scan" &&
    input.verdict === "clean" &&
    typeof input.provider === "string" && input.provider.trim().length > 0 &&
    input.objectGenerationMatches === true &&
    input.processingComplete === true;
}
