const test = require("node:test");
const assert = require("node:assert/strict");
const { addCalendarMonthsUtc, isEmailVerificationDue, isBiometricVerificationDue } = require("../lib/verification-calendar");
test("calendar month arithmetic clamps month-end and preserves UTC time", () => {
 assert.equal(addCalendarMonthsUtc(Date.UTC(2026,0,31,12),1),Date.UTC(2026,1,28,12));
 assert.equal(addCalendarMonthsUtc(Date.UTC(2028,0,31,12),1),Date.UTC(2028,1,29,12));
 assert.equal(addCalendarMonthsUtc(Date.UTC(2026,10,30,8,15),3),Date.UTC(2027,1,28,8,15));
});
test("email and biometric renewal clocks remain independent", () => {
 const anchor=Date.UTC(2026,0,31,12), bio=Date.UTC(2026,1,28,12), email=Date.UTC(2026,3,30,12);
 assert.equal(isBiometricVerificationDue(anchor,bio-1),false); assert.equal(isBiometricVerificationDue(anchor,bio),true);
 assert.equal(isEmailVerificationDue(anchor,email-1),false); assert.equal(isEmailVerificationDue(anchor,email),true);
 assert.equal(isEmailVerificationDue(anchor,bio),false); assert.equal(isBiometricVerificationDue(anchor,email),true);
});
test("invalid clocks and offsets are rejected",()=>{assert.throws(()=>addCalendarMonthsUtc(-1,1));assert.throws(()=>addCalendarMonthsUtc(Date.now(),-1));assert.throws(()=>isEmailVerificationDue(0,NaN));});
