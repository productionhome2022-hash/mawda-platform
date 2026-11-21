const test = require("node:test");
const assert = require("node:assert/strict");
const { validateFirebaseConfiguration } = require("../scripts/validate-firebase-config.cjs");

const projectId = "mawda-app-2026";
const webAppId = "1:697303475139:web:8869603bda6f1a3c3ed376";
const androidAppId = "1:697303475139:android:0aad1a52d2276f273ed376";
const iosAppId = "1:697303475139:ios:7be58cfe1ac9c4c23ed376";
const nonprodProjectId = "mawda-platform-nonprod-2026";
const validOptions = [
  "static const FirebaseOptions web = FirebaseOptions(",
  "  apiKey: 'AIzaSyA-real-looking-key',",
  "  appId: '" + webAppId + "',",
  "  messagingSenderId: '697303475139',",
  "  projectId: '" + projectId + "',",
  "  authDomain: 'mawda-app-2026.firebaseapp.com',",
  "  storageBucket: 'mawda-app-2026.firebasestorage.app',",
  "  );",
  "static const FirebaseOptions android = FirebaseOptions(",
  "  apiKey: 'AIzaSyAndroid-real-looking-key',",
  "  appId: '" + androidAppId + "',",
  "  messagingSenderId: '697303475139',",
  "  projectId: '" + projectId + "',",
  "  storageBucket: 'mawda-app-2026.firebasestorage.app',",
  "  );",
  "static const FirebaseOptions ios = FirebaseOptions(",
  "  apiKey: 'AIzaSyIos-real-looking-key',",
  "  appId: '" + iosAppId + "',",
  "  messagingSenderId: '697303475139',",
  "  projectId: '" + projectId + "',",
  "  storageBucket: 'mawda-app-2026.firebasestorage.app',",
  "  iosBundleId: 'com.mawdda.platform.app',",
  "  );",
].join("\n");

const expectedNonprodApps = {
  web: { appId: "1:12102454568:web:e5b292ae20b9a55ca2141d", messagingSenderId: "12102454568", storageBucket: nonprodProjectId + ".firebasestorage.app" },
  android: { appId: "1:12102454568:android:5f8907b71af845cfa2141d", messagingSenderId: "12102454568", storageBucket: nonprodProjectId + ".firebasestorage.app" },
  ios: { appId: "1:12102454568:ios:c03ae42bbcfca114a2141d", messagingSenderId: "12102454568", storageBucket: nonprodProjectId + ".firebasestorage.app", iosBundleId: "com.mawdda.platform.app" },
};

function makeNonprodOptions(overrides = {}) {
  const apps = { ...expectedNonprodApps, ...overrides };
  return Object.entries(apps).map(([platform, values]) => [
    "static const FirebaseOptions " + platform + " = FirebaseOptions(",
    "  apiKey: 'AIzaSyNonprod-real-looking-key',",
    "  appId: '" + values.appId + "',",
    "  messagingSenderId: '" + values.messagingSenderId + "',",
    "  projectId: '" + (values.projectId || nonprodProjectId) + "',",
    "  storageBucket: '" + values.storageBucket + "',",
    ...(platform === "ios" ? ["  iosBundleId: '" + values.iosBundleId + "',"] : []),
    "  );",
  ].join("\n")).join("\n");
}

function validate(optionsSource = validOptions, productionAlias = projectId,
  defaultAlias = "mawda-platform-nonprod-2026", nonprodSource = makeNonprodOptions(),
  nonprodProject = nonprodProjectId) {
  return validateFirebaseConfiguration({
    alias: { projects: { default: defaultAlias, production: productionAlias } },
    optionsSource, expectedProjectId: projectId, expectedWebAppId: webAppId,
    expectedNativeApps: {
      android: { appId: androidAppId, messagingSenderId: "697303475139", storageBucket: projectId + ".firebasestorage.app" },
      ios: { appId: iosAppId, messagingSenderId: "697303475139", storageBucket: projectId + ".firebasestorage.app", iosBundleId: "com.mawdda.platform.app" },
    },
    nonprodOptionsSource: nonprodSource, expectedNonprodProjectId: nonprodProject,
    expectedNonprodApps,
  });
}

