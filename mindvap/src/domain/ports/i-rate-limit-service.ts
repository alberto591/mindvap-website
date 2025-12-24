export interface RateLimitConfig {
    windowMs: number;
    max: number;
    message: string;
    skipSuccessful?: boolean;
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    error?: string;
}

export interface RateLimitStatus {
    count: number;
    remaining: number;
    resetTime: number;
    blocked: boolean;
}

export type RateLimitAction = 'login' | 'passwordReset' | 'registration' | 'verifyEmail' | 'apiCall';

/**
 * Rate Limiting Service - Focused on rate limiting only (ISP, SRP)
 */
export interface IRateLimitService {
    checkRateLimit(identifier: string, action: RateLimitAction): RateLimitResult;
    recordSuccess(identifier: string, action: RateLimitAction): void;
    recordFailure(identifier: string, action: RateLimitAction): void;
    getRateLimitStatus(identifier: string, action: RateLimitAction): RateLimitStatus;
    clearRateLimits(): void;
    clearRateLimitsForUser(identifier: string): void;
}
