export const PLATFORM_ROLE_IDS = {
  superOwner: "super_admin",
  generalAdmin: "platform_admin",
  mediaAdmin: "ad_general_supervisor",
  generalProductionSupervisor: "production_general_supervisor",
  teamProductionSupervisor: "production_supervisor",
  productionQualityReviewer: "production_quality_reviewer",
  legalAdministrativeSupervisor: "legal_administrative_supervisor",
} as const;

/** Stable role IDs deliberately reuse the existing specialized-grant schema. */
export type NumberedPlatformRole =
  | "platform_admin"
  | "ad_general_supervisor"
  | "production_general_supervisor"
  | "production_supervisor"
  | "production_quality_reviewer"
  | "legal_administrative_supervisor";

export const PLATFORM_ROLE_CAPACITY: Record<NumberedPlatformRole, number | null> = {
  platform_admin: null,
  ad_general_supervisor: 5,
  production_general_supervisor: 5,
  production_supervisor: null,
  production_quality_reviewer: 5,
  legal_administrative_supervisor: 4,
};

/** Resolve only the explicitly owner-configurable capacity; all other role caps are fixed. */
export function platformRoleCapacity(role: NumberedPlatformRole, capacityOverride?: number): number | null {
  const defaultCapacity = PLATFORM_ROLE_CAPACITY[role];
  if (capacityOverride === undefined) return defaultCapacity;
  if (role !== "production_general_supervisor" ||
      !Number.isSafeInteger(capacityOverride) ||
      capacityOverride < (defaultCapacity ?? Number.MAX_SAFE_INTEGER)) {
    throw new Error("PLATFORM_ROLE_CAPACITY_OVERRIDE_INVALID");
  }
  return capacityOverride;
}

/** Server-side seat guard. Call with the active count read in the same Firestore transaction. */
export function assertPlatformRoleCapacity(
  role: NumberedPlatformRole,
  activeCountAfterWrite: number,
  capacityOverride?: number,
): void {
  if (!Number.isSafeInteger(activeCountAfterWrite) || activeCountAfterWrite < 0) {
    throw new Error("PLATFORM_ROLE_ACTIVE_COUNT_INVALID");
  }
  const capacity = platformRoleCapacity(role, capacityOverride);
  if (capacity !== null && activeCountAfterWrite > capacity) {
    throw new Error("PLATFORM_ROLE_CAPACITY_EXCEEDED");
  }
}

export function platformRoleDisplayLabel(
  role: NumberedPlatformRole,
  ordinal: number,
  locale: "ar" | "en" | "fr" | "es" = "en",
  capacityOverride?: number,
): string {
  if (!Number.isSafeInteger(ordinal) || ordinal < 1) {
    throw new Error("PLATFORM_ROLE_ORDINAL_INVALID");
  }
  const capacity = platformRoleCapacity(role, capacityOverride);
  if (capacity !== null && ordinal > capacity) {
    throw new Error("PLATFORM_ROLE_CAPACITY_EXCEEDED");
  }
  const labels = {
    platform_admin: { ar: "أدمن", en: "Admin", fr: "Administrateur", es: "Administrador" },
    ad_general_supervisor: { ar: "أدمن ميديا", en: "Admin Media", fr: "Admin Média", es: "Admin Media" },
    production_general_supervisor: {
      ar: "المشرف العام للإنتاج", en: "General Production Supervisor",
      fr: "Superviseur général de production", es: "Supervisor general de producción",
    },
    production_supervisor: {
      ar: "مشرف إنتاج الفريق", en: "Team Production Supervisor",
      fr: "Superviseur de production d’équipe", es: "Supervisor de producción del equipo",
    },
    production_quality_reviewer: {
      ar: "مراجع جودة الإنتاج", en: "Production Quality Reviewer",
      fr: "Réviseur qualité de production", es: "Revisor de calidad de producción",
    },
    legal_administrative_supervisor: {
      ar: "المشرف القانوني والإداري", en: "Legal and Administrative Supervisor",
      fr: "Superviseur juridique et administratif", es: "Supervisor jurídico y administrativo",
    },
  } as const;
  const prefix = labels[role][locale];
  if (role === "production_supervisor") return prefix;
  return locale === "ar" ? `${prefix} ${toArabicDigits(ordinal)}` : `${prefix} ${ordinal}`;
}

function toArabicDigits(value: number): string {
  return String(value).replace(/[0-9]/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]);
}

/** Admin N is the only role with an approved permanent, never-reused sequence. */
export function nextPermanentRoleOrdinal(
  role: NumberedPlatformRole,
  existingOrdinals: unknown[],
): number {
  if (role !== "platform_admin") {
    throw new Error("PLATFORM_ROLE_SEQUENCE_POLICY_NOT_APPROVED");
  }
  let max = 0;
  for (const value of existingOrdinals) {
    if (!Number.isSafeInteger(value) || (value as number) < 1) {
      throw new Error("PLATFORM_ROLE_HISTORY_INVALID");
    }
    max = Math.max(max, value as number);
  }
  return max + 1;
}
