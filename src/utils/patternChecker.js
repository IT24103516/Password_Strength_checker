/**
 * Detects weak patterns in a password.
 */
export const detectPatterns = (password) => {
  const issues = [];
  
  // 1. Check for common dictionary-like passwords (partial list for demo)
  const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'welcome', '12345678', 'password123'];
  if (commonPasswords.includes(password.toLowerCase())) {
    issues.push({
      type: 'critical',
      message: 'This is an extremely common password.',
    });
  }

  // 2. Check for sequences
  const sequences = ['abcdefghijklmnopqrstuvwxyz', '01234567890', 'qwertyuiop'];
  for (const seq of sequences) {
    for (let i = 0; i < password.length - 3; i++) {
        const sub = password.toLowerCase().substring(i, i + 4);
        if (seq.includes(sub)) {
            issues.push({
                type: 'warning',
                message: `Avoid sequences like '${sub}'.`,
            });
            break;
        }
    }
  }

  // 3. Check for repeated characters
  const repeatedCharRegex = /(.)\1{2,}/;
  if (repeatedCharRegex.test(password)) {
    issues.push({
      type: 'warning',
      message: 'Avoid repeating characters three or more times.',
    });
  }

  // 4. Check for length
  if (password.length < 8) {
    issues.push({
      type: 'warning',
      message: 'Password is too short (minimum 8 characters).',
    });
  }

  return issues;
};
