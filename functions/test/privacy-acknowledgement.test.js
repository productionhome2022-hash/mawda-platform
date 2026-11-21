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
  const versionMarker = "const mawdaPrivacyPolicyVersion = '";
  const versionStart = frontendSource.indexOf(versionMarker);
  const versionEnd = frontendSource.indexOf("';", versionStart);
  const hashMarker = "const mawdaPrivacyPolicyHash =";
  const hashMarkerIndex = frontendSource.indexOf(hashMarker);
  const hashStart = frontendSource.indexOf("'", hashMarkerIndex) + 1;
  const hashEnd = frontendSource.indexOf("'", hashStart);
  const bodyMarker = "const mawdaPrivacyNoticeArabic = '''";
  const bodyMarkerIndex = frontendSource.indexOf(bodyMarker);
  const bodyStart = bodyMarkerIndex + bodyMarker.length;
  const bodyEnd = frontendSource.indexOf("'''", bodyStart);

  assert.notEqual(versionStart, -1, "Flutter policy version must be present");
  assert.notEqual(versionEnd, -1, "Flutter policy version must be terminated");
  assert.notEqual(hashMarkerIndex, -1, "Flutter policy hash must be present");
  assert.notEqual(hashStart, 0, "Flutter policy hash value must be present");
  assert.notEqual(hashEnd, -1, "Flutter policy hash must be terminated");
  assert.notEqual(bodyMarkerIndex, -1, "Flutter Arabic policy body must be present");
  assert.notEqual(bodyEnd, -1, "Flutter Arabic policy body must be terminated");
  const version = frontendSource.slice(versionStart + versionMarker.length, versionEnd);
  const hash = frontendSource.slice(hashStart, hashEnd);
  const body = frontendSource.slice(bodyStart, bodyEnd);

  assert.equal(version, PRIVACY_POLICY_VERSION);
  assert.equal(hash, PRIVACY_POLICY_SHA256);
  assert.equal(
    createHash("sha256").update(body, "utf8").digest("hex"),
    PRIVACY_POLICY_SHA256,
  );
});
