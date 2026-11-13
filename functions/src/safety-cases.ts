export const SAFETY_REPORT_CATEGORIES = [
  "harassment",
  "hate_or_threats",
  "sexual_content",
  "spam_or_scam",
  "impersonation",
  "minor_safety",
  "privacy_violation",
  "other",
] as const;

export type SafetyReportCategory = typeof SAFETY_REPORT_CATEGORIES[number];

export type SafetyReportInput = {
  targetUid: string;
  category: SafetyReportCategory;
  contextType: "member" | "direct_message" | "room" | "room_message" | "profile";
  contextId: string | null;
  description: string;
  requestId: string;
};

export function validateSafetyReportInput(input: Record<string, unknown>): SafetyReportInput {
  const allowed = new Set([
    "targetUid", "category", "contextType", "contextId", "description", "requestId",
  ]);
  if (Object.keys(input).some((key) => !allowed.has(key))) {
    throw new Error("UNSUPPORTED_SAFETY_REPORT_FIELDS");
  }
  const targetUid = typeof input.targetUid === "string" ? input.targetUid.trim() : "";
  const category = input.category;
  const contextType = input.contextType;
  const contextId = input.contextId === undefined || input.contextId === null
    ? null
    : typeof input.contextId === "string" ? input.contextId.trim() : "";
  const description = typeof input.description === "string" ? input.description.trim() : "";
  const requestId = typeof input.requestId === "string" ? input.requestId.trim() : "";
  if (!targetUid || targetUid.length > 128) throw new Error("INVALID_SAFETY_TARGET");
  if (!(SAFETY_REPORT_CATEGORIES as readonly unknown[]).includes(category)) {
    throw new Error("INVALID_SAFETY_CATEGORY");
  }
  if (!["member", "direct_message", "room", "room_message", "profile"].includes(String(contextType))) {
    throw new Error("INVALID_SAFETY_CONTEXT");
  }
  if (contextId !== null && (!contextId || contextId.length > 160)) {
    throw new Error("INVALID_SAFETY_CONTEXT_ID");
  }
  if ((contextType === "direct_message" || contextType === "room_message" || contextType === "room") &&
      contextId === null) throw new Error("SAFETY_CONTEXT_ID_REQUIRED");
  if (description.length < 10 || description.length > 2000) {
    throw new Error("INVALID_SAFETY_DESCRIPTION");
  }
  if (!/^[A-Za-z0-9_-]{8,80}$/.test(requestId)) throw new Error("INVALID_SAFETY_REQUEST_ID");
  return {
    targetUid,
    category: category as SafetyReportCategory,
    contextType: contextType as SafetyReportInput["contextType"],
    contextId,
    description,
    requestId,
  };
}

export type SafetyAppealInput = {
  caseId: string;
  reason: string;
  requestId: string;
};

export function validateSafetyAppealInput(input: Record<string, unknown>): SafetyAppealInput {
  const allowed = new Set(["caseId", "reason", "requestId"]);
  if (Object.keys(input).some((key) => !allowed.has(key))) {
    throw new Error("UNSUPPORTED_SAFETY_APPEAL_FIELDS");
  }
  const caseId = typeof input.caseId === "string" ? input.caseId.trim() : "";
  const reason = typeof input.reason === "string" ? input.reason.trim() : "";
  const requestId = typeof input.requestId === "string" ? input.requestId.trim() : "";
  if (!/^[A-Za-z0-9_-]{8,160}$/.test(caseId)) throw new Error("INVALID_SAFETY_CASE_ID");
  if (reason.length < 20 || reason.length > 2000) throw new Error("INVALID_SAFETY_APPEAL_REASON");
  if (!/^[A-Za-z0-9_-]{8,80}$/.test(requestId)) throw new Error("INVALID_SAFETY_REQUEST_ID");
  return { caseId, reason, requestId };
}
