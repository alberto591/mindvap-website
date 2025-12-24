// Initialize DOMPurify for both browser and Node/JSDOM environments
const DOMPurify = (() => {
    if (typeof window !== 'undefined') {
        const DOMPurifyLibrary = require('dompurify');
        return DOMPurifyLibrary(window);
    } else {
        try {
            const { JSDOM } = require('jsdom');
            const DOMPurifyLibrary = require('dompurify');
            return DOMPurifyLibrary(new JSDOM('').window);
        } catch (e) {
            return { sanitize: (s: string) => s }; // Fallback for environments without JSDOM
        }
    }
})();

/**
 * Sanitization Service - SRP: Only handles input sanitization
 * Injectable service for sanitizing user inputs
 */
export class SanitizationService {
    /**
     * Sanitize user input to prevent XSS attacks
     */
    sanitizeInput(input: string): string {
        if (typeof input !== 'string') return '';

        // Use DOMPurify to sanitize HTML and prevent XSS
        const sanitized = DOMPurify.sanitize(input, {
            ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'img', 'a'],
            ALLOWED_ATTR: ['src', 'href'],
        });

        // Additional trimming and normalization
        return sanitized.trim().replace(/\s+/g, ' ');
    }

    /**
     * Sanitize HTML content (for rich text areas if needed)
     */
    sanitizeHtml(html: string): string {
        if (typeof html !== 'string') return '';

        return DOMPurify.sanitize(html, {
            ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a'],
            ALLOWED_ATTR: ['href', 'target', 'rel'],
            ALLOW_DATA_ATTR: false,
        });
    }

    /**
     * Validate and sanitize email input
     */
    sanitizeEmail(email: string): string {
        if (typeof email !== 'string') return '';

        const sanitized = this.sanitizeInput(email).toLowerCase();
        return sanitized;
    }

    /**
     * Validate and sanitize password (basic sanitization, strength validation separate)
     */
    sanitizePassword(password: string): string {
        if (typeof password !== 'string') return '';

        // Remove any HTML/script content and trim whitespace
        return DOMPurify.sanitize(password.trim(), {
            ALLOWED_TAGS: [],
            ALLOWED_ATTR: [],
        });
    }
}

// Export instance for backward compatibility with utility functions
export const sanitizationService = new SanitizationService();

// Export utility functions for easy migration
export const sanitizeInput = (input: string) => sanitizationService.sanitizeInput(input);
export const sanitizeHtml = (html: string) => sanitizationService.sanitizeHtml(html);
export const sanitizeEmail = (email: string) => sanitizationService.sanitizeEmail(email);
export const sanitizePassword = (password: string) => sanitizationService.sanitizePassword(password);
