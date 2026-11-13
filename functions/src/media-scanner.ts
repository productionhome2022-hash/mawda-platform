import { createHmac, timingSafeEqual } from "node:crypto";

export interface ScannerSafeDerivative {
  category: "gif" | "audio" | "video" | "document";
  path: string;
  generation: string;
  sha256: string;
  contentType: "image/gif" | "audio/mpeg" | "video/mp4" | "application/pdf";
  pipelineVersion: string;
}

export interface ScannerVerdictPayload {
  mediaId: string;
  provider: string;
  verdict: "clean" | "malicious" | "error";
  objectGeneration: string;
  sha256: string;
  scannedAtMs: number;
  scanEngine: "ClamAV";
  engineVersion: string;
  signatureDatabaseVersion: string;
  signatureDatabaseAgeMs: number;
  safePreviewPath?: string;
  safePreviewGeneration?: string;
  safePreviewSha256?: string;
  safePreviewContentType?: "image/webp";
  safeDerivative?: ScannerSafeDerivative;
  processingStatus?: string;
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
  return supplied.length === expected.length && timingSafeEqual(expected, supplied);
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

  let safeDerivative: ScannerSafeDerivative | undefined;
  if (v.safeDerivative !== undefined) {
    if (!v.safeDerivative || typeof v.safeDerivative !== "object" || Array.isArray(v.safeDerivative)) return null;
    const d = v.safeDerivative as Record<string, unknown>;
    const route = {
      gif: { filename: "animation.gif", contentType: "image/gif", version: "gif-sanitize-preserve-animation-v1" },
      audio: { filename: "audio.mp3", contentType: "audio/mpeg", version: "ffmpeg-audio-transcode-v1" },
      video: { filename: "video.mp4", contentType: "video/mp4", version: "ffmpeg-video-transcode-v1" },
      document: { filename: "document.pdf", contentType: "application/pdf", version: "pdf-raster-flatten-v1" },
    } as const;
    const category = typeof d.category === "string" ? d.category as keyof typeof route : null;
    const expected = category ? route[category] : undefined;
    const parts = typeof d.path === "string" ? d.path.split("/") : [];
    if (!expected || parts.length !== 4 || parts[0] !== "processed" ||
        !/^[A-Za-z0-9_-]{1,128}$/.test(parts[1]) || parts[2] !== v.mediaId ||
        parts[3] !== expected.filename || d.contentType !== expected.contentType ||
        d.pipelineVersion !== expected.version ||
        typeof d.generation !== "string" || !/^[1-9][0-9]*$/.test(d.generation) ||
        typeof d.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(d.sha256) ||
        v.verdict !== "clean" || hasAnyPreview ||
        v.processingStatus !== ({
          gif: "safe_animation_derivative_ready",
          audio: "safe_audio_derivative_ready",
          video: "safe_video_derivative_ready",
          document: "safe_document_derivative_ready",
        } as const)[category]) return null;
    safeDerivative = {
      category, path: d.path as string, generation: d.generation as string,
      sha256: d.sha256 as string, contentType: d.contentType as ScannerSafeDerivative["contentType"],
      pipelineVersion: d.pipelineVersion as string,
    };
  }

  if (typeof v.mediaId !== "string" || !/^[0-9a-f-]{36}$/i.test(v.mediaId) ||
      v.provider !== expectedProvider ||
      !["clean", "malicious", "error"].includes(String(v.verdict)) ||
      typeof v.objectGeneration !== "string" || !/^\d+$/.test(v.objectGeneration) ||
      typeof v.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(v.sha256) ||
      !Number.isSafeInteger(v.scannedAtMs) ||
      Math.abs(nowMs - Number(v.scannedAtMs)) > 10 * 60 * 1000 ||
      v.scanEngine !== "ClamAV" ||
      typeof v.engineVersion !== "string" || !/^\d+\.\d+\.\d+$/.test(v.engineVersion) ||
      typeof v.signatureDatabaseVersion !== "string" || !/^\d{1,8}$/.test(v.signatureDatabaseVersion) ||
      !Number.isSafeInteger(v.signatureDatabaseAgeMs) ||
      Number(v.signatureDatabaseAgeMs) < 0 ||
      Number(v.signatureDatabaseAgeMs) > 36 * 60 * 60 * 1000 ||
      (hasAnyPreview && (!hasAllPreview || safeDerivative !== undefined)) ||
      (hasAllPreview && (
        !previewPathValid ||
        typeof v.safePreviewGeneration !== "string" || !/^\d+$/.test(v.safePreviewGeneration) ||
        typeof v.safePreviewSha256 !== "string" || !/^[a-f0-9]{64}$/.test(v.safePreviewSha256) ||
        v.safePreviewContentType !== "image/webp" || v.verdict !== "clean"
      )) ||
      (v.verdict !== "clean" && (hasAnyPreview || safeDerivative !== undefined))) return null;
  return v as unknown as ScannerVerdictPayload;
}
