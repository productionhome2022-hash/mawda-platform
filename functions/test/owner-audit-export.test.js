const test = require("node:test");
const assert = require("node:assert/strict");
const {
  validateOwnerAuditExportRequest,
  projectOwnerAuditExportValue,
} = require("../lib/owner-audit-export");

test("audit export validates bounded pagination and optional filters", () => {
  assert.deepEqual(validateOwnerAuditExportRequest({
    afterSequence: 10, pageSize: 25, fromMs: 100, toMs: 200,
    actorUid: "owner-uid", action: "owner_review_requested",
  }, 20), {
    afterSequence: 10, pageSize: 25, fromMs: 100, toMs: 200,
    actorUid: "owner-uid", action: "owner_review_requested",
  });
  assert.equal(validateOwnerAuditExportRequest({}, 0).pageSize, 50);
});

test("audit export rejects invalid cursors, page sizes and time windows", () => {
  for (const input of [
    { afterSequence: -1 }, { afterSequence: 4 }, { pageSize: 0 },
    { pageSize: 101 }, { fromMs: 300, toMs: 200 }, { actorUid: "" },
    { action: "bad action" },
  ]) {
    assert.throws(() => validateOwnerAuditExportRequest(input, 3));
  }
});

test("audit export redacts credentials, signed URLs and user-generated content recursively", () => {
  const projected = projectOwnerAuditExportValue({
    action: "owner_review",
    actorUid: "owner",
    signedUrl: "https://storage.invalid/token",
    accessToken: "secret",
    noticeText: "private user content",
    details: {
      messageText: "private",
      count: 2,
      nested: [{ password: "hidden", safe: true }],
    },
  });
  assert.deepEqual(projected, {
    action: "owner_review",
    actorUid: "owner",
    details: { count: 2, nested: [{ safe: true }] },
  });
});
