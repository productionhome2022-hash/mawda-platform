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
const path = `quarantine-http-tests/${randomUUID()}.txt`;
const file = bucket.file(path);
const bytes = Buffer.from("Mawadda signed URL HTTP integration test");
const contentType = "text/plain";

async function main() {
  try {
    const [putUrl] = await file.getSignedUrl({
      version: "v4", action: "write", expires: Date.now() + 5_000,
      contentType, queryParams: { ifGenerationMatch: "0" },
    });
    const first = await fetch(putUrl, { method: "PUT", headers: { "content-type": contentType }, body: bytes });
    if (!first.ok) throw new Error(`Initial signed PUT failed: HTTP ${first.status}`);
    const replay = await fetch(putUrl, { method: "PUT", headers: { "content-type": contentType }, body: bytes });
    if (replay.status !== 412) throw new Error(`Replay should fail with 412; received HTTP ${replay.status}`);

    const [readUrl] = await file.getSignedUrl({ version: "v4", action: "read", expires: Date.now() + 5_000 });
    const read = await fetch(readUrl);
    if (!read.ok || Buffer.compare(Buffer.from(await read.arrayBuffer()), bytes) !== 0) {
      throw new Error(`Signed GET failed or returned different bytes: HTTP ${read.status}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 6000));
    const expired = await fetch(readUrl);
    if (expired.ok) throw new Error("Expired signed GET unexpectedly remained usable.");
    console.log(JSON.stringify({ initialPut: first.status, replayPut: replay.status, signedGet: read.status, expiredGet: expired.status, objectPath: path }));
  } finally {
    await file.delete({ ignoreNotFound: true });
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
