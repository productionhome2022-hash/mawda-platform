export type StickerKind = "static" | "animated";
export type StickerMediaType = "image/png" | "image/webp" | "image/gif";

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
    contentType,
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
