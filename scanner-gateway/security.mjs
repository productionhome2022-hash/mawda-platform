import { timingSafeEqual } from "node:crypto";

export function constantTimeBearerMatch(suppliedHeader, expectedToken) {
  if (typeof suppliedHeader !== "string" || typeof expectedToken !== "string" || expectedToken.length < 32) return false;
  const match = /^Bearer ([A-Za-z0-9._~-]+)$/.exec(suppliedHeader);
  if (!match) return false;
  const supplied = Buffer.from(match[1]);
  const expected = Buffer.from(expectedToken);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}
export function parseAllowedHosts(value) {
  return new Set(String(value ?? "").split(",").map((host) => host.trim().toLowerCase()).filter(Boolean));
}
export function validateScanRequest(value, { storageHosts, callbackHosts }) {
  if (!value || typeof value !== "object") return null;
  const v = value;
  if (typeof v.mediaId !== "string" || !/^[0-9a-f-]{36}$/i.test(v.mediaId) ||
      typeof v.objectPath !== "string" || !/^quarantine\/[A-Za-z0-9_-]{1,128}\/[0-9a-f-]{36}$/i.test(v.objectPath) ||
      !v.objectPath.endsWith(v.mediaId) || typeof v.objectGeneration !== "string" ||
      !/^\d+$/.test(v.objectGeneration) || typeof v.provider !== "string" ||
      !/^[a-z0-9-]{3,80}$/.test(v.provider)) return null;
  let downloadUrl; let callbackUrl;
  try { downloadUrl = new URL(v.downloadUrl); callbackUrl = new URL(v.callbackUrl); } catch { return null; }
  if (downloadUrl.protocol !== "https:" || !storageHosts.has(downloadUrl.hostname.toLowerCase()) ||
      callbackUrl.protocol !== "https:" || !callbackHosts.has(callbackUrl.hostname.toLowerCase()) ||
      downloadUrl.username || downloadUrl.password || callbackUrl.username || callbackUrl.password ||
      downloadUrl.searchParams.get("generation") !== v.objectGeneration) return null;
  if (!decodeURIComponent(downloadUrl.pathname).endsWith("/" + v.objectPath)) return null;
  return { mediaId: v.mediaId, objectPath: v.objectPath, objectGeneration: v.objectGeneration,
    provider: v.provider, downloadUrl: downloadUrl.toString(), callbackUrl: callbackUrl.toString() };
}
export function classifyClamDResponse(responseText) {
  const value = String(responseText ?? "").trim();
  if (/^stream: OK\.?$/i.test(value)) return "clean";
  if (/^stream: .+ FOUND$/i.test(value)) return "malicious";
  throw new Error("ClamAV did not return a definitive verdict.");
}
