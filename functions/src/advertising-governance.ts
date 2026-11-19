import { createHash } from "node:crypto";

export const ADVERTISING_SPECIALIZED_ROLES = [
  "ad_representative",
  "ad_general_supervisor",
  "production_supervisor",
  "production_general_supervisor",
  "production_quality_reviewer",
  "legal_administrative_supervisor",
] as const;

export type AdvertisingSpecializedRole = typeof ADVERTISING_SPECIALIZED_ROLES[number];

export const ADVERTISING_PERMISSIONS = [
  "advertising.requests.review",
  "advertising.requests.assign",
  "advertising.creatives.review",
  "advertising.campaigns.schedule",
  "advertising.campaigns.pause_operational",
  "advertising.campaigns.publish",
  "advertising.representatives.message",
  "advertising.reports.read",
  "advertising.rooms.observe_assigned",
  "advertising.tasks.assign",
  "production.rooms.create",
  "production.rooms.manage_assigned",
  "production.tasks.manage_assigned",
  "production.reviews.write",
  "production.achievements.nominate",
  "contracts.drafts.create",
  "contracts.drafts.review",
  "contracts.send",
  "contracts.sign_delegated",
  "contracts.archive.read",
] as const;

export type AdvertisingPermission = typeof ADVERTISING_PERMISSIONS[number];

const FORBIDDEN_SPECIALIZED_PERMISSIONS = new Set([
  "platform.admin",
  "platform.owner",
  "advertising.commission.set",
  "advertising.receipt.confirm",
  "finance.ledger.manage",
  "specialized_roles.manage",
  "owner.pause_override",
  "owner.audit.delete",
  "contracts.delegation.create",
]);

/** Stable document identity: changing permissions or resource scopes updates the same grant. */
export function specializedRoleGrantId(uid: string, role: AdvertisingSpecializedRole): string {
  if (typeof uid !== "string" || !/^[A-Za-z0-9._:@-]{8,128}$/.test(uid) ||
      !ADVERTISING_SPECIALIZED_ROLES.includes(role)) {
    throw new Error("SPECIALIZED_GRANT_ID_INVALID");
  }
  return createHash("sha256").update("specialized-role-v1|" + uid + "|" + role).digest("hex");
}

export interface SpecializedRoleGrant {
  uid: string;
  role: AdvertisingSpecializedRole;
  permissions: AdvertisingPermission[];
  resourceScopes: string[];
  status: "active" | "suspended" | "revoked";
  startsAtMs: number;
  endsAtMs: number | null;
  version: number;
}

export function validateSpecializedRoleGrant(value: unknown): SpecializedRoleGrant {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("SPECIALIZED_GRANT_INVALID");
  }
  const input = value as Record<string, unknown>;
  if (typeof input.uid !== "string" || !/^[A-Za-z0-9._:@-]{8,128}$/.test(input.uid) ||
      !ADVERTISING_SPECIALIZED_ROLES.includes(input.role as AdvertisingSpecializedRole) ||
      !Array.isArray(input.permissions) || input.permissions.length < 1 || !Array.isArray(input.resourceScopes) ||
      !["active", "suspended", "revoked"].includes(String(input.status)) ||
      !Number.isSafeInteger(input.startsAtMs) || (input.startsAtMs as number) < 0 ||
      !(input.endsAtMs === null || (Number.isSafeInteger(input.endsAtMs) && (input.endsAtMs as number) > (input.startsAtMs as number))) ||
      !Number.isSafeInteger(input.version) || (input.version as number) < 1) {
    throw new Error("SPECIALIZED_GRANT_INVALID");
  }
  const permissions = input.permissions as unknown[];
  if (permissions.some((permission) =>
    typeof permission !== "string" ||
    !ADVERTISING_PERMISSIONS.includes(permission as AdvertisingPermission) ||
    FORBIDDEN_SPECIALIZED_PERMISSIONS.has(permission))) {
    throw new Error("SPECIALIZED_PERMISSION_FORBIDDEN");
  }
  if (new Set(permissions).size !== permissions.length) {
    throw new Error("SPECIALIZED_PERMISSION_DUPLICATE");
  }
  const scopes = input.resourceScopes as unknown[];
  if (scopes.length < 1 || scopes.length > 200 ||
      scopes.some((scope) => typeof scope !== "string" ||
        scope.trim().length < 1 || scope !== scope.trim() || /[\x00-\x1f\x7f]/.test(scope) || scope.length > 160 || scope === "*")) {
    throw new Error("SPECIALIZED_SCOPE_INVALID");
  }
  if (new Set(scopes).size !== scopes.length) {
    throw new Error("SPECIALIZED_SCOPE_DUPLICATE");
  }
  return {
    uid: input.uid,
    role: input.role as AdvertisingSpecializedRole,
    permissions: permissions as AdvertisingPermission[],
    resourceScopes: scopes as string[],
    status: input.status as SpecializedRoleGrant["status"],
    startsAtMs: input.startsAtMs as number,
    endsAtMs: input.endsAtMs as number | null,
    version: input.version as number,
  };
}

