const test = require("node:test");
const assert = require("node:assert/strict");
const { validateMediaLegalHoldInput } = require("../lib/media-legal-hold");

test("media legal hold requires authority, basis, reference and ordered review/end dates", () => {
  assert.deepEqual(validateMediaLegalHoldInput({
    mediaId: "12345678-1234-1234-1234-123456789abc",
    authority: "Court order",
    legalBasis: "Preserve the specifically identified media evidence.",
    reference: "CASE-2026-123",
    startsAtMs: 100,
    reviewAtMs: 200,
    endsAtMs: 300,
  }, 150), {
    mediaId: "12345678-1234-1234-1234-123456789abc",
    authority: "Court order",
    legalBasis: "Preserve the specifically identified media evidence.",
    reference: "CASE-2026-123",
    startsAtMs: 100,
    reviewAtMs: 200,
    endsAtMs: 300,
  });
});

test("media legal hold rejects malformed scope and invalid dates", () => {
  const valid = {
    mediaId: "12345678-1234-1234-1234-123456789abc",
    authority: "Court order",
    legalBasis: "Preserve the specifically identified media evidence.",
    reference: "CASE-2026-123",
    startsAtMs: 100,
    reviewAtMs: 200,
    endsAtMs: 300,
  };
  for (const patch of [
    { mediaId: "bad" }, { authority: "" }, { legalBasis: "short" },
    { reference: "" }, { startsAtMs: 250 }, { reviewAtMs: 100 },
    { endsAtMs: 200 },
  ]) {
    assert.throws(() => validateMediaLegalHoldInput({ ...valid, ...patch }, 250));
  }
});
