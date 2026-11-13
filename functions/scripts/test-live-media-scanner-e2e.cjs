const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { FieldValue, Timestamp, getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");
const { deleteMediaAssetForMessage } = require("../lib/media");
const { randomUUID } = require("node:crypto");
const { deflateSync } = require("node:zlib");

const projectId = process.env.GOOGLE_CLOUD_PROJECT;
const bucketName = process.env.MAWDA_MEDIA_TEST_BUCKET;
if (process.env.MAWDA_MEDIA_LIVE_SCANNER_E2E !== "1" || !projectId || !bucketName) {
  throw new Error("Set MAWDA_MEDIA_LIVE_SCANNER_E2E=1, GOOGLE_CLOUD_PROJECT and MAWDA_MEDIA_TEST_BUCKET.");
}
if (projectId === "mawda-app-2026" || /prod(uction)?/i.test(projectId) ||
    /prod(uction)?/i.test(bucketName) ||
    !/(test|staging|dev|nonprod|sandbox|qa)/i.test(projectId) ||
    !/(test|staging|dev|nonprod|sandbox|qa)/i.test(bucketName)) {
  throw new Error("Refusing to run live scanner E2E against a production or unmarked target.");
}

initializeApp({ credential: applicationDefault(), projectId, storageBucket: bucketName });
const db = getFirestore();
const bucket = getStorage().bucket(bucketName);
const RETENTION_MS = 4 * 60 * 60 * 1000;
const POLL_MS = 3_000;
const TIMEOUT_MS = 5 * 60 * 1000;

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])));
  return Buffer.concat([length, typeBytes, data, checksum]);
}

