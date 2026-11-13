const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getStorage } = require("firebase-admin/storage");
const { randomUUID } = require("node:crypto");

const projectId = process.env.GOOGLE_CLOUD_PROJECT;
const bucketName = process.env.MAWDA_MEDIA_TEST_BUCKET;
if (process.env.MAWDA_MEDIA_SIGNED_URL_HTTP_TEST !== "1" || !projectId || !bucketName) {
  throw new Error("Set MAWDA_MEDIA_SIGNED_URL_HTTP_TEST=1, GOOGLE_CLOUD_PROJECT and MAWDA_MEDIA_TEST_BUCKET to run this opt-in HTTP test.");
}
if (projectId === "mawda-app-2026" || /prod(uction)?/i.test(projectId) || /prod(uction)?/i.test(bucketName) ||
    !/(test|staging|dev|nonprod|sandbox)/i.test(projectId) ||
    !/(test|staging|dev|nonprod|sandbox)/i.test(bucketName)) {
  throw new Error("Refusing to run signed URL destructive/replay tests against a production project or bucket.");
}
initializeApp({ credential: applicationDefault(), projectId, storageBucket: bucketName });
const bucket = getStorage().bucket(bucketName);
const file = bucket.file(`quarantine-http-tests/${randomUUID()}.txt`);
const expiredUploadFile = bucket.file(`quarantine-http-tests/${randomUUID()}-expired.txt`);
const bytes = Buffer.from("Mawadda signed URL HTTP integration test");
const contentType = "text/plain";

async function main() {
  try {
    const sizeRange = `${bytes.length},${bytes.length}`;
    const signedUploadHeaders = {
      "content-type": contentType,
      "x-goog-content-length-range": sizeRange,
    };
    const [putUrl] = await file.getSignedUrl({
      version: "v4", action: "write", expires: Date.now() + 2_500,
      contentType,
      extensionHeaders: { "x-goog-content-length-range": sizeRange },
      queryParams: { ifGenerationMatch: "0" },
    });
    const first = await fetch(putUrl, { method: "PUT", headers: signedUploadHeaders, body: bytes });
    if (!first.ok) throw new Error(`Initial signed PUT failed: HTTP ${first.status}`);
    const replay = await fetch(putUrl, { method: "PUT", headers: signedUploadHeaders, body: bytes });
    if (replay.status !== 412) throw new Error(`Replay should fail with 412; received HTTP ${replay.status}`);
    const oversized = await fetch(putUrl, {
      method: "PUT", headers: signedUploadHeaders, body: Buffer.concat([bytes, Buffer.from("x")]),
    });
    if (oversized.ok) throw new Error("Oversized signed PUT unexpectedly bypassed the exact content-length range.");

    const [readUrl] = await file.getSignedUrl({ version: "v4", action: "read", expires: Date.now() + 2_500 });
    const read = await fetch(readUrl);
    if (!read.ok || Buffer.compare(Buffer.from(await read.arrayBuffer()), bytes) !== 0) {
      throw new Error(`Signed GET failed or returned different bytes: HTTP ${read.status}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 2_500));
    const expiredGet = await fetch(readUrl);
    if (expiredGet.ok) throw new Error("Expired signed GET unexpectedly remained usable.");

    const [expiredPutUrl] = await expiredUploadFile.getSignedUrl({
      version: "v4", action: "write", expires: Date.now() + 1_500,
      contentType,
      extensionHeaders: { "x-goog-content-length-range": sizeRange },
      queryParams: { ifGenerationMatch: "0" },
    });
    await new Promise((resolve) => setTimeout(resolve, 2_000));
    const expiredPut = await fetch(expiredPutUrl, {
      method: "PUT", headers: signedUploadHeaders, body: bytes,
    });
    if (expiredPut.ok) throw new Error("Expired signed PUT unexpectedly remained usable.");

    console.log(JSON.stringify({
      initialPut: first.status,
      replayPut: replay.status,
      oversizedPut: oversized.status,
      signedGet: read.status,
      expiredGet: expiredGet.status,
      expiredPut: expiredPut.status,
      objectPath: file.name,
    }));
  } finally {
    await Promise.all([
      file.delete({ ignoreNotFound: true }),
      expiredUploadFile.delete({ ignoreNotFound: true }),
    ]);
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
