/**
 * String and date sanitation utilities.
 * Pure linear transformations without branches or loops (AST complexity: 0).
 */

/**
 * Strips HTML angle brackets and trims surrounding whitespace.
 */
export function sanitizeString(input: string): string {
  return input.replace(/[<>]/g, '').trim();
}

/**
 * Normalizes input text to lower case and removes non-alphanumeric characters.
 */
export function normalizeIdentifier(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
}

/**
 * Returns an ISO 8601 string representation of a given timestamp.
 */
export function formatIsoTimestamp(epochMs: number): string {
  return new Date(epochMs).toISOString();
}
