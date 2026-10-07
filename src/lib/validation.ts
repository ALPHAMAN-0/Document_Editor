/** Longest document title the API accepts. */
export const MAX_TITLE_LENGTH = 255;

/** Largest serialized editor content (characters) the API stores per field. */
export const MAX_CONTENT_LENGTH = 5 * 1024 * 1024;

/** `wordCount` is stored in a 32-bit integer column. */
export const MAX_WORD_COUNT = 2_147_483_647;

/** Highest page number accepted, so `skip` always stays a small integer. */
export const MAX_PAGE = 1_000_000;

/**
 * Parses a positive integer query parameter.
 * Missing, malformed or non-positive values fall back to the default instead
 * of reaching the database as NaN; large values are clamped to `max`.
 */
export function parsePositiveInt(
  value: string | null | undefined,
  fallback: number,
  max: number
): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

/** True for JSON objects (`{...}`), false for null, arrays and primitives. */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Checks the string fields of a document create/update payload.
 * Returns an error message and HTTP status, or null when the payload is fine.
 */
export function validateDocumentFields(fields: {
  title?: unknown;
  content?: unknown;
  contentHtml?: unknown;
}): { error: string; status: 400 | 413 } | null {
  if (typeof fields.title === "string" && fields.title.length > MAX_TITLE_LENGTH) {
    return {
      error: `Title must be at most ${MAX_TITLE_LENGTH} characters`,
      status: 400,
    };
  }

  for (const field of ["content", "contentHtml"] as const) {
    const value = fields[field];
    if (typeof value === "string" && value.length > MAX_CONTENT_LENGTH) {
      return { error: "Document content is too large", status: 413 };
    }
  }

  return null;
}
