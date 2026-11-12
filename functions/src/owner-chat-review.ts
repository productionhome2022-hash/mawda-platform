export type OwnerChatReviewRequest = {
  chatId: string;
  reason: string | null;
  mode: "silent";
  limit: number;
};

/**
 * Validate a narrowly scoped owner request to review a one-to-one
 * conversation. A reason is optional audit context, never an access
 * prerequisite. Authorization and MFA are enforced by the callable.
 */
export function validateOwnerChatReviewRequest(
  input: Record<string, unknown>,
): OwnerChatReviewRequest {
  const chatId = input.chatId;
  const rawReason = typeof input.reason === "string" ? input.reason.trim() : "";
  const requestedLimit = input.limit === undefined ? 50 : input.limit;

  if (typeof chatId !== "string" || !/^[a-f0-9]{64}$/.test(chatId)) {
    throw new Error("INVALID_CHAT_ID");
  }
  if (rawReason.length > 500) {
    throw new Error("INVALID_REVIEW_REASON");
  }
  if (
    typeof requestedLimit !== "number" ||
    !Number.isSafeInteger(requestedLimit) ||
    requestedLimit < 1 ||
    requestedLimit > 50
  ) {
    throw new Error("INVALID_PAGE_SIZE");
  }

  return { chatId, reason: rawReason || null, mode: "silent", limit: requestedLimit };
}
