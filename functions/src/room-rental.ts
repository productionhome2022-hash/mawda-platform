export type RoomRentalPlan = {
  planId: string;
  name: string;
  durationDays: number;
  priceCoins: number;
  active: boolean;
};

export const DEFAULT_ROOM_RENTAL_PLANS: RoomRentalPlan[] = [
  { planId: "room_30d", name: "استئجار غرفة 30 يوماً", durationDays: 30, priceCoins: 1000, active: true },
  { planId: "room_90d", name: "استئجار غرفة 90 يوماً", durationDays: 90, priceCoins: 2700, active: true },
  { planId: "room_180d", name: "استئجار غرفة 180 يوماً", durationDays: 180, priceCoins: 5000, active: true },
  { planId: "room_365d", name: "استئجار غرفة 365 يوماً", durationDays: 365, priceCoins: 9000, active: true },
];

export function validateRoomRentalPlans(value: unknown): RoomRentalPlan[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 12) {
    throw new Error("INVALID_ROOM_RENTAL_PLANS");
  }
  const ids = new Set<string>();
  return value.map((raw) => {
    if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
      throw new Error("INVALID_ROOM_RENTAL_PLAN");
    }
    const plan = raw as Record<string, unknown>;
    if (typeof plan.planId !== "string" || !/^[a-z0-9][a-z0-9_-]{2,40}$/.test(plan.planId) ||
        ids.has(plan.planId)) throw new Error("INVALID_ROOM_RENTAL_PLAN_ID");
    ids.add(plan.planId);
    if (typeof plan.name !== "string" || plan.name.trim().length < 3 || plan.name.trim().length > 80 ||
        !Number.isSafeInteger(plan.durationDays) || (plan.durationDays as number) < 1 ||
        (plan.durationDays as number) > 3650 ||
        !Number.isSafeInteger(plan.priceCoins) || (plan.priceCoins as number) < 1 ||
        (plan.priceCoins as number) > 100000000 ||
        typeof plan.active !== "boolean") throw new Error("INVALID_ROOM_RENTAL_PLAN_FIELDS");
    return {
      planId: plan.planId,
      name: plan.name.trim(),
      durationDays: plan.durationDays as number,
      priceCoins: plan.priceCoins as number,
      active: plan.active,
    };
  });
}

export function roomRentalExpiry(nowMs: number, durationDays: number): number {
  if (!Number.isSafeInteger(nowMs) || nowMs < 0 ||
      !Number.isSafeInteger(durationDays) || durationDays < 1 || durationDays > 3650) {
    throw new Error("INVALID_ROOM_RENTAL_EXPIRY");
  }
  return nowMs + durationDays * 24 * 60 * 60 * 1000;
}

export function calculateRoomRentalBalance(balance: unknown, priceCoins: number): number | null {
  if (typeof balance !== "number" || !Number.isSafeInteger(balance) || balance < 0 ||
      !Number.isSafeInteger(priceCoins) || priceCoins < 1 || balance < priceCoins) return null;
  return balance - priceCoins;
}
