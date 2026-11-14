export type RoomAudience = "adult" | "minor" | "all_ages";
export type RoomKind = "public" | "private";
export type RoomModeratorPermissions = {
  manageMessages: boolean;
  muteMembers: boolean;
  removeMembers: boolean;
};

/** Audience is derived from the member's verified-in-app age field, never client-selected. */
export function audienceForAge(age: number): RoomAudience {
  if (!Number.isSafeInteger(age) || age < 16 || age > 120) {
    throw new Error("INVALID_MEMBER_AGE");
  }
  return age < 18 ? "minor" : "adult";
}

export function canJoinRoom(args: {
  memberAge: number;
  roomAudience: unknown;
  roomKind: unknown;
  invited: boolean;
}): boolean {
  let audience: RoomAudience;
  try {
    audience = audienceForAge(args.memberAge);
  } catch {
    return false;
  }
  if (args.roomAudience !== "adult" && args.roomAudience !== "minor" && args.roomAudience !== "all_ages") return false;
  if (args.roomAudience !== "all_ages" && audience !== args.roomAudience) return false;
  if (args.roomKind === "public") return true;
  return args.roomKind === "private" && args.invited;
}

/** Moderators receive room-scoped operational permissions, never platform ownership. */
export function normalizeModeratorPermissions(input: Record<string, unknown>): RoomModeratorPermissions {
  const allowed = ["manageMessages", "muteMembers", "removeMembers"];
  if (Object.keys(input).some((key) => !allowed.includes(key))) {
    throw new Error("ROOM_MODERATOR_PERMISSION_NOT_ALLOWED");
  }
  const permissions = {
    manageMessages: input.manageMessages === true,
    muteMembers: input.muteMembers === true,
    removeMembers: input.removeMembers === true,
  };
  if (!Object.values(permissions).some((enabled) => enabled)) {
    throw new Error("ROOM_MODERATOR_PERMISSION_REQUIRED");
  }
  return permissions;
}


/** Unknown-age guests are admitted only to public rooms explicitly reviewed for a general audience. */
export function canJoinGuestRoom(args: {
  roomAudience: unknown;
  roomKind: unknown;
  roomStatus: unknown;
  guestAudienceApproved: unknown;
}): boolean {
  return args.roomStatus === "active" &&
    args.roomKind === "public" &&
    args.roomAudience === "all_ages" &&
    args.guestAudienceApproved === true;
}
