const EDITABLE_FIELDS = new Set([
  "fullName", "profession", "country", "region", "gender",
  "maritalStatus", "bio", "interests", "goals",
]);

function text(value, field, min, max, allowEmpty = false) {
  if (typeof value !== "string") throw new Error(`INVALID_${field.toUpperCase()}`);
  const normalized = value.trim();
  if ((!allowEmpty && normalized.length < min) || normalized.length > max) {
    throw new Error(`INVALID_${field.toUpperCase()}`);
  }
  return normalized;
}

function list(value, field, maxItems, maxLength) {
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
export function validateMemberProfileUpdate(input, currentAge) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("INVALID_PROFILE_UPDATE");
  }
  const keys = Object.keys(input);
  if (keys.length === 0 || keys.some((key) => !EDITABLE_FIELDS.has(key))) {
    throw new Error("PROFILE_UPDATE_FIELD_NOT_ALLOWED");
  }
  const update = {};
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
      case "gender":
        update.gender = text(input[key], key, 1, 32);
        if (!["male", "female"].includes(update.gender)) throw new Error("INVALID_GENDER");
        break;
      case "maritalStatus":
        update.maritalStatus = text(input[key], key, 1, 40);
        if (!["single", "married", "divorced", "widowed"].includes(update.maritalStatus)) {
          throw new Error("INVALID_MARITAL_STATUS");
        }
        break;
      case "bio":
        update.bio = text(input[key], key, 0, 500, true);
        break;
      case "interests":
        update.interests = list(input[key], key, 20, 40);
        break;
      case "goals":
        update.goals = list(input[key], key, 10, 40);
        if (update.goals.some((goal) => ![
          "friendship", "social_connection", "romantic_dating", "marriage",
        ].includes(goal))) throw new Error("INVALID_GOALS");
        if (currentAge < 18 && update.goals.some((goal) =>
          ["romantic_dating", "marriage"].includes(goal))) {
          throw new Error("ADULT_RELATIONSHIP_GOAL_REQUIRES_ADULT");
        }
        break;
    }
  }
  return update;
}
