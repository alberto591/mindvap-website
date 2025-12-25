
import { log } from '../../infrastructure/lib/logger';

export interface SecurityMetric {
    timestamp: string;
    type: 'rate_limit' | 'circuit_breaker' | 'content_moderation' | 'auth_failure' | 'ai_formulation';
    identifier: string;
    action: string;
    metadata?: Record<string, any>;
}

export interface SecuritySummary {
    totalEvents: number;
    eventsByType: Record<string, number>;
    topOffenders: Array<{ identifier: string; count: number }>;
    recentEvents: SecurityMetric[];
}

/**
 * SecurityMetricService - SRP: Collects and aggregates security metrics for observability.
 */
export class SecurityMetricService {
    private static readonly METRICS_STORAGE_KEY = 'mindvap_security_metrics';
    private static readonly MAX_METRICS = 500;

    /**
     * Track a security-related event
     */
    static trackEvent(metric: Omit<SecurityMetric, 'timestamp'>): void {
        const fullMetric: SecurityMetric = {
            ...metric,
            timestamp: new Date().toISOString()
        };

        const metrics = this.getStoredMetrics();
        metrics.push(fullMetric);

        // Prune old metrics
        if (metrics.length > this.MAX_METRICS) {
            metrics.splice(0, metrics.length - this.MAX_METRICS);
        }

        this.saveMetrics(metrics);

        // Log for visibility
        log.info(`Security Metric Tracked: ${fullMetric.type} - ${fullMetric.action}`, {
            identifier: fullMetric.identifier,
            metadata: fullMetric.metadata
        });
    }

    /**
     * Get current security summary
     */
    static getSummary(): SecuritySummary {
        const metrics = this.getStoredMetrics();

        const summary: SecuritySummary = {
            totalEvents: metrics.length,
            eventsByType: {},
            topOffenders: [],
            recentEvents: metrics.slice(-10).reverse()
        };

        const offenderMap = new Map<string, number>();

        metrics.forEach(m => {
            // Aggregate by type
            summary.eventsByType[m.type] = (summary.eventsByType[m.type] || 0) + 1;

            // Track offenders (identifiers with high event counts)
            offenderMap.set(m.identifier, (offenderMap.get(m.identifier) || 0) + 1);
        });

        // Sort and format top offenders
        summary.topOffenders = Array.from(offenderMap.entries())
            .map(([identifier, count]) => ({ identifier, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return summary;
    }

    /**
     * Clear all stored metrics
     */
    static clearMetrics(): void {
        localStorage.removeItem(this.METRICS_STORAGE_KEY);
        log.info('Security metrics cleared');
    }

    private static getStoredMetrics(): SecurityMetric[] {
        try {
            const stored = localStorage.getItem(this.METRICS_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Failed to parse security metrics', e);
            return [];
        }
    }

    private static saveMetrics(metrics: SecurityMetric[]): void {
        try {
            localStorage.setItem(this.METRICS_STORAGE_KEY, JSON.stringify(metrics));
        } catch (e) {
            console.error('Failed to save security metrics', e);
        }
    }
}
