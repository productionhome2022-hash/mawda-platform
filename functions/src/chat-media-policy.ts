export type ChatMediaCategory = "image" | "gif" | "audio" | "video" | "document";
export type ChatMediaProcessor = "image-raster-v1" | "gif-animation-v1" | "audio-transcode-v1" | "video-transcode-v1" | "pdf-sanitize-v1";

export interface ChatMediaAssetForDelivery {
  mediaId: string;
  ownerUid: string;
  mediaPurpose: unknown;
  uploaderRole: unknown;
  mediaCategory: unknown;
  detectedContentType: unknown;
  status: unknown;
  processingStatus?: unknown;
  safePreviewPath?: unknown;
  safePreviewGeneration?: unknown;
  safePreviewSha256?: unknown;
  safeAnimationPath?: unknown;
  safeAnimationGeneration?: unknown;
  safeAnimationSha256?: unknown;
  safeAudioPath?: unknown;
  safeAudioGeneration?: unknown;
  safeAudioSha256?: unknown;
  safeVideoPath?: unknown;
  safeVideoGeneration?: unknown;
  safeVideoSha256?: unknown;
  safeDocumentPath?: unknown;
  safeDocumentGeneration?: unknown;
  safeDocumentSha256?: unknown;
  processingPipelineVersion?: unknown;
}

export interface ChatMediaDeliveryArtifact {
  category: ChatMediaCategory;
  processor: ChatMediaProcessor;
  objectPath: string;
  generation: string;
  sha256: string;
  contentType: string;
}

const PROCESSORS: Readonly<Record<string, {
  category: ChatMediaCategory;
  processor: ChatMediaProcessor;
  pathField: keyof ChatMediaAssetForDelivery;
  generationField: keyof ChatMediaAssetForDelivery;
  hashField: keyof ChatMediaAssetForDelivery;
  contentTypes: readonly string[];
  pipelineVersion: string;
}>> = {
  "image/jpeg": { category: "image", processor: "image-raster-v1", pathField: "safePreviewPath", generationField: "safePreviewGeneration", hashField: "safePreviewSha256", contentTypes: ["image/webp"], pipelineVersion: "sharp-decode-reencode-v1" },
  "image/png": { category: "image", processor: "image-raster-v1", pathField: "safePreviewPath", generationField: "safePreviewGeneration", hashField: "safePreviewSha256", contentTypes: ["image/webp"], pipelineVersion: "sharp-decode-reencode-v1" },
  "image/webp": { category: "image", processor: "image-raster-v1", pathField: "safePreviewPath", generationField: "safePreviewGeneration", hashField: "safePreviewSha256", contentTypes: ["image/webp"], pipelineVersion: "sharp-decode-reencode-v1" },
  "image/gif": { category: "gif", processor: "gif-animation-v1", pathField: "safeAnimationPath", generationField: "safeAnimationGeneration", hashField: "safeAnimationSha256", contentTypes: ["image/gif"], pipelineVersion: "gif-sanitize-preserve-animation-v1" },
  "audio/mpeg": { category: "audio", processor: "audio-transcode-v1", pathField: "safeAudioPath", generationField: "safeAudioGeneration", hashField: "safeAudioSha256", contentTypes: ["audio/mpeg", "audio/ogg"], pipelineVersion: "ffmpeg-audio-transcode-v1" },
  "audio/mp4": { category: "audio", processor: "audio-transcode-v1", pathField: "safeAudioPath", generationField: "safeAudioGeneration", hashField: "safeAudioSha256", contentTypes: ["audio/mpeg", "audio/ogg"], pipelineVersion: "ffmpeg-audio-transcode-v1" },
  "audio/ogg": { category: "audio", processor: "audio-transcode-v1", pathField: "safeAudioPath", generationField: "safeAudioGeneration", hashField: "safeAudioSha256", contentTypes: ["audio/mpeg", "audio/ogg"], pipelineVersion: "ffmpeg-audio-transcode-v1" },
  "audio/wav": { category: "audio", processor: "audio-transcode-v1", pathField: "safeAudioPath", generationField: "safeAudioGeneration", hashField: "safeAudioSha256", contentTypes: ["audio/mpeg", "audio/ogg"], pipelineVersion: "ffmpeg-audio-transcode-v1" },
  "video/mp4": { category: "video", processor: "video-transcode-v1", pathField: "safeVideoPath", generationField: "safeVideoGeneration", hashField: "safeVideoSha256", contentTypes: ["video/mp4"], pipelineVersion: "ffmpeg-video-transcode-v1" },
  "application/pdf": { category: "document", processor: "pdf-sanitize-v1", pathField: "safeDocumentPath", generationField: "safeDocumentGeneration", hashField: "safeDocumentSha256", contentTypes: ["application/pdf"], pipelineVersion: "pdf-raster-flatten-v1" },
};

