const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");

const read = (path) => readFileSync(resolve(__dirname, path), "utf8");

test("App Check global enforcement loads before callable modules", () => {
  const index = read("../src/index.ts");
  const globalOptions = read("../src/app-check-global.ts");
  assert.ok(index.startsWith('import "./app-check-global";'));
  assert.match(globalOptions, /setGlobalOptions\(\{\s*enforceAppCheck:\s*true\s*\}\)/);
});

test("Flutter initializes App Check after Firebase and before opening AuthGate", () => {
  const main = read("../../lib/main.dart");
  const firebaseInit = main.indexOf("Firebase.initializeApp(");
  const appCheckActivation = main.indexOf("FirebaseAppCheck.instance.activate(");
  const authGate = main.indexOf("return AuthGate();");
  assert.ok(firebaseInit >= 0);
  assert.ok(appCheckActivation > firebaseInit);
  assert.ok(authGate > appCheckActivation);
  assert.match(main, /AndroidProvider\.playIntegrity/);
  assert.match(main, /AppleProvider\.appAttestWithDeviceCheckFallback/);
  assert.match(main, /ReCaptchaV3Provider\(siteKey\)/);
  assert.match(main, /MAWDDA_APP_CHECK_WEB_SITE_KEY is required/);
  assert.match(main, /WebDebugProvider\(\)/);
});

test("Web App Check always requires the configured reCAPTCHA site key", () => {
  const main = read("../../lib/main.dart");
  const productionWeb = main.slice(
    main.indexOf("if (environment == 'production' && kIsWeb)"),
    main.indexOf("} else {", main.indexOf("if (environment == 'production' && kIsWeb)")),
  );
  assert.match(productionWeb, /ReCaptchaV3Provider/);
  assert.match(productionWeb, /MAWDDA_APP_CHECK_WEB_SITE_KEY is required/);
  assert.doesNotMatch(main, /WebDebugProvider/);
});
