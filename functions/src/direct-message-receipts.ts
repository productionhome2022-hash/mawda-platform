/** Returns true when a newly observed latest message can advance a member read cursor. */
export function shouldAdvanceReadReceipt(
  previousMessageCreatedAtMs: unknown,
  latestMessageCreatedAtMs: unknown,
): boolean {
  if (typeof latestMessageCreatedAtMs !== "number" ||
      !Number.isSafeInteger(latestMessageCreatedAtMs) ||
      latestMessageCreatedAtMs < 0) return false;
  if (previousMessageCreatedAtMs === null || previousMessageCreatedAtMs === undefined) {
    return true;
  }
  return typeof previousMessageCreatedAtMs === "number" &&
    Number.isSafeInteger(previousMessageCreatedAtMs) &&
    previousMessageCreatedAtMs >= 0 &&
    latestMessageCreatedAtMs >= previousMessageCreatedAtMs;
}

/** A message is read only when its server creation time is at or before the peer cursor. */
export function isMessageReadByPeer(
  messageCreatedAtMs: unknown,
  peerReadMessageCreatedAtMs: unknown,
): boolean {
  return typeof messageCreatedAtMs === "number" &&
    Number.isSafeInteger(messageCreatedAtMs) &&
    messageCreatedAtMs >= 0 &&
    typeof peerReadMessageCreatedAtMs === "number" &&
    Number.isSafeInteger(peerReadMessageCreatedAtMs) &&
    peerReadMessageCreatedAtMs >= 0 &&
    messageCreatedAtMs <= peerReadMessageCreatedAtMs;
}
