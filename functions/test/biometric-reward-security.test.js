const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("biometric reward callable remains closed pending the Super Owner manual-review workflow", () => {
  const source = fs.readFileSync(path.join(__dirname, "../src/index.ts"), "utf8");
  const start = source.indexOf("export const completeBiometricVerificationCycle = onCall(async (request) => {");
  const end = source.indexOf("\n\n/**\n * Starts a fresh email ownership challenge after three calendar months", start);
  assert.notEqual(start, -1, "biometric reward callable must remain present");
  assert.notEqual(end, -1, "biometric reward callable boundary must remain identifiable");
  const callable = source.slice(start, end);
  assert.match(callable, /failed-precondition/);
  assert.match(callable, /اكتمال المراجعة اليدوية الخادمية بواسطة Super Owner/);
  assert.doesNotMatch(callable, /runTransaction|walletLedger|rewardCoins|transaction\.update|transaction\.create/);
});

test("client booleans and attempt IDs cannot bypass the Super Owner manual-review gate", () => {
  const source = fs.readFileSync(path.join(__dirname, "../src/index.ts"), "utf8");
  const start = source.indexOf("export const completeBiometricVerificationCycle = onCall(async (request) => {");
  const end = source.indexOf("\n\n/**\n * Starts a fresh email ownership challenge after three calendar months", start);
  const callable = source.slice(start, end);
  assert.doesNotMatch(callable, /localAuthenticationSucceeded|clientAttemptId|local_os_biometric_prompt/);
});
