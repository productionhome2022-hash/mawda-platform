export type OwnerChatReviewRequest = {
  chatId: string;
  reason: string;
  limit: number;
};

/**
 * Validate a narrowly scoped, reason-bound owner request to review a
 * one-to-one conversation. Authorization and MFA are enforced separately
 * by the callable before this policy is used.
 */
export function validateOwnerChatReviewRequest(
  input: Record<string, unknown>,
): OwnerChatReviewRequest {
  const chatId = input.chatId;
  const reason = typeof input.reason === "string" ? input.reason.trim() : "";
  const requestedLimit = input.limit === undefined ? 50 : input.limit;

  if (typeof chatId !== "string" || !/^[a-f0-9]{64}$/.test(chatId)) {
    throw new Error("INVALID_CHAT_ID");
  }
  if (reason.length < 12 || reason.length > 500) {
    throw new Error("REVIEW_REASON_REQUIRED");
  }
  if (
    typeof requestedLimit !== "number" ||
    !Number.isSafeInteger(requestedLimit) ||
    requestedLimit < 1 ||
    requestedLimit > 50
  ) {
    throw new Error("INVALID_PAGE_SIZE");
  }

  return { chatId, reason, limit: requestedLimit };
}
