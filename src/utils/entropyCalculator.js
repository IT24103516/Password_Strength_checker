/**
 * Calculates the bit-entropy of a password.
 * Entropy = L * log2(R)
 * L: Length of the password
 * R: Size of the character set pool
 */
export const calculateEntropy = (password) => {
  if (!password) return 0;

  let poolSize = 0;
  
  const charTypes = {
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /[0-9]/.test(password),
    symbols: /[^a-zA-Z0-9]/.test(password),
  };

  if (charTypes.lowercase) poolSize += 26;
  if (charTypes.uppercase) poolSize += 26;
  if (charTypes.numbers) poolSize += 10;
  if (charTypes.symbols) poolSize += 33; // Approx size of symbol set

  if (poolSize === 0) return 0;

  const entropy = password.length * Math.log2(poolSize);
  return Math.round(entropy * 100) / 100;
};

export const getEntropyStrength = (entropy) => {
  if (entropy < 28) return 'Very Weak';
  if (entropy < 36) return 'Weak';
  if (entropy < 60) return 'Medium';
  if (entropy < 128) return 'Strong';
  return 'Very Strong';
};
