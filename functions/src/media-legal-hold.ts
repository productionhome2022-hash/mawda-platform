export type MediaLegalHoldInput = {
  mediaId: string;
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

export function validateMediaLegalHoldInput(
  input: Record<string, unknown>,
  nowMs = Date.now(),
): MediaLegalHoldInput {
  const mediaId = input.mediaId;
  const authority = input.authority;
  const legalBasis = input.legalBasis;
  const reference = input.reference;
  const startsAtMs = input.startsAtMs === undefined ? nowMs : input.startsAtMs;
  const reviewAtMs = input.reviewAtMs;
  const endsAtMs = input.endsAtMs;
  if (typeof mediaId !== "string" || !/^[0-9a-f-]{36}$/i.test(mediaId)) {
    throw new Error("INVALID_MEDIA_HOLD_TARGET");
  }
  if (!boundedText(authority, 3, 120)) throw new Error("INVALID_MEDIA_HOLD_AUTHORITY");
  if (!boundedText(legalBasis, 10, 1000)) throw new Error("INVALID_MEDIA_HOLD_BASIS");
  if (!boundedText(reference, 3, 200)) throw new Error("INVALID_MEDIA_HOLD_REFERENCE");
  if (!Number.isSafeInteger(nowMs) || nowMs < 0 ||
      !Number.isSafeInteger(startsAtMs) || (startsAtMs as number) > nowMs ||
      !Number.isSafeInteger(reviewAtMs) || (reviewAtMs as number) <= (startsAtMs as number) ||
      !Number.isSafeInteger(endsAtMs) || (endsAtMs as number) <= (reviewAtMs as number)) {
    throw new Error("INVALID_MEDIA_HOLD_DATES");
  }
  return {
    mediaId, authority: authority.trim(), legalBasis: legalBasis.trim(),
    reference: reference.trim(), startsAtMs: startsAtMs as number,
    reviewAtMs: reviewAtMs as number, endsAtMs: endsAtMs as number,
  };
}
