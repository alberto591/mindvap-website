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
