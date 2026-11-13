const test = require("node:test");
const assert = require("node:assert/strict");
const {
  MEDIA_QUOTA_POLICY,
  reserveMediaQuota,
  releaseMediaUploadSlot,
  utcDayWindowStart,
  canApproveMediaScan,
} = require("../lib/media-operations");

test("media quota reservations enforce concurrent and UTC daily byte ceilings", () => {
  const now = Date.UTC(2026, 10, 13, 12);
  const empty = { windowStartMs: utcDayWindowStart(now), dailyReservedBytes: 0, activeUploads: 0 };
  const one = reserveMediaQuota(empty, 10, now);
  assert.equal(one.activeUploads, 1);
  assert.equal(one.dailyReservedBytes, 10);
  assert.throws(() => reserveMediaQuota({ ...one, activeUploads: MEDIA_QUOTA_POLICY.maxActiveUploads }, 1, now),
    /MEDIA_QUOTA_ACTIVE_UPLOAD_LIMIT/);
  assert.throws(() => reserveMediaQuota({ ...one, dailyReservedBytes: MEDIA_QUOTA_POLICY.maxDailyReservedBytes }, 1, now),
    /MEDIA_QUOTA_DAILY_BYTES_LIMIT/);
});

test("daily quota resets at UTC midnight without resetting active upload accounting", () => {
  const before = Date.UTC(2026, 10, 13, 23, 59);
  const after = Date.UTC(2026, 10, 14, 0, 1);
  const next = reserveMediaQuota({
    windowStartMs: utcDayWindowStart(before),
    dailyReservedBytes: MEDIA_QUOTA_POLICY.maxDailyReservedBytes,
    activeUploads: 2,
  }, 100, after);
  assert.equal(next.dailyReservedBytes, 100);
  assert.equal(next.activeUploads, 3);
});

test("releasing an upload slot is bounded and does not refund daily abuse budget", () => {
  const released = releaseMediaUploadSlot({ windowStartMs: 10, dailyReservedBytes: 500, activeUploads: 1 });
  assert.deepEqual(released, { windowStartMs: 10, dailyReservedBytes: 500, activeUploads: 0 });
  assert.equal(releaseMediaUploadSlot(released).activeUploads, 0);
});

test("scanner approval fails closed without clean authenticated processing evidence", () => {
  const base = { status: "pending_security_scan", verdict: "clean", provider: "isolated-clamav-worker",
    objectGenerationMatches: true, processingComplete: true };
  assert.equal(canApproveMediaScan(base), true);
  assert.equal(canApproveMediaScan({ ...base, verdict: "unknown" }), false);
  assert.equal(canApproveMediaScan({ ...base, provider: "" }), false);
  assert.equal(canApproveMediaScan({ ...base, objectGenerationMatches: false }), false);
  assert.equal(canApproveMediaScan({ ...base, processingComplete: false }), false);
  assert.equal(canApproveMediaScan({ ...base, status: "upload_authorized" }), false);
});
