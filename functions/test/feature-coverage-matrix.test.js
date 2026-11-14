const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const matrix = require("./fixtures/feature-coverage-matrix.json");
const catalogue = require("./fixtures/test-account-personas.json");
const packageJson = require("../package.json");

test("coverage matrix references only provisioned personas", () => {
  const ids = new Set(catalogue.personas.map((persona) => persona.id));
  for (const [group, actors] of Object.entries(matrix.personas)) {
    assert.ok(Array.isArray(actors), `persona group ${group} must be an array`);
    for (const actor of actors) assert.ok(ids.has(actor), `unknown actor ${actor}`);
  }
  for (const journey of matrix.journeys) {
    assert.ok(journey.id && journey.area && journey.cases.length > 0);
    for (const actor of journey.actors) assert.ok(ids.has(actor), `${journey.id}: unknown actor ${actor}`);
  }
});

test("every journey maps to an executable npm script", () => {
  for (const journey of matrix.journeys) {
    if (journey.command === "npm test") {
      assert.ok(packageJson.scripts.test, `${journey.id}: missing npm test script`);
      continue;
    }
    const match = journey.command.match(/^npm run ([a-z0-9:_-]+)$/);
    assert.ok(match, `${journey.id}: invalid command declaration`);
    assert.ok(packageJson.scripts[match[1]], `${journey.id}: missing npm script ${match[1]}`);
  }
});

test("full member personas have the same baseline member capability set", () => {
  const ids = matrix.personas.fullMembers;
  const capabilities = ids.map((id) => {
    const persona = catalogue.personas.find((entry) => entry.id === id);
    assert.ok(persona, `missing persona ${id}`);
    assert.equal(persona.ownerAccess, false);
    assert.ok(persona.deniedCapabilities.includes("owner.console"));
    return new Set(persona.capabilities);
  });
  for (const capability of capabilities[0]) {
    for (const other of capabilities.slice(1)) {
      assert.ok(other.has(capability), `full member missing shared capability ${capability}`);
    }
  }
  for (const capabilitySet of capabilities.slice(1)) {
    for (const capability of capabilitySet) {
      assert.ok(capabilities[0].has(capability), `full member baseline differs at ${capability}`);
    }
  }
});

test("test environment preserves hard security and financial invariants", () => {
  assert.equal(matrix.environment, "firebase-emulator-only");
  assert.equal(matrix.policy.ordinaryMemberGetsAllMemberFeatures, true);
  assert.equal(matrix.policy.ownerPrivilegesRequireRealMfaFlow, true);
  assert.equal(matrix.policy.testClockMayOnlyBeOverriddenInEmulator, true);
  assert.equal(matrix.policy.paymentMode, "sandbox-only");
  assert.equal(matrix.policy.biometricRewardRequiresServerVerification, true);
  assert.equal(matrix.policy.financialWritesMustUseServerTransactions, true);
  assert.deepEqual(matrix.policy.memberMediaDeny, ["pdf", "documents"]);
  assert.ok(matrix.policy.ownerMediaAllow.includes("pdf"));
});

test("release gates cover client, backend, device, security and pilot readiness", () => {
  for (const gate of [
    "backend-build", "backend-unit-tests", "firestore-storage-rules",
    "all-emulator-integration-journeys", "flutter-analyze", "flutter-tests",
    "flutter-web-release-build", "real-device-biometric",
    "real-device-camera-microphone", "owner-mfa-review", "security-review",
    "manual-acceptance-review", "staging-smoke-tests", "explicit-pilot-approval",
  ]) assert.ok(matrix.releaseGates.includes(gate), `missing release gate ${gate}`);
});

test("every journey has a unique ID and a repeatable non-empty scenario list", () => {
  const ids = matrix.journeys.map((journey) => journey.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const journey of matrix.journeys) {
    assert.equal(new Set(journey.cases).size, journey.cases.length, journey.id);
    assert.ok(journey.cases.every((scenario) => typeof scenario === "string" && scenario.length > 0));
  }
});
