import test from "node:test";
import assert from "node:assert/strict";
import { classifyClamDResponse, constantTimeBearerMatch, parseAllowedHosts, validateScanRequest } from "../security.mjs";
const mediaId = "123e4567-e89b-12d3-a456-426614174000";
const sample = {
  mediaId,
  objectPath: "quarantine/user_1/" + mediaId,
  objectGeneration: "12345",
  provider: "clamav-mawadda-gateway",
  downloadUrl: "https://storage.googleapis.com/example-bucket/quarantine/user_1/" + mediaId + "?generation=12345&X-Goog-Signature=abc",
  callbackUrl: "https://europe-west1-example.cloudfunctions.net/receiveMediaScanVerdict",
};
test("bearer authentication rejects absent, weak and mismatched credentials", () => {
  const token = "x".repeat(48);
  assert.equal(constantTimeBearerMatch("Bearer " + token, token), true);
  assert.equal(constantTimeBearerMatch("Bearer " + token.slice(1) + "y", token), false);
  assert.equal(constantTimeBearerMatch("Bearer " + token, "short"), false);
  assert.equal(constantTimeBearerMatch(token, token), false);
});
test("scan request enforces HTTPS host allowlists, quarantine path and pinned generation", () => {
  const hosts = {
    storageHosts: parseAllowedHosts("storage.googleapis.com"),
    callbackHosts: parseAllowedHosts("europe-west1-example.cloudfunctions.net"),
  };
  assert.equal(validateScanRequest(sample, hosts).mediaId, mediaId);
  assert.equal(validateScanRequest({ ...sample, downloadUrl: "http://storage.googleapis.com/a" }, hosts), null);
  assert.equal(validateScanRequest({ ...sample, callbackUrl: "https://attacker.example/callback" }, hosts), null);
  assert.equal(validateScanRequest({ ...sample, objectPath: "public/anything" }, hosts), null);
  assert.equal(validateScanRequest({ ...sample, objectGeneration: "latest" }, hosts), null);
});
test("only definitive ClamAV replies become clean or malicious verdicts", () => {
  assert.equal(classifyClamDResponse("stream: OK"), "clean");
  assert.equal(classifyClamDResponse("stream: Eicar-Test-Signature FOUND"), "malicious");
  assert.throws(() => classifyClamDResponse("stream: size limit exceeded ERROR"));
  assert.throws(() => classifyClamDResponse(""));
});
