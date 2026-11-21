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
      input.payload.length > 65536 ||
      !Number.isSafeInteger(input.sequence) || (input.sequence as number) < 0) {
    throw new Error("INVALID_CALL_SIGNAL");
  }
  let decoded: unknown;
  try { decoded = JSON.parse(input.payload); } catch { throw new Error("INVALID_CALL_SIGNAL"); }
  if (!decoded || typeof decoded !== "object" || Array.isArray(decoded)) {
    throw new Error("INVALID_CALL_SIGNAL");
  }
  const body = decoded as Record<string, unknown>;
  if (input.kind === "offer" || input.kind === "answer") {
    const expectedType = input.kind;
    if (body.type !== expectedType || typeof body.sdp !== "string" ||
        body.sdp.length < 1 || body.sdp.length > 60000) {
      throw new Error("INVALID_CALL_SIGNAL");
    }
  } else if (typeof body.candidate !== "string" || body.candidate.length > 8192 ||
      (body.sdpMid !== undefined && body.sdpMid !== null && typeof body.sdpMid !== "string") ||
      (body.sdpMLineIndex !== undefined && body.sdpMLineIndex !== null &&
        (!Number.isSafeInteger(body.sdpMLineIndex) || (body.sdpMLineIndex as number) < 0))) {
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


/**
 * A caller occupies a call slot while ringing. Room invitees occupy a slot
 * only after acceptance. Rejected/departed members and terminal calls do not.
 */
export function isCallMemberBusyInSession(
  memberUid: string,
  session: {
    callerUid?: unknown;
    status?: unknown;
    acceptedUids?: unknown;
    rejectedUids?: unknown;
    leftUids?: unknown;
  },
): boolean {
  if (typeof memberUid !== "string" || memberUid.length === 0 ||
      !session || typeof session !== "object") return false;
  const status = session.status;
  if (status !== "ringing" && status !== "accepted") return false;
  const rejected = Array.isArray(session.rejectedUids) ? session.rejectedUids : [];
  const left = Array.isArray(session.leftUids) ? session.leftUids : [];
  if (rejected.includes(memberUid) || left.includes(memberUid)) return false;
  if (session.callerUid === memberUid) return true;
  if (status !== "accepted") return false;
  const accepted = Array.isArray(session.acceptedUids) ? session.acceptedUids : [];
  return accepted.includes(memberUid);
}
