const MAX_GROUP_CALL_PARTICIPANTS = 5;

export type GroupCallCoinShare = {
  uid: string;
  amount: number;
};

/**
 * Split a whole-coin group-call price into integer wallet debits.
 * Every non-initiator pays the floor share; the initiator pays the exact
 * remaining balance, absorbing all fractional remainder. This guarantees
 * that the ledger sum equals totalAmount and no wallet stores fractions.
 */
export function calculateGroupCallCoinShares(
  totalAmount: number,
  participantUids: readonly string[],
  initiatorUid: string,
): GroupCallCoinShare[] {
  if (!Number.isSafeInteger(totalAmount) || totalAmount <= 0) {
    throw new Error("INVALID_GROUP_CALL_TOTAL");
  }
  if (typeof initiatorUid !== "string" || initiatorUid.trim().length < 1 ||
      initiatorUid.length > 128) {
    throw new Error("INVALID_GROUP_CALL_INITIATOR");
  }
  if (!Array.isArray(participantUids) || participantUids.length < 1 ||
      participantUids.some((uid) => typeof uid !== "string" || uid.trim().length < 1 ||
        uid.length > 128) || new Set(participantUids).size !== participantUids.length ||
      !participantUids.includes(initiatorUid)) {
    throw new Error("INVALID_GROUP_CALL_PARTICIPANTS");
  }
  if (participantUids.length > MAX_GROUP_CALL_PARTICIPANTS) {
    throw new Error("GROUP_CALL_PARTICIPANT_LIMIT_EXCEEDED");
  }
  if (participantUids.length > totalAmount) {
    throw new Error("GROUP_CALL_TOTAL_BELOW_MINIMUM_SHARE");
  }

  const baseShare = Math.floor(totalAmount / participantUids.length);
  const initiatorShare = totalAmount - baseShare * (participantUids.length - 1);
  return participantUids.map((uid) => ({
    uid,
    amount: uid === initiatorUid ? initiatorShare : baseShare,
  })).sort((left, right) => left.uid.localeCompare(right.uid));
}
