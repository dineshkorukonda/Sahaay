export interface AuditEntry {
  probeName: string;
  statusCode: number;
  latencyMs: number;
}

export function parseAuditEntry(raw: unknown): AuditEntry | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.probeName !== 'string' || typeof obj.statusCode !== 'number' || typeof obj.latencyMs !== 'number') {
    return null;
  }
  return {
    probeName: obj.probeName,
    statusCode: obj.statusCode,
    latencyMs: obj.latencyMs,
  };
}
