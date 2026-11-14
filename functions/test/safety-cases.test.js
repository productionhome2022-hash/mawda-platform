const test = require("node:test");
const assert = require("node:assert/strict");
const {
  validateSafetyReportInput,
  validateSafetyAppealInput,
} = require("../lib/safety-cases");

const report = {
  targetUid: "member-123",
  category: "harassment",
  contextType: "direct_message",
  contextId: "message-123",
  description: "Repeated unwanted threatening messages.",
  requestId: "report_req_0001",
};

test("valid safety report is normalized and accepted", () => {
  assert.deepEqual(validateSafetyReportInput(report), report);
});

test("safety report rejects self-target, unsupported category, missing context and extra fields", () => {
  assert.throws(() => validateSafetyReportInput({ ...report, targetUid: "" }), /INVALID_SAFETY_TARGET/);
  assert.throws(() => validateSafetyReportInput({ ...report, category: "made_up" }), /INVALID_SAFETY_CATEGORY/);
  assert.throws(() => validateSafetyReportInput({ ...report, contextId: null }), /SAFETY_CONTEXT_ID_REQUIRED/);
  assert.throws(() => validateSafetyReportInput({ ...report, admin: true }), /UNSUPPORTED_SAFETY_REPORT_FIELDS/);
});

test("safety report rejects short descriptions and malformed request IDs", () => {
  assert.throws(() => validateSafetyReportInput({ ...report, description: "bad" }), /INVALID_SAFETY_DESCRIPTION/);
  assert.throws(() => validateSafetyReportInput({ ...report, requestId: "!" }), /INVALID_SAFETY_REQUEST_ID/);
});

test("valid appeal requires a case, meaningful reason and idempotency key", () => {
  const input = { caseId: "case_12345678", reason: "The reported action was misidentified; please review the attached context.", requestId: "appeal_req_01" };
  assert.deepEqual(validateSafetyAppealInput(input), input);
});

test("appeal rejects short reasons, malformed case IDs and client privilege fields", () => {
  assert.throws(() => validateSafetyAppealInput({ caseId: "case_12345678", reason: "no", requestId: "appeal_req_01" }), /INVALID_SAFETY_APPEAL_REASON/);
  assert.throws(() => validateSafetyAppealInput({ caseId: "bad", reason: "This is a sufficiently detailed appeal reason.", requestId: "appeal_req_01" }), /INVALID_SAFETY_CASE_ID/);
  assert.throws(() => validateSafetyAppealInput({ caseId: "case_12345678", reason: "This is a sufficiently detailed appeal reason.", requestId: "appeal_req_01", approved: true }), /UNSUPPORTED_SAFETY_APPEAL_FIELDS/);
});
