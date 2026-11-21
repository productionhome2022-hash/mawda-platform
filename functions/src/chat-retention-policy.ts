export const TEMPORARY_CHAT_INACTIVITY_MS = 4 * 60 * 60 * 1000;
export const NORMAL_CHAT_TEXT_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
export const IMPORTANT_CHAT_TEXT_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

export const CHAT_RETENTION_MODES = ["temporary", "normal", "important"] as const;
export type ChatRetentionMode = typeof CHAT_RETENTION_MODES[number];

/** Old conversations predate mode selection and remain on the approved normal policy. */
export function isChatRetentionMode(value: unknown): value is ChatRetentionMode {
  return typeof value === "string" &&
    (CHAT_RETENTION_MODES as readonly string[]).includes(value);
}

/**
 * A mode is immutable once stored on a conversation. A missing legacy value
 * resolves to normal; an invalid persisted value fails closed.
 */
export function resolveChatRetentionMode(
  persistedMode: unknown,
  requestedMode?: unknown,
): ChatRetentionMode {
  if (persistedMode !== undefined && persistedMode !== null) {
    if (!isChatRetentionMode(persistedMode)) throw new Error("CHAT_RETENTION_MODE_CORRUPT");
    return persistedMode;
  }
  if (requestedMode === undefined || requestedMode === null) return "normal";
  if (!isChatRetentionMode(requestedMode)) throw new Error("CHAT_RETENTION_MODE_INVALID");
  return requestedMode;
}

export function chatTextRetentionMs(mode: ChatRetentionMode): number | null {
  if (mode === "temporary") return null;
  return mode === "important"
    ? IMPORTANT_CHAT_TEXT_RETENTION_MS
    : NORMAL_CHAT_TEXT_RETENTION_MS;
}

export function chatTextExpiryAtMs(
  createdAtMs: number,
  mode: ChatRetentionMode,
): number | null {
  const lifetimeMs = chatTextRetentionMs(mode);
  if (lifetimeMs === null) return null;
  if (!Number.isSafeInteger(createdAtMs) || createdAtMs < 0) {
    throw new Error("INVALID_RETENTION_CLOCK");
  }
  return createdAtMs + lifetimeMs;
}

export function temporaryChatInactivityExpiryAtMs(lastActivityAtMs: number): number {
  if (!Number.isSafeInteger(lastActivityAtMs) || lastActivityAtMs < 0) {
    throw new Error("INVALID_RETENTION_CLOCK");
  }
  return lastActivityAtMs + TEMPORARY_CHAT_INACTIVITY_MS;
}

export function isTemporaryChatDeletionDue(
  mode: unknown,
  lastServerActivityAtMs: number,
  nowMs: number,
): boolean {
  if (mode !== "temporary") return false;
  if (!Number.isSafeInteger(nowMs) || nowMs < 0) throw new Error("INVALID_RETENTION_CLOCK");
  return temporaryChatInactivityExpiryAtMs(lastServerActivityAtMs) <= nowMs;
}

/** Text deletion never substitutes for the temporary chat's full-conversation sweep. */
export function isChatTextDeletionDue(
  createdAtMs: number,
  mode: ChatRetentionMode,
  nowMs: number,
): boolean {
  if (!Number.isSafeInteger(nowMs) || nowMs < 0) throw new Error("INVALID_RETENTION_CLOCK");
  const expiry = chatTextExpiryAtMs(createdAtMs, mode);
  return expiry !== null && expiry <= nowMs;
}

export function chatRetentionNotice(mode: ChatRetentionMode): string {
  switch (mode) {
    case "temporary":
      return "هذه محادثة مؤقتة: تُحذف المحادثة كاملة بعد أربع ساعات من آخر نشاط مسجل على خوادم مودة.";
    case "normal":
      return "سياسة المحادثة العادية: تُحذف الوسائط بعد أربع ساعات، والنصوص بعد سبعة أيام.";
    case "important":
      return "سياسة المحادثة المهمة: تُحذف الوسائط بعد أربع ساعات، والنصوص بعد ثلاثين يوماً.";
  }
}
