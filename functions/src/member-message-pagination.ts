export type MemberMessagePageRequest = {
  direction: "before" | "after";
  limit: number;
  cursor: { createdAtMillis: number; messageId: string } | null;
};

function decodeCursor(value: unknown): { createdAtMillis: number; messageId: string } | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || value.length > 512 || !/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new Error("INVALID_MESSAGE_PAGE_TOKEN");
  }
  try {
    const decoded = Buffer.from(value, "base64url").toString("utf8");
    if (Buffer.from(decoded, "utf8").toString("base64url") !== value) {
      throw new Error("INVALID_MESSAGE_PAGE_TOKEN");
    }
    const parsed: unknown = JSON.parse(decoded);
    if (!Array.isArray(parsed) || parsed.length !== 2 ||
        typeof parsed[0] !== "number" || !Number.isSafeInteger(parsed[0]) || parsed[0] < 0 ||
        typeof parsed[1] !== "string" || parsed[1].length < 1 || parsed[1].length > 150) {
      throw new Error("INVALID_MESSAGE_PAGE_TOKEN");
    }
    return { createdAtMillis: parsed[0], messageId: parsed[1] };
  } catch {
    throw new Error("INVALID_MESSAGE_PAGE_TOKEN");
  }
}

export function encodeMemberMessagePageToken(createdAtMillis: number, messageId: string): string {
  if (!Number.isSafeInteger(createdAtMillis) || createdAtMillis < 0 ||
      typeof messageId !== "string" || messageId.length < 1 || messageId.length > 150) {
    throw new Error("INVALID_MESSAGE_PAGE_CURSOR");
  }
  return Buffer.from(JSON.stringify([createdAtMillis, messageId]), "utf8").toString("base64url");
}

/** Member message paging is mutually exclusive: fetch older history or new arrivals, never both. */
export function validateMemberMessagePageRequest(input: Record<string, unknown>): MemberMessagePageRequest {
  const requestedLimit = input.limit === undefined ? 50 : input.limit;
  if (typeof requestedLimit !== "number" || !Number.isSafeInteger(requestedLimit) ||
      requestedLimit < 1 || requestedLimit > 50) {
    throw new Error("INVALID_MESSAGE_PAGE_SIZE");
  }
  const before = decodeCursor(input.beforePageToken);
  const after = decodeCursor(input.afterPageToken);
  if (before && after) throw new Error("CONFLICTING_MESSAGE_PAGE_TOKENS");
  return {
    direction: after ? "after" : "before",
    limit: requestedLimit,
    cursor: after ?? before,
  };
}
