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

/** Expose only published, approved, clean catalog metadata; never paths or signed URLs. */
export function projectPublishedStickerPack(
  documentId: string,
  value: unknown,
): PublicStickerCatalogItem | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (input.status !== "published" || input.approved !== true) return null;
  let manifest;
  try {
    manifest = validateStickerPackManifest({
      packId: documentId,
      title: input.title,
      description: input.description,
      stickers: input.stickers,
    });
  } catch {
    return null;
  }
  const rawStickers = input.stickers as Array<Record<string, unknown>>;
  const stickers: PublicStickerCatalogItem["stickers"] = [];
  try {
    for (let index = 0; index < manifest.stickers.length; index += 1) {
      const raw = rawStickers[index];
      const assetId = typeof raw?.assetId === "string" ? raw.assetId.trim() : "";
      if (!SAFE_ASSET_ID.test(assetId) || raw?.scanStatus !== "clean") {
        throw new Error("UNAPPROVED_STICKER_ASSET");
      }
      stickers.push({ ...manifest.stickers[index], assetId });
    }
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
