const { timingSafeEqual } = require("node:crypto");

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const GENERATION = /^\d{1,24}$/;

function equalSecret(actual, expected) {
  if (typeof actual !== "string" || typeof expected !== "string") return false;
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && a.length >= 32 && timingSafeEqual(a, b);
}

function validateScanRequest(value, provider, bucketName) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const v = value;
  if (typeof v.mediaId !== "string" || !UUID.test(v.mediaId) ||
      typeof v.objectPath !== "string" ||
      !/^quarantine\/[A-Za-z0-9_-]{1,128}\/[0-9a-f-]{36}$/i.test(v.objectPath) ||
      !v.objectPath.endsWith("/" + v.mediaId) ||
      typeof v.objectGeneration !== "string" || !GENERATION.test(v.objectGeneration) ||
      typeof v.downloadUrl !== "string" ||
      typeof v.provider !== "string" || v.provider !== provider ||
      typeof v.contentType !== "string") return null;

  let url;
  try { url = new URL(v.downloadUrl); } catch { return null; }
  const allowedHosts = new Set(["storage.googleapis.com", `${bucketName}.storage.googleapis.com`]);
  let decodedPath;
  try { decodedPath = decodeURIComponent(url.pathname); } catch { return null; }
  const expectedPath = url.hostname === "storage.googleapis.com"
    ? `/${bucketName}/${v.objectPath}`
    : `/${v.objectPath}`;
  const allowedTypes = new Set([
    "image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4",
    "audio/mpeg", "audio/mp4", "audio/ogg", "audio/wav", "application/pdf",
  ]);
  if (url.protocol !== "https:" || !allowedHosts.has(url.hostname) ||
      url.username || url.password || url.hash ||
      decodedPath !== expectedPath ||
      url.searchParams.get("generation") !== v.objectGeneration ||
      !allowedTypes.has(v.contentType)) {
    return null;
  }
  return {
    mediaId: v.mediaId,
    objectPath: v.objectPath,
    objectGeneration: v.objectGeneration,
    downloadUrl: url.toString(),
    provider: v.provider,
    contentType: v.contentType,
  };
}

function isSafeDerivativeMetadata(metadata, expected) {
  const custom = metadata && metadata.metadata;
  const size = Number(metadata && metadata.size);
  return Boolean(metadata && custom &&
    metadata.contentType === "image/webp" &&
    Number.isSafeInteger(size) && size > 0 && size <= 2 * 1024 * 1024 &&
    custom.mediaId === expected.mediaId &&
    custom.sourceGeneration === expected.objectGeneration &&
    custom.sourceSha256 === expected.sourceSha256 &&
    custom.scannerProvider === expected.provider &&
    custom.processing === "sharp-decode-reencode-v1");
}

function sanitizeScannerError(error) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const fixed = new Set([
    "REQUEST_TOO_LARGE", "SOURCE_EXCEEDS_SCAN_LIMIT", "EMPTY_SOURCE_OBJECT",
    "CLAMAV_SCAN_INCOMPLETE", "SAFE_DERIVATIVE_SIZE_INVALID",
    "GIF_COMPLEXITY_EXCEEDS_SAFE_LIMIT", "EXISTING_SAFE_DERIVATIVE_PROVENANCE_MISMATCH",
    "SAFE_DERIVATIVE_METADATA_MISMATCH", "SCANNER_CALLBACK_NOT_CONFIGURED",
  ]);
  if (fixed.has(message) || /^SOURCE_DOWNLOAD_HTTP_[0-9]{3}$/.test(message) ||
      /^SCANNER_CALLBACK_HTTP_[0-9]{3}$/.test(message)) return message;
  return "SCAN_FAILED";
}

module.exports = {
  equalSecret, validateScanRequest, isSafeDerivativeMetadata, sanitizeScannerError,
};
