export interface SuspicionResult {
    isSuspicious: boolean;
    riskScore: number;
    reasons: string[];
}

export interface DeviceInfo {
    fingerprint: string;
    userAgent: string;
    platform: string;
    language: string;
    screenResolution: string;
    timezone: string;
}

/**
 * Threat Detection Service - Focused on threat detection only (ISP, SRP)
 */
export interface IThreatDetectionService {
    detectSuspiciousActivity(userAgent: string, ip: string): SuspicionResult;
    generateDeviceFingerprint(): string;
    getClientIP(): Promise<string>;
    getDeviceInfo(): DeviceInfo;
    isKnownDevice(fingerprint: string, userId: string): boolean;
    registerDevice(fingerprint: string, userId: string): void;
}
