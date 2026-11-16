export const PRODUCTION_SPECIALTIES = [
  "ad_designer", "graphic_designer", "video_editor", "photographer",
  "videographer", "advertising_copywriter", "voice_over", "motion_designer",
  "creative_director", "production_coordinator",
] as const;

export type ProductionApplicationPayload = {
  applicantName: string;
  requestedTrack: "production_member" | "production_supervisor_candidate";
  specialties: string[];
  experience: string;
  tools: string;
  previousProjects: string;
  collaboratingCompanies: string | null;
  achievements: string | null;
  cvUrl: string | null;
  portfolioUrls: string[];
  roleDescription: string;
  interviewAnswers: string;
  creativeTrialConsent: boolean;
  rightsConfirmed: true;
  idempotencyKey: string;
};

export class ProductionApplicationValidationError extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = "ProductionApplicationValidationError";
  }
}

function required(value: unknown, min: number, max: number, code: string): string {
  if (typeof value !== "string") throw new ProductionApplicationValidationError(code);
  const result = value.trim();
  if (result.length < min || result.length > max) throw new ProductionApplicationValidationError(code);
  return result;
}
function optional(value: unknown, max: number, code: string): string | null {
  if (value === undefined || value === null || value === "") return null;
  return required(value, 1, max, code);
}
function safeHttps(value: unknown, code: string): string {
  const raw = required(value, 10, 2048, code);
  let parsed: URL;
  try { parsed = new URL(raw); } catch { throw new ProductionApplicationValidationError(code); }
  const host = parsed.hostname.toLowerCase().replace(/\.$/, "");
  if (parsed.protocol !== "https:" || parsed.username || parsed.password ||
      !host.includes(".") || host === "localhost" || host.endsWith(".local") ||
      host.endsWith(".internal") || host.includes(":") ||
      /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    throw new ProductionApplicationValidationError(code);
  }
  return parsed.toString();
}

export function validateProductionApplication(value: unknown): ProductionApplicationPayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ProductionApplicationValidationError("invalid_request");
  }
  const data = value as Record<string, unknown>;
  if (data.requestedTrack !== "production_member" &&
      data.requestedTrack !== "production_supervisor_candidate") {
    throw new ProductionApplicationValidationError("invalid_track");
  }
  if (!Array.isArray(data.specialties) || data.specialties.length < 1 ||
      data.specialties.length > PRODUCTION_SPECIALTIES.length) {
    throw new ProductionApplicationValidationError("invalid_specialties");
  }
  const specialties = data.specialties.map((item) => required(item, 2, 80, "invalid_specialty"));
  if (new Set(specialties).size !== specialties.length ||
      specialties.some((item) => !(PRODUCTION_SPECIALTIES as readonly string[]).includes(item))) {
    throw new ProductionApplicationValidationError("unsupported_specialty");
  }
  if (!Array.isArray(data.portfolioUrls) || data.portfolioUrls.length > 12) {
    throw new ProductionApplicationValidationError("invalid_portfolio");
  }
  const portfolioUrls = data.portfolioUrls.map((item) => safeHttps(item, "invalid_portfolio_url"));
  const interviewAnswers = required(data.interviewAnswers, 20, 5000, "invalid_interview_answers");
  const idempotencyKey = required(data.idempotencyKey, 16, 100, "invalid_idempotency_key");
  if (!/^[A-Za-z0-9_-]{16,100}$/.test(idempotencyKey)) {
    throw new ProductionApplicationValidationError("invalid_idempotency_key");
  }
  if (data.rightsConfirmed !== true || typeof data.creativeTrialConsent !== "boolean") {
    throw new ProductionApplicationValidationError("required_confirmations_missing");
  }
  const cvUrl = data.cvUrl ? safeHttps(data.cvUrl, "invalid_cv_url") : null;
  return {
    applicantName: required(data.applicantName, 2, 120, "invalid_applicant_name"),
    requestedTrack: data.requestedTrack,
    specialties,
    experience: required(data.experience, 20, 4000, "invalid_experience"),
    tools: required(data.tools, 5, 1500, "invalid_tools"),
    previousProjects: required(data.previousProjects, 10, 4000, "invalid_previous_projects"),
    collaboratingCompanies: optional(data.collaboratingCompanies, 1500, "invalid_companies"),
    achievements: optional(data.achievements, 2000, "invalid_achievements"),
    cvUrl,
    portfolioUrls,
    roleDescription: required(data.roleDescription, 20, 2000, "invalid_role_description"),
    interviewAnswers,
    creativeTrialConsent: data.creativeTrialConsent,
    rightsConfirmed: true,
    idempotencyKey,
  };
}
