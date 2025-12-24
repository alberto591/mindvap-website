/**
 * @deprecated This interface violates ISP (Interface Segregation Principle)
 * Use the following focused interfaces instead:
 * - IRateLimitService for rate limiting
 * - ICSRFProtectionService for CSRF protection
 * - ISecurityEventLogger for event logging
 * - IThreatDetectionService for threat detection
 * 
 * This file is kept for backwards compatibility during migration.
 * It will be removed once all consumers are updated.
 */

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    retryAfter?: number;
}

export interface SuspicionResult {
    isSuspicious: boolean;
    reasons: string[];
    riskScore: number;
}

export interface SecurityEvent {
    type: 'login' | 'failed_login' | 'password_change' | 'suspicious_activity' | 'rate_limit' | 'csrf_violation';
    identifier: string;
    userAgent?: string;
    ipAddress?: string;
    metadata?: Record<string, any>;
    timestamp: string;
}

/**
 * @deprecated - Split into focused interfaces (ISP)
 */
export interface ISecurityService {
    // Rate limiting
    checkRateLimit(identifier: string, action: string): RateLimitResult;
    recordSuccess(identifier: string, action: string): void;
    recordFailure(identifier: string, action: string): void;
    getRateLimitStatus(identifier: string, action: string): {
        attempts: number;
        remaining: number;
        resetAt: number;
    };
    clearRateLimits(): void;
    clearRateLimitsForUser(identifier: string): void;

    // CSRF Protection
    generateCSRFToken(): string;
    validateCSRFToken(token: string): boolean;
    setCSRFToken(token: string): void;

    // Security Events
    logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): Promise<void>;
    getStoredSecurityEvents(): SecurityEvent[];
    clearSecurityEvents(): void;

    // Threat Detection
    detectSuspiciousActivity(userAgent: string, ip: string): SuspicionResult;
    generateDeviceFingerprint(): string;
    getClientIP(): Promise<string>;
}

