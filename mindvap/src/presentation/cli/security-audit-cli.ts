
import { SecurityMetricService } from '../../application/services/security-metric-service';
import { log } from '../../infrastructure/lib/logger';

/**
 * SecurityAuditCLI - Providing terminal visibility into security health.
 * Note: Designed to be run in a dev environment/console.
 */
export class SecurityAuditCLI {
    /**
     * Print a comprehensive security report to the console
     */
    static printFullReport(): void {
        const summary = SecurityMetricService.getSummary();

        console.log('\n' + '='.repeat(50));
        console.log('🛡️  MINDVAP SECURITY AUDIT REPORT');
        console.log('='.repeat(50));
        console.log(`Report Generated: ${new Date().toLocaleString()}`);
        console.log(`Total Security Events: ${summary.totalEvents}`);

        console.log('\n📊 EVENTS BY TYPE:');
        Object.entries(summary.eventsByType).forEach(([type, count]) => {
            const icon = this.getTypeIcon(type);
            console.log(`${icon} ${type.padEnd(20)}: ${count}`);
        });

        console.log('\n🚫 TOP OFFENDERS (High Risk Identifiers):');
        if (summary.topOffenders.length === 0) {
            console.log('   (No suspicious actors detected)');
        } else {
            summary.topOffenders.forEach((offender, i) => {
                console.log(`   ${i + 1}. ${offender.identifier.padEnd(20)} - ${offender.count} violations`);
            });
        }

        console.log('\n🕒 RECENT ACTIVITY:');
        summary.recentEvents.forEach(event => {
            const time = new Date(event.timestamp).toLocaleTimeString();
            console.log(`   [${time}] ${event.type.toUpperCase()}: ${event.action} (${event.identifier})`);
        });

        console.log('\n' + '='.repeat(50));
        console.log('✅ Audit Complete');
        console.log('='.repeat(50) + '\n');
    }

    /**
     * Trigger a security simulation (for dev/test)
     */
    static runAttackSimulation(): void {
        console.log('🚀 Starting Security Attack Simulation...');

        // Simulate Rate Limit Hits
        for (let i = 0; i < 5; i++) {
            SecurityMetricService.trackEvent({
                type: 'rate_limit',
                identifier: 'attacker_1',
                action: 'login_bruteforce',
                metadata: { severity: 'medium' }
            });
        }

        // Simulate Injection Attempts
        SecurityMetricService.trackEvent({
            type: 'content_moderation',
            identifier: 'attacker_2',
            action: 'sql_injection_attempt',
            metadata: { severity: 'high' }
        });

        // Simulate Auth Failures
        SecurityMetricService.trackEvent({
            type: 'auth_failure',
            identifier: 'session_3',
            action: 'invalid_csrf',
            metadata: { severity: 'low' }
        });

        console.log('✅ Simulation entries added to telemetry.');
        this.printFullReport();
    }

    private static getTypeIcon(type: string): string {
        switch (type) {
            case 'rate_limit': return '⏳';
            case 'content_moderation': return '🔍';
            case 'circuit_breaker': return '⚡';
            case 'auth_failure': return '🔐';
            default: return '📝';
        }
    }
}

// Global exposure for dev console
if (typeof window !== 'undefined') {
    (window as any).SecurityCLI = SecurityAuditCLI;
}
