import { createHash } from "node:crypto";

/** Stable, symmetric conversation ID shared by both participants. */
export function createDirectChatId(firstUid: string, secondUid: string): string {
  if (!firstUid || !secondUid || firstUid === secondUid ||
      firstUid.length > 128 || secondUid.length > 128) {
    throw new Error("INVALID_DIRECT_CHAT_PARTICIPANTS");
  }
  const [first, second] = [firstUid, secondUid].sort();
  return createHash("sha256").update(first + ":" + second).digest("hex");
}
