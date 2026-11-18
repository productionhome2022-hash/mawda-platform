export const PLATFORM_ROLE_IDS = {
  superOwner: "super_owner",
  generalAdmin: "platform_admin",
  mediaAdmin: "ad_general_supervisor",
  generalProductionSupervisor: "production_general_supervisor",
  teamProductionSupervisor: "production_supervisor",
} as const;

/** Stable role IDs deliberately reuse the existing specialized-grant schema. */
export type NumberedPlatformRole =
  | "platform_admin"
  | "ad_general_supervisor"
  | "production_general_supervisor"
  | "production_supervisor";

export const PLATFORM_ROLE_CAPACITY: Record<NumberedPlatformRole, number | null> = {
  platform_admin: null,
  ad_general_supervisor: 5,
  production_general_supervisor: 5,
  production_supervisor: null,
};

export function platformRoleDisplayLabel(
  role: NumberedPlatformRole,
  ordinal: number,
  locale: "ar" | "en" | "fr" | "es" = "en",
): string {
  if (!Number.isSafeInteger(ordinal) || ordinal < 1) {
    throw new Error("PLATFORM_ROLE_ORDINAL_INVALID");
  }
  const capacity = PLATFORM_ROLE_CAPACITY[role];
  if (capacity !== null && ordinal > capacity) {
    throw new Error("PLATFORM_ROLE_CAPACITY_EXCEEDED");
  }
  const labels = {
    platform_admin: { ar: "أدمن", en: "Admin", fr: "Administrateur", es: "Administrador" },
    ad_general_supervisor: { ar: "أدمن ميديا", en: "Admin Media", fr: "Admin Média", es: "Admin Media" },
    production_general_supervisor: {
      ar: "مشرف إنتاج عام", en: "General Production Supervisor",
      fr: "Superviseur général de production", es: "Supervisor general de producción",
    },
    production_supervisor: {
      ar: "مشرف إنتاج الفريق", en: "Team Production Supervisor",
      fr: "Superviseur de production d’équipe", es: "Supervisor de producción del equipo",
    },
  } as const;
  const prefix = labels[role][locale];
  return locale === "ar" ? `${prefix} ${toArabicDigits(ordinal)}` : `${prefix} ${ordinal}`;
}

function toArabicDigits(value: number): string {
  return String(value).replace(/[0-9]/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]);
}

/** Allocate the next permanent ordinal; callers must run this inside a transaction. */
export function nextPermanentRoleOrdinal(existingOrdinals: unknown[]): number {
  let max = 0;
  for (const value of existingOrdinals) {
    if (!Number.isSafeInteger(value) || (value as number) < 1) {
      throw new Error("PLATFORM_ROLE_HISTORY_INVALID");
    }
    max = Math.max(max, value as number);
  }
  return max + 1;
}
