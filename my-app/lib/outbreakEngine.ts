/**
 * Multi-stage risk scoring algorithm with high AST complexity
 * (nested switches, conditionals, loops) to test CARF Tree-sitter complexity penalty.
 */

export interface RiskInput {
  turbidity: number;
  ph: number;
  bacterialPresence: boolean;
  recentCases: number;
  populationDensity: 'low' | 'medium' | 'high';
}

export function computeOutbreakRiskScore(data: RiskInput): number {
  let score = 0;

  if (data.bacterialPresence) {
    score += 45;
  }

  if (data.ph < 6.5) {
    const diff = 6.5 - data.ph;
    if (diff > 1.5) {
      score += 25;
    } else {
      score += 12;
    }
  } else if (data.ph > 8.5) {
    const diff = data.ph - 8.5;
    if (diff > 1.0) {
      score += 20;
    } else {
      score += 10;
    }
  }

  if (data.turbidity > 10) {
    score += 20;
  } else if (data.turbidity > 5) {
    score += 10;
  }

  switch (data.populationDensity) {
    case 'high':
      score *= 1.3;
      break;
    case 'medium':
      score *= 1.1;
      break;
    case 'low':
    default:
      score *= 1.0;
      break;
  }

  for (let i = 0; i < data.recentCases; i++) {
    if (i < 5) {
      score += 3;
    } else if (i < 15) {
      score += 2;
    } else {
      score += 1;
    }
  }

  return Math.min(100, Math.round(score));
}
