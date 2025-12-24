/**
 * CSRF Protection Service - Focused on CSRF token management only (ISP, SRP)
 */
export interface ICSRFProtectionService {
    generateCSRFToken(): string;
    validateCSRFToken(token: string): boolean;
    setCSRFToken(token: string): void;
    clearCSRFToken(): void;
}
