import { createHash } from "node:crypto";

export type GroupCallCoinShare = {
  uid: string;
  amount: number;
};

/**
 * Split one whole-coin billing unit across the members connected in that
 * interval. Any remainder is assigned by a stable hash rank so retries and
 * request ordering cannot change the allocation. Use a distinct, immutable
 * allocationKey for each billable interval (for example callId + intervalId).
 */
export function calculateGroupCallCoinShares(
  totalAmount: number,
  participantUids: readonly string[],
  allocationKey: string,
): GroupCallCoinShare[] {
  if (!Number.isSafeInteger(totalAmount) || totalAmount <= 0) {
    throw new Error("INVALID_GROUP_CALL_TOTAL");
  }
  if (typeof allocationKey !== "string" || allocationKey.length < 1 ||
      allocationKey.length > 200) {
    throw new Error("INVALID_GROUP_CALL_ALLOCATION_KEY");
  }
  if (!Array.isArray(participantUids) || participantUids.length < 1 ||
      participantUids.some((uid) => typeof uid !== "string" || uid.trim().length < 1 ||
        uid.length > 128) || new Set(participantUids).size !== participantUids.length) {
    throw new Error("INVALID_GROUP_CALL_PARTICIPANTS");
  }
  if (participantUids.length > totalAmount) {
    throw new Error("GROUP_CALL_TOTAL_BELOW_MINIMUM_SHARE");
  }

  const baseShare = Math.floor(totalAmount / participantUids.length);
  const remainder = totalAmount % participantUids.length;
  const ranked = participantUids.map((uid) => ({
    uid,
    rank: createHash("sha256").update(allocationKey).update(":").update(uid).digest("hex"),
  })).sort((left, right) => left.rank.localeCompare(right.rank) || left.uid.localeCompare(right.uid));

  const bonusUids = new Set(ranked.slice(0, remainder).map((item) => item.uid));
  return participantUids.map((uid) => ({
    uid,
    amount: baseShare + (bonusUids.has(uid) ? 1 : 0),
  })).sort((left, right) => left.uid.localeCompare(right.uid));
}
