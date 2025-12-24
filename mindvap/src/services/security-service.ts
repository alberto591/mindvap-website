// Security Service
// Rate limiting, audit logging, and security monitoring

import { SecurityEvent } from '../types/auth';
import { log } from '../lib/logger';

export interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  max: number;          // Maximum requests per window
  message: string;      // Error message when limit exceeded
  skipSuccessful?: boolean; // Skip counting successful requests
}

export interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
    blocked?: boolean;
    blockedUntil?: number;
  };
}

export class SecurityService {
  private static rateLimitStore: RateLimitStore = {};
  private static readonly DEFAULT_RATE_LIMIT = {
    login: {
      windowMs: 15 * 60 * 1000,  // 15 minutes
      max: 5,                    // 5 attempts per window
      message: 'Too many login attempts, please try again later',
      skipSuccessful: true       // Don't count successful logins
    },
    passwordReset: {
      windowMs: 60 * 60 * 1000,  // 1 hour
      max: 3,                    // 3 reset requests per hour
      message: 'Too many password reset requests',
      skipSuccessful: false
    },
    registration: {
      windowMs: 60 * 60 * 1000,  // 1 hour
      max: 3,                    // 3 registrations per hour per IP
      message: 'Too many registration attempts',
      skipSuccessful: false
    },
    verifyEmail: {
      windowMs: 60 * 60 * 1000,  // 1 hour
      max: 5,                    // 5 verification attempts per hour
      message: 'Too many email verification attempts',
      skipSuccessful: true
    }
  };

