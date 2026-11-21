#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const path = require("node:path");

function readFirebaseOptions(source, platform) {
  if (typeof source !== "string") return null;
  const match = source.match(new RegExp(
    "static const FirebaseOptions " + platform + " = FirebaseOptions\\(([\\s\\S]*?)\\n  \\);",
  ));
  if (!match) return null;
  const block = match[1];
  const read = (key) => {
    const field = block.match(new RegExp(key + "\\s*:\\s*'([^']*)'"));
    return field ? field[1] : "";
  };
  return {
    apiKey: read("apiKey"),
    appId: read("appId"),
    messagingSenderId: read("messagingSenderId"),
    projectId: read("projectId"),
    storageBucket: read("storageBucket"),
    iosBundleId: read("iosBundleId"),
  };
}

function hasPlaceholder(value) {
  return !value || /placeholder|replace|your_|abcdef|1234567890|actualapikey/i.test(value);
}

function validateFirebaseConfiguration({
  alias, optionsSource, expectedProjectId, expectedWebAppId, expectedNativeApps,
  nonprodOptionsSource, expectedNonprodProjectId, expectedNonprodApps,
}) {
  const errors = [];
  if (!expectedProjectId || typeof expectedProjectId !== "string") errors.push("EXPECTED_FIREBASE_PROJECT_ID_MISSING");
  if (!alias || alias.projects?.default !== "mawda-platform-nonprod-2026") errors.push("FIREBASE_CLI_DEFAULT_NOT_NONPRODUCTION");
  if (!alias || alias.projects?.production !== expectedProjectId) errors.push("FIREBASE_CLI_PRODUCTION_ALIAS_MISMATCH");

  const productionWeb = readFirebaseOptions(optionsSource, "web");
  if (!productionWeb) {
    errors.push(typeof optionsSource === "string" ? "FIREBASE_WEB_OPTIONS_MISSING" : "FIREBASE_OPTIONS_MISSING");
  } else {
    if (productionWeb.projectId !== expectedProjectId) errors.push("FIREBASE_WEB_PROJECT_MISMATCH");
    if (expectedWebAppId && productionWeb.appId !== expectedWebAppId) errors.push("FIREBASE_WEB_APP_ID_MISMATCH");
    for (const key of ["apiKey", "appId", "messagingSenderId", "storageBucket"]) {
      if (hasPlaceholder(productionWeb[key])) {
        errors.push("FIREBASE_WEB_" + key.replace(/[A-Z]/g, (letter) => "_" + letter).toUpperCase() + "_INVALID");
      }
    }
  }

  if (!expectedNativeApps || typeof expectedNativeApps !== "object" ||
      Object.keys(expectedNativeApps).length !== 2) {
    errors.push("EXPECTED_PRODUCTION_NATIVE_APP_IDENTITIES_MISSING");
  } else {
    for (const platform of ["android", "ios"]) {
      const expected = expectedNativeApps[platform];
      const actual = readFirebaseOptions(optionsSource, platform);
      const prefix = "FIREBASE_" + platform.toUpperCase() + "_";
      if (!actual) {
        errors.push(prefix + "OPTIONS_MISSING");
        continue;
      }
      if (actual.projectId !== expectedProjectId) errors.push(prefix + "PROJECT_MISMATCH");
      for (const key of ["apiKey", "appId", "messagingSenderId", "storageBucket"]) {
        if (hasPlaceholder(actual[key])) errors.push(prefix + key.replace(/[A-Z]/g, (letter) => "_" + letter).toUpperCase() + "_INVALID");
      }
      if (actual.appId !== expected.appId) errors.push(prefix + "APP_ID_MISMATCH");
      if (actual.messagingSenderId !== expected.messagingSenderId) errors.push(prefix + "SENDER_ID_MISMATCH");
      if (actual.storageBucket !== expected.storageBucket) errors.push(prefix + "STORAGE_BUCKET_MISMATCH");
      if (platform === "ios" && actual.iosBundleId !== expected.iosBundleId) errors.push(prefix + "BUNDLE_ID_MISMATCH");
      if (actual.appId === expectedWebAppId) errors.push(prefix + "REUSES_PRODUCTION_WEB_APP_ID");
    }
  }

  if (!expectedNonprodProjectId || typeof expectedNonprodProjectId !== "string") {
    errors.push("EXPECTED_NONPRODUCTION_FIREBASE_PROJECT_ID_MISSING");
  } else if (expectedNonprodProjectId === expectedProjectId) {
    errors.push("FIREBASE_ENVIRONMENTS_MUST_BE_SEPARATE");
  }
  if (typeof nonprodOptionsSource !== "string") {
    errors.push("NONPRODUCTION_FIREBASE_OPTIONS_MISSING");
  } else if (!expectedNonprodApps || typeof expectedNonprodApps !== "object" ||
      Object.keys(expectedNonprodApps).length !== 3) {
    errors.push("EXPECTED_NONPRODUCTION_APP_IDENTITIES_MISSING");
  } else {
    for (const [platform, expected] of Object.entries(expectedNonprodApps)) {
      const actual = readFirebaseOptions(nonprodOptionsSource, platform);
      const prefix = "NONPRODUCTION_" + platform.toUpperCase() + "_";
      if (!actual) {
        errors.push(prefix + "OPTIONS_MISSING");
        continue;
      }
      if (actual.projectId !== expectedNonprodProjectId) errors.push(prefix + "PROJECT_MISMATCH");
      for (const key of ["apiKey", "appId", "messagingSenderId", "storageBucket"]) {
        if (hasPlaceholder(actual[key])) errors.push(prefix + key.toUpperCase() + "_INVALID");
      }
      if (actual.appId !== expected.appId) errors.push(prefix + "APP_ID_MISMATCH");
      if (actual.messagingSenderId !== expected.messagingSenderId) errors.push(prefix + "SENDER_ID_MISMATCH");
      if (actual.storageBucket !== expected.storageBucket) errors.push(prefix + "STORAGE_BUCKET_MISMATCH");
      if (platform === "ios" && actual.iosBundleId !== expected.iosBundleId) errors.push(prefix + "BUNDLE_ID_MISMATCH");
      if (actual.appId === expectedWebAppId) errors.push(prefix + "REUSES_PRODUCTION_APP_ID");
    }
  }
  return { valid: errors.length === 0, errors };
}