function tinyPng() {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const header = Buffer.alloc(13);
  header.writeUInt32BE(1, 0);
  header.writeUInt32BE(1, 4);
  header[8] = 8;
  header[9] = 6;
  const imageData = deflateSync(Buffer.from([0, 20, 80, 160, 255]));
  return Buffer.concat([
    signature,
    pngChunk("IHDR", header),
    pngChunk("IDAT", imageData),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

async function waitForAssetStatus(assetRef, expectedStatus, jobRef) {
  const deadline = Date.now() + TIMEOUT_MS;
  let lastStatus = "missing";
  let lastJobState = "missing";
  while (Date.now() < deadline) {
    const [assetSnapshot, jobSnapshot] = await Promise.all([assetRef.get(), jobRef.get()]);
    lastStatus = assetSnapshot.data()?.status ?? "missing";
    lastJobState = jobSnapshot.data()?.state ?? "missing";
    if (lastStatus === expectedStatus) return { asset: assetSnapshot.data(), job: jobSnapshot.data() };
    if (["failed", "cancelled"].includes(String(lastJobState))) {
      throw new Error(`Scanner job ended as ${lastJobState}; asset status is ${lastStatus}.`);
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }
  throw new Error(`Timed out waiting for ${expectedStatus}; asset=${lastStatus}, job=${lastJobState}.`);
}

async function waitForAuditAction(mediaId, action) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const snapshot = await db.collection("mediaAccessAudit")
      .where("mediaId", "==", mediaId)
      .get();
    if (snapshot.docs.some((doc) => doc.data().action === action)) return;
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  throw new Error(`Missing audit action after live replay cleanup: ${action}`);
}

async function waitForObjectGone(file) {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    const [exists] = await file.exists();
    if (!exists) return;
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  throw new Error("Scanner verdict was rejected but the quarantined object was not deleted.");
}

async function deleteExact(file) {
  const [exists] = await file.exists();
  if (!exists) return;
  const [metadata] = await file.getMetadata();
  const generation = Number(metadata.generation);
  if (!Number.isSafeInteger(generation) || generation <= 0) {
    throw new Error("Storage returned an invalid generation during E2E cleanup.");
  }
  await file.delete({ ignoreNotFound: true, ifGenerationMatch: generation });
}

async function runCase(label, bytes, expectedStatus) {
  const mediaId = randomUUID();
  const ownerUid = `scanner-e2e-${randomUUID()}`;
  const objectPath = `quarantine/${ownerUid}/${mediaId}`;
  const file = bucket.file(objectPath);
  const assetRef = db.collection("mediaAssets").doc(mediaId);
  const jobRef = db.collection("mediaScanJobs").doc(mediaId);
  let previewFile = null;
  try {
    const now = Timestamp.now();
    await assetRef.set({
      mediaId,
      ownerUid,
      uploaderType: "member",
      mediaPurpose: "chat",
      objectPath,
      declaredContentType: "image/png",
      detectedContentType: "image/png",
      declaredSizeBytes: bytes.length,
      sizeBytes: bytes.length,
      storageGeneration: null,
      status: "upload_authorized",
      retentionPolicyStatus: "four_hour_self_destruct",
      mediaUploadedAt: now,
      retentionExpiresAt: Timestamp.fromMillis(Date.now() + RETENTION_MS),
      createdAt: now,
      updatedAt: now,
    });
    const [signedPutUrl] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000,
      contentType: "image/png",
      extensionHeaders: { "x-goog-if-generation-match": "0" },
    });
    const initialUpload = await fetch(signedPutUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "image/png",
        "x-goog-if-generation-match": "0",
      },
      body: bytes,
    });
    if (!initialUpload.ok) {
      throw new Error(`Signed test upload failed: HTTP ${initialUpload.status}`);
    }
    const [metadata] = await file.getMetadata();
    await assetRef.update({
      storageGeneration: String(metadata.generation),
      status: "pending_security_scan",
      updatedAt: FieldValue.serverTimestamp(),
    });

    const result = await waitForAssetStatus(assetRef, expectedStatus, jobRef);
    if (result.job?.state !== (expectedStatus === "rejected" ? "rejected" : "completed")) {
      throw new Error(`Unexpected scan job state for ${label}: ${result.job?.state}`);
    }
    if (expectedStatus === "rejected") {
      await waitForObjectGone(file);
    } else {
      const safePath = result.asset?.safePreviewPath;
      if (typeof safePath !== "string" ||
          safePath !== `processed/${ownerUid}/${mediaId}/preview.webp`) {
        throw new Error("Clean image did not receive the expected deterministic WebP derivative.");
      }
      previewFile = bucket.file(safePath);
      const [previewMetadata] = await previewFile.getMetadata();
      if (previewMetadata.contentType !== "image/webp" ||
          String(previewMetadata.generation) !== String(result.asset.safePreviewGeneration)) {
        throw new Error("Clean image preview metadata did not match the scanner verdict.");
      }
      await deleteMediaAssetForMessage(mediaId, ownerUid, "chat");
      await waitForObjectGone(file);
      await waitForObjectGone(previewFile);
    }

    // The same signed create-only PUT URL is still live. Reuse it after the
    // original was deleted/rejected; the Storage finalized trigger must erase
    // the newly created generation against the media tombstone.
    const replay = await fetch(signedPutUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "image/png",
        "x-goog-if-generation-match": "0",
      },
      body: bytes,
    });
    if (!replay.ok) {
      throw new Error(`Signed upload replay did not reach the cleanup trigger: HTTP ${replay.status}`);
    }
    await waitForObjectGone(file);
    await waitForAuditAction(mediaId, "late_chat_media_original_deleted");

    const audit = await db.collection("mediaAccessAudit")
      .where("mediaId", "==", mediaId).get();
    const hasLateReplayAudit = audit.docs.some((doc) =>
      doc.data().action === "late_chat_media_original_deleted",
    );
    if (!hasLateReplayAudit) {
      throw new Error(`No exact-generation late replay cleanup audit was recorded for ${label}.`);
    }
    console.log(JSON.stringify({
      test: label,
      mediaId,
      expectedStatus,
      actualStatus: result.asset.status,
      jobState: result.job.state,
      previewCreated: Boolean(previewFile),
      lateReplayDeleted: true,
      auditEvents: audit.size,
    }));
  } finally {
    // Stop any late retry from dispatching while the test fixture is being removed.
    await assetRef.update({
      status: "test_cleanup",
      updatedAt: FieldValue.serverTimestamp(),
    }).catch(() => undefined);
    await Promise.all([
      deleteExact(file),
      previewFile ? deleteExact(previewFile) : Promise.resolve(),
      jobRef.delete().catch(() => undefined),
    ]);
    const audit = await db.collection("mediaAccessAudit")
      .where("mediaId", "==", mediaId).get();
    await Promise.all(audit.docs.map((doc) => doc.ref.delete()));
    await assetRef.delete().catch(() => undefined);
  }
}

async function main() {
  const clean = tinyPng();
  const eicar = Buffer.from(
    "X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*",
    "ascii",
  );
  const maliciousPng = Buffer.concat([clean, eicar]);
  await runCase("clean-png", clean, "security_approved");
  await runCase("eicar-in-png", maliciousPng, "rejected");
  console.log("Live Firebase Functions → private Cloud Run ClamAV → signed callback E2E passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
