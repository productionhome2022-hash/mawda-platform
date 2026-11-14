const test = require("node:test");
const assert = require("node:assert/strict");
const { isExplicitNonProductionTarget } = require("../lib/nonproduction-target");

const markers = ["test", "staging", "dev", "demo", "nonprod", "sandbox", "qa"];

test("accepts explicitly marked non-production names, including nonprod and nonproduction", () => {
  assert.equal(isExplicitNonProductionTarget("mawda-nonprod-test", markers), true);
  assert.equal(isExplicitNonProductionTarget("mawda-nonproduction-test", markers), true);
  assert.equal(isExplicitNonProductionTarget("mawda-dev-eu", markers), true);
  assert.equal(isExplicitNonProductionTarget("MAWDA-STAGING-1", markers), true);
});

test("rejects production-like names even when they also contain a test marker", () => {
  assert.equal(isExplicitNonProductionTarget("mawda-prod-test", markers), false);
  assert.equal(isExplicitNonProductionTarget("mawda-production-sandbox", markers), false);
  assert.equal(isExplicitNonProductionTarget("mawda-test-production", markers), false);
});

test("rejects missing, blank, whitespace-padded and unmarked names", () => {
  assert.equal(isExplicitNonProductionTarget(undefined, markers), false);
  assert.equal(isExplicitNonProductionTarget("", markers), false);
  assert.equal(isExplicitNonProductionTarget(" mawda-dev ", markers), false);
  assert.equal(isExplicitNonProductionTarget("mawda-europe", markers), false);
});
