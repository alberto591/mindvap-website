import { clsx, ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * CSS Utilities - SRP: Only handles CSS class name manipulation
 */

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
