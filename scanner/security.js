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
    "image/jpeg", "image/png", "image/webp", "video/mp4",
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

module.exports = { equalSecret, validateScanRequest };
