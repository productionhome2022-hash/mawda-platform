import { FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { onObjectFinalized } from "firebase-functions/v2/storage";
import { defineString } from "firebase-functions/params";
import { logger } from "firebase-functions";

export const CHAT_MEDIA_RETENTION_MS = 4 * 60 * 60 * 1000;
export const CHAT_TEXT_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
const RETENTION_BATCH_SIZE = 150;
const RETENTION_PAGES_PER_RUN = 10;
const retentionJobsEnabled = defineString("MAWDA_RETENTION_JOBS_ENABLED", { default: "false" });

/** Fail closed when a specific media asset is under a documented active hold. */
export function shouldSuspendMediaDeletion(asset: Record<string, unknown>): boolean {
  return asset.legalHoldStatus === "active";
}

export function retentionDeadline(createdAtMs: number, lifetimeMs: number): number {
  if (!Number.isSafeInteger(createdAtMs) || createdAtMs < 0 ||
      !Number.isSafeInteger(lifetimeMs) || lifetimeMs <= 0) {
    throw new Error("INVALID_RETENTION_CLOCK");
  }
  return createdAtMs + lifetimeMs;
}

export function isRetentionDue(createdAtMs: number, lifetimeMs: number, nowMs: number): boolean {
  if (!Number.isSafeInteger(nowMs) || nowMs < 0) throw new Error("INVALID_RETENTION_CLOCK");
  return retentionDeadline(createdAtMs, lifetimeMs) <= nowMs;
}

export function isSupportedChatMessagePath(path: string): boolean {
  const parts = path.split("/");
  return parts.length === 4 &&
    (parts[0] === "directChats" || parts[0] === "rooms") &&
    parts[1].length > 0 && parts[2] === "messages" && parts[3].length > 0;
}

function nonProductionProject(): boolean {
  const projectId = process.env.GCLOUD_PROJECT ?? process.env.GCP_PROJECT ?? "";
  return projectId !== "mawda-app-2026" &&
    /(test|staging|dev|demo|nonprod|sandbox)/i.test(projectId) &&
    !/prod(uction)?/i.test(projectId);
}

function jobsMayRun(): boolean {
  if (retentionJobsEnabled.value() !== "true") return false;
  if (!nonProductionProject()) {
    logger.error("Retention sweep refused: only an explicitly named non-production project is allowed.", {
      projectId: process.env.GCLOUD_PROJECT ?? process.env.GCP_PROJECT ?? "unknown",
    });
    return false;
  }
  return true;
}

/**
 * Deletes every live and noncurrent generation for one exact object name.
 * It deliberately never performs a prefix-wide deletion. Bucket soft-delete,
 * retention locks and backup policies are infrastructure controls and must be
 * disabled/validated separately before this job can be enabled.
 */
async function deleteAllObjectGenerations(objectPath: string): Promise<number> {
  if (!objectPath || objectPath.startsWith("/") || objectPath.split("/").includes("..")) {
    throw new Error("UNSAFE_MEDIA_OBJECT_PATH");
  }
  const configuredBucket = configuredMediaBucketName();
  const bucket = configuredBucket ? getStorage().bucket(configuredBucket) : getStorage().bucket();
  const [listed] = await bucket.getFiles({ prefix: objectPath, versions: true, autoPaginate: true });
  const exactVersions = listed.filter((file) => file.name === objectPath);
  let deleted = 0;
  for (const file of exactVersions) {
    const [metadata] = await file.getMetadata();
    const generation = Number(metadata.generation);
    if (!Number.isSafeInteger(generation) || generation <= 0) {
      throw new Error("INVALID_STORAGE_GENERATION");
    }
    await file.delete({ ignoreNotFound: true, ifGenerationMatch: generation });
    deleted += 1;
  }
  return deleted;
}

const ACTIVE_MEDIA_STATES = [
  "upload_authorized", "pending_security_scan", "scanner_clean_pending_processing",
  "security_approved", "rejected", "expired_cleanup_in_progress", "expired",
];
const MEDIA_DERIVATIVE_RECHECK_MS = 5 * 60 * 1000;

export async function runChatMediaRetentionSweep(): Promise<{ assets: number; objects: number; failures: number }> {
  const db = getFirestore();
  const now = Timestamp.fromMillis(Date.now());
  let assets = 0;
  let objects = 0;
  let failures = 0;

  for (const purpose of ["chat", "room", "profile_album"] as const) {
    const lifetimeMs = purpose === "profile_album" ? 7 * 24 * 60 * 60 * 1000 : CHAT_MEDIA_RETENTION_MS;
    const cutoff = Timestamp.fromMillis(Date.now() - lifetimeMs);
    const retentionLabel = purpose === "profile_album" ? "seven_day_profile_album" : "four_hour_self_destruct";
    const deletedPolicyStatus = purpose === "profile_album" ? "seven_day_profile_album_deleted" : "four_hour_self_destructed";
    const deletionAuditAction = purpose === "profile_album" ? "profile_album_media_deleted" : "chat_media_self_destructed";
    // Revisit content-free tombstones on a separate clock. This catches a
    // derivative written by a scanner that was already running at expiry,
    // without allowing tombstones to occupy the active-expiry query forever.
    const tombstones = await db.collection("mediaAssets")
      .where("mediaPurpose", "==", purpose)
      .where("status", "==", "self_destructed")
      .where("retentionReconcileAt", "<=", now)
      .orderBy("retentionReconcileAt", "asc")
      .limit(RETENTION_BATCH_SIZE)
      .get();
    for (const tombstoneDoc of tombstones.docs) {
      const ownerUid = tombstoneDoc.data().ownerUid;
      const mediaId = tombstoneDoc.id;
      if (typeof ownerUid !== "string" || !/^[0-9a-f-]{36}$/i.test(mediaId)) continue;
      try {
        const originalPath = `quarantine/${ownerUid}/${mediaId}`;
        const derivativePath = `processed/${ownerUid}/${mediaId}/preview.webp`;
        objects += await deleteAllObjectGenerations(originalPath);
        objects += await deleteAllObjectGenerations(derivativePath);
        await tombstoneDoc.ref.update({
          retentionReconcileAt: Timestamp.fromMillis(Date.now() + MEDIA_DERIVATIVE_RECHECK_MS),
          updatedAt: FieldValue.serverTimestamp(),
        });
      } catch (error) {
        failures += 1;
        logger.error("Late media derivative reconciliation failed; retry remains scheduled.", {
          mediaId, purpose, errorName: error instanceof Error ? error.name : "unknown",
        });
      }
    }

    for (let page = 0; page < RETENTION_PAGES_PER_RUN; page += 1) {
      const dueAt = Timestamp.fromMillis(Date.now());
      const [due, legacy] = await Promise.all([
        db.collection("mediaAssets")
          .where("mediaPurpose", "==", purpose)
          .where("status", "in", ACTIVE_MEDIA_STATES)
          .where("retentionExpiresAt", "<=", dueAt)
          .orderBy("retentionExpiresAt", "asc")
          .limit(RETENTION_BATCH_SIZE)
          .get(),
        db.collection("mediaAssets")
          .where("mediaPurpose", "==", purpose)
          .where("status", "in", ACTIVE_MEDIA_STATES)
          .where("retentionExpiresAt", "==", null)
          .where("createdAt", "<=", cutoff)
          .orderBy("createdAt", "asc")
          .limit(RETENTION_BATCH_SIZE)
          .get(),
      ]);
      const candidates = new Map<string, (typeof due.docs)[number]>();
      for (const doc of [...due.docs, ...legacy.docs]) candidates.set(doc.id, doc);
      if (candidates.size === 0) break;

      let succeededThisPage = 0;
      for (const assetDoc of candidates.values()) {
        const asset = assetDoc.data();
        // A documented owner legal hold suspends deletion only for this exact asset.
        // The original retention deadline is preserved and resumes on release/expiry.
        if (shouldSuspendMediaDeletion(asset)) {
          continue;
        }
        const ownerUid = typeof asset.ownerUid === "string" ? asset.ownerUid : "";
        const mediaId = assetDoc.id;
        const paths = new Set<string>();
        if (typeof asset.objectPath === "string") paths.add(asset.objectPath);
        if (typeof asset.safePreviewPath === "string") paths.add(asset.safePreviewPath);
        if (ownerUid && /^[0-9a-f-]{36}$/i.test(mediaId)) {
          paths.add(`processed/${ownerUid}/${mediaId}/preview.webp`);
        }

        try {
          for (const path of paths) objects += await deleteAllObjectGenerations(path);
          const tombstone: Record<string, unknown> = {};
          for (const key of Object.keys(asset)) {
            if (!["ownerUid", "uploaderType", "mediaPurpose", "createdAt", "retentionExpiresAt"].includes(key)) {
              tombstone[key] = FieldValue.delete();
            }
          }
          const createdAt = asset.createdAt instanceof Timestamp ? asset.createdAt : null;
          tombstone.status = "self_destructed";
          tombstone.retentionPolicyStatus = deletedPolicyStatus;
          tombstone.retentionExpiresAt = asset.retentionExpiresAt ??
            (createdAt ? Timestamp.fromMillis(createdAt.toMillis() + lifetimeMs) : Timestamp.fromMillis(Date.now()));
          tombstone.retentionDeletedAt = FieldValue.serverTimestamp();
          tombstone.retentionReconcileAt = Timestamp.fromMillis(Date.now() + MEDIA_DERIVATIVE_RECHECK_MS);
          tombstone.updatedAt = FieldValue.serverTimestamp();
          await assetDoc.ref.set(tombstone, { merge: true });
          await db.collection("mediaScanJobs").doc(mediaId).delete().catch(() => undefined);
          await db.collection("mediaAccessAudit").add({
            actorUid: "system-retention", mediaId, action: deletionAuditAction,
            outcome: "success", purpose, objectCount: paths.size,
            createdAt: FieldValue.serverTimestamp(),
            expiresAt: Timestamp.fromMillis(Date.now() + 90 * 24 * 60 * 60 * 1000),
          });
          assets += 1;
          succeededThisPage += 1;
        } catch (error) {
          failures += 1;
          await db.collection("mediaAccessAudit").add({
            actorUid: "system-retention", mediaId, action: purpose === "profile_album" ? "profile_album_media_delete" : "chat_media_self_destruct",
            outcome: "retry_required", purpose,
            failureCode: error instanceof Error ? error.name : "unknown",
            createdAt: FieldValue.serverTimestamp(),
            expiresAt: Timestamp.fromMillis(Date.now() + 90 * 24 * 60 * 60 * 1000),
          });
          logger.error("Chat media deletion failed; asset remains for retry.", {
            mediaId, purpose, errorName: error instanceof Error ? error.name : "unknown",
          });
        }
      }
      if (succeededThisPage === 0) break;
    }
  }
  return { assets, objects, failures };
}

export async function runChatTextRetentionSweep(): Promise<{ messages: number; failures: number }> {
  const db = getFirestore();
  const cutoff = Timestamp.fromMillis(Date.now() - CHAT_TEXT_RETENTION_MS);
  let messages = 0;
  let failures = 0;

  for (let page = 0; page < RETENTION_PAGES_PER_RUN; page += 1) {
    const snapshot = await db.collectionGroup("messages")
      .where("createdAt", "<=", cutoff)
      .orderBy("createdAt", "asc")
      .limit(RETENTION_BATCH_SIZE)
      .get();
    if (snapshot.empty) break;

    const batch = db.batch();
    const directChatIds = new Set<string>();
    let batchMessages = 0;
    for (const messageDoc of snapshot.docs) {
      if (!isSupportedChatMessagePath(messageDoc.ref.path)) continue;
      const parts = messageDoc.ref.path.split("/");
      if (parts[0] === "directChats") {
        const data = messageDoc.data();
        const recipientUid = typeof data.recipientUid === "string" ? data.recipientUid : "";
        if (recipientUid) {
          batch.delete(db.collection("users").doc(recipientUid)
            .collection("notifications").doc(messageDoc.id));
        }
        directChatIds.add(parts[1]);
      }
      batch.delete(messageDoc.ref);
      batchMessages += 1;
    }
    if (batchMessages === 0) break;

    // Clear text previews in the same atomic batch as their expired messages.
    // Keep at most 150 messages per batch so message, notification and chat
    // metadata writes stay below Firestore's 500-write batch limit.
    for (const chatId of directChatIds) {
      const chatRef = db.collection("directChats").doc(chatId);
      const chat = await chatRef.get();
      const lastMessageAt = chat.data()?.lastMessageAt;
      if (chat.exists && (!(lastMessageAt instanceof Timestamp) ||
          lastMessageAt.toMillis() <= cutoff.toMillis())) {
        batch.update(chatRef, {
          lastMessagePreview: FieldValue.delete(),
          lastMessageAt: FieldValue.delete(),
          lastMessageSenderUid: FieldValue.delete(),
          textRetentionPurgedAt: FieldValue.serverTimestamp(),
        });
      }
    }

    try {
      await batch.commit();
      messages += batchMessages;
    } catch (error) {
      logger.error("Chat text deletion batch failed; scheduled sweep will retry.", {
        errorName: error instanceof Error ? error.name : "unknown",
      });
      failures += batchMessages;
      break;
    }
  }
  return { messages, failures };
}

async function deleteExpiredMediaOperationalAudit(): Promise<number> {
  const db = getFirestore();
  const cutoff = Timestamp.fromMillis(Date.now() - 90 * 24 * 60 * 60 * 1000);
  let deleted = 0;
  for (let page = 0; page < RETENTION_PAGES_PER_RUN; page += 1) {
    const snapshot = await db.collection("mediaAccessAudit")
      .where("createdAt", "<=", cutoff)
      .orderBy("createdAt", "asc")
      .limit(RETENTION_BATCH_SIZE)
      .get();
    if (snapshot.empty) break;
    const batch = db.batch();
    for (const entry of snapshot.docs) batch.delete(entry.ref);
    await batch.commit();
    deleted += snapshot.size;
    if (snapshot.size < RETENTION_BATCH_SIZE) break;
  }
  return deleted;
}

function configuredMediaBucketName(): string | null {
  if (typeof process.env.MAWDA_MEDIA_BUCKET_NAME === "string" && process.env.MAWDA_MEDIA_BUCKET_NAME.trim()) {
    return process.env.MAWDA_MEDIA_BUCKET_NAME.trim();
  }
  try {
    const config = JSON.parse(process.env.FIREBASE_CONFIG ?? "{}") as Record<string, unknown>;
    return typeof config.storageBucket === "string" && config.storageBucket.trim()
      ? config.storageBucket.trim()
      : null;
  } catch {
    return null;
  }
}

export function isKnownDeletedMediaObjectPath(
  asset: Record<string, unknown>,
  objectPath: string,
  ownerUid: string,
  mediaId: string,
): boolean {
  const deterministicOriginal = `quarantine/${ownerUid}/${mediaId}`;
  const deterministicPreview = `processed/${ownerUid}/${mediaId}/preview.webp`;
  const candidates = [
    asset.objectPath,
    asset.safePreviewPath,
    deterministicOriginal,
    deterministicPreview,
    ...(Array.isArray(asset.derivedObjectPaths) ? asset.derivedObjectPaths : []),
    ...(Array.isArray(asset.deletedObjectPaths) ? asset.deletedObjectPaths : []),
  ];
  return candidates.some((candidate) => candidate === objectPath);
}

async function handleLateExpiredChatMediaDerivative(event: Parameters<typeof onObjectFinalized>[1] extends (event: infer T) => unknown ? T : never): Promise<void> {
  const object = event.data;
  const objectPath = typeof object.name === "string" ? object.name : "";
  const parts = objectPath.split("/");
  const isOriginal = parts.length === 3 && parts[0] === "quarantine";
  const isDerived = parts.length === 4 && parts[0] === "processed" &&
    parts[3] === "preview.webp";
  if (!isOriginal && !isDerived) return;
  const ownerUid = parts[1];
  const mediaId = parts[2];
  const generation = Number(object.generation);
  if (!/^[0-9a-f-]{36}$/i.test(mediaId) || !Number.isSafeInteger(generation) || generation <= 0) return;

  const db = getFirestore();
  const assetRef = db.collection("mediaAssets").doc(mediaId);
  const assetSnapshot = await assetRef.get();
  if (!assetSnapshot.exists) return;
  const asset = assetSnapshot.data() ?? {};
  if (asset.ownerUid !== ownerUid ||
      !["chat", "room", "profile_album"].includes(String(asset.mediaPurpose)) ||
      asset.legalHoldStatus === "active" ||
      !isKnownDeletedMediaObjectPath(asset, objectPath, ownerUid, mediaId)) return;

  const manualDeletionState = ["manual_deletion_pending", "manually_deleted", "rejected"].includes(String(asset.status));
  const expiry = asset.retentionExpiresAt instanceof Timestamp
    ? asset.retentionExpiresAt
    : asset.createdAt instanceof Timestamp
      ? Timestamp.fromMillis(asset.createdAt.toMillis() + CHAT_MEDIA_RETENTION_MS)
      : null;
  if (!manualDeletionState && asset.status !== "self_destructed" &&
      (!expiry || expiry.toMillis() > Date.now())) return;

  await getStorage().bucket(object.bucket).file(objectPath).delete({
    ignoreNotFound: true,
    ifGenerationMatch: generation,
  });
  await db.collection("mediaAccessAudit").add({
    actorUid: "system-retention",
    mediaId,
    action: isOriginal
      ? "late_chat_media_original_deleted"
      : "late_chat_media_derivative_deleted",
    objectGeneration: String(generation),
    outcome: "success",
    purpose: asset.mediaPurpose,
    createdAt: FieldValue.serverTimestamp(),
    expiresAt: Timestamp.fromMillis(Date.now() + 90 * 24 * 60 * 60 * 1000),
  });
}

// Storage trigger registration needs a real bucket name. Unit tests intentionally
// import this module without Firebase deployment config, so do not register an
// unusable trigger in that environment.
const configuredBucket = configuredMediaBucketName();
export const removeLateExpiredChatMediaDerivative = configuredBucket
  ? onObjectFinalized({ bucket: configuredBucket }, handleLateExpiredChatMediaDerivative)
  : undefined;

/** Reconciles expired chat and profile-gallery media every minute; disabled by default and non-production gated. */
export const enforceChatMediaRetention = onSchedule(
  { schedule: "every 1 minutes", timeZone: "UTC", timeoutSeconds: 540, memory: "512MiB" },
  async () => {
    if (!jobsMayRun()) return;
    const result = await runChatMediaRetentionSweep();
    logger.info("Chat media retention sweep completed.", result);
  },
);

/** Permanently removes chat text and text-bearing previews after seven days. */
export const enforceChatTextRetention = onSchedule(
  { schedule: "every 1 minutes", timeZone: "UTC", timeoutSeconds: 540, memory: "512MiB" },
  async () => {
    if (!jobsMayRun()) return;
    const result = await runChatTextRetentionSweep();
    logger.info("Chat text retention sweep completed.", result);
  },
);

/** Removes operational media access logs after the approved 90-day period. */
export const enforceMediaOperationalAuditRetention = onSchedule(
  { schedule: "every 24 hours", timeZone: "UTC", timeoutSeconds: 300, memory: "256MiB" },
  async () => {
    if (!jobsMayRun()) return;
    const deleted = await deleteExpiredMediaOperationalAudit();
    logger.info("Media operational audit retention sweep completed.", { deleted });
  },
);
