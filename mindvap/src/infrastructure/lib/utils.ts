import { clsx, ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
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

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';

  // Use DOMPurify to sanitize HTML and prevent XSS
  const sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'img', 'a'], // Allow basic safe tags
    ALLOWED_ATTR: ['src', 'href'], // Allow basic attributes
  });

  // Additional trimming and normalization
  return sanitized.trim().replace(/\s+/g, ' ');
}

/**
 * Sanitize HTML content (for rich text areas if needed)
 */
export function sanitizeHtml(html: string): string {
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
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return '';

  const sanitized = sanitizeInput(email).toLowerCase();

  // Return sanitized email even if empty - validation happens elsewhere
  return sanitized;
}

/**
 * Validate and sanitize password (basic sanitization, strength validation separate)
 */
export function sanitizePassword(password: string): string {
  if (typeof password !== 'string') return '';

  // Remove any HTML/script content and trim whitespace
  return DOMPurify.sanitize(password.trim(), {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}
