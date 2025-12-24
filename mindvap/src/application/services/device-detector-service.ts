/**
 * Device Detection Service - SRP: Only handles device/browser/OS detection
 */
export class DeviceDetectorService {
    detectDeviceType(): string {
        const userAgent = navigator.userAgent;
        if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'Tablet';
        if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\\sce|palm|smartphone|iemobile/i.test(userAgent)) return 'Mobile';
        return 'Desktop';
    }

    detectBrowser(): string {
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        if (userAgent.includes('Opera')) return 'Opera';
        return 'Unknown';
    }

    detectOS(): string {
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Windows')) return 'Windows';
        if (userAgent.includes('Mac')) return 'macOS';
        if (userAgent.includes('Linux')) return 'Linux';
        if (userAgent.includes('Android')) return 'Android';
        if (userAgent.includes('iOS')) return 'iOS';
        return 'Unknown';
    }

    getUserAgent(): string {
        return navigator.userAgent;
    }

    getDeviceInfo() {
        return {
            type: this.detectDeviceType(),
            browser: this.detectBrowser(),
            os: this.detectOS(),
            userAgent: this.getUserAgent()
        };
    }
}
