import { isIP } from "node:net";

export type OwnerLiveStreamScope = "direct" | "room";
export type OwnerLiveStreamProvider = "youtube" | "facebook" | "instagram" | "tiktok" | "other";

const BLOCKED_SHORTENERS = new Set([
  "bit.ly", "t.co", "tinyurl.com", "goo.gl", "ow.ly", "buff.ly",
  "is.gd", "cutt.ly", "rebrand.ly", "lnkd.in", "shorturl.at",
]);
const BLOCKED_SUFFIXES = [".localhost", ".local", ".internal", ".test", ".invalid"];

function providerFor(host: string): OwnerLiveStreamProvider {
  const domain = host.toLowerCase().replace(/^www\./, "");
  if (domain === "youtube.com" || domain.endsWith(".youtube.com") ||
      domain === "youtu.be" || domain === "youtube-nocookie.com") return "youtube";
  if (domain === "facebook.com" || domain.endsWith(".facebook.com") || domain === "fb.watch") return "facebook";
  if (domain === "instagram.com" || domain.endsWith(".instagram.com")) return "instagram";
  if (domain === "tiktok.com" || domain.endsWith(".tiktok.com")) return "tiktok";
  return "other";
}

export function validateOwnerLiveStreamInput(value: unknown): {
  requestId: string; scope: OwnerLiveStreamScope; targetId: string;
  url: string; hostname: string; provider: OwnerLiveStreamProvider;
  title: string; description: string;
} {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("INVALID_LIVE_STREAM");
  const data = value as Record<string, unknown>;
  const allowed = ["requestId", "scope", "targetId", "url", "title", "description"];
  if (Object.keys(data).some((key) => !allowed.includes(key))) throw new Error("INVALID_LIVE_STREAM_FIELDS");
  if (typeof data.requestId !== "string" || !/^[A-Za-z0-9_-]{8,80}$/.test(data.requestId) ||
      (data.scope !== "direct" && data.scope !== "room") ||
      typeof data.targetId !== "string" || data.targetId.trim().length < 1 ||
      data.targetId.length > 128 || /[\u0000-\u001f\u007f]/.test(data.targetId) || typeof data.url !== "string" ||
      data.url.length < 10 || data.url.length > 2048 ||
      /[\u0000-\u0020\u007f\\<>"'{}|^]/.test(data.url)) {
    throw new Error("INVALID_LIVE_STREAM_FIELDS");
  }
  const title = typeof data.title === "string" ? data.title.trim() : "";
  const description = typeof data.description === "string" ? data.description.trim() : "";
  if (title.length > 120 || description.length > 500) throw new Error("INVALID_LIVE_STREAM_TEXT");
  let parsed: URL;
  try { parsed = new URL(data.url); }
  catch { throw new Error("INVALID_LIVE_STREAM_URL"); }
  const hostname = parsed.hostname.toLowerCase().replace(/\.$/, "");
  const bareHostname = hostname.replace(/^www\./, "");
  const isShortener = BLOCKED_SHORTENERS.has(bareHostname) ||
    [...BLOCKED_SHORTENERS].some((domain) => bareHostname.endsWith("." + domain));
  if (parsed.protocol !== "https:" || parsed.username || parsed.password ||
      (parsed.port !== "" && parsed.port !== "443") || !hostname ||
      isIP(hostname) !== 0 || hostname === "localhost" ||
      BLOCKED_SUFFIXES.some((suffix) => hostname.endsWith(suffix)) ||
      isShortener ||
      !/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(hostname)) {
    throw new Error("UNSAFE_LIVE_STREAM_URL");
  }
  return {
    requestId: data.requestId, scope: data.scope, targetId: data.targetId.trim(),
    url: parsed.toString(), hostname, provider: providerFor(hostname), title, description,
  };
}
