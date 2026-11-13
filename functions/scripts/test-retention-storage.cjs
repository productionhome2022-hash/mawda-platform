const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getStorage } = require("firebase-admin/storage");
const { randomUUID } = require("node:crypto");

const projectId = process.env.GOOGLE_CLOUD_PROJECT;
const bucketName = process.env.MAWDA_MEDIA_TEST_BUCKET;
if (process.env.MAWDA_RETENTION_GCS_TEST !== "1" || !projectId || !bucketName) {
  throw new Error("Set MAWDA_RETENTION_GCS_TEST=1, GOOGLE_CLOUD_PROJECT and MAWDA_MEDIA_TEST_BUCKET.");
}
if (projectId === "mawda-app-2026" || /prod(uction)?/i.test(projectId) ||
    /prod(uction)?/i.test(bucketName) ||
    !/(test|staging|dev|demo|nonprod|sandbox)/i.test(projectId) ||
    !/(test|staging|dev|demo|nonprod|sandbox)/i.test(bucketName)) {
  throw new Error("Refusing to test destructive retention against a production or unmarked bucket.");
}

initializeApp({ credential: applicationDefault(), projectId, storageBucket: bucketName });
const bucket = getStorage().bucket(bucketName);
const objectPath = `retention-http-tests/${randomUUID()}.txt`;
const file = bucket.file(objectPath);

async function listExactVersions() {
  const [files] = await bucket.getFiles({ prefix: objectPath, versions: true, autoPaginate: true });
  return files.filter((candidate) => candidate.name === objectPath);
}

async function deleteExactVersions() {
  const versions = await listExactVersions();
  for (const version of versions) {
    const [metadata] = await version.getMetadata();
    const generation = Number(metadata.generation);
    if (!Number.isSafeInteger(generation) || generation <= 0) {
      throw new Error("Storage returned an invalid generation during cleanup.");
    }
    await version.delete({ ignoreNotFound: true, ifGenerationMatch: generation });
  }
}

async function main() {
  const [bucketMetadata] = await bucket.getMetadata();
  const softDeleteSeconds = Number(bucketMetadata.softDeletePolicy?.retentionDurationSeconds ?? 0);
  const retentionSeconds = Number(bucketMetadata.retentionPolicy?.retentionPeriod ?? 0);
  const uniformAccess = bucketMetadata.iamConfiguration?.uniformBucketLevelAccess?.enabled === true;
  const publicAccessPrevention =
    bucketMetadata.iamConfiguration?.publicAccessPrevention === "enforced";
  const objectVersioningEnabled = bucketMetadata.versioning?.enabled === true;

  if (!objectVersioningEnabled) {
    throw new Error("Bucket object versioning must be enabled to verify permanent deletion of multiple generations.");
  }
  if (softDeleteSeconds > 0) {
    throw new Error(`Bucket soft-delete retention is enabled for ${softDeleteSeconds} seconds; permanent expiry cannot be certified.`);
  }
  if (retentionSeconds > 0) {
    throw new Error(`Bucket retention policy is enabled for ${retentionSeconds} seconds; chat media cannot be permanently deleted on schedule.`);
  }
  if (!uniformAccess || !publicAccessPrevention) {
    throw new Error("Bucket must enforce uniform bucket-level access and public access prevention.");
  }

  try {
    const firstBytes = Buffer.from("Mawda retention generation one");
    await file.save(firstBytes, {
      resumable: false,
      metadata: { contentType: "text/plain" },
      preconditionOpts: { ifGenerationMatch: 0 },
    });
    const [firstMetadata] = await file.getMetadata();
    const firstGeneration = Number(firstMetadata.generation);

    await file.save(Buffer.from("Mawda retention generation two"), {
      resumable: false,
      metadata: { contentType: "text/plain" },
      preconditionOpts: { ifGenerationMatch: firstGeneration },
    });

    const beforeDelete = await listExactVersions();
    if (beforeDelete.length !== 2) {
      throw new Error(`Expected exactly two retained test generations, found ${beforeDelete.length}.`);
    }
    const generations = [];
    for (const version of beforeDelete) {
      const [metadata] = await version.getMetadata();
      generations.push(String(metadata.generation));
      if (metadata.temporaryHold === true || metadata.eventBasedHold === true) {
        throw new Error("Test object unexpectedly has a retention hold.");
      }
    }

    if (new Set(generations).size !== 2) {
      throw new Error("The two test writes did not produce distinct object generations.");
    }

    await deleteExactVersions();
    const remaining = await listExactVersions();
    if (remaining.length !== 0) {
      throw new Error(`Object generations remain after deletion: ${remaining.length}`);
    }

    console.log(JSON.stringify({
      bucket: bucketName,
      softDeleteRetentionSeconds: softDeleteSeconds,
      bucketRetentionSeconds: retentionSeconds,
      uniformBucketLevelAccess: uniformAccess,
      publicAccessPrevention,
      objectVersioningEnabled: bucketMetadata.versioning?.enabled === true,
      generationsObserved: generations,
      allGenerationsPermanentlyDeleted: true,
    }));
  } finally {
    await deleteExactVersions();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
