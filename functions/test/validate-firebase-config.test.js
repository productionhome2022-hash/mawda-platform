const test = require("node:test");
const assert = require("node:assert/strict");
const { validateFirebaseConfiguration } = require("../scripts/validate-firebase-config.cjs");
const projectId = "mawda-app-2026";
const webAppId = "1:697303475139:web:8869603bda6f1a3c3ed376";
const validOptions = [
  "static const FirebaseOptions web = FirebaseOptions(",
  "  apiKey: 'AIzaSyA-real-looking-key',",
  "  appId: '" + webAppId + "',",
  "  messagingSenderId: '697303475139',",
  "  projectId: '" + projectId + "',",
  "  authDomain: 'mawda-app-2026.firebaseapp.com',",
  "  storageBucket: 'mawda-app-2026.firebasestorage.app',",
  "  );",
].join("\n");
function validate(optionsSource = validOptions, aliasProject = projectId) {
  return validateFirebaseConfiguration({
    alias: { projects: { default: aliasProject } },
    optionsSource,
    expectedProjectId: projectId,
    expectedWebAppId: webAppId,
  });
}
test("accepts matching Firebase CLI and registered Web app configuration", () => {
  assert.deepEqual(validate(), { valid: true, errors: [] });
});
test("rejects a Firebase CLI project mismatch", () => {
  assert.ok(validate(validOptions, "another-project").errors.includes("FIREBASE_CLI_PROJECT_MISMATCH"));
});
test("rejects a FlutterFire project mismatch", () => {
  assert.ok(validate(validOptions.replace(projectId, "mawda-platform")).errors.includes("FIREBASE_WEB_PROJECT_MISMATCH"));
});
test("rejects an unregistered Web app ID", () => {
  assert.ok(validate(validOptions.replace(webAppId, "1:1234567890:web:abcdef123456789")).errors.includes("FIREBASE_WEB_APP_ID_MISMATCH"));
});
test("rejects placeholder credentials without exposing their values", () => {
  const result = validate(validOptions.replace("AIzaSyA-real-looking-key", "YOUR_API_KEY"));
  assert.ok(result.errors.some((error) => error.includes("API_KEY_INVALID")));
});
test("fails closed when Web options are missing or malformed", () => {
  assert.ok(validate("// no Firebase options").errors.includes("FIREBASE_WEB_OPTIONS_MISSING"));
  assert.ok(validate(null).errors.includes("FIREBASE_OPTIONS_MISSING"));
});
