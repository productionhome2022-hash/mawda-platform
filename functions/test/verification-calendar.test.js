const test = require("node:test");
const assert = require("node:assert/strict");
const { addCalendarMonthsUtc, isEmailVerificationDue, isBiometricVerificationDue, BIOMETRIC_VERIFICATION_INTERVAL_MS } = require("../lib/verification-calendar");

test("calendar month arithmetic clamps month-end and preserves UTC time", () => {
  assert.equal(addCalendarMonthsUtc(Date.UTC(2026, 0, 31, 12), 1), Date.UTC(2026, 1, 28, 12));
  assert.equal(addCalendarMonthsUtc(Date.UTC(2028, 0, 31, 12), 1), Date.UTC(2028, 1, 29, 12));
  assert.equal(addCalendarMonthsUtc(Date.UTC(2026, 10, 30, 8, 15), 3), Date.UTC(2027, 1, 28, 8, 15));
});

test("biometric verification expires after exactly 30 days while email renews after three calendar months", () => {
  const anchor = Date.UTC(2026, 0, 31, 12);
  const biometricDue = anchor + 30 * 24 * 60 * 60 * 1000;
  const emailDue = Date.UTC(2026, 3, 30, 12);
  assert.equal(BIOMETRIC_VERIFICATION_INTERVAL_MS, 30 * 24 * 60 * 60 * 1000);
  assert.equal(isBiometricVerificationDue(anchor, biometricDue - 1), false);
  assert.equal(isBiometricVerificationDue(anchor, biometricDue), true);
  assert.equal(isEmailVerificationDue(anchor, emailDue - 1), false);
  assert.equal(isEmailVerificationDue(anchor, emailDue), true);
  assert.equal(isEmailVerificationDue(anchor, biometricDue), false);
  assert.equal(isBiometricVerificationDue(anchor, emailDue), true);
});

test("invalid clocks and month offsets are rejected", () => {
  assert.throws(() => addCalendarMonthsUtc(-1, 1));
  assert.throws(() => addCalendarMonthsUtc(Date.now(), -1));
  assert.throws(() => isEmailVerificationDue(0, Number.NaN));
});
