import { createHmac, timingSafeEqual } from "node:crypto";

export interface ScannerVerdictPayload {
  mediaId: string;
  provider: string;
  verdict: "clean" | "malicious" | "error";
  objectGeneration: string;
  sha256: string;
  scannedAtMs: number;
  safePreviewPath?: string;
  safePreviewGeneration?: string;
  safePreviewSha256?: string;
  safePreviewContentType?: "image/webp";
}

export function verifyScannerWebhook(
  rawBody: Buffer,
  suppliedSignature: string | undefined,
  secret: string | undefined,
): boolean {
  if (!secret || secret.length < 32 || !suppliedSignature ||
      !/^[a-f0-9]{64}$/i.test(suppliedSignature)) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest();
  const supplied = Buffer.from(suppliedSignature, "hex");
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export function validateScannerVerdict(
  value: unknown,
  expectedProvider: string,
  nowMs = Date.now(),
): ScannerVerdictPayload | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const v = value as Record<string, unknown>;
  const previewFields = [
    v.safePreviewPath, v.safePreviewGeneration, v.safePreviewSha256, v.safePreviewContentType,
  ];
  const hasAnyPreview = previewFields.some((field) => field !== undefined);
  const hasAllPreview = previewFields.every((field) => field !== undefined);
  const previewParts = typeof v.safePreviewPath === "string" ? v.safePreviewPath.split("/") : [];
  const previewPathValid = previewParts.length === 4 &&
    previewParts[0] === "processed" &&
    /^[A-Za-z0-9_-]{1,128}$/.test(previewParts[1]) &&
    previewParts[2] === v.mediaId &&
    previewParts[3] === "preview.webp";

  if (typeof v.mediaId !== "string" || !/^[0-9a-f-]{36}$/i.test(v.mediaId) ||
      v.provider !== expectedProvider ||
      !["clean", "malicious", "error"].includes(String(v.verdict)) ||
      typeof v.objectGeneration !== "string" || !/^\d+$/.test(v.objectGeneration) ||
      typeof v.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(v.sha256) ||
      !Number.isSafeInteger(v.scannedAtMs) ||
      Math.abs(nowMs - Number(v.scannedAtMs)) > 10 * 60 * 1000 ||
      (hasAnyPreview && !hasAllPreview) ||
      (hasAllPreview && (
        !previewPathValid ||
        typeof v.safePreviewGeneration !== "string" || !/^\d+$/.test(v.safePreviewGeneration) ||
        typeof v.safePreviewSha256 !== "string" || !/^[a-f0-9]{64}$/.test(v.safePreviewSha256) ||
        v.safePreviewContentType !== "image/webp" ||
        v.verdict !== "clean"
      ))) return null;
  return v as unknown as ScannerVerdictPayload;
}
