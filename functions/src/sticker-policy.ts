export type StickerKind = "static" | "animated";
export type StickerMediaType = "image/png" | "image/webp" | "image/gif";

/**
 * Owner-approved sticker byte ceilings:
 * static: 256 KiB; animated: 512 KiB.
 * These are stricter sticker-specific limits, not replacements for platform media caps.
 */
export const STICKER_LIMITS = Object.freeze({
  width: 512,
  height: 512,
  staticMaxBytes: 256 * 1024,
  animatedMaxBytes: 512 * 1024,
  animatedMaxDurationMs: 5_000,
  animatedMaxFrames: 50,
  maxPackStickers: 120,
} as const);

export type StickerMediaMetadata = {
  kind: StickerKind;
  contentType: StickerMediaType;
  width: number;
  height: number;
  sizeBytes: number;
  durationMs?: number;
  frameCount?: number;
};

export function validateStickerMediaMetadata(value: unknown): StickerMediaMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("INVALID_STICKER_MEDIA");
  }
  const input = value as Record<string, unknown>;
  const allowedKeys = new Set([
    "kind", "contentType", "width", "height", "sizeBytes", "durationMs", "frameCount",
  ]);
  if (Object.keys(input).some((key) => !allowedKeys.has(key))) {
    throw new Error("UNSUPPORTED_STICKER_METADATA_FIELD");
  }
  const kind = input.kind;
  const contentType = input.contentType;
  const width = input.width;
  const height = input.height;
  const sizeBytes = input.sizeBytes;
  if (kind !== "static" && kind !== "animated") throw new Error("INVALID_STICKER_KIND");
  if (kind === "static" && contentType !== "image/png" && contentType !== "image/webp") {
    throw new Error("INVALID_STATIC_STICKER_TYPE");
  }
  if (kind === "animated" && contentType !== "image/gif") {
    throw new Error("INVALID_ANIMATED_STICKER_TYPE");
  }
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) ||
      (width as number) < 1 || (height as number) < 1 ||
      (width as number) > STICKER_LIMITS.width || (height as number) > STICKER_LIMITS.height) {
    throw new Error("INVALID_STICKER_DIMENSIONS");
  }
  const maxBytes = kind === "animated"
    ? STICKER_LIMITS.animatedMaxBytes
    : STICKER_LIMITS.staticMaxBytes;
  if (!Number.isSafeInteger(sizeBytes) || (sizeBytes as number) < 1 ||
      (sizeBytes as number) > maxBytes) {
    throw new Error("INVALID_STICKER_SIZE");
  }
  if (kind === "animated") {
    if (!Number.isSafeInteger(input.durationMs) ||
        (input.durationMs as number) < 1 ||
        (input.durationMs as number) > STICKER_LIMITS.animatedMaxDurationMs) {
      throw new Error("INVALID_STICKER_DURATION");
    }
    if (!Number.isSafeInteger(input.frameCount) ||
        (input.frameCount as number) < 1 ||
        (input.frameCount as number) > STICKER_LIMITS.animatedMaxFrames) {
      throw new Error("INVALID_STICKER_FRAME_COUNT");
    }
  }
  return {
    kind,
    contentType: contentType as StickerMediaType,
    width: width as number,
    height: height as number,
    sizeBytes: sizeBytes as number,
    ...(kind === "animated" ? {
      durationMs: input.durationMs as number,
      frameCount: input.frameCount as number,
    } : {}),
  };
}

export function validateStickerPackSize(stickerCount: number): boolean {
  return Number.isSafeInteger(stickerCount) &&
    stickerCount >= 1 && stickerCount <= STICKER_LIMITS.maxPackStickers;
}

export type StickerPackManifestInput = {
  packId: string;
  title: string;
  description?: string;
  stickers: Array<{
    stickerId: string;
    kind: StickerKind;
    contentType: StickerMediaType;
    width: number;
    height: number;
    sizeBytes: number;
    durationMs?: number;
    frameCount?: number;
  }>;
};

export type StickerSendRequest = {
  scope: "direct" | "room";
  targetId: string;
  packId: string;
  stickerId: string;
  clientMessageId: string;
};

const STICKER_IDENTIFIER = /^[A-Za-z0-9_-]{1,80}$/;
const STICKER_MESSAGE_ID = /^[A-Za-z0-9_-]{8,80}$/;

