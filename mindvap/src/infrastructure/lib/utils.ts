/**
 * @deprecated This file mixes CSS utilities with sanitization (SRP violation)
 * Use imports from the following focused modules instead:
 * - './css-utils' for CSS class name utilities (cn function)
 * - './sanitization-service' for input sanitization
 * 
 * This file is kept for backwards compatibility during migration.
 * It will be removed once all consumers are updated.
 */

// Re-export from focused modules for backward compatibility
export { cn } from './css-utils';
export {
  sanitizeInput,
  sanitizeHtml,
  sanitizeEmail,
  sanitizePassword,
  SanitizationService,
  sanitizationService
} from './sanitization-service';
