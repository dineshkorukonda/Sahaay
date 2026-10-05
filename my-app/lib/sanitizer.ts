/**
 * Linear string sanitization utilities with minimal cyclomatic complexity.
 * Designed to provide baseline low-AST-complexity code change for CARF vector classification.
 */

export function sanitizeText(input: string): string {
  if (!input) return "";
  return input.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
}

export function normalizeSearchQuery(query: string): string {
  return query.toLowerCase().trim().replace(/\s+/g, " ");
}

export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength);
}
