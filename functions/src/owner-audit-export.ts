export type OwnerAuditExportFilters = {
  afterSequence: number;
  pageSize: number;
  fromMs: number | null;
  toMs: number | null;
  actorUid: string | null;
  action: string | null;
};

export function validateOwnerAuditExportRequest(
  input: Record<string, unknown>,
  currentHeadSequence: number,
): OwnerAuditExportFilters {
  const afterSequence = input.afterSequence === undefined ? 0 : input.afterSequence;
  const pageSize = input.pageSize === undefined ? 50 : input.pageSize;
  const fromMs = input.fromMs === undefined ? null : input.fromMs;
  const toMs = input.toMs === undefined ? null : input.toMs;
  const actorUid = input.actorUid === undefined ? null : input.actorUid;
  const action = input.action === undefined ? null : input.action;
  if (!Number.isSafeInteger(currentHeadSequence) || currentHeadSequence < 0 ||
      !Number.isSafeInteger(afterSequence) || (afterSequence as number) < 0 ||
      (afterSequence as number) > currentHeadSequence) {
    throw new Error("INVALID_AUDIT_EXPORT_CURSOR");
  }
  if (!Number.isSafeInteger(pageSize) || (pageSize as number) < 1 || (pageSize as number) > 100) {
    throw new Error("INVALID_AUDIT_EXPORT_PAGE_SIZE");
  }
  if (fromMs !== null && (!Number.isSafeInteger(fromMs) || (fromMs as number) < 0)) {
    throw new Error("INVALID_AUDIT_EXPORT_FROM");
  }
  if (toMs !== null && (!Number.isSafeInteger(toMs) || (toMs as number) < 0)) {
    throw new Error("INVALID_AUDIT_EXPORT_TO");
  }
  if (fromMs !== null && toMs !== null && (fromMs as number) > (toMs as number)) {
    throw new Error("INVALID_AUDIT_EXPORT_RANGE");
  }
  if (actorUid !== null && (typeof actorUid !== "string" || actorUid.trim().length < 1 || actorUid.length > 128)) {
    throw new Error("INVALID_AUDIT_EXPORT_ACTOR");
  }
  if (action !== null && (typeof action !== "string" || !/^[a-z0-9_:-]{1,80}$/i.test(action))) {
    throw new Error("INVALID_AUDIT_EXPORT_ACTION");
  }
  return {
    afterSequence: afterSequence as number,
    pageSize: pageSize as number,
    fromMs: fromMs as number | null,
    toMs: toMs as number | null,
    actorUid: actorUid as string | null,
    action: action as string | null,
  };
}

const OMIT_AUDIT_KEYS = /token|secret|password|signed.?url|download.?url|raw.?body|file.?bytes|message.?text|notice.?text|content.?body/i;

/** Remove credentials and user-generated content from exported audit metadata. */
export function projectOwnerAuditExportValue(value: unknown): unknown {
  if (value === null || typeof value === "string" || typeof value === "boolean" ||
      (typeof value === "number" && Number.isFinite(value))) return value;
  if (Array.isArray(value)) return value.slice(0, 100).map(projectOwnerAuditExportValue);
  if (typeof value === "object") {
    const input = value as Record<string, unknown>;
    const output: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(input)) {
      if (OMIT_AUDIT_KEYS.test(key) || nested === undefined) continue;
      output[key] = projectOwnerAuditExportValue(nested);
    }
    return output;
  }
  return null;
}
