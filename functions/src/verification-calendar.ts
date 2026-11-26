/** UTC calendar-month arithmetic shared only as a pure date primitive. */
export function addCalendarMonthsUtc(anchorMs: number, months: number): number {
  if (!Number.isSafeInteger(anchorMs) || anchorMs < 0 ||
      !Number.isSafeInteger(months) || months < 0) {
    throw new Error("INVALID_CALENDAR_MONTH_INPUT");
  }
  const source = new Date(anchorMs);
  if (!Number.isFinite(source.getTime())) throw new Error("INVALID_CALENDAR_MONTH_INPUT");
  const year = source.getUTCFullYear();
  const monthIndex = source.getUTCMonth() + months;
  const targetYear = year + Math.floor(monthIndex / 12);
  const targetMonth = monthIndex % 12;
  const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  const targetDay = Math.min(source.getUTCDate(), lastDay);
  return Date.UTC(targetYear, targetMonth, targetDay,
    source.getUTCHours(), source.getUTCMinutes(), source.getUTCSeconds(), source.getUTCMilliseconds());
}

export function isCalendarMonthCycleDue(anchorMs: number, nowMs: number, months: number): boolean {
  if (!Number.isSafeInteger(nowMs) || nowMs < 0) throw new Error("INVALID_CALENDAR_MONTH_INPUT");
  return nowMs >= addCalendarMonthsUtc(anchorMs, months);
}

export function isEmailVerificationDue(lastVerifiedAtMs: number, nowMs: number): boolean {
  return isCalendarMonthCycleDue(lastVerifiedAtMs, nowMs, 3);
}

export const BIOMETRIC_VERIFICATION_INTERVAL_MS = 30 * 24 * 60 * 60 * 1000;

export function isBiometricVerificationDue(lastApprovedAtMs: number, nowMs: number): boolean {
  if (!Number.isSafeInteger(lastApprovedAtMs) || lastApprovedAtMs < 0 ||
      !Number.isSafeInteger(nowMs) || nowMs < 0 ||
      !Number.isSafeInteger(lastApprovedAtMs + BIOMETRIC_VERIFICATION_INTERVAL_MS)) {
    throw new Error("INVALID_VERIFICATION_CLOCK");
  }
  return nowMs >= lastApprovedAtMs + BIOMETRIC_VERIFICATION_INTERVAL_MS;
}
