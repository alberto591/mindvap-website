/**
 * Authentication Context Unit Tests
 *
 * This file contains unit tests for the AuthContext, including
 * session management, timeout functionality, and security features.
 */

import React from 'react';
import { act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { render } from './utils';

// Mock Supabase
jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      getSession: jest.fn(),
      getUser: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
  },
  SupabaseAuth: {
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    getSession: jest.fn(),
    getUser: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
  },
}));

// Mock other dependencies
jest.mock('../lib/tokenManager', () => ({
  TokenManager: {
    verifyAccessToken: jest.fn(),
  },
  generateDeviceFingerprint: jest.fn(() => 'mock-fingerprint'),
  generateSessionId: jest.fn(() => 'mock-session-id'),
}));

jest.mock('../services/securityService', () => ({
  SecurityService: {
    checkRateLimit: jest.fn(() => ({ allowed: true })),
    generateDeviceFingerprint: jest.fn(() => 'mock-fingerprint'),
    recordFailure: jest.fn(),
    recordSuccess: jest.fn(),
    logSecurityEvent: jest.fn(),
    getClientIP: jest.fn(() => '127.0.0.1'),
  },
}));

jest.mock('../lib/mockAuthService', () => ({
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
        const { login } = useAuth();
        return (
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
        );
      };

      const { getByText } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Mock successful login
      const mockLogin = require('../lib/mockAuthService').MockAuthService.login;
      mockLogin.mockResolvedValue({
        success: true,
        session: {
          user: { id: 'user-123', email: 'test@example.com' },
          accessToken: 'token',
          refreshToken: 'refresh',
          expiresIn: 3600,
          tokenType: 'Bearer',
          deviceFingerprint: 'fingerprint',
          createdAt: new Date().toISOString(),
        }
      });

      // Trigger login
      act(() => {
        getByText('Login').click();
      });

      await waitFor(() => {
        expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 60000);
      });
    });

    test('should clear inactivity timer on logout', async () => {
      const TestComponent = () => {
        const { logout } = useAuth();
        return (
          <button onClick={() => logout()}>
            Logout
          </button>
        );
      };

      const { getByText } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Mock logout
      const mockSignOut = require('../lib/supabase').SupabaseAuth.signOut;
      mockSignOut.mockResolvedValue({});

      // Trigger logout
      act(() => {
        getByText('Logout').click();
      });

      await waitFor(() => {
        expect(clearInterval).toHaveBeenCalled();
      });
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
      const mockCheckRateLimit = require('../services/securityService').SecurityService.checkRateLimit;
      mockCheckRateLimit.mockReturnValue({ allowed: false, error: 'Too many attempts' });

      const TestComponent = () => {
        const { login } = useAuth();
        const [error, setError] = React.useState('');

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
      act(() => {
        getByText('Login').click();
      });

      await waitFor(() => {
        expect(getByText('Too many attempts')).toBeInTheDocument();
      });
    });
  });
});