export type MemberProfileInput = {
  fullName: string;
  username: string;
  age: number;
  profession: string;
  country: string;
  region: string;
  gender: string;
  maritalStatus: string;
  bio: string;
  interests: string[];
  goals: string[];
};

function requiredText(value: unknown, field: string, min: number, max: number): string {
  if (typeof value !== "string") throw new Error(`${field}: يجب إدخال نص صالح.`);
  const normalized = value.trim();
  if (normalized.length < min || normalized.length > max) {
    throw new Error(`${field}: طول القيمة غير صالح.`);
  }
  return normalized;
}

function stringList(value: unknown, field: string, maxItems: number, maxLength: number): string[] {
  if (!Array.isArray(value) || value.length > maxItems) {
    throw new Error(`${field}: القائمة غير صالحة.`);
  }
  const result = value.map((item) => requiredText(item, field, 1, maxLength));
  if (new Set(result.map((item) => item.toLocaleLowerCase())).size !== result.length) {
    throw new Error(`${field}: توجد عناصر مكررة.`);
  }
  return result;
}

export function normalizeUsername(value: unknown): string {
  const username = requiredText(value, "username", 3, 20).toLowerCase();
  if (!/^[a-z0-9_]+$/.test(username)) {
    throw new Error("username: استخدم الحروف الإنجليزية الصغيرة والأرقام والشرطة السفلية فقط.");
  }
  return username;
}

export function validateMemberProfile(
  data: Record<string, unknown>,
  minimumAge: number | undefined,
): MemberProfileInput {
  if (!Number.isSafeInteger(minimumAge) || (minimumAge as number) < 16 || (minimumAge as number) > 120) {
    throw new Error("REGISTRATION_POLICY_NOT_CONFIGURED");
  }
  const age = data.age;
  if (typeof age !== "number" || !Number.isSafeInteger(age) || age < minimumAge! || age > 120) {
    throw new Error("AGE_POLICY_NOT_MET");
  }
  const gender = requiredText(data.gender, "gender", 1, 32);
  if (!["male", "female"].includes(gender)) {
    throw new Error("gender: القيمة المختارة غير مدعومة.");
  }
  const maritalStatus = requiredText(data.maritalStatus, "maritalStatus", 1, 40);
  if (!["single", "married", "divorced", "widowed"].includes(maritalStatus)) {
    throw new Error("maritalStatus: القيمة المختارة غير مدعومة.");
  }
  const goals = stringList(data.goals ?? [], "goals", 10, 40);
  const allowedGoals = new Set(["friendship", "social_connection", "romantic_dating", "marriage"]);
  if (goals.some((goal) => !allowedGoals.has(goal))) {
    throw new Error("goals: اختر هدفاً معتمداً من القائمة.");
  }
  if (age < 18 && goals.some((goal) => ["romantic_dating", "marriage"].includes(goal))) {
    throw new Error("ADULT_RELATIONSHIP_GOAL_REQUIRES_ADULT");
  }
  const bio = data.bio === undefined ? "" : data.bio;
  if (typeof bio !== "string" || bio.trim().length > 500) {
    throw new Error("bio: الحد الأقصى 500 حرف.");
  }
  return {
    fullName: requiredText(data.fullName, "fullName", 2, 80),
    username: normalizeUsername(data.username),
    age,
    profession: requiredText(data.profession, "profession", 2, 80),
    country: requiredText(data.country, "country", 2, 80),
    region: requiredText(data.region, "region", 2, 80),
    gender,
    maritalStatus,
    bio: bio.trim(),
    interests: stringList(data.interests ?? [], "interests", 20, 40),
    goals,
  };
}