/** Validate a server-authored pack manifest; never accept client asset paths or URLs. */
export function validateStickerPackManifest(value: unknown): StickerPackManifestInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("INVALID_STICKER_PACK");
  }
  const input = value as Record<string, unknown>;
  const packId = typeof input.packId === "string" ? input.packId.trim() : "";
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const description = input.description === undefined
    ? undefined
    : typeof input.description === "string" ? input.description.trim() : null;
  if (!STICKER_IDENTIFIER.test(packId)) throw new Error("INVALID_STICKER_PACK_ID");
  if (!title || title.length > 80) throw new Error("INVALID_STICKER_PACK_TITLE");
  if (description === null || (description !== undefined && description.length > 240)) {
    throw new Error("INVALID_STICKER_PACK_DESCRIPTION");
  }
  if (!Array.isArray(input.stickers) || !validateStickerPackSize(input.stickers.length)) {
    throw new Error("INVALID_STICKER_PACK_SIZE");
  }
  const seen = new Set<string>();
  const stickers = input.stickers.map((raw) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      throw new Error("INVALID_STICKER_ENTRY");
    }
    const entry = raw as Record<string, unknown>;
    const stickerId = typeof entry.stickerId === "string" ? entry.stickerId.trim() : "";
    if (!STICKER_IDENTIFIER.test(stickerId) || seen.has(stickerId)) {
      throw new Error("INVALID_STICKER_ID");
    }
    seen.add(stickerId);
    // Pack entries may carry private asset references and moderation fields;
    // project only the six approved media-metadata fields before strict validation.
    const metadata = {
      kind: entry.kind,
      contentType: entry.contentType,
      width: entry.width,
      height: entry.height,
      sizeBytes: entry.sizeBytes,
      ...(entry.durationMs !== undefined ? { durationMs: entry.durationMs } : {}),
      ...(entry.frameCount !== undefined ? { frameCount: entry.frameCount } : {}),
    };
    return { stickerId, ...validateStickerMediaMetadata(metadata) };
  });
  return {
    packId,
    title,
    ...(description !== undefined ? { description } : {}),
    stickers,
  };
}

/** Shape-only validation. Membership, publication, asset approval and idempotency remain server duties. */
export function validateStickerSendRequest(value: unknown): StickerSendRequest {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("INVALID_STICKER_SEND_REQUEST");
  }
  const input = value as Record<string, unknown>;
  const allowed = new Set(["scope", "targetId", "packId", "stickerId", "clientMessageId"]);
  if (Object.keys(input).some((key) => !allowed.has(key))) {
    throw new Error("UNSUPPORTED_STICKER_SEND_FIELDS");
  }
  const scope = input.scope;
  const targetId = typeof input.targetId === "string" ? input.targetId.trim() : "";
  const packId = typeof input.packId === "string" ? input.packId.trim() : "";
  const stickerId = typeof input.stickerId === "string" ? input.stickerId.trim() : "";
  const clientMessageId = typeof input.clientMessageId === "string"
    ? input.clientMessageId.trim()
    : "";
  if (scope !== "direct" && scope !== "room") throw new Error("INVALID_STICKER_SCOPE");
  if (!targetId || targetId.length > 128) throw new Error("INVALID_STICKER_TARGET");
  if (!STICKER_IDENTIFIER.test(packId)) throw new Error("INVALID_STICKER_PACK_ID");
  if (!STICKER_IDENTIFIER.test(stickerId)) throw new Error("INVALID_STICKER_ID");
  if (!STICKER_MESSAGE_ID.test(clientMessageId)) throw new Error("INVALID_STICKER_MESSAGE_ID");
  return { scope, targetId, packId, stickerId, clientMessageId };
}


/** Bind an idempotent sticker-message retry to its complete sender and asset identity. */
export function stickerMessageReplayMatches(
  existing: unknown,
  expected: { senderUid: string; mediaId: string; packId: string; stickerId: string },
): boolean {
  if (!existing || typeof existing !== "object" || Array.isArray(existing)) return false;
  const message = existing as Record<string, unknown>;
  return message.type === "sticker" &&
    message.senderUid === expected.senderUid &&
    message.mediaId === expected.mediaId &&
    message.stickerPackId === expected.packId &&
    message.stickerId === expected.stickerId;
}
