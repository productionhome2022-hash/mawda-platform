export type MediaCategory = "image" | "video" | "audio" | "document";

export interface MediaPolicy {
  category: MediaCategory;
  maxBytes: number;
}

const POLICIES: Record<string, MediaPolicy> = {
  "image/jpeg": { category: "image", maxBytes: 10 * 1024 * 1024 },
  "image/png": { category: "image", maxBytes: 10 * 1024 * 1024 },
  "image/webp": { category: "image", maxBytes: 10 * 1024 * 1024 },
  "video/mp4": { category: "video", maxBytes: 100 * 1024 * 1024 },
  "audio/mpeg": { category: "audio", maxBytes: 25 * 1024 * 1024 },
  "audio/mp4": { category: "audio", maxBytes: 25 * 1024 * 1024 },
  "audio/ogg": { category: "audio", maxBytes: 25 * 1024 * 1024 },
  "audio/wav": { category: "audio", maxBytes: 25 * 1024 * 1024 },
  "application/pdf": { category: "document", maxBytes: 20 * 1024 * 1024 },
};

export function mediaPolicyFor(contentType: string): MediaPolicy | null {
  return POLICIES[contentType] ?? null;
}

export function normalizeMediaRequest(input: Record<string, unknown>): {
  originalName: string;
  contentType: string;
  declaredSizeBytes: number;
} {
  const originalName = typeof input.originalName === "string" ? input.originalName.trim() : "";
  const contentType = typeof input.contentType === "string" ? input.contentType.trim().toLowerCase() : "";
  const declaredSizeBytes = input.sizeBytes;
  if (!originalName || originalName.length > 180 || /[\\/\u0000-\u001f]/.test(originalName)) {
    throw new Error("اسم الملف غير صالح.");
  }
  if (!mediaPolicyFor(contentType)) throw new Error("نوع الملف غير مسموح به.");
  if (typeof declaredSizeBytes !== "number" || !Number.isSafeInteger(declaredSizeBytes) || declaredSizeBytes <= 0) {
    throw new Error("حجم الملف المعلن غير صالح.");
  }
  return { originalName, contentType, declaredSizeBytes };
}

/** Detect common file signatures from the first 32 bytes; not a malware scanner. */
export function detectMediaSignature(bytes: Uint8Array): string | null {
  if (bytes.length >= 8 &&
      bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
      bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return "image/png";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 12 &&
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return "image/webp";
  if (bytes.length >= 8 && String.fromCharCode(...bytes.slice(0, 4)) === "%PDF") return "application/pdf";
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(4, 8)) === "ftyp") {
    const brand = String.fromCharCode(...bytes.slice(8, 12));
    return ["M4A ", "M4B ", "M4P "].includes(brand) ? "audio/mp4" : "video/mp4";
  }
  if (bytes.length >= 4 && String.fromCharCode(...bytes.slice(0, 4)) === "OggS") return "audio/ogg";
  if (bytes.length >= 12 &&
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WAVE") return "audio/wav";
  if (bytes.length >= 3 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) return "audio/mpeg";
  if (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0) return "audio/mpeg";
  return null;
}


/** Firebase Auth's signed token is the sole source for member/anonymous-guest classification. */
export function mediaUploaderTypeFromToken(token: Record<string, unknown>): "member" | "guest" {
  const firebase = token.firebase;
  if (firebase && typeof firebase === "object" && !Array.isArray(firebase) &&
      (firebase as Record<string, unknown>).sign_in_provider === "anonymous") {
    return "guest";
  }
  return "member";
}
