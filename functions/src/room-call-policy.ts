type TimestampLike = { toMillis?: unknown };

function timestampMillis(value: unknown): number | null {
  if (value === null || typeof value !== "object" ||
      typeof (value as TimestampLike).toMillis !== "function") return null;
  try {
    const result = (value as { toMillis: () => number }).toMillis();
    return Number.isSafeInteger(result) && result >= 0 ? result : null;
  } catch {
    return null;
  }
}

/**
 * Group-call eligibility follows the approved product boundary: active private
 * rented rooms only, backed by the exact active rental record. Both expiries
 * are checked because room and rental lifecycle transitions can diverge.
 */
export function isActiveRentedPrivateRoom(
  roomInput: unknown,
  rentalInput: unknown,
  nowMs = Date.now(),
): boolean {
  if (!Number.isSafeInteger(nowMs) || nowMs < 0 ||
      roomInput === null || typeof roomInput !== "object" || Array.isArray(roomInput) ||
      rentalInput === null || typeof rentalInput !== "object" || Array.isArray(rentalInput)) {
    return false;
  }
  const room = roomInput as Record<string, unknown>;
  const rental = rentalInput as Record<string, unknown>;
  const roomExpiry = timestampMillis(room.expiresAt);
  const rentalExpiry = timestampMillis(rental.expiresAt);
  return room.status === "active" &&
    room.kind === "private" &&
    room.isRented === true &&
    typeof room.roomId === "string" && room.roomId.length > 0 &&
    typeof room.rentalId === "string" && room.rentalId.length > 0 &&
    typeof room.ownerUid === "string" && room.ownerUid.length > 0 &&
    rental.status === "active" &&
    rental.roomId === room.roomId &&
    rental.ownerUid === room.ownerUid &&
    rental.rentalId === room.rentalId &&
    roomExpiry !== null && roomExpiry > nowMs &&
    rentalExpiry !== null && rentalExpiry > nowMs;
}


/**
 * Room membership must be re-read in the call-creation transaction. A preflight
 * membership snapshot can become stale while the call is being created.
 */
export function areRoomCallParticipantsMembers(memberSnapshots: unknown): boolean {
  return Array.isArray(memberSnapshots) && memberSnapshots.length >= 2 &&
    memberSnapshots.every((snapshot) => snapshot !== null &&
      typeof snapshot === "object" && !Array.isArray(snapshot) &&
      (snapshot as Record<string, unknown>).exists === true);
}

 
/**
 * Direct-call relationship checks are repeated inside the call-creation
 * transaction so a changed chat membership, age class, or block cannot race
 * the preflight reads.
 */
export function areDirectCallParticipantsEligible(
  callerUid: unknown,
  peerUid: unknown,
  participantUids: unknown,
  callerInput: unknown,
  peerInput: unknown,
): boolean {
  if (typeof callerUid !== "string" || callerUid.length < 1 ||
      typeof peerUid !== "string" || peerUid.length < 1 || callerUid === peerUid ||
      !Array.isArray(participantUids) || participantUids.length !== 2 ||
      new Set(participantUids).size !== 2 ||
      !participantUids.includes(callerUid) || !participantUids.includes(peerUid) ||
      callerInput === null || typeof callerInput !== "object" || Array.isArray(callerInput) ||
      peerInput === null || typeof peerInput !== "object" || Array.isArray(peerInput)) {
    return false;
  }
  const caller = callerInput as Record<string, unknown>;
  const peer = peerInput as Record<string, unknown>;
  if (!Number.isSafeInteger(caller.age) || !Number.isSafeInteger(peer.age) ||
      (((caller.age as number) < 18) !== ((peer.age as number) < 18))) {
    return false;
  }
  const callerBlocks = caller.blockedUids;
  const peerBlocks = peer.blockedUids;
  if ((Array.isArray(callerBlocks) && callerBlocks.includes(peerUid)) ||
      (Array.isArray(peerBlocks) && peerBlocks.includes(callerUid))) {
    return false;
  }
  return true;
}


/**
 * Audio group calls follow the room's configured capacity. Video group calls
 * are capped at four participants total, including the initiator.
 */
export function roomCallParticipantLimit(mode: unknown, roomCapacity: unknown): number | null {
  if ((mode !== "audio" && mode !== "video") ||
      !Number.isSafeInteger(roomCapacity) ||
      (roomCapacity as number) < 5 || (roomCapacity as number) > 1000) {
    return null;
  }
  return mode === "video" ? Math.min(roomCapacity as number, 4) : roomCapacity as number;
}
