export type CallMode = "audio" | "video";
export type CallScope = "direct" | "room";
export type CallStatus = "ringing" | "accepted" | "rejected" | "cancelled" | "ended" | "missed";

export interface CallRequest {
  callId: string;
  scope: CallScope;
  targetId: string;
  mode: CallMode;
}

export function validateCallRequest(value: unknown): CallRequest {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("INVALID_CALL_REQUEST");
  }
  const input = value as Record<string, unknown>;
  if (typeof input.callId !== "string" || !/^[A-Za-z0-9_-]{16,80}$/.test(input.callId) ||
      (input.scope !== "direct" && input.scope !== "room") ||
      typeof input.targetId !== "string" || !/^[A-Za-z0-9_-]{3,128}$/.test(input.targetId) ||
      (input.mode !== "audio" && input.mode !== "video")) {
    throw new Error("INVALID_CALL_REQUEST");
  }
  return {
    callId: input.callId,
    scope: input.scope,
    targetId: input.targetId,
    mode: input.mode,
  };
}

export function canTransitionCall(status: CallStatus, next: CallStatus, actorUid: string,
  callerUid: string, participantUids: readonly string[]): boolean {
  if (!participantUids.includes(actorUid)) return false;
  if (status === "ringing") {
    if (next === "accepted" || next === "rejected") return actorUid !== callerUid;
    if (next === "cancelled") return actorUid === callerUid;
    if (next === "missed") return true;
    return false;
  }
  if (status === "accepted") return next === "ended";
  return false;
}

export function validateCallSignal(value: unknown): {
  kind: "offer" | "answer" | "ice";
  payload: string;
  sequence: number;
} {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("INVALID_CALL_SIGNAL");
  }
  const input = value as Record<string, unknown>;
  if (!["offer", "answer", "ice"].includes(String(input.kind)) ||
      typeof input.payload !== "string" || input.payload.length < 1 ||
      input.payload.length > 12000 ||
      !Number.isSafeInteger(input.sequence) || (input.sequence as number) < 0) {
    throw new Error("INVALID_CALL_SIGNAL");
  }
  let decoded: unknown;
  try { decoded = JSON.parse(input.payload); } catch { throw new Error("INVALID_CALL_SIGNAL"); }
  if (!decoded || typeof decoded !== "object" || Array.isArray(decoded)) {
    throw new Error("INVALID_CALL_SIGNAL");
  }
  return {
    kind: input.kind as "offer" | "answer" | "ice",
    payload: input.payload,
    sequence: input.sequence as number,
  };
}

export const CALL_RING_TIMEOUT_MS = 45_000;
export const CALL_SIGNAL_MAX_AGE_MS = 2 * 60_000;
export const CALL_SIGNAL_MAX_PER_CALLER = 256;
