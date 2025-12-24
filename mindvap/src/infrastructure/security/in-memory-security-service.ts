import {
    ISecurityService,
    RateLimitResult,
    SuspicionResult,
    SecurityEvent
} from '../../domain/ports/i-security-service';
import { log } from '../lib/logger';

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
        blocked?: boolean;
        blockedUntil?: number;
    };
}

interface RateLimitConfig {
    windowMs: number;
    max: number;
    message: string;
    skipSuccessful?: boolean;
}

export class InMemorySecurityService implements ISecurityService {
    private rateLimitStore: RateLimitStore = {};

    private readonly DEFAULT_RATE_LIMIT: Record<string, RateLimitConfig> = {
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
        }
    };

    checkRateLimit(identifier: string, action: string): RateLimitResult {
        const config = this.DEFAULT_RATE_LIMIT[action] || this.DEFAULT_RATE_LIMIT.login;
        const now = Date.now();
        const key = `${action}:${identifier}`;

        this.cleanupExpiredEntries();

        const entry = this.rateLimitStore[key];

        if (!entry) {
            this.rateLimitStore[key] = {
                count: 1,
                resetTime: now + config.windowMs
            };

            return {
                allowed: true,
                remaining: config.max - 1
            };
        }

        if (entry.blocked && entry.blockedUntil && now < entry.blockedUntil) {
            return {
                allowed: false,
                remaining: 0,
                retryAfter: entry.blockedUntil
            };
        }

        if (now >= entry.resetTime) {
            entry.count = 1;
            entry.resetTime = now + config.windowMs;
            entry.blocked = false;
            entry.blockedUntil = undefined;

            return {
                allowed: true,
                remaining: config.max - 1
            };
        }

        if (entry.count >= config.max) {
            if (action === 'login' && entry.count >= 5) {
                const blockMinutes = Math.min(Math.pow(3, entry.count - 4) * 5, 1440);
                entry.blocked = true;
                entry.blockedUntil = now + (blockMinutes * 60 * 1000);
            }

            return {
                allowed: false,
                remaining: 0,
                retryAfter: entry.resetTime
            };
        }

        entry.count++;

        return {
            allowed: true,
            remaining: config.max - entry.count
        };
    }

    recordSuccess(identifier: string, action: string): void {
        const config = this.DEFAULT_RATE_LIMIT[action];
        if (config?.skipSuccessful) {
            const key = `${action}:${identifier}`;
            delete this.rateLimitStore[key];
        }
    }

    recordFailure(identifier: string, action: string): void {
        // Failure is already tracked by checkRateLimit
    }

    getRateLimitStatus(identifier: string, action: string): {
        attempts: number;
        remaining: number;
        resetAt: number;
    } {
        const config = this.DEFAULT_RATE_LIMIT[action] || this.DEFAULT_RATE_LIMIT.login;
        const now = Date.now();
        const key = `${action}:${identifier}`;
        const entry = this.rateLimitStore[key];

        if (!entry) {
            return {
                attempts: 0,
                remaining: config.max,
                resetAt: now + config.windowMs
            };
        }

        return {
            attempts: entry.count,
            remaining: Math.max(0, config.max - entry.count),
            resetAt: entry.resetTime
        };
    }

    clearRateLimits(): void {
        this.rateLimitStore = {};
    }

    clearRateLimitsForUser(identifier: string): void {
        const keysToDelete: string[] = [];

        for (const key of Object.keys(this.rateLimitStore)) {
            if (key.includes(identifier)) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => delete this.rateLimitStore[key]);
        log.info(`Cleared rate limits for: ${identifier}`);
    }

    generateCSRFToken(): string {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    validateCSRFToken(token: string): boolean {
        const storedToken = sessionStorage.getItem('mindvap_csrf_token');
        return storedToken === token;
    }

    setCSRFToken(token: string): void {
        sessionStorage.setItem('mindvap_csrf_token', token);
    }

    async logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): Promise<void> {
        const securityEvent: SecurityEvent = {
            ...event,
            timestamp: new Date().toISOString()
        };

        const events = this.getStoredSecurityEvents();
        events.push(securityEvent);

        if (events.length > 100) {
            events.splice(0, events.length - 100);
        }

        localStorage.setItem('mindvap_security_events', JSON.stringify(events));

        if (process.env.NODE_ENV === 'development') {
            log.info('Security Event', { securityEvent });
        }
    }

    getStoredSecurityEvents(): SecurityEvent[] {
        try {
            const events = localStorage.getItem('mindvap_security_events');
            return events ? JSON.parse(events) : [];
        } catch (error) {
            log.error('Failed to parse security events', error);
            return [];
        }
    }

    clearSecurityEvents(): void {
        localStorage.removeItem('mindvap_security_events');
    }

    detectSuspiciousActivity(userAgent: string, ip: string): SuspicionResult {
        const reasons: string[] = [];
        let riskScore = 0;

        if (!userAgent || userAgent.length < 10) {
            reasons.push('Unusual user agent');
            riskScore += 20;
        }

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

        if (ip === 'unknown' || ip.includes('proxy') || ip.includes('tor')) {
            reasons.push('Suspicious IP address');
            riskScore += 30;
        }

        const hour = new Date().getHours();
        if (hour < 6 || hour > 23) {
            reasons.push('Unusual access time');
            riskScore += 10;
        }

        return {
            isSuspicious: riskScore > 30,
            riskScore,
            reasons
        };
    }

    generateDeviceFingerprint(): string {
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

        let hash = 0;
        for (let i = 0; i < components.length; i++) {
            const char = components.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }

    async getClientIP(): Promise<string> {
        try {
            return this.generateDeviceFingerprint();
        } catch (error) {
            return 'unknown';
        }
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
