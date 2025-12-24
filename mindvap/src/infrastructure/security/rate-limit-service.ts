import { IRateLimitService, RateLimitAction, RateLimitConfig, RateLimitResult, RateLimitStatus } from '../../domain/ports/i-rate-limit-service';
import { log } from '../lib/logger';

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
        blocked?: boolean;
        blockedUntil?: number;
    };
}

/**
 * Rate Limiting Service - SRP: Only handles rate limiting logic
 * DIP: Implements domain interface, injectable
 */
export class RateLimitService implements IRateLimitService {
    private rateLimitStore: RateLimitStore = {};
    private readonly DEFAULT_CONFIGS: Record<RateLimitAction, RateLimitConfig> = {
        login: {
            windowMs: 15 * 60 * 1000,  // 15 minutes
            max: 5,
            message: 'Too many login attempts, please try again later',
            skipSuccessful: true
        },
        passwordReset: {
            windowMs: 60 * 60 * 1000,  // 1 hour
            max: 3,
            message: 'Too many password reset requests',
            skipSuccessful: false
        },
        registration: {
            windowMs: 60 * 60 * 1000,  // 1 hour
            max: 3,
            message: 'Too many registration attempts',
            skipSuccessful: false
        },
        verifyEmail: {
            windowMs: 60 * 60 * 1000,  // 1 hour
            max: 5,
            message: 'Too many email verification attempts',
            skipSuccessful: true
        },
        apiCall: {
            windowMs: 60 * 1000,  // 1 minute
            max: 60,
            message: 'Too many API calls',
            skipSuccessful: false
        }
    };

    checkRateLimit(identifier: string, action: RateLimitAction): RateLimitResult {
        const config = this.DEFAULT_CONFIGS[action];
        const now = Date.now();
        const key = `${action}:${identifier}`;

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
            // Progressive blocking for login attempts
            if (action === 'login' && entry.count >= 5) {
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

    recordSuccess(identifier: string, action: RateLimitAction): void {
        const config = this.DEFAULT_CONFIGS[action];

        if (config.skipSuccessful) {
            const key = `${action}:${identifier}`;
            delete this.rateLimitStore[key];
        }
    }

    recordFailure(identifier: string, action: RateLimitAction): void {
        // Failure tracking is handled by checkRateLimit incrementing the counter
        log.info('Rate limit failure recorded', { identifier, action });
    }

    getRateLimitStatus(identifier: string, action: RateLimitAction): RateLimitStatus {
        const config = this.DEFAULT_CONFIGS[action];
        const now = Date.now();
        const key = `${action}:${identifier}`;

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

    clearRateLimits(): void {
        this.rateLimitStore = {};
        log.info('All rate limits cleared');
    }

    clearRateLimitsForUser(identifier: string): void {
        const keysToDelete: string[] = [];

        for (const [key] of Object.entries(this.rateLimitStore)) {
            if (key.includes(identifier)) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => delete this.rateLimitStore[key]);
        log.info(`Cleared rate limits for: ${identifier}`);
    }

    private cleanupExpiredEntries(): void {
        const now = Date.now();
        const keysToDelete: string[] = [];

        for (const [key, entry] of Object.entries(this.rateLimitStore)) {
            if (now > entry.resetTime && (!entry.blockedUntil || now > entry.blockedUntil)) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => delete this.rateLimitStore[key]);
    }
}
