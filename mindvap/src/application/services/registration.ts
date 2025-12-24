// Registration Service
// Handles registration logic, email notifications, and integrates with AuthContext

import { RegisterRequest } from '../../domain/entities/auth';
import { log } from '../../infrastructure/lib/logger';
import { RegistrationValidationService } from './registration-validation-service';
import { RegistrationExecutionService, RegistrationEmailData } from './registration-execution-service';

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

/**
 * RegistrationService - SRP: Coordinator for user registration workflow
 * Refactored to adhere to SOLID principles by delegating validation and execution.
 */
export class RegistrationService {
  /**
   * Main registration service that handles user registration
   */
  static async registerUser(userData: RegisterRequest): Promise<RegistrationServiceResult> {
    try {
      // 1. Validate registration data
      const validation = RegistrationValidationService.validateRegistrationData(userData);
      if (!validation.valid) {
        return {
          success: false,
          message: validation.message!,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.message!
          }
        };
      }

      // 2. Check email uniqueness
      const emailExists = await RegistrationExecutionService.checkEmailExists(userData.email);
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

      // 3. Create the user in the database
      const userId = await RegistrationExecutionService.createUserAccount(userData);
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

      // 4. Send welcome/verification email
      const emailData: RegistrationEmailData = {
        userName: `${userData.firstName} ${userData.lastName}`,
        userEmail: userData.email,
        verificationUrl: `${window.location.origin}/verify-email`,
        accountType: 'customer',
        verificationToken: RegistrationExecutionService.generateVerificationToken()
      };

      const emailSent = await RegistrationExecutionService.sendWelcomeEmail(emailData);

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

  // Delegate static methods for backward compatibility
  static checkEmailExists = RegistrationExecutionService.checkEmailExists;
  static sendWelcomeEmail = RegistrationExecutionService.sendWelcomeEmail;
  static sendAgeVerificationReminder = RegistrationExecutionService.sendAgeVerificationReminder;
  static sendAdminNotification = RegistrationExecutionService.sendAdminNotification;
  static isValidEmail = RegistrationValidationService.isValidEmail;
  static isValidPhone = RegistrationValidationService.isValidPhone;

  /**
   * Get registration statistics (for admin dashboard)
   */
  static getRegistrationStats = RegistrationExecutionService.getRegistrationStats;
}

// Export utility functions for easy access
export const registerUser = RegistrationService.registerUser;
export const sendWelcomeEmail = RegistrationService.sendWelcomeEmail;
export const sendAgeVerificationReminder = RegistrationService.sendAgeVerificationReminder;
export const sendAdminNotification = RegistrationService.sendAdminNotification;
export const checkEmailExists = RegistrationService.checkEmailExists;
export const isValidEmail = RegistrationService.isValidEmail;
export const isValidPhone = RegistrationService.isValidPhone;