/** Specialized grants never imply general platform administration or another permission. */
export function hasAdvertisingPermission(args: {
  ownerVerified: boolean;
  grants: SpecializedRoleGrant[];
  uid: string;
  permission: AdvertisingPermission;
  resourceScope: string;
  nowMs: number;
}): boolean {
  if (args.ownerVerified) return true;
  if (!ADVERTISING_PERMISSIONS.includes(args.permission) ||
      typeof args.uid !== "string" || !args.uid ||
      typeof args.resourceScope !== "string" || !args.resourceScope ||
      !Number.isSafeInteger(args.nowMs) || args.nowMs < 0 ||
      !Array.isArray(args.grants)) return false;

  // Firestore is an untyped boundary: never trust a TypeScript annotation
  // when grant documents are loaded from persistence. Validate each candidate
  // independently so one malformed/stale document cannot authorize an action.
  return args.grants.some((candidate) => {
    let grant: SpecializedRoleGrant;
    try {
      grant = validateSpecializedRoleGrant(candidate);
    } catch {
      return false;
    }
    return grant.uid === args.uid &&
      grant.status === "active" &&
      grant.startsAtMs <= args.nowMs &&
      (grant.endsAtMs === null || grant.endsAtMs > args.nowMs) &&
      grant.permissions.includes(args.permission) &&
      grant.resourceScopes.includes(args.resourceScope);
  });
}

export interface SigningDelegation {
  delegateUid: string;
  contractTypes: string[];
  maxCommitmentMinor: number;
  currency: string;
  startsAtMs: number;
  endsAtMs: number;
  active: boolean;
  ownerCoSignatureRequired: boolean;
  delegationVersion: number;
}

export function canSignUnderDelegation(args: {
  delegation: SigningDelegation | null;
  delegateUid: string;
  contractType: string;
  commitmentMinor: number;
  currency: string;
  nowMs: number;
  ownerCoSignaturePresent: boolean;
}): boolean {
  const d = args.delegation;
  if (!d || typeof d !== "object" ||
      typeof d.active !== "boolean" || !d.active ||
      typeof d.delegateUid !== "string" || !/^[A-Za-z0-9._:@-]{8,128}$/.test(d.delegateUid) ||
      typeof args.delegateUid !== "string" || d.delegateUid !== args.delegateUid ||
      !Array.isArray(d.contractTypes) || d.contractTypes.length < 1 ||
      d.contractTypes.length > 100 ||
      d.contractTypes.some((type) => typeof type !== "string" || !/^[a-z][a-z0-9_-]{1,63}$/.test(type)) ||
      new Set(d.contractTypes).size !== d.contractTypes.length ||
      typeof args.contractType !== "string" || !d.contractTypes.includes(args.contractType) ||
      !Number.isSafeInteger(d.maxCommitmentMinor) || d.maxCommitmentMinor < 0 ||
      !Number.isSafeInteger(args.commitmentMinor) || args.commitmentMinor < 0 ||
      args.commitmentMinor > d.maxCommitmentMinor ||
      typeof d.currency !== "string" || !/^[A-Z]{3}$/.test(d.currency) ||
      args.currency !== d.currency ||
      !Number.isSafeInteger(d.startsAtMs) || d.startsAtMs < 0 ||
      !Number.isSafeInteger(d.endsAtMs) || d.endsAtMs <= d.startsAtMs ||
      !Number.isSafeInteger(args.nowMs) || args.nowMs < d.startsAtMs || args.nowMs >= d.endsAtMs ||
      typeof d.ownerCoSignatureRequired !== "boolean" ||
      typeof args.ownerCoSignaturePresent !== "boolean" ||
      !Number.isSafeInteger(d.delegationVersion) || d.delegationVersion < 1) return false;
  return !d.ownerCoSignatureRequired || args.ownerCoSignaturePresent;
}

