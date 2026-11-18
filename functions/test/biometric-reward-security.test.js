const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("legacy device-local biometric completion is rejected in favor of Super Owner manual review", () => {
  const source = fs.readFileSync(path.join(__dirname, "../src/index.ts"), "utf8");
  const start = source.indexOf("export const completeBiometricVerificationCycle = onCall(async (request) => {");
  const end = source.indexOf("\n\nconst BIOMETRIC_REQUESTS", start);
  assert.notEqual(start, -1, "biometric reward callable must remain present");
  assert.notEqual(end, -1, "biometric reward callable boundary must remain identifiable");
  const callable = source.slice(start, end);
  assert.match(callable, /failed-precondition/);
  assert.match(callable, /المصادقة المحلية للهاتف ليست توثيقاً بيومترياً/);
  assert.match(callable, /طلب التوثيق ومراجعة Super Owner/);
  assert.doesNotMatch(callable, /runTransaction|walletLedger|rewardCoins|transaction\.update|transaction\.create/);
});

test("device-local prompts and client assertions are not accepted as biometric verification", () => {
  const source = fs.readFileSync(path.join(__dirname, "../src/index.ts"), "utf8");
  const start = source.indexOf("export const completeBiometricVerificationCycle = onCall(async (request) => {");
  const end = source.indexOf("\n\n/**\n * Starts a fresh 90-day email ownership challenge", start);
  const callable = source.slice(start, end);
  assert.doesNotMatch(callable, /localAuthenticationSucceeded|clientAttemptId|local_os_biometric_prompt/);
});