test("accepts matching production and non-production Firebase identities", () => {
  assert.deepEqual(validate(), { valid: true, errors: [] });
});
test("rejects a mismatched explicit production alias", () => {
  assert.ok(validate(validOptions, "another-project").errors.includes("FIREBASE_CLI_PRODUCTION_ALIAS_MISMATCH"));
});
test("rejects a production default alias", () => {
  assert.ok(validate(validOptions, projectId, projectId).errors.includes("FIREBASE_CLI_DEFAULT_NOT_NONPRODUCTION"));
});
test("rejects a FlutterFire production project mismatch", () => {
  assert.ok(validate(validOptions.replace(projectId, "mawda-platform")).errors.includes("FIREBASE_WEB_PROJECT_MISMATCH"));
});
test("rejects an unregistered production Web app ID", () => {
  assert.ok(validate(validOptions.replace(webAppId, "1:1234567890:web:abcdef123456789")).errors.includes("FIREBASE_WEB_APP_ID_MISMATCH"));
});
test("rejects placeholder production credentials without exposing their values", () => {
  assert.ok(validate(validOptions.replace("AIzaSyA-real-looking-key", "YOUR_API_KEY")).errors.some((error) => error.includes("API_KEY_INVALID")));
});
test("fails closed when production or non-production options are missing", () => {
  assert.ok(validate("// no Firebase options").errors.includes("FIREBASE_WEB_OPTIONS_MISSING"));
  assert.ok(validate(null).errors.includes("FIREBASE_OPTIONS_MISSING"));
  assert.ok(validate(validOptions, projectId, undefined, null).errors.includes("NONPRODUCTION_FIREBASE_OPTIONS_MISSING"));
});
test("rejects a non-production project mismatch", () => {
  const source = makeNonprodOptions({ web: { ...expectedNonprodApps.web, projectId } });
  assert.ok(validate(validOptions, projectId, undefined, source).errors.includes("NONPRODUCTION_WEB_PROJECT_MISMATCH"));
});
test("rejects a non-production app ID mismatch and production app ID reuse", () => {
  const source = makeNonprodOptions({ web: { ...expectedNonprodApps.web, appId: webAppId } });
  const result = validate(validOptions, projectId, undefined, source);
  assert.ok(result.errors.includes("NONPRODUCTION_WEB_APP_ID_MISMATCH"));
  assert.ok(result.errors.includes("NONPRODUCTION_WEB_REUSES_PRODUCTION_APP_ID"));
});
test("rejects a missing native registration and an incorrect iOS bundle identifier", () => {
  const missingAndroid = makeNonprodOptions().replace(
    /static const FirebaseOptions android = FirebaseOptions\([\s\S]*?\n  \);\n?/,
    "",
  );
  assert.ok(validate(validOptions, projectId, undefined, missingAndroid).errors.includes("NONPRODUCTION_ANDROID_OPTIONS_MISSING"));
  const wrongIos = makeNonprodOptions({ ios: { ...expectedNonprodApps.ios, iosBundleId: "com.example.wrong" } });
  assert.ok(validate(validOptions, projectId, undefined, wrongIos).errors.includes("NONPRODUCTION_IOS_BUNDLE_ID_MISMATCH"));
});
test("rejects production and non-production aliases that resolve to the same project", () => {
  assert.ok(validate(validOptions, projectId, undefined, makeNonprodOptions(), projectId).errors.includes("FIREBASE_ENVIRONMENTS_MUST_BE_SEPARATE"));
});

test("rejects mismatched production Android/iOS app identities", () => {
  assert.ok(validate(validOptions.replace(androidAppId, "1:1234567890:android:abcdef123456789")).errors.includes("FIREBASE_ANDROID_APP_ID_MISMATCH"));
  assert.ok(validate(validOptions.replace("com.mawdda.platform.app", "com.example.wrong")).errors.includes("FIREBASE_IOS_BUNDLE_ID_MISMATCH"));
});
test("rejects missing production native registrations", () => {
  const missingAndroid = validOptions.replace(/static const FirebaseOptions android = FirebaseOptions\([\s\S]*?\n  \);\n?/, "");
  assert.ok(validate(missingAndroid).errors.includes("FIREBASE_ANDROID_OPTIONS_MISSING"));
});

test("fails closed when expected production native identities are omitted", () => {
  const result = validateFirebaseConfiguration({
    alias: { projects: { default: nonprodProjectId, production: projectId } },
    optionsSource: validOptions,
    expectedProjectId: projectId,
    expectedWebAppId: webAppId,
    nonprodOptionsSource: makeNonprodOptions(),
    expectedNonprodProjectId: nonprodProjectId,
    expectedNonprodApps,
  });
  assert.ok(result.errors.includes("EXPECTED_PRODUCTION_NATIVE_APP_IDENTITIES_MISSING"));
});
