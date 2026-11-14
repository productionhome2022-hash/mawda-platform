/** Shared fail-closed guard for explicitly named non-production resources. */
export function isExplicitNonProductionTarget(
  value: unknown,
  allowedMarkers: readonly string[],
): value is string {
  if (typeof value !== "string" || value.length === 0 || value.trim() !== value) return false;
  // "nonprod" and "nonproduction" are valid non-production markers; do not
  // mistake their embedded "prod" substring for a production target.
  if (/(?<!non)prod(uction)?/i.test(value)) return false;
  const normalized = value.toLowerCase();
  return allowedMarkers.some((marker) => normalized.includes(marker.toLowerCase()));
}
