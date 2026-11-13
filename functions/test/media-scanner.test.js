const test = require("node:test");
const assert = require("node:assert/strict");
const { createHmac } = require("node:crypto");
const { verifyScannerWebhook, validateScannerVerdict } = require("../lib/media-scanner");

test("scanner webhook HMAC is verified and rejects absent or weak secrets", () => {
  const body = Buffer.from("{\"verdict\":\"clean\"}");
  const secret = "s".repeat(48);
  const signature = createHmac("sha256", secret).update(body).digest("hex");
  assert.equal(verifyScannerWebhook(body, signature, secret), true);
  assert.equal(verifyScannerWebhook(body, signature, "weak"), false);
  assert.equal(verifyScannerWebhook(body, signature, undefined), false);
  assert.equal(verifyScannerWebhook(body, "0".repeat(64), secret), false);
});

test("scanner verdict binds provider, object generation, hash and freshness", () => {
  const now = 1_800_000_000_000;
  const payload = {
    mediaId: "123e4567-e89b-12d3-a456-426614174000",
    provider: "clamav-mawadda-gateway",
    verdict: "clean",
    objectGeneration: "123456",
    sha256: "a".repeat(64),
    scannedAtMs: now,
    scanEngine: "ClamAV",
    engineVersion: "1.4.6",
    signatureDatabaseVersion: "28202",
    signatureDatabaseAgeMs: 60 * 60 * 1000,
  };
  assert.equal(validateScannerVerdict(payload, "clamav-mawadda-gateway", now).verdict, "clean");
  assert.equal(validateScannerVerdict({ ...payload, provider: "untrusted" }, "clamav-mawadda-gateway", now), null);
  assert.equal(validateScannerVerdict({ ...payload, objectGeneration: "latest" }, "clamav-mawadda-gateway", now), null);
  assert.equal(validateScannerVerdict({ ...payload, scannedAtMs: now - 700000 }, "clamav-mawadda-gateway", now), null);
  assert.equal(validateScannerVerdict({ ...payload, verdict: "approved" }, "clamav-mawadda-gateway", now), null);
  assert.equal(validateScannerVerdict({ ...payload, scanEngine: "unknown" }, "clamav-mawadda-gateway", now), null);
  assert.equal(validateScannerVerdict({ ...payload, engineVersion: "latest" }, "clamav-mawadda-gateway", now), null);
  assert.equal(validateScannerVerdict({ ...payload, signatureDatabaseVersion: "unknown" }, "clamav-mawadda-gateway", now), null);
  assert.equal(validateScannerVerdict({ ...payload, signatureDatabaseAgeMs: 37 * 60 * 60 * 1000 }, "clamav-mawadda-gateway", now), null);
});


test("scanner verdict accepts a fully bound safe WebP derivative and rejects partial or unsafe paths", () => {
  const now = 1_800_000_000_000;
  const base = {
    mediaId: "123e4567-e89b-12d3-a456-426614174000",
    provider: "clamav-mawadda-gateway",
    verdict: "clean",
    objectGeneration: "123456",
    sha256: "a".repeat(64),
    scannedAtMs: now,
    scanEngine: "ClamAV",
    engineVersion: "1.4.6",
    signatureDatabaseVersion: "28202",
    signatureDatabaseAgeMs: 60 * 60 * 1000,
  };
  const derivative = {
    safePreviewPath: "processed/member_123/123e4567-e89b-12d3-a456-426614174000/preview.webp",
    safePreviewGeneration: "987654",
    safePreviewSha256: "b".repeat(64),
    safePreviewContentType: "image/webp",
  };
  assert.equal(validateScannerVerdict({ ...base, ...derivative }, base.provider, now).safePreviewGeneration, "987654");
  assert.equal(validateScannerVerdict({ ...base, safePreviewPath: derivative.safePreviewPath }, base.provider, now), null);
  assert.equal(validateScannerVerdict({ ...base, ...derivative, safePreviewPath: "processed/other/another-id/preview.webp" }, base.provider, now), null);
  assert.equal(validateScannerVerdict({ ...base, ...derivative, verdict: "malicious" }, base.provider, now), null);
});
