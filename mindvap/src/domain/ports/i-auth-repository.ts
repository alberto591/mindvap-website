export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phone?: string;
    agreeToTerms: boolean;
    agreeToPrivacy: boolean;
    emailConsent?: boolean;
}

export interface IAuthRepository {
    // User registration
    checkEmailExists(email: string): Promise<boolean>;
    createUserAccount(userData: RegisterRequest): Promise<string | null>;

    // Password reset
    createPasswordResetToken(userId: string): Promise<string>;
    validatePasswordResetToken(token: string): Promise<string | null>;
    updatePassword(userId: string, newPasswordHash: string): Promise<void>;

    // Email verification
    createEmailVerificationToken(userId: string): Promise<string>;
    validateEmailVerificationToken(token: string): Promise<string | null>;
    markEmailAsVerified(userId: string): Promise<void>;
}
