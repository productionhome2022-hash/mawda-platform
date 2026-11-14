export type DirectMessageInput = {
  recipientUid: string;
  text: string;
  clientMessageId: string;
};

/** Normalize a text-only direct message request; authorization is checked separately. */
export function validateDirectMessageInput(input: Record<string, unknown>): DirectMessageInput {
  const allowedFields = new Set(["recipientUid", "text", "clientMessageId"]);
  if (Object.keys(input).some((key) => !allowedFields.has(key))) {
    throw new Error("UNSUPPORTED_DIRECT_MESSAGE_FIELDS");
  }
  const recipientUid = typeof input.recipientUid === "string" ? input.recipientUid.trim() : "";
  const text = typeof input.text === "string" ? input.text.trim() : "";
  const clientMessageId = typeof input.clientMessageId === "string"
    ? input.clientMessageId.trim()
    : "";
  if (!recipientUid || recipientUid.length > 128) throw new Error("INVALID_RECIPIENT");
  if (!text || text.length > 4000) throw new Error("INVALID_MESSAGE_TEXT");
  if (!clientMessageId || clientMessageId.length < 8 || clientMessageId.length > 80 ||
      !/^[A-Za-z0-9_-]+$/.test(clientMessageId)) {
    throw new Error("INVALID_CLIENT_MESSAGE_ID");
  }
  return { recipientUid, text, clientMessageId };
}
