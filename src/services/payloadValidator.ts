/**
 * Multi-Stage Payload Validation and Transformation Service.
 * Implements intensive branching, nested loops, and deep conditional AST structures
 * for Tree-sitter AST complexity scoring and validation.
 */

export interface ValidationRule {
  field: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
  min?: number;
  max?: number;
  regex?: string;
}

export interface ValidationReport {
  isValid: boolean;
  score: number;
  errors: string[];
  warnings: string[];
  transformedData: Record<string, unknown>;
}

export class PayloadValidationService {
  /**
   * Evaluates incoming request payload through multi-tiered validation rules
   * with high cyclomatic complexity and deep branching.
   */
  public static validateAndTransform(
    payload: Record<string, unknown>,
    rules: ValidationRule[],
    strictMode: boolean = false
  ): ValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];
    const transformed: Record<string, unknown> = {};
    let anomalyScore = 0;

    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return {
        isValid: false,
        score: 100,
        errors: ['Payload must be a non-null, non-array object'],
        warnings: [],
        transformedData: {},
      };
    }

    // Stage 1: Iterative rule processing with nested constraint checks
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      const val = payload[rule.field];

      if (val === undefined || val === null) {
        if (rule.required) {
          errors.push(`Missing required field: ${rule.field}`);
          anomalyScore += 25;
        } else {
          warnings.push(`Optional field omitted: ${rule.field}`);
        }
        continue;
      }

      // Stage 2: Deep type branching and nested type verification
      switch (rule.type) {
        case 'string':
          if (typeof val !== 'string') {
            errors.push(`Field ${rule.field} must be a string`);
            anomalyScore += 15;
          } else {
            const trimmed = val.trim();
            if (rule.min !== undefined && trimmed.length < rule.min) {
              errors.push(`Field ${rule.field} length below min ${rule.min}`);
              anomalyScore += 10;
            } else if (rule.max !== undefined && trimmed.length > rule.max) {
              errors.push(`Field ${rule.field} length exceeds max ${rule.max}`);
              anomalyScore += 10;
            }

            if (rule.regex) {
              const matcher = new RegExp(rule.regex);
              if (!matcher.test(trimmed)) {
                if (strictMode) {
                  errors.push(`Field ${rule.field} failed strict regex validation`);
                  anomalyScore += 20;
                } else {
                  warnings.push(`Field ${rule.field} pattern discrepancy`);
                  anomalyScore += 5;
                }
              }
            }
            transformed[rule.field] = trimmed;
          }
          break;

        case 'number':
          if (typeof val !== 'number' || isNaN(val)) {
            errors.push(`Field ${rule.field} must be a valid number`);
            anomalyScore += 20;
          } else {
            if (rule.min !== undefined && val < rule.min) {
              if (strictMode) {
                errors.push(`Field ${rule.field} value ${val} < min ${rule.min}`);
              } else {
                warnings.push(`Field ${rule.field} under recommended lower bound`);
              }
              anomalyScore += 10;
            }
            if (rule.max !== undefined && val > rule.max) {
              if (strictMode) {
                errors.push(`Field ${rule.field} value ${val} > max ${rule.max}`);
              } else {
                warnings.push(`Field ${rule.field} exceeds upper bound`);
              }
              anomalyScore += 10;
            }
            transformed[rule.field] = val;
          }
          break;

        case 'array':
          if (!Array.isArray(val)) {
            errors.push(`Field ${rule.field} must be an array`);
            anomalyScore += 20;
          } else {
            const sanitizedList: unknown[] = [];
            for (let j = 0; j < val.length; j++) {
              const item = val[j];
              if (item !== null && item !== undefined) {
                if (typeof item === 'string') {
                  const s = item.trim();
                  if (s.length > 0) {
                    sanitizedList.push(s);
                  }
                } else if (typeof item === 'number') {
                  if (!isNaN(item) && item >= 0) {
                    sanitizedList.push(item);
                  }
                } else if (typeof item === 'object') {
                  sanitizedList.push(item);
                }
              }
            }
            transformed[rule.field] = sanitizedList;
          }
          break;

        default:
          transformed[rule.field] = val;
          break;
      }
    }

    // Stage 3: Compound risk calculation
    const isValid = strictMode ? errors.length === 0 && warnings.length === 0 : errors.length === 0;

    return {
      isValid,
      score: anomalyScore,
      errors,
      warnings,
      transformedData: transformed,
    };
  }
}
