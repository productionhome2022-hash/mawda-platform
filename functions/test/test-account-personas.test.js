const test = require("node:test");
const assert = require("node:assert/strict");
const personas = require("./fixtures/test-account-personas.json");

test("test persona catalogue has unique stable IDs and complete profile requirements", () => {
  const ids = personas.personas.map((persona) => persona.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const field of personas.profileFixtureRequirements) assert.ok(field.length > 0);
  for (const persona of personas.personas) {
    assert.ok(persona.displayName);
    assert.ok(Array.isArray(persona.capabilities));
    assert.ok(Array.isArray(persona.deniedCapabilities));
    assert.equal(persona.capabilities.some((capability) => persona.deniedCapabilities.includes(capability)), false);
  }
});

test("guest persona is browse-only and carries exact one-hour per rolling-24-hour policy", () => {
  const guest = personas.personas.find((persona) => persona.id === "guest-preview");
  assert.ok(guest);
  assert.deepEqual(guest.guestWindow, { durationSeconds: 3600, rollingWindowSeconds: 86400, emulatorClockOverrideOnly: true });
  assert.deepEqual(guest.capabilities, ["browse.publicMemberDiscovery", "browse.publicShopCatalog", "browse.publicAds"]);
  assert.ok(guest.deniedCapabilities.includes("wallet.write"));
  assert.ok(guest.deniedCapabilities.includes("store.purchase"));
});

test("email and biometric member personas cannot inherit owner authority", () => {
  for (const id of ["email-member", "biometric-member"]) {
    const persona = personas.personas.find((item) => item.id === id);
    assert.ok(persona);
    assert.equal(persona.emailVerified, true);
    assert.equal(persona.ownerAccess, false);
    assert.ok(persona.deniedCapabilities.includes("owner.console"));
  }
});

test("owner test persona requires MFA and cannot mutate production", () => {
  const owner = personas.personas.find((persona) => persona.id === "owner-operator");
  assert.ok(owner);
  assert.equal(owner.ownerAccess, "mfa-required-no-bypass");
  assert.ok(owner.deniedCapabilities.includes("owner.actionWithoutMfa"));
  assert.ok(owner.deniedCapabilities.includes("productionOwnerMutation"));
});

test("member media policy denies documents while preserving owner-only document exchange", () => {
  assert.deepEqual(personas.mediaPolicy.memberDenied, ["pdf", "documents"]);
  assert.ok(personas.mediaPolicy.ownerAllowed.includes("pdf"));
});

test("payments remain sandbox-only and biometric fixture is not hardware proof", () => {
  assert.equal(personas.paymentPolicy.liveChargesAllowed, false);
  assert.equal(personas.biometricPolicy.emulatorFixtureIsNotHardwareProof, true);
  assert.equal(personas.biometricPolicy.grantRewardsOnlyAfterAuthoritativeServerVerification, true);
});