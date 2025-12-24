export interface SecurityEvent {
    type: 'login' | 'failed_login' | 'password_change' | 'suspicious_activity' | 'rate_limit' | 'csrf_violation';
    identifier: string;
    userAgent?: string;
    ipAddress?: string;
    metadata?: Record<string, any>;
    timestamp: Date;
}

/**
 * Security Event Logger - Focused on security event logging only (ISP, SRP)
 */
export interface ISecurityEventLogger {
    logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): Promise<void>;
    getStoredSecurityEvents(): SecurityEvent[];
    clearSecurityEvents(): void;
    getEventsByType(type: SecurityEvent['type']): SecurityEvent[];
    getEventsByIdentifier(identifier: string): SecurityEvent[];
}
