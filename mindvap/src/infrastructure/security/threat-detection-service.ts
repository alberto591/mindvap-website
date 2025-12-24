import { IThreatDetectionService, SuspicionResult, DeviceInfo } from '../../domain/ports/i-threat-detection-service';
import { log } from '../lib/logger';

/**
 * Threat Detection Service - SRP: Only handles threat detection and device fingerprinting
 * DIP: Implements domain interface, injectable
 */
export class ThreatDetectionService implements IThreatDetectionService {
    private readonly KNOWN_DEVICES_KEY = 'mindvap_known_devices';

    detectSuspiciousActivity(userAgent: string, ip: string): SuspicionResult {
        const reasons: string[] = [];
        let riskScore = 0;

        // Check for unusual user agent
        if (!userAgent || userAgent.length < 10) {
            reasons.push('Unusual user agent');
            riskScore += 20;
        }

        // Check for automation patterns
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

        // Check IP against known suspicious patterns (simplified)
        if (ip === 'unknown' || ip.includes('proxy') || ip.includes('tor')) {
            reasons.push('Suspicious IP address');
            riskScore += 30;
        }

        // Time-based anomaly detection (simplified)
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

        // Simple hash function for browser compatibility
        let hash = 0;
        for (let i = 0; i < components.length; i++) {
            const char = components.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    async getClientIP(): Promise<string> {
        try {
            // In a real implementation, this would come from server headers
            // For now, return a placeholder based on browser fingerprint
            return this.generateDeviceFingerprint();
        } catch (error) {
            log.error('Failed to get client IP', error);
            return 'unknown';
        }
    }

    getDeviceInfo(): DeviceInfo {
        return {
            fingerprint: this.generateDeviceFingerprint(),
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenResolution: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }

    isKnownDevice(fingerprint: string, userId: string): boolean {
        try {
            const stored = localStorage.getItem(this.KNOWN_DEVICES_KEY);
            if (!stored) return false;

            const knownDevices: Record<string, string[]> = JSON.parse(stored);
            const userDevices = knownDevices[userId] || [];

            return userDevices.includes(fingerprint);
        } catch (error) {
            log.error('Failed to check known devices', error);
            return false;
        }
    }

    registerDevice(fingerprint: string, userId: string): void {
        try {
            const stored = localStorage.getItem(this.KNOWN_DEVICES_KEY);
            const knownDevices: Record<string, string[]> = stored ? JSON.parse(stored) : {};

            if (!knownDevices[userId]) {
                knownDevices[userId] = [];
            }

            if (!knownDevices[userId].includes(fingerprint)) {
                knownDevices[userId].push(fingerprint);
            }

            localStorage.setItem(this.KNOWN_DEVICES_KEY, JSON.stringify(knownDevices));
        } catch (error) {
            log.error('Failed to register device', error);
        }
    }
}
