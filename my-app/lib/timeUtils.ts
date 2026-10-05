import ms from "ms";

/**
 * Format uptime or duration strings using ms package.
 */
export function formatDuration(durationMs: number): string {
  if (durationMs < 0) return "0s";
  return ms(durationMs, { long: true });
}

export function parseDurationToMs(durationStr: string): number {
  return ms(durationStr) || 0;
}
