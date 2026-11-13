const test = require("node:test");
const assert = require("node:assert/strict");
const { equalSecret, validateScanRequest, isSafeDerivativeMetadata } = require("../security");

const bucket = "mawda-media-test.appspot.com";
const mediaId = "123e4567-e89b-42d3-a456-426614174000";
const generation = "1740000000000000";
const url = `https://storage.googleapis.com/${bucket}/quarantine/user/${mediaId}?generation=${generation}&X-Goog-Signature=opaque`;

test("scanner API secret comparison is constant-time and rejects weak/missing values", () => {
  const secret = "s".repeat(48);
  assert.equal(equalSecret(secret, secret), true);
  assert.equal(equalSecret(secret, "x".repeat(48)), false);
  assert.equal(equalSecret(secret, "weak"), false);
  assert.equal(equalSecret(secret, undefined), false);
});

test("scan request accepts only exact quarantine path, UUID, generation and Google Storage HTTPS URL", () => {
  const valid = {
    mediaId, objectPath: `quarantine/user/${mediaId}`,
    objectGeneration: generation, downloadUrl: url,
    provider: "clamav-mawadda-gateway", contentType: "image/png",
  };
  assert.deepEqual(validateScanRequest(valid, "clamav-mawadda-gateway", bucket), valid);
  assert.equal(validateScanRequest({ ...valid, objectPath: `processed/user/${mediaId}` }, valid.provider, bucket), null);
  assert.equal(validateScanRequest({ ...valid, objectGeneration: "latest" }, valid.provider, bucket), null);
  assert.equal(validateScanRequest({ ...valid, provider: "untrusted" }, valid.provider, bucket), null);
  assert.equal(validateScanRequest({ ...valid, downloadUrl: "http://127.0.0.1/admin" }, valid.provider, bucket), null);
  assert.equal(validateScanRequest({ ...valid, downloadUrl: "https://evil.example/file" }, valid.provider, bucket), null);
  assert.equal(validateScanRequest({ ...valid, downloadUrl: url.replace(generation, "1") }, valid.provider, bucket), null);
});

test("safe derivative reuse is bound to source hash, generation, provider and processing version", () => {
  const expected = {
    mediaId, objectGeneration: generation, sourceSha256: "a".repeat(64),
    provider: "clamav-mawadda-gateway",
  };
  const metadata = {
    contentType: "image/webp", size: 4096,
    metadata: {
      mediaId,
      sourceGeneration: generation,
      sourceSha256: "a".repeat(64),
      scannerProvider: expected.provider,
      processing: "sharp-decode-reencode-v1",
    },
  };
  assert.equal(isSafeDerivativeMetadata(metadata, expected), true);
  assert.equal(isSafeDerivativeMetadata({ ...metadata, metadata: { ...metadata.metadata, sourceSha256: "b".repeat(64) } }, expected), false);
  assert.equal(isSafeDerivativeMetadata({ ...metadata, metadata: { ...metadata.metadata, sourceGeneration: "1" } }, expected), false);
  assert.equal(isSafeDerivativeMetadata({ ...metadata, size: 21 * 1024 * 1024 }, expected), false);
  assert.equal(isSafeDerivativeMetadata({ ...metadata, contentType: "image/png" }, expected), false);
});
