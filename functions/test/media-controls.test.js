const test = require("node:test");
const assert = require("node:assert/strict");
const {
  MEDIA_QUOTA_POLICY, validateMediaQuotaUsage, mediaRetentionCutoff,
  isExpiredUploadIntent, assertTrustedScannerVerdict,
} = require("../lib/media-controls");

test("quota gates reject count, daily bytes and active quarantine overflow", () => {
  const base = { uploadCount: 0, declaredBytes: 0, activeBytes: 0, nextBytes: 1024 };
  assert.equal(validateMediaQuotaUsage(base), null);
  assert.equal(validateMediaQuotaUsage({ ...base, uploadCount: MEDIA_QUOTA_POLICY.dailyUploadCount }), "DAILY_UPLOAD_COUNT");
  assert.equal(validateMediaQuotaUsage({ ...base, declaredBytes: MEDIA_QUOTA_POLICY.dailyDeclaredBytes }), "DAILY_BYTES");
  assert.equal(validateMediaQuotaUsage({ ...base, activeBytes: MEDIA_QUOTA_POLICY.activeQuarantineBytes }), "ACTIVE_QUARANTINE_BYTES");
  assert.throws(() => validateMediaQuotaUsage({ ...base, nextBytes: -1 }));
});

test("retention cutoff and upload-intent expiry are deterministic", () => {
  const now = 1_800_000_000_000;
  assert.equal(mediaRetentionCutoff(now), now - 30 * 86400000);
  assert.equal(isExpiredUploadIntent(now - 300001, now), true);
  assert.equal(isExpiredUploadIntent(now - 300000, now), false);
  assert.equal(isExpiredUploadIntent(-1, now), false);
});

test("only a fresh, generation-bound scanner verdict is accepted", () => {
  const expected = { provider: "mawadda-clamav-gateway", objectGeneration: "17", sha256: "a".repeat(64), nowMs: 1_800_000_000_000 };
  const verdict = { ...expected, verdict: "clean", scannedAtMs: expected.nowMs };
  assert.equal(assertTrustedScannerVerdict(verdict, expected), true);
  assert.equal(assertTrustedScannerVerdict({ ...verdict, objectGeneration: "16" }, expected), false);
  assert.equal(assertTrustedScannerVerdict({ ...verdict, scannedAtMs: expected.nowMs - 700000 }, expected), false);
  assert.equal(assertTrustedScannerVerdict({ ...verdict, verdict: "unknown" }, expected), false);
});
