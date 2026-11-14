export const MEDIA_QUOTA_LIMITS = Object.freeze({
  maxActiveUploads: 5,
  maxActiveBytes: 150 * 1024 * 1024,
  maxDailyBytes: 500 * 1024 * 1024,
  maxDailyUploads: 100,
});

export interface MediaQuotaState {
  activeUploads?: number;
  activeBytes?: number;
  dailyBytes?: number;
  dailyUploads?: number;
  dailyWindow?: string;
}

export interface MediaQuotaReservation {
  activeUploads: number;
  activeBytes: number;
  dailyBytes: number;
  dailyUploads: number;
  dailyWindow: string;
}

function utcDay(now: number): string {
  if (!Number.isSafeInteger(now) || now < 0) throw new Error("Invalid quota clock.");
  return new Date(now).toISOString().slice(0, 10);
}

/** Calculate a reservation before issuing an upload capability. */
export function reserveMediaQuota(
  current: MediaQuotaState | undefined,
  bytes: number,
  now = Date.now(),
): MediaQuotaReservation {
  if (!Number.isSafeInteger(bytes) || bytes <= 0) throw new Error("Invalid media reservation size.");
  const day = utcDay(now);
  const sameDay = current?.dailyWindow === day;
  const activeUploads = current?.activeUploads ?? 0;
  const activeBytes = current?.activeBytes ?? 0;
  const dailyBytes = sameDay ? current?.dailyBytes ?? 0 : 0;
  const dailyUploads = sameDay ? current?.dailyUploads ?? 0 : 0;
  if (![activeUploads, activeBytes, dailyBytes, dailyUploads].every((value) =>
    Number.isSafeInteger(value) && value >= 0)) {
    throw new Error("Corrupt media quota state.");
  }
  if (activeUploads + 1 > MEDIA_QUOTA_LIMITS.maxActiveUploads ||
      activeBytes + bytes > MEDIA_QUOTA_LIMITS.maxActiveBytes ||
      dailyBytes + bytes > MEDIA_QUOTA_LIMITS.maxDailyBytes ||
      dailyUploads + 1 > MEDIA_QUOTA_LIMITS.maxDailyUploads) {
    throw new Error("Media upload quota exceeded.");
  }
  return {
    activeUploads: activeUploads + 1,
    activeBytes: activeBytes + bytes,
    dailyBytes: dailyBytes + bytes,
    dailyUploads: dailyUploads + 1,
    dailyWindow: day,
  };
}

/** Release an active reservation once finalization has reached a terminal result. */
export function releaseMediaQuota(
  current: MediaQuotaState | undefined,
  bytes: number,
): MediaQuotaReservation {
  if (!Number.isSafeInteger(bytes) || bytes <= 0) throw new Error("Invalid media reservation release.");
  const activeUploads = current?.activeUploads ?? 0;
  const activeBytes = current?.activeBytes ?? 0;
  const dailyBytes = current?.dailyBytes ?? 0;
  const dailyUploads = current?.dailyUploads ?? 0;
  const dailyWindow = current?.dailyWindow ?? utcDay(Date.now());
  if (![activeUploads, activeBytes, dailyBytes].every((value) =>
    Number.isSafeInteger(value) && value >= 0) ||
    activeUploads < 1 || activeBytes < bytes) {
    throw new Error("Media quota reservation is inconsistent.");
  }
  return {
    activeUploads: activeUploads - 1,
    activeBytes: activeBytes - bytes,
    dailyBytes,
    dailyUploads,
    dailyWindow,
  };
}
