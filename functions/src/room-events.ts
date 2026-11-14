export type RoomEventType = "announcement" | "audio_stream" | "video_stream" | "watch_party";
export type RoomEventStatus = "scheduled" | "live" | "completed" | "cancelled";

const ALLOWED_AUDIO_HOSTS = new Set([
  "soundcloud.com", "www.soundcloud.com", "mixcloud.com", "www.mixcloud.com",
  "spotify.com", "open.spotify.com", "youtube.com", "www.youtube.com", "youtu.be",
  "twitch.tv", "www.twitch.tv",
]);
const ALLOWED_VIDEO_HOSTS = new Set([
  "youtube.com", "www.youtube.com", "youtu.be", "twitch.tv", "www.twitch.tv",
  "vimeo.com", "www.vimeo.com", "tiktok.com", "www.tiktok.com",
  "facebook.com", "www.facebook.com",
]);

export type NormalizedRoomEventInput = {
  title: string;
  description: string;
  eventType: RoomEventType;
  startsAtMs: number;
  durationMinutes: number;
  streamUrl: string | null;
};

export function normalizeRoomEventInput(
  input: Record<string, unknown>,
  nowMs = Date.now(),
): NormalizedRoomEventInput {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const description = typeof input.description === "string" ? input.description.trim() : "";
  const eventType = input.eventType;
  const startsAtMs = input.startsAtMs;
  const durationMinutes = input.durationMinutes ?? 60;
  const streamUrlRaw = typeof input.streamUrl === "string" ? input.streamUrl.trim() : "";

  if (title.length < 3 || title.length > 80 || description.length > 500) {
    throw new Error("INVALID_ROOM_EVENT_TEXT");
  }
  if (!["announcement", "audio_stream", "video_stream", "watch_party"].includes(String(eventType))) {
    throw new Error("INVALID_ROOM_EVENT_TYPE");
  }
  if (!Number.isSafeInteger(startsAtMs) ||
      (startsAtMs as number) < nowMs + 5 * 60 * 1000 ||
      (startsAtMs as number) > nowMs + 90 * 24 * 60 * 60 * 1000) {
    throw new Error("INVALID_ROOM_EVENT_START");
  }
  if (!Number.isSafeInteger(durationMinutes) || (durationMinutes as number) < 10 ||
      (durationMinutes as number) > 240) {
    throw new Error("INVALID_ROOM_EVENT_DURATION");
  }

  let streamUrl: string | null = null;
  if (streamUrlRaw) {
    let parsed: URL;
    try {
      parsed = new URL(streamUrlRaw);
    } catch {
      throw new Error("INVALID_ROOM_EVENT_STREAM_URL");
    }
    if (parsed.protocol !== "https:" || parsed.username || parsed.password ||
        parsed.port || parsed.hostname.includes("localhost") ||
        parsed.hostname.startsWith("127.") || parsed.hostname.startsWith("192.168.") ||
        parsed.hostname.startsWith("10.")) {
      throw new Error("INVALID_ROOM_EVENT_STREAM_URL");
    }
    const allowedHosts = eventType === "audio_stream" ? ALLOWED_AUDIO_HOSTS : ALLOWED_VIDEO_HOSTS;
    if (eventType === "announcement" || !allowedHosts.has(parsed.hostname.toLowerCase())) {
      throw new Error("ROOM_EVENT_STREAM_HOST_NOT_ALLOWED");
    }
    streamUrl = parsed.toString();
  } else if (eventType === "audio_stream" || eventType === "video_stream" || eventType === "watch_party") {
    throw new Error("ROOM_EVENT_STREAM_URL_REQUIRED");
  }

  return {
    title,
    description,
    eventType: eventType as RoomEventType,
    startsAtMs: startsAtMs as number,
    durationMinutes: durationMinutes as number,
    streamUrl,
  };
}

export function nextRoomEventStatus(
  current: unknown,
  next: unknown,
): RoomEventStatus {
  const allowed: Record<string, RoomEventStatus[]> = {
    scheduled: ["live", "cancelled"],
    live: ["completed"],
    completed: [],
    cancelled: [],
  };
  if (typeof current !== "string" || typeof next !== "string" ||
      !allowed[current]?.includes(next as RoomEventStatus)) {
    throw new Error("INVALID_ROOM_EVENT_TRANSITION");
  }
  return next as RoomEventStatus;
}
