export type SafeDerivativeCategory = "gif" | "audio" | "video" | "document";

export type SafeDerivativeContract = {
  filename: string;
  contentType: string;
  pipeline: string;
  maxBytes: number;
};

const SAFE_DERIVATIVE_CONTRACTS: Readonly<Record<SafeDerivativeCategory, SafeDerivativeContract>> = {
  gif: {
    filename: "animation.gif",
    contentType: "image/gif",
    pipeline: "gif-sanitize-preserve-animation-v1",
    maxBytes: 3 * 1024 * 1024,
  },
  audio: {
    filename: "audio.mp3",
    contentType: "audio/mpeg",
    pipeline: "ffmpeg-audio-purpose-limit-v2",
    maxBytes: 5 * 1024 * 1024,
  },
  video: {
    filename: "video.mp4",
    contentType: "video/mp4",
    pipeline: "ffmpeg-video-transcode-v1",
    maxBytes: 15 * 1024 * 1024,
  },
  document: {
    filename: "document.pdf",
    contentType: "application/pdf",
    pipeline: "pdf-raster-flatten-v1",
    maxBytes: 20 * 1024 * 1024,
  },
};

export function expectedSafeDerivativeContract(
  category: string,
): SafeDerivativeContract | null {
  if (!Object.prototype.hasOwnProperty.call(SAFE_DERIVATIVE_CONTRACTS, category)) return null;
  return SAFE_DERIVATIVE_CONTRACTS[category as SafeDerivativeCategory];
}

export function safeDerivativePurposeAllowed(
  category: SafeDerivativeCategory,
  purpose: string,
  uploaderRole: string,
): boolean {
  if (category === "audio") return purpose === "chat" || purpose === "room" || purpose === "biometric";
  if (category === "video") {
    return purpose === "chat" || purpose === "room" || purpose === "biometric" ||
      (purpose === "advertisement" && uploaderRole === "platform_owner");
  }
  if (category === "document") {
    return (purpose === "chat" || purpose === "room") && uploaderRole === "platform_owner";
  }
  if (purpose === "sticker") return category === "gif" && uploaderRole === "platform_owner";
  if (purpose === "advertisement") return uploaderRole === "platform_owner";
  return ["chat", "room", "profile_album", "avatar_cover", "story"].includes(purpose);
}
