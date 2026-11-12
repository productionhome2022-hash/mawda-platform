#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const path = require("node:path");
function validateFirebaseConfiguration({ alias, optionsSource, expectedProjectId, expectedWebAppId }) {
  const errors = [];
  if (!expectedProjectId || typeof expectedProjectId !== "string") errors.push("EXPECTED_FIREBASE_PROJECT_ID_MISSING");
  if (!alias || alias.projects?.default !== expectedProjectId) errors.push("FIREBASE_CLI_PROJECT_MISMATCH");
  if (typeof optionsSource !== "string") errors.push("FIREBASE_OPTIONS_MISSING");
  else {
    const match = optionsSource.match(/static const FirebaseOptions web = FirebaseOptions\(([\s\S]*?)\n  \);/);
    if (!match) errors.push("FIREBASE_WEB_OPTIONS_MISSING");
    else {
      const web = match[1];
      const read = (key) => {
        const field = web.match(new RegExp(key + "\\s*:\\s*'([^']*)'"));
        return field ? field[1] : "";
      };
      if (read("projectId") !== expectedProjectId) errors.push("FIREBASE_WEB_PROJECT_MISMATCH");
      if (expectedWebAppId && read("appId") !== expectedWebAppId) errors.push("FIREBASE_WEB_APP_ID_MISMATCH");
      for (const key of ["apiKey", "appId", "messagingSenderId", "storageBucket"]) {
        const value = read(key);
        if (!value || /placeholder|replace|your_|abcdef|1234567890|actualapikey/i.test(value))
          errors.push("FIREBASE_WEB_" + key.replace(/[A-Z]/g, (letter) => "_" + letter).toUpperCase() + "_INVALID");
      }
    }
  }
  return { valid: errors.length === 0, errors };
}
function main() {
  const root = path.resolve(__dirname, "../..");
  const expectedProjectId = process.env.FIREBASE_PROJECT_ID || "mawda-app-2026";
  const expectedWebAppId = process.env.FIREBASE_WEB_APP_ID || "1:697303475139:web:8869603bda6f1a3c3ed376";
  let alias, optionsSource;
  try { alias = JSON.parse(fs.readFileSync(path.join(root, ".firebaserc"), "utf8")); }
  catch { console.error("Firebase CLI project configuration is missing or invalid JSON."); process.exitCode = 1; return; }
  try { optionsSource = fs.readFileSync(path.join(root, "lib/firebase_options.dart"), "utf8"); }
  catch { console.error("FlutterFire options file is missing."); process.exitCode = 1; return; }
  const result = validateFirebaseConfiguration({ alias, optionsSource, expectedProjectId, expectedWebAppId });
  if (!result.valid) {
    console.error("Firebase production configuration validation failed: " + result.errors.join(", "));
    process.exitCode = 1;
    return;
  }
  console.log("Firebase production project and registered Web app identifiers validated.");
}
if (require.main === module) main();
module.exports = { validateFirebaseConfiguration };
