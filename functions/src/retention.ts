import { FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { defineString } from "firebase-functions/params";
import { logger } from "firebase-functions";

export const CHAT_MEDIA_RETENTION_MS = 4 * 60 * 60 * 1000;
export const CHAT_TEXT_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
const RETENTION_BATCH_SIZE = 250;
const retentionJobsEnabled = defineString("MAWDA_RETENTION_JOBS_ENABLED", { default: "false" });

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
  if (!objectPath || objectPath.startsWith("/") || objectPath.includes("..")) {
    throw new Error("UNSAFE_MEDIA_OBJECT_PATH");
  }
  const bucket = getStorage().bucket();
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

async function deleteExpiredChatMedia(): Promise<{ assets: number; objects: number; failures: number }> {
  const db = getFirestore();
  const cutoff = Timestamp.fromMillis(Date.now() - CHAT_MEDIA_RETENTION_MS);
  let assets = 0;
  let objects = 0;
  let failures = 0;

  for (const purpose of ["chat", "room"] as const) {
    for (let page = 0; page < 10; page += 1) {
      const snapshot = await db.collection("mediaAssets")
        .where("mediaPurpose", "==", purpose)
        .where("createdAt", "<=", cutoff)
        .orderBy("createdAt", "asc")
        .limit(RETENTION_BATCH_SIZE)
        .get();
      if (snapshot.empty) break;

      for (const assetDoc of snapshot.docs) {
      const asset = assetDoc.data();
      const ownerUid = typeof asset.ownerUid === "string" ? asset.ownerUid : "";
      const mediaId = assetDoc.id;
      const paths = new Set<string>();
      if (typeof asset.objectPath === "string") paths.add(asset.objectPath);
      if (typeof asset.safePreviewPath === "string") paths.add(asset.safePreviewPath);
      // The scanner's only supported cloud derivative is this deterministic WebP path.
      if (ownerUid && /^[0-9a-f-]{36}$/i.test(mediaId)) {
        paths.add(`processed/${ownerUid}/${mediaId}/preview.webp`);
      }
      try {
        for (const path of paths) objects += await deleteAllObjectGenerations(path);
        await db.collection("mediaScanJobs").doc(mediaId).delete().catch(() => undefined);
        await assetDoc.ref.delete();
        await db.collection("mediaAccessAudit").add({
          actorUid: "system-retention",
          mediaId,
          action: "chat_media_self_destructed",
          outcome: "success",
          purpose,
          objectCount: paths.size,
          createdAt: FieldValue.serverTimestamp(),
          expiresAt: Timestamp.fromMillis(Date.now() + 90 * 24 * 60 * 60 * 1000),
        });
        assets += 1;
      } catch (error) {
        failures += 1;
        await db.collection("mediaAccessAudit").add({
          actorUid: "system-retention",
          mediaId,
          action: "chat_media_self_destruct",
          outcome: "retry_required",
          purpose,
          failureCode: error instanceof Error ? error.name : "unknown",
          createdAt: FieldValue.serverTimestamp(),
          expiresAt: Timestamp.fromMillis(Date.now() + 90 * 24 * 60 * 60 * 1000),
        });
        logger.error("Chat media deletion failed; asset remains for retry.", {
          mediaId, purpose, errorName: error instanceof Error ? error.name : "unknown",
        });
      }
    }
    }
  }
  return { assets, objects, failures };
}

async function deleteExpiredChatText(): Promise<{ messages: number; failures: number }> {
  const db = getFirestore();
  const cutoff = Timestamp.fromMillis(Date.now() - CHAT_TEXT_RETENTION_MS);
  let messages = 0;
  let failures = 0;
  for (let page = 0; page < 10; page += 1) {
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

  try {
    await batch.commit();
    messages += batchMessages;
    // lastMessagePreview is a text copy. Remove it when its timestamp is expired.
    for (const chatId of directChatIds) {
      const chatRef = db.collection("directChats").doc(chatId);
      await db.runTransaction(async (transaction) => {
        const chat = await transaction.get(chatRef);
        const lastMessageAt = chat.data()?.lastMessageAt;
        if (chat.exists && lastMessageAt instanceof Timestamp &&
            lastMessageAt.toMillis() <= cutoff.toMillis()) {
          transaction.update(chatRef, {
            lastMessagePreview: FieldValue.delete(),
            lastMessageAt: FieldValue.delete(),
            lastMessageSenderUid: FieldValue.delete(),
            textRetentionPurgedAt: FieldValue.serverTimestamp(),
          });
        }
      });
    }
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

/** Reconciles expired chat media every minute; disabled by default and non-production gated. */
export const enforceChatMediaRetention = onSchedule(
  { schedule: "every 1 minutes", timeZone: "UTC", timeoutSeconds: 540, memory: "512MiB" },
  async () => {
    if (!jobsMayRun()) return;
    const result = await deleteExpiredChatMedia();
    logger.info("Chat media retention sweep completed.", result);
  },
);

/** Permanently removes chat text and text-bearing previews after seven days. */
export const enforceChatTextRetention = onSchedule(
  { schedule: "every 1 minutes", timeZone: "UTC", timeoutSeconds: 540, memory: "512MiB" },
  async () => {
    if (!jobsMayRun()) return;
    const result = await deleteExpiredChatText();
    logger.info("Chat text retention sweep completed.", result);
  },
);
