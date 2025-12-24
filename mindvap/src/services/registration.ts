// Registration Service
// Handles registration logic, email notifications, and integrates with AuthContext

import { RegisterRequest, RegisterResponse } from '../types/auth';
import { log } from '../lib/logger';
import { sendContactEmail } from './email';

export interface RegistrationEmailData {
  userName: string;
  userEmail: string;
  verificationUrl?: string;
  accountType: 'customer' | 'admin';
  verificationToken?: string;
}

export interface RegistrationServiceResult {
  success: boolean;
  message: string;
  emailSent?: boolean;
  userId?: string;
  emailVerificationRequired?: boolean;
  error?: {
    code: string;
    message: string;
  };
}

export class RegistrationService {
  private static readonly VERIFICATION_EMAIL_TEMPLATE = {
    subject: 'Welcome to MindVap - Verify Your Email',
    fromName: 'MindVap Team',
    toName: '{{userName}}'
  };

  /**
   * Main registration service that handles user registration
   */
  static async registerUser(userData: RegisterRequest): Promise<RegistrationServiceResult> {
    try {
      // Validate registration data
      const validation = this.validateRegistrationData(userData);
      if (!validation.valid) {
        return {
          success: false,
          message: validation.message,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.message
          }
        };
      }

      // Check email uniqueness (would be implemented with backend API)
      const emailExists = await this.checkEmailExists(userData.email);
      if (emailExists) {
        return {
          success: false,
          message: 'An account with this email address already exists',
          error: {
            code: 'EMAIL_EXISTS',
            message: 'Email address already registered'
          }
        };
      }

      // In a real implementation, this would create the user in the database
      // For now, we'll simulate the user creation and return success
      const userId = await this.createUserAccount(userData);

      if (!userId) {
        return {
          success: false,
          message: 'Failed to create user account',
          error: {
            code: 'ACCOUNT_CREATION_FAILED',
            message: 'Could not create user account'
          }
        };
      }

      // Send welcome/verification email
      const emailData: RegistrationEmailData = {
        userName: `${userData.firstName} ${userData.lastName}`,
        userEmail: userData.email,
        verificationUrl: `${window.location.origin}/verify-email`,
        accountType: 'customer',
        verificationToken: this.generateVerificationToken()
      };

      const emailSent = await this.sendWelcomeEmail(emailData);

      return {
        success: true,
        message: emailSent
          ? 'Account created successfully! Please check your email to verify your account.'
          : 'Account created successfully! Please verify your email address.',
        emailSent,
        userId,
        emailVerificationRequired: true
      };

    } catch (error) {
      log.error('Registration service error', error, { userData });
      return {
        success: false,
        message: 'An unexpected error occurred during registration',
        error: {
          code: 'REGISTRATION_ERROR',
          message: 'Registration failed due to an internal error'
        }
      };
    }
  }

  /**
   * Validate registration data according to business rules
   */
  private static validateRegistrationData(userData: RegisterRequest): { valid: boolean; message?: string } {
    // Required fields check
    if (!userData.email || !userData.password || !userData.firstName ||
      !userData.lastName || !userData.dateOfBirth) {
      return {
        valid: false,
        message: 'All required fields must be provided'
      };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return {
        valid: false,
        message: 'Please enter a valid email address'
      };
    }

    // Age verification (21+ requirement for vaping products)
    const age = this.calculateAge(userData.dateOfBirth);
    if (age < 21) {
      return {
        valid: false,
        message: 'You must be at least 21 years old to create an account'
      };
    }

    // Password strength validation (basic check)
    if (userData.password.length < 8) {
      return {
        valid: false,
        message: 'Password must be at least 8 characters long'
      };
    }

    // Consent validation
    if (!userData.termsAccepted || !userData.privacyAccepted || !userData.dataProcessingConsent) {
      return {
        valid: false,
        message: 'You must accept the terms of service, privacy policy, and data processing consent'
      };
    }

    return { valid: true };
  }

  /**
   * Calculate age from date of birth
   */
  private static calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Check if email already exists (would call backend API in production)
   */
  static async checkEmailExists(email: string): Promise<boolean> {
    // In production, this would make an API call to check email uniqueness
    // For demo purposes, we'll simulate a check
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simulate checking against existing emails
    const existingEmails = ['admin@mindvap.com', 'test@example.com'];
    return existingEmails.includes(email.toLowerCase());
  }

  /**
   * Create user account in database (simulated)
   */
  private static async createUserAccount(userData: RegisterRequest): Promise<string | null> {
    // In production, this would:
    // 1. Hash the password using Argon2id
    // 2. Store user in Supabase/PostgreSQL
    // 3. Create user sessions table entry
    // 4. Log security events
    // 5. Return the new user ID

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
        age: this.calculateAge(userData.dateOfBirth),
        createdAt: new Date().toISOString()
      });

      return userId;
    } catch (error) {
      log.error('Failed to create user account', error, { userData });
      return null;
    }
  }

  /**
   * Send welcome/verification email using EmailJS
   */
  static async sendWelcomeEmail(emailData: RegistrationEmailData): Promise<boolean> {
    try {
      // Prepare email content
      const subject = `Welcome to MindVap - Verify Your Email`;
      const message = `
        Hello ${emailData.userName},

        Welcome to MindVap! Your account has been created successfully.

        To complete your registration, please verify your email address by clicking the link below:
        ${emailData.verificationUrl}

        If you did not create this account, please ignore this email.

        Thank you for joining MindVap!
        - The MindVap Team

        ---
        MindVap - Premium Herbal Wellness Solutions
        Must be 21+ to use our products.
      `;

      // Prepare form data for EmailJS
      const formData = {
        name: emailData.userName,
        email: emailData.userEmail,
        subject: subject,
        message: message
      };

      log.info('Sending welcome email via EmailJS', { email: emailData.userEmail });

      // Send email using existing EmailJS service
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
   * Generate verification token (would be more secure in production)
   */
  private static generateVerificationToken(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 9);
    return `${timestamp}_${random}`;
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
        Age: ${this.calculateAge(userData.dateOfBirth)}
        User ID: ${userId}
        Marketing Consent: ${userData.marketingConsent ? 'Yes' : 'No'}
        Registered At: ${new Date().toISOString()}

        Please review for compliance.
      `;

      const formData = {
        name: 'Admin Notification',
        email: 'albertocalvorivas@gmail.com', // Admin email from EmailJS setup
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
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format (basic)
   */
  static isValidPhone(phone: string): boolean {
    // Basic phone validation - allows international formats
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    const cleaned = phone.replace(/[\s\-(.)]/g, '');
    return cleaned.length >= 10 && phoneRegex.test(cleaned);
  }

  /**
   * Get registration statistics (for admin dashboard)
   */
  static getRegistrationStats(): Promise<{
    totalRegistrations: number;
    todayRegistrations: number;
    verificationRate: number;
    ageVerifiedRate: number;
  }> {
    // In production, this would query the database
    return Promise.resolve({
      totalRegistrations: 0,
      todayRegistrations: 0,
      verificationRate: 0,
      ageVerifiedRate: 0
    });
  }
}

// Export utility functions for easy access
export const registerUser = RegistrationService.registerUser;
export const sendWelcomeEmail = RegistrationService.sendWelcomeEmail;
export const sendAgeVerificationReminder = RegistrationService.sendAgeVerificationReminder;
export const sendAdminNotification = RegistrationService.sendAdminNotification;
export const checkEmailExists = RegistrationService.checkEmailExists;
export const isValidEmail = RegistrationService.isValidEmail;
export const isValidPhone = RegistrationService.isValidPhone;