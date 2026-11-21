const EDITABLE_FIELDS = new Set([
  "fullName", "profession", "country", "region", "gender",
  "maritalStatus", "bio", "interests", "goals",
]);

function text(value: unknown, field: string, min: number, max: number, allowEmpty = false): string {
  if (typeof value !== "string") throw new Error(`INVALID_${field.toUpperCase()}`);
  const normalized = value.trim();
  if ((!allowEmpty && normalized.length < min) || normalized.length > max) {
    throw new Error(`INVALID_${field.toUpperCase()}`);
  }
  return normalized;
}

function list(value: unknown, field: string, maxItems: number, maxLength: number): string[] {
  if (!Array.isArray(value) || value.length > maxItems) {
    throw new Error(`INVALID_${field.toUpperCase()}`);
  }
  const normalized = value.map((item) => text(item, field, 1, maxLength));
  if (new Set(normalized.map((item) => item.toLocaleLowerCase())).size !== normalized.length) {
    throw new Error(`DUPLICATE_${field.toUpperCase()}`);
  }
  return normalized;
}

/** Validate a partial, allowlisted member edit; age and username are immutable here. */
export function validateMemberProfileUpdate(input: Record<string, unknown>, currentAge: number): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("INVALID_PROFILE_UPDATE");
  }
  const keys = Object.keys(input);
  if (keys.length === 0 || keys.some((key) => !EDITABLE_FIELDS.has(key))) {
    throw new Error("PROFILE_UPDATE_FIELD_NOT_ALLOWED");
  }
  const update: Record<string, unknown> = {};
  for (const key of keys) {
    switch (key) {
      case "fullName":
        update.fullName = text(input[key], key, 2, 80);
        break;
      case "profession":
      case "country":
      case "region":
        update[key] = text(input[key], key, 2, 80);
        break;
      case "gender": {
        const gender = text(input[key], key, 1, 32);
        if (!["male", "female"].includes(gender)) throw new Error("INVALID_GENDER");
        update.gender = gender;
        break;
      }
      case "maritalStatus": {
        const maritalStatus = text(input[key], key, 1, 40);
        if (!["single", "married", "divorced", "widowed"].includes(maritalStatus)) {
          throw new Error("INVALID_MARITAL_STATUS");
        }
        update.maritalStatus = maritalStatus;
        break;
      }
      case "bio":
        update.bio = text(input[key], key, 0, 500, true);
        break;
      case "interests":
        update.interests = list(input[key], key, 20, 40);
        break;
      case "goals": {
        const goals = list(input[key], key, 10, 40);
        if (goals.some((goal) => ![
          "friendship", "social_connection", "romantic_dating", "marriage",
        ].includes(goal))) throw new Error("INVALID_GOALS");
        if (currentAge < 18 && goals.some((goal) =>
          ["romantic_dating", "marriage"].includes(goal))) {
          throw new Error("ADULT_RELATIONSHIP_GOAL_REQUIRES_ADULT");
        }
        update.goals = goals;
        break;
      }
    }
  }
  return update;
}
