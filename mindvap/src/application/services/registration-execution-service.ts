
import { RegisterRequest } from '../../domain/entities/auth';
import { log } from '../../infrastructure/lib/logger';
import { sendContactEmail } from './email';
import { RegistrationValidationService } from './registration-validation-service';

export interface RegistrationEmailData {
    userName: string;
    userEmail: string;
    verificationUrl?: string;
    accountType: 'customer' | 'admin';
    verificationToken?: string;
}

/**
 * SRP: Handles the execution of registration workflows and side effects
 */
export class RegistrationExecutionService {
    /**
     * Check if email already exists (would call backend API in production)
     */
    static async checkEmailExists(email: string): Promise<boolean> {
        // In production, this would make an API call to check email uniqueness
        await new Promise(resolve => setTimeout(resolve, 500));

        // Simulate checking against existing emails
        const existingEmails = ['admin@mindvap.com', 'test@example.com'];
        return existingEmails.includes(email.toLowerCase());
    }

    /**
     * Create user account in database (simulated)
     */
    static async createUserAccount(userData: RegisterRequest): Promise<string | null> {
        try {
            // Simulate account creation process
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Generate a mock user ID
            const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            log.info('User account created successfully', {
                userId,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                age: RegistrationValidationService.calculateAge(userData.dateOfBirth),
                createdAt: new Date().toISOString()
            });

            return userId;
        } catch (error) {
            log.error('Failed to create user account', error, { userData });
            return null;
        }
    }

    /**
     * Send welcome/verification email
     */
    static async sendWelcomeEmail(emailData: RegistrationEmailData): Promise<boolean> {
        try {
            const subject = `Welcome to MindVap - Verify Your Email`;
            const message = `
        Hello ${emailData.userName},

        Welcome to MindVap! Your account has been created successfully.

        To complete your registration, please verify your email address by clicking the link below:
        ${emailData.verificationUrl}

        If you did not create this account, please ignore this email.

        Thank you for joining MindVap!
        - The MindVap Team
      `;

            const formData = {
                name: emailData.userName,
                email: emailData.userEmail,
                subject: subject,
                message: message
            };

            log.info('Sending welcome email via EmailJS', { email: emailData.userEmail });
            const success = await sendContactEmail(formData);

            if (success) {
                log.info('Welcome email sent successfully', { email: emailData.userEmail });
            } else {
                log.warn('Failed to send welcome email', { email: emailData.userEmail });
            }

            return success;
        } catch (error) {
            log.error('Failed to send welcome email', error, { emailData });
            return false;
        }
    }

    /**
     * Send age verification reminder email
     */
    static async sendAgeVerificationReminder(emailData: RegistrationEmailData): Promise<boolean> {
        try {
            const subject = 'MindVap - Age Verification Required';
            const message = `
        Hello ${emailData.userName},

        Thank you for registering with MindVap!

        As a reminder, age verification is required for our products. Please complete the age verification process to continue using your account.

        Visit: ${emailData.verificationUrl}

        - The MindVap Team
      `;

            const formData = {
                name: emailData.userName,
                email: emailData.userEmail,
                subject: subject,
                message: message
            };

            return await sendContactEmail(formData);
        } catch (error) {
            log.error('Failed to send age verification reminder', error, { emailData });
            return false;
        }
    }

    /**
     * Send admin notification about new user registration
     */
    static async sendAdminNotification(userData: RegisterRequest, userId: string): Promise<boolean> {
        try {
            const subject = 'New User Registration - MindVap';
            const message = `
        New user registered:

        Name: ${userData.firstName} ${userData.lastName}
        Email: ${userData.email}
        Phone: ${userData.phone || 'Not provided'}
        Date of Birth: ${userData.dateOfBirth}
        Age: ${RegistrationValidationService.calculateAge(userData.dateOfBirth)}
        User ID: ${userId}
        Marketing Consent: ${userData.marketingConsent ? 'Yes' : 'No'}
        Registered At: ${new Date().toISOString()}

        Please review for compliance.
      `;

            const formData = {
                name: 'Admin Notification',
                email: 'albertocalvorivas@gmail.com',
                subject: subject,
                message: message
            };

            return await sendContactEmail(formData);
        } catch (error) {
            log.error('Failed to send admin notification', error, { userData, userId });
            return false;
        }
    }

    /**
     * Generate verification token
     */
    static generateVerificationToken(): string {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substr(2, 9);
        return `${timestamp}_${random}`;
    }
}
