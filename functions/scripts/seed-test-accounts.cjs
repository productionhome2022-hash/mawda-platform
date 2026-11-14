#!/usr/bin/env node
"use strict";

// Emulator-only test identity provisioner. Never points at a live Firebase project.
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { initializeApp, getApps } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const catalogue = require("../test/fixtures/test-account-personas.json");

function fail(message) {
  console.error(`[mawdda-test-seed] REFUSED: ${message}`);
  process.exit(1);
}

function resolveProjectId() {
  if (process.env.GCLOUD_PROJECT) return process.env.GCLOUD_PROJECT;
  if (process.env.GOOGLE_CLOUD_PROJECT) return process.env.GOOGLE_CLOUD_PROJECT;
  if (process.env.FIREBASE_CONFIG) {
    try {
      const config = JSON.parse(process.env.FIREBASE_CONFIG);
      return config.projectId || config.project_id || "";
    } catch {
      fail("FIREBASE_CONFIG is not valid JSON.");
    }
  }
  return "";
}

const projectId = resolveProjectId();
const requiredEmulators = catalogue.environmentPolicy.requiredEmulators;
for (const variable of requiredEmulators) {
  if (!process.env[variable]) fail(`${variable} is required.`);
}
if (!projectId.startsWith(catalogue.environmentPolicy.allowedProjectIdPrefix)) {
  fail(`project id must start with ${catalogue.environmentPolicy.allowedProjectIdPrefix}; received ${projectId || "(empty)"}.`);
}
if (process.env.FUNCTIONS_EMULATOR !== "true" && process.env.MAWDDA_ALLOW_TEST_SEED !== "1") {
  // firebase emulators:exec sets emulator hosts but not always FUNCTIONS_EMULATOR.
  // An explicit opt-in is required to avoid accidental invocation from a developer shell.
  fail("set MAWDDA_ALLOW_TEST_SEED=1 explicitly when running against the required emulators.");
}

const app = getApps()[0] || initializeApp({ projectId });
const auth = getAuth(app);
const db = getFirestore(app);
const testEmailDomain = "test.mawdda.invalid";
const outputPath = path.resolve(process.cwd(), ".mawdda-test-credentials.local.json");

function randomPassword() {
  return `Mw!${crypto.randomBytes(24).toString("base64url")}9a`;
}

async function ensureUser(persona) {
  const email = `${persona.id}@${testEmailDomain}`;
  const password = randomPassword();
  const profileFixture = catalogue.profileFixtures?.[persona.id] || {};
  const username = `${persona.id.replace(/[^a-z0-9]/g, "_")}_mawdda_test`;
  let user;
  try {
    user = await auth.getUserByEmail(email);
    user = await auth.updateUser(user.uid, {
      password,
      emailVerified: persona.emailVerified === true,
      displayName: persona.displayName,
      disabled: false,
    });
  } catch (error) {
    if (error.code !== "auth/user-not-found") throw error;
    user = await auth.createUser({
      email,
      password,
      emailVerified: persona.emailVerified === true,
      displayName: persona.displayName,
      disabled: false,
    });
  }

  // Intentionally do not set platformOwner, biometricVerified, wallet, or reward claims.
  // Privileged and verified states must be produced by their real server-side flows.
  await db.collection("users").doc(user.uid).set({
    uid: user.uid,
    email,
    memberId: user.uid,
    displayName: persona.displayName,
    fullName: persona.displayName,
    username,
    emailVerified: persona.emailVerified === true,
    coins: 100000,
    profileCompleted: true,
    accountStatus: "active",
    age: Number.isSafeInteger(profileFixture.age) ? profileFixture.age : 25,
    profession: profileFixture.profession || "عضو تجريبي",
    country: profileFixture.country || "Switzerland",
    region: profileFixture.region || "Zurich",
    gender: profileFixture.gender || "unspecified",
    maritalStatus: profileFixture.maritalStatus || "unspecified",
    bio: profileFixture.biography || "",
    interests: Array.isArray(profileFixture.interests) ? profileFixture.interests : [],
    goals: Array.isArray(profileFixture.goals) ? profileFixture.goals : [],
    profileVisibility: profileFixture.profileVisibility || "public",
    isTestAccount: true,
    testPersonaId: persona.id,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  await db.collection("usernameRegistry").doc(username).set({
    uid: user.uid,
    username,
    isTestAccount: true,
    createdAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  await db.collection("testAccountProfiles").doc(persona.id).set({
    schemaVersion: 1,
    personaId: persona.id,
    uid: user.uid,
    displayName: persona.displayName,
    accountKind: persona.accountKind,
    emailVerifiedFixture: persona.emailVerified === true,
    biometricFixture: persona.biometricFixture || false,
    ownerAccess: persona.ownerAccess || false,
    capabilities: persona.capabilities,
    deniedCapabilities: persona.deniedCapabilities,
    profile: {
      ...profileFixture,
      uniqueHandle: username,
      avatarFixture: `fixture://avatars/${persona.id}`,
      coverFixture: `fixture://covers/${persona.id}`,
      accountState: "active-test-only",
      badgesAndTitles: [],
      shopEntitlements: [],
      walletFixture: { coins: 100000, mode: "sandbox" },
      roomPermissions: [],
      notificationPreferences: { inApp: true, push: false, email: false },
      testLabels: ["MAWDDA_TEST_ONLY", persona.id],
    },
    environment: { projectId, emulatorOnly: true },
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  return { personaId: persona.id, uid: user.uid, email, password };
}

async function main() {
  const results = [];
  for (const persona of catalogue.personas) {
    if (persona.id === "guest-preview") {
      // A guest is created through Firebase anonymous sign-in in the client test flow.
      // No password account is created for this persona.
      await db.collection("testAccountProfiles").doc(persona.id).set({
        schemaVersion: 1,
        personaId: persona.id,
        displayName: persona.displayName,
        accountKind: "anonymous-client-flow",
        guestWindow: persona.guestWindow,
        profile: {
          ...(catalogue.profileFixtures?.[persona.id] || {}),
          uniqueHandle: "guest_preview_mawdda_test",
          avatarFixture: "fixture://avatars/guest-preview",
          coverFixture: "fixture://covers/guest-preview",
          accountState: "active-test-only",
          testLabels: ["MAWDDA_TEST_ONLY", persona.id],
        },
        capabilities: persona.capabilities,
        deniedCapabilities: persona.deniedCapabilities,
        environment: { projectId, emulatorOnly: true },
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      continue;
    }
    results.push(await ensureUser(persona));
  }

  fs.writeFileSync(outputPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    projectId,
    emulatorOnly: true,
    accounts: results,
  }, null, 2), { mode: 0o600 });
  try { fs.chmodSync(outputPath, 0o600); } catch {}
  console.log(`Provisioned ${results.length} emulator-only email identities and the guest profile fixture.`);
  console.log(`Credentials written locally with owner-only permissions: ${outputPath}`);
  console.log("No custom claims, biometric proof, wallet credits, rewards, or live payments were created.");
}

main().catch((error) => {
  console.error("[mawdda-test-seed] failed:", error);
  process.exitCode = 1;
});
