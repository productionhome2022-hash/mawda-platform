const test = require("node:test");
const assert = require("node:assert/strict");
const {
  MEDIA_UPLOAD_CLEANUP_GRACE_MS,
  uploadIntentIsEligibleForCleanup,
} = require("../lib/media-cleanup");

test("abandoned upload cleanup waits for URL expiry plus a full grace period", () => {
  const now = 1_800_000_000_000;
  const expiry = now - MEDIA_UPLOAD_CLEANUP_GRACE_MS;
  assert.equal(uploadIntentIsEligibleForCleanup(expiry, now), true);
  assert.equal(uploadIntentIsEligibleForCleanup(expiry + 1, now), false);
  assert.equal(uploadIntentIsEligibleForCleanup(now, now), false);
});

test("cleanup eligibility rejects invalid timestamps and grace periods", () => {
  assert.throws(() => uploadIntentIsEligibleForCleanup(Number.NaN));
  assert.throws(() => uploadIntentIsEligibleForCleanup(-1));
  assert.throws(() => uploadIntentIsEligibleForCleanup(1, 2, -1));
});
