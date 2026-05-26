import { calculateEntropy, getEntropyStrength } from './entropyCalculator';
import { detectPatterns } from './patternChecker';

/**
 * Orchestrates password analysis and returns a comprehensive report.
 */
export const analyzePassword = (password) => {
  if (!password) {
    return {
      score: 0,
      entropy: 0,
      strength: 'None',
      feedback: [],
      checks: {
        length: false,
        uppercase: false,
        lowercase: false,
        numbers: false,
        symbols: false,
      }
    };
  }

  const entropy = calculateEntropy(password);
  const patternIssues = detectPatterns(password);
  
  const checks = {
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /[0-9]/.test(password),
    symbols: /[^a-zA-Z0-9]/.test(password),
  };

  // Calculate score (0-100)
  // Base score from entropy (up to 80 points)
  // + Bonus for variety of characters (up to 20 points)
  let score = Math.min(80, (entropy / 100) * 80);
  
  const checkCount = Object.values(checks).filter(Boolean).length;
  score += (checkCount / 5) * 20;

  // Deduct for patterns
  patternIssues.forEach(issue => {
    if (issue.type === 'critical') score *= 0.2;
    if (issue.type === 'warning') score *= 0.8;
  });

  return {
    score: Math.round(Math.max(0, Math.min(100, score))),
    entropy,
    strength: getEntropyStrength(entropy),
    feedback: patternIssues,
    checks,
  };
};
