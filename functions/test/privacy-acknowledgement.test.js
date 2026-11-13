const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");
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

test("accepts only supported locales and member or guest actor type", () => {
  for (const locale of ["ar", "en", "fr", "es"]) {
    assert.equal(validatePrivacyAcknowledgement({ ...valid, locale }).locale, locale);
  }
  assert.throws(() => validatePrivacyAcknowledgement({
    ...valid, locale: "de",
  }), /PRIVACY_POLICY_LOCALE_INVALID/);
  assert.equal(validatePrivacyAcknowledgement({ ...valid, actorType: "guest" }).actorType, "guest");
  assert.throws(() => validatePrivacyAcknowledgement({
    ...valid, actorType: "owner",
  }), /PRIVACY_POLICY_ACTOR_INVALID/);
});

test("rejects missing, oversized, or malformed app versions", () => {
  for (const appVersion of ["", "x".repeat(33), "../secret"]) {
    assert.throws(() => validatePrivacyAcknowledgement({
      ...valid, appVersion,
    }), /PRIVACY_POLICY_APP_VERSION_INVALID/);
  }
});

test("Flutter privacy notice version and body hash match the backend policy constants", () => {
  const frontendSource = fs.readFileSync(
    path.join(__dirname, "../../lib/privacy_policy.dart"),
    "utf8",
  );
  const version = frontendSource.match(/const mawdaPrivacyPolicyVersion = '([^']+)';/);
  const hash = frontendSource.match(/const mawdaPrivacyPolicyHash =\\s*'([^']+)';/);
  const body = frontendSource.match(/const mawdaPrivacyNoticeArabic = '''([\\s\\S]*?)''';/);

  assert.ok(version, "Flutter policy version must be present");
  assert.ok(hash, "Flutter policy hash must be present");
  assert.ok(body, "Flutter Arabic policy body must be present");
  assert.equal(version[1], PRIVACY_POLICY_VERSION);
  assert.equal(hash[1], PRIVACY_POLICY_SHA256);
  assert.equal(
    createHash("sha256").update(body[1], "utf8").digest("hex"),
    PRIVACY_POLICY_SHA256,
  );
});
