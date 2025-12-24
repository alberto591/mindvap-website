
import { RegisterRequest } from '../../domain/entities/auth';

/**
 * SRP: Handles registration validation logic and business rules
 */
export class RegistrationValidationService {
    /**
     * Validate registration data according to business rules
     */
    static validateRegistrationData(userData: RegisterRequest): { valid: boolean; message?: string } {
        // Required fields check
        if (!userData.email || !userData.password || !userData.firstName ||
            !userData.lastName || !userData.dateOfBirth) {
            return {
                valid: false,
                message: 'All required fields must be provided'
            };
        }

        // Email validation
        if (!this.isValidEmail(userData.email)) {
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
    static calculateAge(dateOfBirth: string): number {
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
        const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
        const cleaned = phone.replace(/[\s\-(.)]/g, '');
        return cleaned.length >= 10 && phoneRegex.test(cleaned);
    }
}
