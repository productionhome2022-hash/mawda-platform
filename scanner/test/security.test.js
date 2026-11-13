const test = require("node:test");
const assert = require("node:assert/strict");
const { equalSecret, validateScanRequest } = require("../security");

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
