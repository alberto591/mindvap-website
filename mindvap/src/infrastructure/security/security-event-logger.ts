import { ISecurityEventLogger, SecurityEvent } from '../../domain/ports/i-security-event-logger';
import { log } from '../lib/logger';

/**
 * Security Event Logger - SRP: Only handles security event logging
 * DIP: Implements domain interface, injectable
 */
export class SecurityEventLogger implements ISecurityEventLogger {
    private readonly STORAGE_KEY = 'mindvap_security_events';
    private readonly MAX_EVENTS = 100;

    async logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): Promise<void> {
        const securityEvent: SecurityEvent = {
            ...event,
            timestamp: new Date()
        };

        // Store in local storage for demo purposes
        // In production, this would be sent to a logging service
        const events = this.getStoredSecurityEvents();
        events.push(securityEvent);

        // Keep only last MAX_EVENTS
        if (events.length > this.MAX_EVENTS) {
            events.splice(0, events.length - this.MAX_EVENTS);
        }

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(events));

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            log.info('Security Event', { securityEvent });
        }
    }

    getStoredSecurityEvents(): SecurityEvent[] {
        try {
            const events = localStorage.getItem(this.STORAGE_KEY);
            if (!events) return [];

            const parsed = JSON.parse(events);
            // Convert timestamp strings back to Date objects
            return parsed.map((event: any) => ({
                ...event,
                timestamp: new Date(event.timestamp)
            }));
        } catch (error) {
            log.error('Failed to parse security events', error);
            return [];
        }
    }

    clearSecurityEvents(): void {
        localStorage.removeItem(this.STORAGE_KEY);
    }

    getEventsByType(type: SecurityEvent['type']): SecurityEvent[] {
        return this.getStoredSecurityEvents().filter(event => event.type === type);
    }

    getEventsByIdentifier(identifier: string): SecurityEvent[] {
        return this.getStoredSecurityEvents().filter(event => event.identifier === identifier);
    }
}
