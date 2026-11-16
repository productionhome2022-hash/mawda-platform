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
  if (typeof input.uid !== "string" || !/^[A-Za-z0-9:_-]{8,128}$/.test(input.uid) ||
      !ADVERTISING_SPECIALIZED_ROLES.includes(input.role as AdvertisingSpecializedRole) ||
      !Array.isArray(input.permissions) || !Array.isArray(input.resourceScopes) ||
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
        scope.trim().length < 1 || scope.length > 160 || scope === "*")) {
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
  if (!ADVERTISING_PERMISSIONS.includes(args.permission)) return false;
  return args.grants.some((grant) =>
    grant.uid === args.uid &&
    grant.status === "active" &&
    grant.startsAtMs <= args.nowMs &&
    (grant.endsAtMs === null || grant.endsAtMs > args.nowMs) &&
    grant.permissions.includes(args.permission) &&
    grant.resourceScopes.includes(args.resourceScope));
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
  if (!d || !d.active || d.delegateUid !== args.delegateUid ||
      !d.contractTypes.includes(args.contractType) ||
      !Number.isSafeInteger(args.commitmentMinor) || args.commitmentMinor < 0 ||
      args.commitmentMinor > d.maxCommitmentMinor ||
      args.currency !== d.currency ||
      args.nowMs < d.startsAtMs || args.nowMs >= d.endsAtMs ||
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
