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
    provider: "mawadda-malware-gateway",
    engine: "ClamAV",
    engineVersion: "1.4.2",
    signatureVersion: "20261113-090000",
    verdict: "clean",
    objectGeneration: "123456",
    sha256: "a".repeat(64),
    scannedAtMs: now,
  };
  assert.equal(validateScannerVerdict(payload, "mawadda-malware-gateway", now).verdict, "clean");
  assert.equal(validateScannerVerdict({ ...payload, provider: "untrusted" }, "mawadda-malware-gateway", now), null);
  assert.equal(validateScannerVerdict({ ...payload, objectGeneration: "latest" }, "mawadda-malware-gateway", now), null);
  assert.equal(validateScannerVerdict({ ...payload, scannedAtMs: now - 700000 }, "mawadda-malware-gateway", now), null);
  assert.equal(validateScannerVerdict({ ...payload, verdict: "approved" }, "mawadda-malware-gateway", now), null);
});
