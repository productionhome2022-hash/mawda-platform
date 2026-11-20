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
