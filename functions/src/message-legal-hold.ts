export type MessageLegalHoldInput = {
  messagePath: string;
  authority: string;
  legalBasis: string;
  reference: string;
  startsAtMs: number;
  reviewAtMs: number;
  endsAtMs: number;
};

function boundedText(value: unknown, min: number, max: number): value is string {
  return typeof value === "string" && value.trim().length >= min &&
    value.length <= max && !/[\u0000-\u001f]/.test(value);
}

export function validateMessageLegalHoldInput(
  input: Record<string, unknown>,
  nowMs = Date.now(),
): MessageLegalHoldInput {
  const messagePath = typeof input.messagePath === "string" ? input.messagePath.trim() : "";
  const parts = messagePath.split("/");
  const direct = parts.length === 4 && parts[0] === "directChats" &&
    /^[a-f0-9]{64}$/.test(parts[1]) && parts[2] === "messages" &&
    /^[a-f0-9]{64}$/.test(parts[3]);
  const room = parts.length === 4 && parts[0] === "rooms" &&
    /^[A-Za-z0-9_-]{1,128}$/.test(parts[1]) && parts[2] === "messages" &&
    /^[a-f0-9]{64}$/.test(parts[3]);
  if (!direct && !room) throw new Error("INVALID_MESSAGE_HOLD_PATH");

  const authority = input.authority;
  const legalBasis = input.legalBasis;
  const reference = input.reference;
  const startsAtMs = input.startsAtMs === undefined ? nowMs : input.startsAtMs;
  const reviewAtMs = input.reviewAtMs;
  const endsAtMs = input.endsAtMs;
  if (!boundedText(authority, 3, 120)) throw new Error("INVALID_MESSAGE_HOLD_AUTHORITY");
  if (!boundedText(legalBasis, 10, 1000)) throw new Error("INVALID_MESSAGE_HOLD_BASIS");
  if (!boundedText(reference, 3, 200)) throw new Error("INVALID_MESSAGE_HOLD_REFERENCE");
  if (!Number.isSafeInteger(nowMs) || nowMs < 0 ||
      !Number.isSafeInteger(startsAtMs) || (startsAtMs as number) > nowMs ||
      !Number.isSafeInteger(reviewAtMs) || (reviewAtMs as number) <= (startsAtMs as number) ||
      !Number.isSafeInteger(endsAtMs) || (endsAtMs as number) <= (reviewAtMs as number)) {
    throw new Error("INVALID_MESSAGE_HOLD_DATES");
  }
  return {
    messagePath,
    authority: authority.trim(),
    legalBasis: legalBasis.trim(),
    reference: reference.trim(),
    startsAtMs: startsAtMs as number,
    reviewAtMs: reviewAtMs as number,
    endsAtMs: endsAtMs as number,
  };
}
