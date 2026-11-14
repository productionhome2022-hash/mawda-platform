const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("biometric reward callable fails closed without server-verifiable device attestation", () => {
  const source = fs.readFileSync(path.join(__dirname, "../src/index.ts"), "utf8");
  const start = source.indexOf("export const completeBiometricVerificationCycle = onCall(async (request) => {");
  const end = source.indexOf("\n\n/**\n * Starts a fresh 90-day email ownership challenge", start);
  assert.notEqual(start, -1, "biometric reward callable must remain present");
  assert.notEqual(end, -1, "biometric reward callable boundary must remain identifiable");
  const callable = source.slice(start, end);
  assert.match(callable, /failed-precondition/);
  assert.match(callable, /التحقق التشفيري المرتبط بالجهاز/);
  assert.doesNotMatch(callable, /runTransaction|walletLedger|rewardCoins|transaction\.update|transaction\.create/);
});

test("client booleans and attempt IDs are not accepted as a biometric proof contract", () => {
  const source = fs.readFileSync(path.join(__dirname, "../src/index.ts"), "utf8");
  const start = source.indexOf("export const completeBiometricVerificationCycle = onCall(async (request) => {");
  const end = source.indexOf("\n\n/**\n * Starts a fresh 90-day email ownership challenge", start);
  const callable = source.slice(start, end);
  assert.doesNotMatch(callable, /localAuthenticationSucceeded|clientAttemptId|local_os_biometric_prompt/);
});
