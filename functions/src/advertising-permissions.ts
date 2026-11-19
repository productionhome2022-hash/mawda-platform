export const ADVERTISING_GENERAL_SUPERVISOR_LIMIT = 5;

export const ADVERTISING_SUPERVISOR_PERMISSIONS = [
  "advertising.applicants.view",
  "advertising.applicants.review_profile",
  "advertising.applicants.request_information",
  "advertising.applicants.discuss",
  "advertising.agreements.prepare_and_send",
  "advertising.agreements.view_status",
  "advertising.agreements.route_to_owner",
  "advertising.representatives.activate",
  "advertising.representatives.suspend",
  "advertising.requests.view_assigned",
  "advertising.requests.view_all",
  "advertising.requests.assign",
  "advertising.requests.return_for_correction",
  "advertising.requests.reject_with_reason",
  "advertising.requests.review_description",
  "advertising.requests.review_media",
  "advertising.requests.preview_external_link",
  "advertising.requests.validate_geographic_target",
  "advertising.requests.accept_preliminary",
  "advertising.requests.route_to_owner",
  "advertising.campaign.edit_nonfinancial_metadata",
  "advertising.campaign.propose_schedule",
  "advertising.campaign.schedule_within_owner_limits",
  "advertising.campaign.pause_operationally",
  "advertising.campaign.resume_if_not_owner_blocked",
  "advertising.campaign.view_delivery_status",
  "advertising.campaign.view_aggregate_performance",
  "advertising.campaign.publish",
  "advertising.campaign.unpublish_operationally",
  "advertising.workspace.message_representatives",
  "advertising.workspace.message_advertisers",
  "advertising.notifications.send_approved_templates",
  "advertising.reports.view_requests",
  "advertising.reports.export_nonfinancial",
] as const;

export type AdvertisingSupervisorPermission =
  typeof ADVERTISING_SUPERVISOR_PERMISSIONS[number];

export type AdvertisingActorRole = "owner" | "general_supervisor" | "representative" | "member";

const SUPERVISOR_PERMISSION_SET = new Set<string>(ADVERTISING_SUPERVISOR_PERMISSIONS);

const OWNER_ONLY_ADVERTISING_ACTIONS = new Set([
  "advertising.commission.set_per_ad",
  "advertising.payment.confirm_received",
  "advertising.finance.view_ledger",
  "advertising.campaign.owner_emergency_withdraw",
  "advertising.supervisors.manage",
  "advertising.agreements.company_countersign",
]);

/** Validates a complete supervisor permission list. Unknown and duplicate grants fail closed. */
export function normalizeAdvertisingSupervisorPermissions(
  input: unknown,
): AdvertisingSupervisorPermission[] {
  if (!Array.isArray(input) || input.length > ADVERTISING_SUPERVISOR_PERMISSIONS.length) {
    throw new Error("INVALID_ADVERTISING_SUPERVISOR_PERMISSIONS");
  }
  const seen = new Set<string>();
  for (const permission of input) {
    if (typeof permission !== "string" || !SUPERVISOR_PERMISSION_SET.has(permission)) {
      throw new Error("ADVERTISING_SUPERVISOR_PERMISSION_NOT_ALLOWED");
    }
    if (seen.has(permission)) {
      throw new Error("DUPLICATE_ADVERTISING_SUPERVISOR_PERMISSION");
    }
    seen.add(permission);
  }
  return [...seen] as AdvertisingSupervisorPermission[];
}

/** There are five assignable supervisor seats; representatives are not counted here. */
export function assertAdvertisingSupervisorCapacity(activeSupervisorCount: number): void {
  if (!Number.isSafeInteger(activeSupervisorCount) ||
      activeSupervisorCount < 0 ||
      activeSupervisorCount > ADVERTISING_GENERAL_SUPERVISOR_LIMIT) {
    throw new Error("INVALID_ADVERTISING_SUPERVISOR_COUNT");
  }
  if (activeSupervisorCount >= ADVERTISING_GENERAL_SUPERVISOR_LIMIT) {
    throw new Error("ADVERTISING_SUPERVISOR_CAPACITY_REACHED");
  }
}

/** Owner-only actions can never be granted through the supervisor permission editor. */
export function isOwnerOnlyAdvertisingAction(action: string): boolean {
  return OWNER_ONLY_ADVERTISING_ACTIONS.has(action);
}

export function canPerformAdvertisingAction(args: {
  actorRole: AdvertisingActorRole;
  action: string;
  supervisorPermissions?: unknown;
}): boolean {
  if (args.actorRole === "owner") return true;
  if (isOwnerOnlyAdvertisingAction(args.action) || args.actorRole !== "general_supervisor") {
    return false;
  }
  if (!Array.isArray(args.supervisorPermissions)) return false;
  return args.supervisorPermissions.includes(args.action) &&
    SUPERVISOR_PERMISSION_SET.has(args.action);
}

/** Activation is impossible until the Owner has countersigned the representative agreement. */
export function canActivateAdvertisingRepresentative(args: {
  actorRole: AdvertisingActorRole;
  supervisorPermissions?: unknown;
  ownerCountersignaturePresent: boolean;
}): boolean {
  if (!args || typeof args !== "object" || args.ownerCountersignaturePresent !== true) {
    return false;
  }
  return args.actorRole === "owner" ||
    canPerformAdvertisingAction({
      actorRole: args.actorRole,
      action: "advertising.representatives.activate",
      supervisorPermissions: args.supervisorPermissions,
    });
}

export function canPublishAdvertisingCampaign(args: {
  actorRole: AdvertisingActorRole;
  supervisorPermissions?: unknown;
  ownerBlocked: boolean;
  finalTermsOwnerApproved: boolean;
  perAdCommissionSetByOwner: boolean;
  representativeAcceptedCommission: boolean;
  paymentConfirmedByOwner: boolean;
}): boolean {
  if (args.ownerBlocked ||
      !args.finalTermsOwnerApproved ||
      !args.perAdCommissionSetByOwner ||
      !args.representativeAcceptedCommission ||
      !args.paymentConfirmedByOwner) {
    return false;
  }
  return args.actorRole === "owner" ||
    canPerformAdvertisingAction({
      actorRole: args.actorRole,
      action: "advertising.campaign.publish",
      supervisorPermissions: args.supervisorPermissions,
    });
}

/** The emergency withdrawal control is never delegated, even to a publisher. */
export function canOwnerEmergencyWithdrawAdvertisingCampaign(
  actorRole: AdvertisingActorRole,
): boolean {
  return actorRole === "owner";
}