function main() {
  const root = path.resolve(__dirname, "../..");
  const expectedProjectId = process.env.FIREBASE_PROJECT_ID || "mawda-app-2026";
  const expectedWebAppId = process.env.FIREBASE_WEB_APP_ID || "1:697303475139:web:8869603bda6f1a3c3ed376";
  const expectedNonprodProjectId = process.env.FIREBASE_NONPROD_PROJECT_ID || "mawda-platform-nonprod-2026";
  const expectedNativeApps = {
    android: {
      appId: "1:697303475139:android:0aad1a52d2276f273ed376",
      messagingSenderId: "697303475139",
      storageBucket: "mawda-app-2026.firebasestorage.app",
    },
    ios: {
      appId: "1:697303475139:ios:7be58cfe1ac9c4c23ed376",
      messagingSenderId: "697303475139",
      storageBucket: "mawda-app-2026.firebasestorage.app",
      iosBundleId: "com.mawdda.platform.app",
    },
  };
  const expectedNonprodApps = {
    web: {
      appId: "1:12102454568:web:e5b292ae20b9a55ca2141d",
      messagingSenderId: "12102454568",
      storageBucket: "mawda-platform-nonprod-2026.firebasestorage.app",
    },
    android: {
      appId: "1:12102454568:android:5f8907b71af845cfa2141d",
      messagingSenderId: "12102454568",
      storageBucket: "mawda-platform-nonprod-2026.firebasestorage.app",
    },
    ios: {
      appId: "1:12102454568:ios:c03ae42bbcfca114a2141d",
      messagingSenderId: "12102454568",
      storageBucket: "mawda-platform-nonprod-2026.firebasestorage.app",
      iosBundleId: "com.mawdda.platform.app",
    },
  };
  let alias, optionsSource, nonprodOptionsSource;
  try {
    alias = JSON.parse(fs.readFileSync(path.join(root, ".firebaserc"), "utf8"));
  } catch {
    console.error("Firebase CLI project configuration is missing or invalid JSON.");
    process.exitCode = 1;
    return;
  }
  try {
    optionsSource = fs.readFileSync(path.join(root, "lib/firebase_options.dart"), "utf8");
    nonprodOptionsSource = fs.readFileSync(path.join(root, "lib/firebase_options_nonprod.dart"), "utf8");
  } catch {
    console.error("Production or non-production FlutterFire options file is missing.");
    process.exitCode = 1;
    return;
  }
  const result = validateFirebaseConfiguration({
    alias, optionsSource, expectedProjectId, expectedWebAppId, expectedNativeApps,
    nonprodOptionsSource, expectedNonprodProjectId, expectedNonprodApps,
  });
  if (!result.valid) {
    console.error("Firebase environment configuration validation failed: " + result.errors.join(", "));
    process.exitCode = 1;
    return;
  }
  console.log("Firebase production and non-production project/app identities validated.");
}

if (require.main === module) main();
module.exports = { validateFirebaseConfiguration, readFirebaseOptions };
