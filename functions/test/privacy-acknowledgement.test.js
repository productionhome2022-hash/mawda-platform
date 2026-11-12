const test = require("node:test");
const assert = require("node:assert/strict");
const {
  PRIVACY_POLICY_VERSION,
  PRIVACY_POLICY_SHA256,
  validatePrivacyAcknowledgement,
} = require("../lib/privacy-acknowledgement");

const valid = {
  policyVersion: PRIVACY_POLICY_VERSION,
  policyHash: PRIVACY_POLICY_SHA256,
  locale: "ar",
  actorType: "member",
  appVersion: "1.0.0+1",
};

test("accepts the exact current policy revision and supported locale", () => {
  assert.deepEqual(validatePrivacyAcknowledgement(valid), valid);
});

test("rejects stale policy versions and mismatched hashes", () => {
  assert.throws(() => validatePrivacyAcknowledgement({
    ...valid, policyVersion: "older",
  }), /PRIVACY_POLICY_VERSION_MISMATCH/);
  assert.throws(() => validatePrivacyAcknowledgement({
    ...valid, policyHash: "0".repeat(64),
  }), /PRIVACY_POLICY_HASH_MISMATCH/);
});

test("accepts only supported locales and member actor type", () => {
  for (const locale of ["ar", "en", "fr", "es"]) {
    assert.equal(validatePrivacyAcknowledgement({ ...valid, locale }).locale, locale);
  }
  assert.throws(() => validatePrivacyAcknowledgement({
    ...valid, locale: "de",
  }), /PRIVACY_POLICY_LOCALE_INVALID/);
  assert.throws(() => validatePrivacyAcknowledgement({
    ...valid, actorType: "guest",
  }), /PRIVACY_POLICY_ACTOR_INVALID/);
});

test("rejects missing, oversized, or malformed app versions", () => {
  for (const appVersion of ["", "x".repeat(33), "../secret"]) {
    assert.throws(() => validatePrivacyAcknowledgement({
      ...valid, appVersion,
    }), /PRIVACY_POLICY_APP_VERSION_INVALID/);
  }
});
