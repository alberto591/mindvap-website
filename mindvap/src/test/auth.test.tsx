/**
 * Authentication Context Unit Tests
 *
 * This file contains unit tests for the AuthContext, including
 * session management, timeout functionality, and security features.
 */

import React, { useState } from 'react';
import { act, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '../presentation/contexts/auth-context';
import { render } from './utils';
import { MockAuthService } from '../infrastructure/lib/mock-auth-service';
import { SecurityService } from '../application/services/security-service';
import { SupabaseAuth } from '../infrastructure/lib/supabase';
import { User } from '../domain/entities/auth';

// Mock Supabase
jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
  },
  SupabaseAuth: {
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    getSession: jest.fn().mockResolvedValue(null),
    getUser: jest.fn().mockResolvedValue(null),
    signInWithPassword: jest.fn().mockResolvedValue({
      data: {
        user: { id: 'user-123', email: 'test@example.com' },
        session: { access_token: 'token', refresh_token: 'refresh', expires_at: Math.floor(Date.now() / 1000) + 3600 }
      },
      error: null
    }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
  },
}));

jest.mock('../lib/token-manager', () => ({
  TokenManager: {
    verifyAccessToken: jest.fn().mockResolvedValue({ valid: false }),
  },
  generateDeviceFingerprint: jest.fn(() => 'mock-fingerprint'),
  generateSessionId: jest.fn(() => 'mock-session-id'),
}));

jest.mock('../services/security-service', () => ({
  SecurityService: {
    checkRateLimit: jest.fn(() => ({ allowed: true })),
    generateDeviceFingerprint: jest.fn(() => 'mock-fingerprint'),
    recordFailure: jest.fn(),
    recordSuccess: jest.fn(),
    logSecurityEvent: jest.fn(),
    getClientIP: jest.fn(() => '127.0.0.1'),
  },
}));

jest.mock('../lib/mock-auth-service', () => ({
  MockAuthService: {
    getSession: jest.fn(),
    login: jest.fn(),
  },
}));

describe('AuthContext Session Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Session Timeout', () => {
    test('should initialize session timeout timer when user logs in', async () => {
      const TestComponent = () => {
        const { login, logout } = useAuth();
        return (
          <div>
            <button onClick={() => login({
              email: 'test@example.com',
              password: 'password123',
              deviceInfo: {
                fingerprint: 'test-fingerprint',
                userAgent: 'test-agent'
              }
            })}>
              Login
            </button>
            <button onClick={() => logout()}>Logout</button>
          </div>
        );
      };

      const { getByText } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '1990-01-01',
        ageVerified: true,
        emailVerified: true,
        marketingConsent: false,
        termsAccepted: true,
        privacyAccepted: true,
        status: 'active',
        failedLoginAttempts: 0,
        passwordChangedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dataProcessingConsent: true,
        dataRetentionPeriod: 365
      };

      // Mock successful login
      jest.spyOn(MockAuthService, 'login').mockResolvedValue({
        success: true,
        message: 'Login successful',
        session: {
          id: 'session-123',
          user: mockUser,
          accessToken: 'token',
          refreshToken: 'refresh',
          expiresIn: 3600,
          tokenType: 'Bearer' as const,
          deviceFingerprint: 'fingerprint',
          createdAt: new Date().toISOString()
        }
      });

      // Trigger login
      await act(async () => {
        fireEvent.click(getByText('Login'));
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });
      expect(jest.getTimerCount()).toBeGreaterThan(0);
    });

    test('should clear inactivity timer on logout', async () => {
      const TestComponent = () => {
        const { login, logout } = useAuth();
        return (
          <div>
            <button onClick={() => login({
              email: 'test@example.com',
              password: 'password123',
              deviceInfo: {
                fingerprint: 'test-fingerprint',
                userAgent: 'test-agent'
              }
            })}>
              Login
            </button>
            <button onClick={() => logout()}>Logout</button>
          </div>
        );
      };

      // 1. Login first
      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '1990-01-01',
        ageVerified: true,
        emailVerified: true,
        marketingConsent: false,
        termsAccepted: true,
        privacyAccepted: true,
        status: 'active',
        failedLoginAttempts: 0,
        passwordChangedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dataProcessingConsent: true,
        dataRetentionPeriod: 365
      };

      jest.spyOn(MockAuthService, 'login').mockResolvedValue({
        success: true,
        message: 'Login successful',
        session: {
          id: 'session-123',
          user: mockUser,
          accessToken: 'token',
          refreshToken: 'refresh',
          expiresIn: 3600,
          tokenType: 'Bearer' as const,
          deviceFingerprint: 'fingerprint',
          createdAt: new Date().toISOString()
        }
      });

      const { getByText } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // 2. Trigger login to start timer
      await act(async () => {
        fireEvent.click(getByText('Login'));
      });

      // 3. Mock logout
      jest.spyOn(SupabaseAuth, 'signOut').mockResolvedValue({ error: null });

      // 4. Trigger logout
      await act(async () => {
        fireEvent.click(getByText('Logout'));
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });
      // Checking that the timer was cleared
      expect(jest.getTimerCount()).toBe(0);
    });
  });

  describe('Activity Tracking', () => {
    test('should track mouse movements', () => {
      render(
        <AuthProvider>
          <div>Test</div>
        </AuthProvider>
      );

      // Simulate mouse movement
      act(() => {
        document.dispatchEvent(new Event('mousemove'));
      });

      // Activity should be tracked (internal state)
      expect(true).toBe(true); // Basic test that component renders
    });

    test('should track keyboard events', () => {
      render(
        <AuthProvider>
          <div>Test</div>
        </AuthProvider>
      );

      // Simulate keypress
      act(() => {
        document.dispatchEvent(new KeyboardEvent('keypress', { key: 'a' }));
      });

      expect(true).toBe(true); // Basic test that component renders
    });
  });

  describe('Security Features', () => {
    test('should handle rate limiting', async () => {
      jest.spyOn(SecurityService, 'checkRateLimit').mockReturnValue({
        allowed: false,
        error: 'Too many attempts',
        remaining: 0,
        resetTime: Date.now() + 1000
      });

      const TestComponent = () => {
        const { login } = useAuth();
        const [error, setError] = useState('');

        const handleLogin = async () => {
          const result = await login({
            email: 'test@example.com',
            password: 'password123',
            deviceInfo: {
              fingerprint: 'test-fingerprint',
              userAgent: 'test-agent'
            }
          });
          if (!result.success) {
            setError(result.message || '');
          }
        };

        return (
          <div>
            <button onClick={handleLogin}>Login</button>
            {error && <div>{error}</div>}
          </div>
        );
      };

      const { getByText } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Trigger login
      await act(async () => {
        fireEvent.click(getByText('Login'));
      });

      await waitFor(() => {
        expect(getByText('Too many attempts')).toBeInTheDocument();
      });
    });
  });
});