function validSafePath(value: unknown, ownerUid: string, mediaId: string): value is string {
  if (typeof value !== "string" || !ownerUid || value.startsWith("/") || value.split("/").includes("..")) return false;
  return value.startsWith(`processed/${ownerUid}/${mediaId}/`);
}

/** Returns an isolated processor route; unknown types never fall back to a generic handler. */
export function chatMediaProcessorFor(contentType: string): ChatMediaProcessor | null {
  return PROCESSORS[contentType]?.processor ?? null;
}

/**
 * Resolve only a fully scanned AND safely transformed delivery artifact.
 * A malware-clean verdict alone is deliberately insufficient. The object
 * path, generation, hash and processor version must all be persisted.
 */
export function resolveChatMediaDeliveryArtifact(
  asset: ChatMediaAssetForDelivery,
  isVerifiedPlatformOwner: boolean,
): ChatMediaDeliveryArtifact | null {
  if (asset.mediaPurpose !== "chat" && asset.mediaPurpose !== "room") return null;
  if (asset.status !== "security_approved") return null;
  if (typeof asset.mediaId !== "string" || !/^[0-9a-f-]{36}$/i.test(asset.mediaId)) return null;
  if (typeof asset.detectedContentType !== "string") return null;
  const route = PROCESSORS[asset.detectedContentType];
  if (!route) return null;
  if (route.category === "document" && (!isVerifiedPlatformOwner || asset.uploaderRole !== "platform_owner")) return null;
  if (route.category !== "document" && asset.uploaderRole !== "member" && asset.uploaderRole !== "platform_owner") return null;
  const expectedProcessingStatus = route.category === "image" ? "safe_raster_derivative_ready" :
    route.category === "gif" ? "safe_animation_derivative_ready" :
      route.category === "audio" ? "safe_audio_derivative_ready" :
        route.category === "video" ? "safe_video_derivative_ready" : "safe_document_derivative_ready";
  if (asset.processingStatus !== expectedProcessingStatus) return null;
  if (asset.processingPipelineVersion !== route.pipelineVersion) return null;
  const path = asset[route.pathField];
  const generation = asset[route.generationField];
  const sha256 = asset[route.hashField];
  if (typeof asset.ownerUid !== "string" || !validSafePath(path, asset.ownerUid, asset.mediaId) ||
      typeof generation !== "string" || !/^[1-9][0-9]*$/.test(generation) ||
      typeof sha256 !== "string" || !/^[a-f0-9]{64}$/i.test(sha256)) return null;
  return {
    category: route.category,
    processor: route.processor,
    objectPath: path,
    generation,
    sha256,
    contentType: route.contentTypes[0],
  };
}

/** Role checks are repeated at attachment time; upload-time claims are not enough. */
export function chatMediaUploaderAllowed(
  asset: Pick<ChatMediaAssetForDelivery, "uploaderRole" | "detectedContentType">,
  isVerifiedPlatformOwner: boolean,
): boolean {
  if (typeof asset.detectedContentType !== "string" || !PROCESSORS[asset.detectedContentType]) return false;
  const isDocument = PROCESSORS[asset.detectedContentType].category === "document";
  if (isDocument) return isVerifiedPlatformOwner && asset.uploaderRole === "platform_owner";
  return asset.uploaderRole === "member" || (isVerifiedPlatformOwner && asset.uploaderRole === "platform_owner");
}
