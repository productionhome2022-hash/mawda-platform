const test = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");

const bucketName = process.env.MAWDA_GCS_HTTP_TEST_BUCKET;
const enabled = Boolean(bucketName);

test("real Cloud Storage signed URLs enforce HTTP upload, generation precondition, read and expiry", {
  skip: !enabled ? "Set MAWDA_GCS_HTTP_TEST_BUCKET in an isolated non-production GCS project." : false,
  timeout: 30_000,
}, async () => {
  const { initializeApp, getApps } = require("firebase-admin/app");
  const { getStorage } = require("firebase-admin/storage");
  if (getApps().length === 0) initializeApp({ storageBucket: bucketName });
  const bucket = getStorage().bucket(bucketName);
  const objectPath = `mawda-signed-url-http-tests/${randomUUID()}.bin`;
  const file = bucket.file(objectPath);
  const bytes = Buffer.from("MAWDA-HTTP-SIGNED-URL-TEST");

  try {
    const [uploadUrl] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 5 * 60 * 1000,
      contentType: "application/octet-stream",
      queryParams: { ifGenerationMatch: "0" },
    });
    const firstPut = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "content-type": "application/octet-stream" },
      body: bytes,
    });
    assert.ok(firstPut.ok, `first PUT failed: HTTP ${firstPut.status}`);

    const replayPut = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "content-type": "application/octet-stream" },
      body: Buffer.from("overwrite-attempt"),
    });
    assert.equal(replayPut.status, 412, "create-only generation precondition must reject overwrite/replay");

    const [readUrl] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + 5 * 60 * 1000,
      responseDisposition: "attachment",
    });
    const read = await fetch(readUrl);
    assert.equal(read.status, 200);
    assert.deepEqual(Buffer.from(await read.arrayBuffer()), bytes);

    const [shortReadUrl] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + 1000,
      responseDisposition: "attachment",
    });
    await new Promise((resolve) => setTimeout(resolve, 2200));
    const expiredRead = await fetch(shortReadUrl);
    assert.ok(expiredRead.status >= 400, `expired URL unexpectedly returned HTTP ${expiredRead.status}`);
  } finally {
    await file.delete({ ignoreNotFound: true });
  }
});
