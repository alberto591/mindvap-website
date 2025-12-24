
import { EmailTemplateType, EmailTemplateRegistry } from './email-template-registry';
import { EmailAnalytics } from './email-types';

/**
 * SRP: Handles email delivery analytics and tracking
 */
export class EmailAnalyticsService {
    private analytics: Map<EmailTemplateType, EmailAnalytics> = new Map();

    constructor() {
        this.initializeAnalytics();
    }

    /**
     * Initialize analytics data structure
     */
    private initializeAnalytics(): void {
        const templateTypes = EmailTemplateRegistry.getAllTemplateTypes();

        templateTypes.forEach(type => {
            this.analytics.set(type, {
                templateType: type,
                sent: 0,
                delivered: 0,
                opened: 0,
                clicked: 0,
                bounced: 0,
                complained: 0,
                unsubscribed: 0,
                deliveryRate: 0,
                openRate: 0,
                clickRate: 0,
                bounceRate: 0,
                complaintRate: 0,
                unsubscribedRate: 0,
                period: 'current'
            });
        });
    }

    /**
     * Update analytics counters
     */
    updateAnalytics(templateType: EmailTemplateType, metric: keyof EmailAnalytics, count: number = 1): void {
        const data = this.analytics.get(templateType);
        if (!data) return;

        if (typeof data[metric] === 'number') {
            (data[metric] as number) += count;
            this.calculateRates(templateType);
        }
    }

    /**
     * Calculate rates for a template type
     */
    private calculateRates(templateType: EmailTemplateType): void {
        const data = this.analytics.get(templateType);
        if (!data || data.sent === 0) return;

        data.deliveryRate = (data.delivered / data.sent) * 100;
        data.openRate = (data.opened / data.sent) * 100;
        data.clickRate = (data.clicked / data.sent) * 100;
        data.bounceRate = (data.bounced / data.sent) * 100;
        data.complaintRate = (data.complained / data.sent) * 100;
        data.unsubscribedRate = (data.unsubscribed / data.sent) * 100;
    }

    getAnalytics(templateType?: EmailTemplateType): EmailAnalytics | EmailAnalytics[] {
        if (templateType) {
            return this.analytics.get(templateType) || Object.create(null);
        }
        return Array.from(this.analytics.values());
    }

    resetAnalytics(): void {
        this.initializeAnalytics();
    }
}
