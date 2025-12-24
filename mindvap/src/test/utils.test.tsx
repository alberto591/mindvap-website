/**
 * Utility Functions Unit Tests
 *
 * This file contains unit tests for utility functions, including
 * input sanitization, validation, and security helpers.
 */

import { sanitizeEmail, sanitizePassword, sanitizeInput } from '../infrastructure/lib/utils';

describe('Utility Functions', () => {
  describe('sanitizeEmail', () => {
    test('should trim whitespace from email', () => {
      const result = sanitizeEmail('  test@example.com  ');
      expect(result).toBe('test@example.com');
    });

    test('should convert email to lowercase', () => {
      const result = sanitizeEmail('Test@Example.COM');
      expect(result).toBe('test@example.com');
    });

    test('should handle empty string', () => {
      const result = sanitizeEmail('');
      expect(result).toBe('');
    });

    test('should handle null input', () => {
      const result = sanitizeEmail(null as any);
      expect(result).toBe('');
    });

    test('should handle undefined input', () => {
      const result = sanitizeEmail(undefined as any);
      expect(result).toBe('');
    });

    test('should remove dangerous characters', () => {
      const result = sanitizeEmail('test<script>alert("xss")</script>@example.com');
      expect(result).toBe('test@example.com');
    });
  });

  describe('sanitizePassword', () => {
    test('should trim whitespace from password', () => {
      const result = sanitizePassword('  password123  ');
      expect(result).toBe('password123');
    });

    test('should handle empty string', () => {
      const result = sanitizePassword('');
      expect(result).toBe('');
    });

    test('should handle null input', () => {
      const result = sanitizePassword(null as any);
      expect(result).toBe('');
    });

    test('should handle undefined input', () => {
      const result = sanitizePassword(undefined as any);
      expect(result).toBe('');
    });

    test('should preserve special characters in passwords', () => {
      const result = sanitizePassword('P@ssw0rd!#$%');
      expect(result).toBe('P@ssw0rd!#$%');
    });
  });

  describe('sanitizeInput', () => {
    test('should remove script tags', () => {
      const result = sanitizeInput('<script>alert("xss")</script>Hello World');
      expect(result).toBe('Hello World');
    });

    test('should remove event handlers', () => {
      const result = sanitizeInput('<img src="x" onerror="alert(1)">');
      expect(result).toBe('<img src="x">');
    });

    test('should remove javascript URLs', () => {
      const result = sanitizeInput('<a href="javascript:alert(1)">Click me</a>');
      expect(result).toBe('<a>Click me</a>');
    });

    test('should remove SVG elements', () => {
      const result = sanitizeInput('<svg onload="alert(1)"></svg>');
      expect(result).toBe('');
    });

    test('should preserve safe HTML', () => {
      const result = sanitizeInput('<p>Hello <strong>World</strong></p>');
      expect(result).toBe('<p>Hello <strong>World</strong></p>');
    });

    test('should handle empty string', () => {
      const result = sanitizeInput('');
      expect(result).toBe('');
    });

    test('should handle null input', () => {
      const result = sanitizeInput(null as any);
      expect(result).toBe('');
    });

    test('should handle undefined input', () => {
      const result = sanitizeInput(undefined as any);
      expect(result).toBe('');
    });

    test('should remove multiple dangerous elements', () => {
      const result = sanitizeInput('<script>alert(1)</script><img src="x" onerror="alert(2)"><svg onload="alert(3)"></svg>');
      expect(result).toBe('<img src="x">');
    });
  });

  describe('Input Validation Edge Cases', () => {
    test('should handle very long inputs', () => {
      const longInput = 'a'.repeat(10000);
      const result = sanitizeInput(longInput);
      expect(result.length).toBe(10000);
    });

    test('should handle inputs with unicode characters', () => {
      const result = sanitizeInput('Hello 世界 🌍 <script>alert(1)</script>');
      expect(result).toBe('Hello 世界 🌍');
    });

    test('should handle nested script tags', () => {
      const result = sanitizeInput('<script><script>alert(1)</script></script>');
      expect(result).toBe('');
    });

    test('should handle mixed case tags', () => {
      const result = sanitizeInput('<SCRIPT>alert(1)</SCRIPT>');
      expect(result).toBe('');
    });
  });
});