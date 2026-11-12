export type OwnerChatReviewRequest = {
  chatId: string;
  reason: string | null;
  mode: "silent";
  limit: number;
  pageToken: string | null;
};

export type OwnerConversationPageRequest = {
  memberUid: string;
  limit: number;
  pageToken: string | null;
};

function validatePageToken(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || value.length < 1 || value.length > 128 ||
      !/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new Error("INVALID_PAGE_TOKEN");
  }
  return value;
}

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

  return {
    chatId,
    reason: rawReason || null,
    mode: "silent",
    limit: requestedLimit,
    pageToken: validatePageToken(input.pageToken),
  };
}

/** Validate a bounded, member-scoped conversation metadata page. */
export function validateOwnerConversationPageRequest(
  input: Record<string, unknown>,
): OwnerConversationPageRequest {
  const memberUid = typeof input.memberUid === "string" ? input.memberUid.trim() : "";
  const requestedLimit = input.limit === undefined ? 50 : input.limit;
  if (!memberUid || memberUid.length > 128) {
    throw new Error("INVALID_MEMBER_UID");
  }
  if (typeof requestedLimit !== "number" || !Number.isSafeInteger(requestedLimit) ||
      requestedLimit < 1 || requestedLimit > 50) {
    throw new Error("INVALID_PAGE_SIZE");
  }
  return {
    memberUid,
    limit: requestedLimit,
    pageToken: validatePageToken(input.pageToken),
  };
}

export type OwnerChatParticipationMode =
  | "platform_admin"
  | "super_admin"
  | "anonymous";

export type OwnerChatParticipationRequest = {
  chatId: string;
  text: string;
  clientMessageId: string;
  mode: OwnerChatParticipationMode;
};

/** Validate the owner's explicitly labelled administrative message. */
export function validateOwnerChatParticipationRequest(
  input: Record<string, unknown>,
): OwnerChatParticipationRequest {
  const chatId = input.chatId;
  const text = typeof input.text === "string" ? input.text.trim() : "";
  const clientMessageId = input.clientMessageId;
  const mode = input.mode;
  if (typeof chatId !== "string" || !/^[a-f0-9]{64}$/.test(chatId)) {
    throw new Error("INVALID_CHAT_ID");
  }
  if (text.length < 1 || text.length > 4000) {
    throw new Error("INVALID_OWNER_MESSAGE_TEXT");
  }
  if (typeof clientMessageId !== "string" ||
      clientMessageId.length < 8 || clientMessageId.length > 80 ||
      !/^[A-Za-z0-9_-]+$/.test(clientMessageId)) {
    throw new Error("INVALID_OWNER_MESSAGE_ID");
  }
  if (mode !== "platform_admin" && mode !== "super_admin" && mode !== "anonymous") {
    throw new Error("INVALID_OWNER_PARTICIPATION_MODE");
  }
  return { chatId, text, clientMessageId, mode };
}
