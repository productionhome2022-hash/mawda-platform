const test = require("node:test");
const assert = require("node:assert/strict");
const { validateRegistrationPolicy } = require("../lib/registration-policy.js");

test("accepts an explicitly disabled policy with a valid minimum age", () => {
  assert.deepEqual(validateRegistrationPolicy(false, 18), {
    enabled: false,
    minimumAge: 18,
  });
});

test("accepts an explicitly enabled policy with a valid minimum age", () => {
  assert.deepEqual(validateRegistrationPolicy(true, 18), {
    enabled: true,
    minimumAge: 18,
  });
});

test("accepts the supported minimum and maximum age boundaries", () => {
  assert.equal(validateRegistrationPolicy(true, 1).minimumAge, 1);
  assert.equal(validateRegistrationPolicy(true, 120).minimumAge, 120);
});

test("rejects a missing or non-boolean registration switch", () => {
  for (const value of [undefined, null, 0, 1, "true", "false"]) {
    assert.throws(
      () => validateRegistrationPolicy(value, 18),
      /REGISTRATION_ENABLED_INVALID/,
    );
  }
});

test("rejects missing, fractional, non-finite and out-of-range minimum ages", () => {
  for (const age of [undefined, null, "18", 0, -1, 1.5, 121, NaN, Infinity]) {
    assert.throws(
      () => validateRegistrationPolicy(true, age),
      /REGISTRATION_MINIMUM_AGE_INVALID/,
    );
  }
});