export type ProductionRoomRoster = {
  teamMemberUids: string[];
  privilegedObserverUids: string[];
};

export function validateProductionRoomRoster(value: unknown): ProductionRoomRoster {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("PRODUCTION_ROSTER_INVALID");
  }
  const input = value as Record<string, unknown>;
  const team = input.teamMemberUids;
  const observers = input.privilegedObserverUids;
  if (!Array.isArray(team) || !Array.isArray(observers) ||
      team.length < 1 || team.length > 5 ||
      team.some((uid) => typeof uid !== "string" || uid.trim().length < 8 || uid.length > 128) ||
      observers.some((uid) => typeof uid !== "string" || uid.trim().length < 8 || uid.length > 128) ||
      new Set(team).size !== team.length || new Set(observers).size !== observers.length ||
      team.some((uid) => observers.includes(uid))) {
    throw new Error("PRODUCTION_ROSTER_INVALID");
  }
  return { teamMemberUids: team as string[], privilegedObserverUids: observers as string[] };
}

/** Public achievement publication is always an explicit owner decision. */
export function canPublishProductionAchievement(args: {
  ownerVerified: boolean;
  ownerApprovalRecorded: boolean;
  rightsCleared: boolean;
  participantDisclosureCleared: boolean;
}): boolean {
  return args.ownerVerified && args.ownerApprovalRecorded &&
    args.rightsCleared && args.participantDisclosureCleared;
}


/**
 * Applies an owner-requested additive/partial permission change without
 * replacing unrelated role scope, dates, status, or grant identity.
 * Full revocation remains a separate owner-only lifecycle operation.
 */
export function applySpecializedPermissionDelta(
  value: unknown,
  delta: { add?: unknown; remove?: unknown },
): SpecializedRoleGrant {
  const grant = validateSpecializedRoleGrant(value);
  if (!delta || typeof delta !== "object" || Array.isArray(delta)) {
    throw new Error("SPECIALIZED_PERMISSION_DELTA_INVALID");
  }
  const add = delta.add === undefined ? [] : delta.add;
  const remove = delta.remove === undefined ? [] : delta.remove;
  if (!Array.isArray(add) || !Array.isArray(remove)) {
    throw new Error("SPECIALIZED_PERMISSION_DELTA_INVALID");
  }
  const allowed = new Set<string>(ADVERTISING_PERMISSIONS);
  const current = new Set<string>(grant.permissions);
  const additions = new Set<string>();
  const removals = new Set<string>();
  for (const permission of add) {
    if (typeof permission !== "string" || !allowed.has(permission) ||
        FORBIDDEN_SPECIALIZED_PERMISSIONS.has(permission) ||
        current.has(permission) || additions.has(permission)) {
      throw new Error("SPECIALIZED_PERMISSION_ADD_INVALID");
    }
    additions.add(permission);
  }
  for (const permission of remove) {
    if (typeof permission !== "string" || !current.has(permission) ||
        removals.has(permission)) {
      throw new Error("SPECIALIZED_PERMISSION_REMOVE_INVALID");
    }
    removals.add(permission);
  }
  for (const permission of additions) current.add(permission);
  for (const permission of removals) current.delete(permission);
  if (current.size < 1) {
    throw new Error("SPECIALIZED_PERMISSION_EMPTY_GRANT");
  }
  return validateSpecializedRoleGrant({
    ...grant,
    permissions: [...current],
  });
}
