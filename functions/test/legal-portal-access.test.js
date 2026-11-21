const test = require("node:test");
const assert = require("node:assert/strict");
const { isAllowedLegalPortalAppId } = require("../lib/legal-portal-access");

const WEB_APP_ID = "1:697303475139:web:8869603bda6f1a3c3ed376";
const ANDROID_APP_ID = "1:697303475139:android:0aad1a52d2276f273ed376";
const IOS_APP_ID = "1:697303475139:ios:7be58cfe1ac9c4c23ed376";

test("legal portal access fails closed for missing identity or empty configuration", () => {
  for (const actual of [undefined, null, "", 42]) {
    assert.equal(isAllowedLegalPortalAppId(actual, WEB_APP_ID), false);
  }
  for (const configured of [undefined, null, "", " , , "]) {
    assert.equal(isAllowedLegalPortalAppId(WEB_APP_ID, configured), false);
  }
});

test("legal portal access allows only an exact configured web App ID", () => {
  assert.equal(isAllowedLegalPortalAppId(WEB_APP_ID, WEB_APP_ID), true);
  assert.equal(isAllowedLegalPortalAppId(WEB_APP_ID, ` ${WEB_APP_ID} , `), true);
  assert.equal(isAllowedLegalPortalAppId(WEB_APP_ID.toUpperCase(), WEB_APP_ID), false);
  assert.equal(isAllowedLegalPortalAppId(`${WEB_APP_ID} `, WEB_APP_ID), false);
});

test("native Android and iOS App IDs are hard-denied even if misconfigured in the allowlist", () => {
  assert.equal(isAllowedLegalPortalAppId(ANDROID_APP_ID, WEB_APP_ID), false);
  assert.equal(isAllowedLegalPortalAppId(IOS_APP_ID, WEB_APP_ID), false);
  assert.equal(isAllowedLegalPortalAppId(ANDROID_APP_ID, `${WEB_APP_ID},${ANDROID_APP_ID}`), false);
  assert.equal(isAllowedLegalPortalAppId(IOS_APP_ID, `${WEB_APP_ID},${IOS_APP_ID}`), false);
});

test("multiple explicitly configured portal app IDs are matched exactly", () => {
  const allowed = `${WEB_APP_ID}, 1:697303475139:web:desktop-approved`;
  assert.equal(isAllowedLegalPortalAppId(WEB_APP_ID, allowed), true);
  assert.equal(isAllowedLegalPortalAppId("1:697303475139:web:desktop-approved", allowed), true);
  assert.equal(isAllowedLegalPortalAppId("1:697303475139:web:other", allowed), false);
});
