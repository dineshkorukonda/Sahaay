export interface QualityRecord {
  turbidity: number;
  ph: number;
}

export function validateWaterParameters(record: QualityRecord): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (record.turbidity < 0) issues.push("Turbidity cannot be negative");
  if (record.ph < 0 || record.ph > 14) issues.push("pH must be between 0 and 14");
  return {
    isValid: issues.length === 0,
    issues,
  };
}
