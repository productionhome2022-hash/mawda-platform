const test = require("node:test");
const assert = require("node:assert/strict");
const { advertisingIntakeAuditEventId } = require("../lib/advertising-intake");

test("advertising intake audit event ID is stable for a request replay", () => {
  const requestId = "request_123456789";
  assert.equal(
    advertisingIntakeAuditEventId(requestId),
    advertisingIntakeAuditEventId(requestId),
  );
  assert.equal(
    advertisingIntakeAuditEventId(requestId),
    "advertising_intake_submitted_request_123456789",
  );
});

test("advertising intake audit event ID rejects unsafe request IDs", () => {
  assert.throws(() => advertisingIntakeAuditEventId(""), /INVALID_ADVERTISING_INTAKE_REQUEST_ID/);
  assert.throws(() => advertisingIntakeAuditEventId("../private"), /INVALID_ADVERTISING_INTAKE_REQUEST_ID/);
});