  /**
   * Check if request is within rate limits
   */
  static checkRateLimit(identifier: string, action: keyof typeof SecurityService.DEFAULT_RATE_LIMIT): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    error?: string;
  } {
    const config = this.DEFAULT_RATE_LIMIT[action];
    const now = Date.now();
    const key = `${action}:${identifier} `;

    // Clean up expired entries
    this.cleanupExpiredEntries();

    const entry = this.rateLimitStore[key];

    if (!entry) {
      // First request
      this.rateLimitStore[key] = {
        count: 1,
        resetTime: now + config.windowMs
      };

      return {
        allowed: true,
        remaining: config.max - 1,
        resetTime: now + config.windowMs
      };
    }

    // Check if blocked
    if (entry.blocked && entry.blockedUntil && now < entry.blockedUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockedUntil,
        error: config.message
      };
    }

    // Reset window if expired
    if (now >= entry.resetTime) {
      entry.count = 1;
      entry.resetTime = now + config.windowMs;
      entry.blocked = false;
      entry.blockedUntil = undefined;

      return {
        allowed: true,
        remaining: config.max - 1,
        resetTime: now + config.windowMs
      };
    }

    // Check limit
    if (entry.count >= config.max) {
      // Block after max attempts (except for successful logins)
      if (action === 'login' && entry.count >= 5) {
        // Progressive blocking: 5min, 15min, 1hr, 24hr
        const blockMinutes = Math.min(Math.pow(3, entry.count - 4) * 5, 1440);
        entry.blocked = true;
        entry.blockedUntil = now + (blockMinutes * 60 * 1000);
      }

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        error: config.message
      };
    }

    // Increment counter
    entry.count++;

    return {
      allowed: true,
      remaining: config.max - entry.count,
      resetTime: entry.resetTime
    };
  }

  /**
   * Record successful action (reset rate limit)
   */
  static recordSuccess(identifier: string, action: keyof typeof SecurityService.DEFAULT_RATE_LIMIT): void {
    const config = this.DEFAULT_RATE_LIMIT[action];

    if (config.skipSuccessful) {
      const key = `${action}:${identifier} `;
      delete this.rateLimitStore[key];
    }
  }

  /**
   * Record failed action
   */
  static recordFailure(identifier: string, action: keyof typeof SecurityService.DEFAULT_RATE_LIMIT): void {
    // Additional failure tracking can be added here
    // For now, just use the rate limiting logic
  }

  /**
   * Get current rate limit status
   */
  static getRateLimitStatus(identifier: string, action: keyof typeof SecurityService.DEFAULT_RATE_LIMIT): {
    count: number;
    remaining: number;
    resetTime: number;
    blocked: boolean;
  } {
    const config = this.DEFAULT_RATE_LIMIT[action];
    const now = Date.now();
    const key = `${action}:${identifier} `;

    const entry = this.rateLimitStore[key];

    if (!entry) {
      return {
        count: 0,
        remaining: config.max,
        resetTime: now + config.windowMs,
        blocked: false
      };
    }

    return {
      count: entry.count,
      remaining: Math.max(0, config.max - entry.count),
      resetTime: entry.resetTime,
      blocked: entry.blocked || false
    };
  }

  /**
   * Generate device fingerprint (simplified synchronous version)
   */
  static generateDeviceFingerprint(): string {
    const components = [
      navigator.userAgent,
      navigator.language,
      navigator.platform,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset().toString(),
      navigator.cookieEnabled.toString(),
      navigator.hardwareConcurrency?.toString() || 'unknown',
      navigator.maxTouchPoints?.toString() || '0'
    ].join('|');

    // Simple hash function for browser compatibility
    let hash = 0;
    for (let i = 0; i < components.length; i++) {
      const char = components.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get client IP address (limited in browser environment)
   */
  static async getClientIP(): Promise<string> {
    try {
      // In a real implementation, this would come from server headers
      // For now, return a placeholder based on browser fingerprint
      return this.generateDeviceFingerprint();
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Log security event
   */
  static async logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): Promise<void> {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date()
    };

    // Store in local storage for demo purposes
    // In production, this would be sent to a logging service
    const events = this.getStoredSecurityEvents();
    events.push(securityEvent);

    // Keep only last 100 events
    if (events.length > 100) {
      events.splice(0, events.length - 100);
    }

    localStorage.setItem('mindvap_security_events', JSON.stringify(events));

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      log.info('Security Event', { securityEvent });
    }
  }

  /**
   * Get stored security events
   */
  static getStoredSecurityEvents(): SecurityEvent[] {
    try {
      const events = localStorage.getItem('mindvap_security_events');
      return events ? JSON.parse(events) : [];
    } catch (error) {
      log.error('Failed to parse security events', error);
      return [];
    }
  }

  /**
   * Clear security events
   */
  static clearSecurityEvents(): void {
    localStorage.removeItem('mindvap_security_events');
  }

  /**
   * Generate CSRF token
   */
  static generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate CSRF token
   */
  static validateCSRFToken(token: string): boolean {
    const storedToken = sessionStorage.getItem('mindvap_csrf_token');
    return storedToken === token;
  }

  /**
   * Set CSRF token
   */
  static setCSRFToken(token: string): void {
    sessionStorage.setItem('mindvap_csrf_token', token);
  }

  /**
   * Detect suspicious activity
   */
  static detectSuspiciousActivity(userAgent: string, ip: string): {
    isSuspicious: boolean;
    riskScore: number;
    reasons: string[];
  } {
    const reasons: string[] = [];
    let riskScore = 0;

    // Check for unusual user agent
    if (!userAgent || userAgent.length < 10) {
      reasons.push('Unusual user agent');
      riskScore += 20;
    }

    // Check for automation patterns
    const automationPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /headless/i,
      /phantom/i,
      /selenium/i
    ];

    if (automationPatterns.some(pattern => pattern.test(userAgent))) {
      reasons.push('Automation detected');
      riskScore += 50;
    }

    // Check IP against known suspicious patterns (simplified)
    if (ip === 'unknown' || ip.includes('proxy') || ip.includes('tor')) {
      reasons.push('Suspicious IP address');
      riskScore += 30;
    }

    // Time-based anomaly detection (simplified)
    const hour = new Date().getHours();
    if (hour < 6 || hour > 23) { // Late night/early morning
      reasons.push('Unusual access time');
      riskScore += 10;
    }

    return {
      isSuspicious: riskScore > 30,
      riskScore,
      reasons
    };
  }

  /**
   * Clean up expired rate limit entries
   */
  private static cleanupExpiredEntries(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of Object.entries(this.rateLimitStore)) {
      if (now > entry.resetTime && (!entry.blockedUntil || now > entry.blockedUntil)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => delete this.rateLimitStore[key]);
  }

  /**
   * Clear all rate limiting data
   */
  static clearRateLimits(): void {
    this.rateLimitStore = {};
  }

  /**
   * Clear rate limits for specific user/identifier
   */
  static clearRateLimitsForUser(identifier: string): void {
    const keysToDelete: string[] = [];

    for (const [key, entry] of Object.entries(this.rateLimitStore)) {
      if (key.includes(identifier)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => delete this.rateLimitStore[key]);
    log.info(`Cleared rate limits for: ${identifier} `);
  }

  /**
   * Reset security service completely (for testing)
   */
  static resetForTesting(): void {
    this.rateLimitStore = {};
    this.clearSecurityEvents();
    log.info('Security service reset for testing');
  }
}

// Export utility functions
export const checkRateLimit = SecurityService.checkRateLimit;
export const recordSuccess = SecurityService.recordSuccess;
export const recordFailure = SecurityService.recordFailure;
export const logSecurityEvent = SecurityService.logSecurityEvent;
export const generateDeviceFingerprint = SecurityService.generateDeviceFingerprint;
export const getClientIP = SecurityService.getClientIP;
export const generateCSRFToken = SecurityService.generateCSRFToken;
export const validateCSRFToken = SecurityService.validateCSRFToken;
export const setCSRFToken = SecurityService.setCSRFToken;