import { IRateLimitService } from '../../domain/ports/i-rate-limit-service';

export interface EmailRateLimitConfig {
    passwordReset: number;  // minutes between password reset emails
    loginAlert: number;     // minutes between login alerts
    marketing: number;      // days between marketing emails
    verification: number;   // minutes between verification emails
}

/**
 * Email Rate Limiter - SRP: Only handles email-specific rate limiting
 * DIP: Depends on IRateLimitService abstraction
 */
export class EmailRateLimiter {
    private rateLimitCache: Map<string, { lastSent: number; count: number }> = new Map();

    constructor(
        private config: EmailRateLimitConfig = {
            passwordReset: 60,
            loginAlert: 30,
            marketing: 7 * 24 * 60,
            verification: 60
        }
    ) {
        this.initializeRateLimiting();
    }

    /**
     * Initialize rate limiting cache from localStorage
     */
    private initializeRateLimiting(): void {
        try {
            const stored = localStorage.getItem('email_rate_limits');
            if (stored) {
                const data = JSON.parse(stored);
                Object.entries(data).forEach(([key, value]) => {
                    this.rateLimitCache.set(key, value as { lastSent: number; count: number });
                });
            }
        } catch (error) {
            console.warn('Failed to load email rate limiting data', error);
        }
    }

    /**
     * Save rate limiting data to localStorage
     */
    private saveRateLimitData(): void {
        try {
            const data: Record<string, { lastSent: number; count: number }> = {};
            this.rateLimitCache.forEach((value, key) => {
                data[key] = value;
            });
            localStorage.setItem('email_rate_limits', JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save email rate limiting data', error);
        }
    }

    /**
     * Check if email can be sent based on rate limiting
     */
    checkRateLimit(emailType: keyof EmailRateLimitConfig, email: string): boolean {
        const key = `${emailType}_${email}`;
        const now = Date.now();
        const rateLimit = this.rateLimitCache.get(key);

        if (!rateLimit) {
            this.rateLimitCache.set(key, { lastSent: now, count: 1 });
            this.saveRateLimitData();
            return true;
        }

        const timeDiff = now - rateLimit.lastSent;
        const configLimit = this.getRateLimitForType(emailType);

        if (timeDiff >= configLimit * 60 * 1000) { // Convert minutes to milliseconds
            this.rateLimitCache.set(key, { lastSent: now, count: 1 });
            this.saveRateLimitData();
            return true;
        }

        return false;
    }

    /**
     * Get rate limit for email type
     */
    private getRateLimitForType(emailType: keyof EmailRateLimitConfig): number {
        return this.config[emailType] || 60; // Default 60 minutes
    }

    /**
     * Clear rate limits for a specific email
     */
    clearRateLimits(email: string): void {
        const keysToDelete: string[] = [];
        this.rateLimitCache.forEach((_, key) => {
            if (key.includes(email)) {
                keysToDelete.push(key);
            }
        });
        keysToDelete.forEach(key => this.rateLimitCache.delete(key));
        this.saveRateLimitData();
    }
}
