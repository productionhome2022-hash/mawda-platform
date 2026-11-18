import { validateStickerPackManifest } from "./sticker-policy";

const SAFE_ASSET_ID = /^[A-Za-z0-9_-]{1,100}$/;

export type PublicStickerCatalogItem = {
  packId: string;
  title: string;
  description?: string;
  sortOrder: number;
  stickers: Array<{
    stickerId: string;
    assetId: string;
    kind: "static" | "animated";
    contentType: "image/png" | "image/webp" | "image/gif";
    width: number;
    height: number;
    sizeBytes: number;
    durationMs?: number;
    frameCount?: number;
  }>;
};

/**
 * Projects only published, server-approved catalog metadata.
 * Storage paths, signed URLs, moderation notes and arbitrary document fields
 * are never returned to clients.
 */
export function projectPublishedStickerPack(
  documentId: string,
  value: unknown,
): PublicStickerCatalogItem | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (input.status !== "published" || input.approved !== true) return null;
  const rawManifest = {
    packId: documentId,
    title: input.title,
    description: input.description,
    stickers: input.stickers,
  };
  let manifest;
  try {
    manifest = validateStickerPackManifest(rawManifest);
  } catch {
    return null;
  }
  const rawStickers = input.stickers as Array<Record<string, unknown>>;
  let stickers: PublicStickerCatalogItem["stickers"];
  try {
    stickers = manifest.stickers.map((sticker, index) => {
      const assetId = typeof rawStickers[index]?.assetId === "string"
        ? (rawStickers[index].assetId as string).trim()
        : "";
      if (!SAFE_ASSET_ID.test(assetId) || rawStickers[index]?.scanStatus !== "clean") {
        throw new Error("UNAPPROVED_STICKER_ASSET");
      }
      return { ...sticker, assetId };
    });
  } catch {
    return null;
  }
  const sortOrder = Number.isSafeInteger(input.sortOrder) && (input.sortOrder as number) >= 0
    ? input.sortOrder as number
    : 0;
  return {
    packId: manifest.packId,
    title: manifest.title,
    ...(manifest.description !== undefined ? { description: manifest.description } : {}),
    sortOrder,
    stickers,
  };
}
