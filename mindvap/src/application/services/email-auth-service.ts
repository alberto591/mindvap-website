
import { EmailTemplateService, EmailServiceResponse } from './email-template-service';
import { User } from '../../domain/entities/auth';
import { log } from '../../infrastructure/lib/logger';

/**
 * SRP: Handles only authentication-related email notifications
 */
export class EmailAuthService {
    constructor(
        private emailService: EmailTemplateService,
        private executeWithBreaker: (methodName: string, ...args: any[]) => Promise<EmailServiceResponse>
    ) { }

    public async sendWelcomeEmail(user: User, verificationToken?: string): Promise<EmailServiceResponse> {
        const verificationLink = verificationToken
            ? `${window.location.origin}/verify-email?token=${verificationToken}`
            : '';

        return this.executeWithBreaker('sendWelcomeEmail', {
            toEmail: user.email!,
            firstName: user.firstName || 'Valued Customer',
            verificationLink,
            verificationToken,
            expiresIn: '24 hours',
            loginUrl: `${window.location.origin}/login`,
            supportEmail: 'support@mindvap.com',
            supportPhone: '1-800-MINDVAP',
            baseUrl: window.location.origin
        });
    }

    public async sendEmailVerification(user: User, verificationToken: string): Promise<EmailServiceResponse> {
        const verificationLink = `${window.location.origin}/verify-email?token=${verificationToken}`;

        return this.executeWithBreaker('sendEmailVerification', {
            toEmail: user.email!,
            firstName: user.firstName || 'Valued Customer',
            verificationLink,
            expiresIn: '24 hours',
            supportEmail: 'support@mindvap.com',
            supportPhone: '1-800-MINDVAP',
            baseUrl: window.location.origin
        });
    }

    public async sendPasswordReset(user: User, resetToken: string): Promise<EmailServiceResponse> {
        const resetLink = `${window.location.origin}/login?token=${resetToken}&type=recovery`;

        return this.executeWithBreaker('sendPasswordReset', {
            toEmail: user.email!,
            firstName: user.firstName || 'Valued Customer',
            resetLink,
            expiresIn: '1 hour',
            requestTime: new Date().toLocaleString(),
            userAgent: navigator.userAgent,
            supportEmail: 'support@mindvap.com',
            supportPhone: '1-800-MINDVAP',
            baseUrl: window.location.origin
        });
    }

    public async sendPasswordChanged(user: User, changeMethod: string, clientIp: string): Promise<EmailServiceResponse> {
        return this.executeWithBreaker('sendPasswordChanged', {
            toEmail: user.email!,
            firstName: user.firstName || 'Valued Customer',
            changeMethod,
            ipAddress: clientIp,
            supportEmail: 'support@mindvap.com',
            supportPhone: '1-800-MINDVAP',
            baseUrl: window.location.origin
        });
    }
}
