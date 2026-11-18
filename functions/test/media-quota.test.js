const test = require("node:test");
const assert = require("node:assert/strict");
const {
  MEDIA_QUOTA_LIMITS,
  reserveMediaQuota,
  releaseMediaQuota,
  mediaQuotaExemptForTransfer,
  mediaDailyQuotaExemptForTransfer,
} = require("../lib/media-quota");

test("media quota enforces concurrent count, active bytes, UTC daily bytes and upload count", () => {
  const now = Date.UTC(2026, 10, 13, 12);
  const empty = { activeUploads: 0, activeBytes: 0, dailyBytes: 0, dailyUploads: 0, dailyWindow: "2026-11-13" };
  assert.deepEqual(reserveMediaQuota(empty, 10 * 1024 * 1024, now), {
    activeUploads: 1,
    activeBytes: 10 * 1024 * 1024,
    dailyBytes: 10 * 1024 * 1024,
    dailyUploads: 1,
    dailyWindow: "2026-11-13",
  });
  assert.throws(() => reserveMediaQuota({
    ...empty, activeUploads: MEDIA_QUOTA_LIMITS.maxActiveUploads,
  }, 1, now), /quota exceeded/i);
  assert.throws(() => reserveMediaQuota({
    ...empty, activeBytes: MEDIA_QUOTA_LIMITS.maxActiveBytes,
  }, 1, now), /quota exceeded/i);
  assert.throws(() => reserveMediaQuota({
    ...empty, dailyBytes: MEDIA_QUOTA_LIMITS.maxDailyBytes,
  }, 1, now), /quota exceeded/i);
  assert.throws(() => reserveMediaQuota({
    ...empty, dailyUploads: MEDIA_QUOTA_LIMITS.maxDailyUploads,
  }, 1, now), /quota exceeded/i);
});

test("daily media quota resets at UTC day boundary but active reservations remain", () => {
  const nextDay = Date.UTC(2026, 10, 14, 0, 1);
  assert.deepEqual(reserveMediaQuota({
    activeUploads: 2,
    activeBytes: 1024,
    dailyBytes: MEDIA_QUOTA_LIMITS.maxDailyBytes,
    dailyUploads: MEDIA_QUOTA_LIMITS.maxDailyUploads,
    dailyWindow: "2026-11-13",
  }, 2048, nextDay), {
    activeUploads: 3,
    activeBytes: 3072,
    dailyBytes: 2048,
    dailyUploads: 1,
    dailyWindow: "2026-11-14",
  });
});

test("quota release decrements active reservations and fails closed on inconsistent state", () => {
  assert.deepEqual(releaseMediaQuota({
    activeUploads: 2, activeBytes: 4096, dailyBytes: 8192, dailyUploads: 12, dailyWindow: "2026-11-13",
  }, 2048), {
    activeUploads: 1, activeBytes: 2048, dailyBytes: 8192, dailyUploads: 12, dailyWindow: "2026-11-13",
  });
  assert.throws(() => releaseMediaQuota({
    activeUploads: 0, activeBytes: 0, dailyBytes: 0, dailyUploads: 0, dailyWindow: "2026-11-13",
  }, 1), /inconsistent/i);
});

test("only owner-originated uploads bypass all personal media admission quotas", () => {
  assert.equal(mediaQuotaExemptForTransfer(true), true);
  assert.equal(mediaQuotaExemptForTransfer(false), false);
});

test("member-to-owner transfers bypass daily usage accounting but retain active guards", () => {
  const now = Date.UTC(2026, 10, 18, 12);
  const atDailyLimit = {
    activeUploads: 1,
    activeBytes: 1024,
    dailyBytes: MEDIA_QUOTA_LIMITS.maxDailyBytes,
    dailyUploads: MEDIA_QUOTA_LIMITS.maxDailyUploads,
    dailyWindow: "2026-11-18",
  };
  assert.equal(mediaDailyQuotaExemptForTransfer(false, true), true);
  const reservation = reserveMediaQuota(atDailyLimit, 2048, now, true);
  assert.equal(reservation.activeUploads, 2);
  assert.equal(reservation.activeBytes, 3072);
  assert.equal(reservation.dailyBytes, MEDIA_QUOTA_LIMITS.maxDailyBytes);
  assert.equal(reservation.dailyUploads, MEDIA_QUOTA_LIMITS.maxDailyUploads);
  assert.throws(() => reserveMediaQuota({
    ...atDailyLimit, activeUploads: MEDIA_QUOTA_LIMITS.maxActiveUploads,
  }, 1, now, true), /quota exceeded/i);
  assert.throws(() => reserveMediaQuota({
    ...atDailyLimit, activeBytes: MEDIA_QUOTA_LIMITS.maxActiveBytes,
  }, 1, now, true), /quota exceeded/i);
  assert.equal(mediaDailyQuotaExemptForTransfer(false, false), false);
});

test("releasing a member-to-owner reservation frees active capacity without changing daily usage", () => {
  const now = Date.UTC(2026, 10, 18, 12);
  const before = {
    activeUploads: 2,
    activeBytes: 3072,
    dailyBytes: 4096,
    dailyUploads: 7,
    dailyWindow: "2026-11-18",
  };
  const reserved = reserveMediaQuota(before, 2048, now, true);
  const released = releaseMediaQuota(reserved, 2048);
  assert.deepEqual(released, before);
});
