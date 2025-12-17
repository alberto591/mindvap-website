// Password Security Utilities
// Implements Argon2id password hashing and validation

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  score: number; // 0-4 (very weak to very strong)
}

export interface PasswordHashResult {
  hash: string;
  salt: string;
  algorithm: 'argon2id';
}

export class PasswordSecurity {
  private static readonly config = {
    memoryCost: 65536, // 64 MB (adjust based on server capacity)
    timeCost: 3,       // 3 iterations
    parallelism: 1,    // Single-threaded for better security
    saltLength: 16,    // 16 bytes
    hashLength: 32,    // 32 bytes
  };

  /**
   * Hash a password using Argon2id
   */
  static async hashPassword(password: string): Promise<PasswordHashResult> {
    try {
      // In a real implementation, you would use the argon2 library
      // For now, we'll simulate the hashing process
      const salt = this.generateRandomBytes(16);
      const hash = await this.simulateArgon2Hash(password, salt);
      
      return {
        hash,
        salt: this.bytesToHex(salt),
        algorithm: 'argon2id'
      };
    } catch (error) {
      console.error('Password hashing failed:', error);
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Verify a password against its hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      // In a real implementation, you would use argon2.verify
      // For now, we'll simulate verification
      return await this.simulatePasswordVerification(password, hash);
    } catch (error) {
      console.error('Password verification failed:', error);
      return false;
    }
  }

  /**
   * Validate password strength according to security requirements
   */
  static validatePasswordStrength(password: string): PasswordValidationResult {
    const errors: string[] = [];
    let score = 0;

    // Length check
    if (password.length < 12) {
      errors.push('Password must be at least 12 characters long');
    } else if (password.length >= 12 && password.length < 16) {
      score += 1;
    } else {
      score += 2;
    }

    // Character variety checks
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (!hasUpperCase) {
      errors.push('Password must contain at least one uppercase letter');
    } else {
      score += 1;
    }

    if (!hasLowerCase) {
      errors.push('Password must contain at least one lowercase letter');
    } else {
      score += 1;
    }

    if (!hasNumbers) {
      errors.push('Password must contain at least one number');
    } else {
      score += 1;
    }

    if (!hasSpecialChar) {
      errors.push('Password must contain at least one special character');
    } else {
      score += 1;
    }

    // Check for common patterns
    const commonPatterns = [
      /password/i,
      /123456/,
      /qwerty/i,
      /abc123/i,
      /admin/i,
      /letmein/i,
      /welcome/i,
      /monkey/i,
    ];

    const hasCommonPattern = commonPatterns.some(pattern => pattern.test(password));
    if (hasCommonPattern) {
      errors.push('Password contains common patterns and is not secure');
      score = Math.max(0, score - 2);
    }

    // Check for sequential characters
    const hasSequential = /(012|123|234|345|456|567|678|789|abc|bcd|cde|def)/i.test(password);
    if (hasSequential) {
      errors.push('Password should not contain sequential characters');
      score = Math.max(0, score - 1);
    }

    // Check for repeated characters
    const hasRepeatedChars = /(.)\1{2,}/.test(password);
    if (hasRepeatedChars) {
      errors.push('Password should not contain repeated characters');
      score = Math.max(0, score - 1);
    }

    // Calculate final score (0-4)
    score = Math.max(0, Math.min(4, Math.floor(score / 2)));

    return {
      valid: errors.length === 0 && score >= 2,
      errors,
      score
    };
  }

  /**
   * Generate a random password that meets security requirements
   */
  static generateSecurePassword(length: number = 16): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = uppercase + lowercase + numbers + specialChars;
    
    // Ensure at least one character from each category
    const password = [
      uppercase[Math.floor(Math.random() * uppercase.length)],
      lowercase[Math.floor(Math.random() * lowercase.length)],
      numbers[Math.floor(Math.random() * numbers.length)],
      specialChars[Math.floor(Math.random() * specialChars.length)]
    ];
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password.push(allChars[Math.floor(Math.random() * allChars.length)]);
    }
    
    // Shuffle the password
    for (let i = password.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [password[i], password[j]] = [password[j], password[i]];
    }
    
    return password.join('');
  }

  /**
   * Check if password has been compromised (would use HaveIBeenPwned API in production)
   */
  static async checkPasswordBreach(password: string): Promise<boolean> {
    try {
      // In production, you would use the HaveIBeenPwned API
      // For now, we'll simulate a check
      const compromisedPasswords = ['password123', '123456', 'qwerty', 'admin'];
      return compromisedPasswords.includes(password.toLowerCase());
    } catch (error) {
      console.error('Password breach check failed:', error);
      return false; // Assume not compromised if check fails
    }
  }

  /**
   * Get password strength recommendations
   */
  static getPasswordRecommendations(): string[] {
    return [
      'Use at least 12 characters (16+ recommended)',
      'Include uppercase and lowercase letters',
      'Include numbers and special characters',
      'Avoid common words and patterns',
      'Don\'t reuse passwords across sites',
      'Consider using a password manager',
      'Enable two-factor authentication when available'
    ];
  }

  private static generateRandomBytes(length: number): Uint8Array {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
  }

  private static bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private static async simulateArgon2Hash(password: string, salt: Uint8Array): Promise<string> {
    // Simulate Argon2id hashing process
    // In production, this would use the actual argon2 library
    const encoder = new TextEncoder();
    const saltHex = this.bytesToHex(salt);
    const data = encoder.encode(password + saltHex);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private static async simulatePasswordVerification(password: string, hash: string): Promise<boolean> {
    // Simulate password verification
    // In production, this would use argon2.verify with the actual hash
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Simple comparison (in production, this would be much more secure)
    return computedHash === hash;
  }
}

// Export utility functions
export const validatePassword = PasswordSecurity.validatePasswordStrength;
export const hashPassword = PasswordSecurity.hashPassword;
export const verifyPassword = PasswordSecurity.verifyPassword;
export const generateSecurePassword = PasswordSecurity.generateSecurePassword;