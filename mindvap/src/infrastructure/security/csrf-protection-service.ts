import { ICSRFProtectionService } from '../../domain/ports/i-csrf-protection-service';

/**
 * CSRF Protection Service - SRP: Only handles CSRF token management
 * DIP: Implements domain interface, injectable
 */
export class CSRFProtectionService implements ICSRFProtectionService {
    private readonly CSRF_TOKEN_KEY = 'mindvap_csrf_token';

    generateCSRFToken(): string {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    validateCSRFToken(token: string): boolean {
        const storedToken = sessionStorage.getItem(this.CSRF_TOKEN_KEY);
        return storedToken === token;
    }

    setCSRFToken(token: string): void {
        sessionStorage.setItem(this.CSRF_TOKEN_KEY, token);
    }

    clearCSRFToken(): void {
        sessionStorage.removeItem(this.CSRF_TOKEN_KEY);
    }
}
