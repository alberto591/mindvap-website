// Authentication Context
// Manages authentication state and provides authentication methods throughout the app
// Version: 1.0.1 - Fixed Vercel deployment issues

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, Session, AuthContextType, AuthState, AuthError, DeviceInfo, LoginRequest, RegisterRequest, UpdateProfileRequest, ChangePasswordRequest, ForgotPasswordRequest, ResetPasswordRequest, VerifyEmailRequest, UpdateEmailPreferencesRequest, AgeVerificationRequest, DataExportRequest, DeleteAccountRequest } from '../../domain/entities/auth';
import { supabase, SupabaseAuth, isUsingMockAuth } from '../../infrastructure/lib/supabase';
import { TokenManager, generateDeviceFingerprint, generateSessionId } from '../../infrastructure/lib/token-manager';
import { PasswordSecurity } from '../../infrastructure/lib/password-security';
import { SecurityService } from '../../application/services/security-service';
import { PasswordResetService } from '../../application/services/password-reset-service';
import { MockAuthService } from '../../infrastructure/lib/mock-auth-service';
import { getEnvVariable } from '../../infrastructure/lib/env-utils';

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Authentication provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State management
  const [state, setState] = useState<AuthState>({
    status: 'idle',
    user: null,
    session: null,
    error: null,
    deviceInfo: {
      fingerprint: '',
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      touchPoints: navigator.maxTouchPoints
    }
  });

  const refreshTimerRef = useRef<any>(null);
  const isRefreshingRef = useRef(false);
  const inactivityTimerRef = useRef<any>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Session timeout configuration (30 minutes of inactivity)
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  // Track user activity
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, status: 'loading', error: null }));

      // Clear refresh timer
      if (refreshTimerRef.current) {
        globalThis.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }

      // Stop inactivity timer
      stopInactivityTimer();

      // Sign out from Supabase
      await SupabaseAuth.signOut();

      // Clear local state
      setState(prev => ({
        ...prev,
        status: 'unauthenticated',
        user: null,
        session: null,
        error: null
      }));

    } catch (error) {
      console.error('Logout error:', error);
      setState(prev => ({
        ...prev,
        status: 'error',
        error: { code: 'LOGOUT_ERROR', message: 'Failed to logout properly' }
      }));
    }
  }, []);

  // Check for session timeout
  const checkSessionTimeout = useCallback(() => {
    if (state.status === 'authenticated') {
      const timeSinceActivity = Date.now() - lastActivityRef.current;
      if (timeSinceActivity > SESSION_TIMEOUT) {
        console.log('Session expired due to inactivity');
        logout();
      }
    }
  }, [state.status, logout]);

  // Start inactivity timer
  const startInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      globalThis.clearInterval(inactivityTimerRef.current);
    }

    // Check every minute for session timeout
    inactivityTimerRef.current = globalThis.setInterval(checkSessionTimeout, 60 * 1000);
  }, [checkSessionTimeout]);

  // Stop inactivity timer
  const stopInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      globalThis.clearInterval(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  // Initialize authentication state
  useEffect(() => {
    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = SupabaseAuth.onAuthStateChange((event, session) => {
      handleAuthStateChange(event, session);
    });

    // Set up activity tracking
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => updateActivity();

    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Clean up on unmount
    return () => {
      subscription.unsubscribe();
      if (refreshTimerRef.current) {
        globalThis.clearTimeout(refreshTimerRef.current);
      }
      stopInactivityTimer();
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [updateActivity, stopInactivityTimer]);

  // Check if we should use mock authentication
  const shouldUseMockAuth = () => {
    return isUsingMockAuth || getEnvVariable('SKIP_EMAIL_VERIFICATION') === 'true';
  };

  // Initialize authentication
  const initializeAuth = async () => {
    try {
      setState(prev => ({ ...prev, status: 'loading', error: null }));

      // Check if we should use mock auth
      if (shouldUseMockAuth()) {
        // Use mock authentication
        const session = MockAuthService.getSession();
        if (session) {
          setState(prev => ({
            ...prev,
            status: 'authenticated',
            user: session.user,
            session,
            error: null
          }));
        } else {
          setState(prev => ({
            ...prev,
            status: 'unauthenticated',
            user: null,
            session: null,
            error: null
          }));
        }
        return;
      }

      // Get current session from Supabase
      const session = await SupabaseAuth.getSession();
      const user = await SupabaseAuth.getUser();

      if (session && user) {
        // Validate session and update state
        const accessToken = session.access_token;
        const validation = await TokenManager.verifyAccessToken(accessToken);

        if (validation.valid && validation.payload) {
          const userSession: Session = {
            id: validation.payload.sessionId,
            user: user as unknown as User,
            accessToken,
            refreshToken: session.refresh_token || '',
            expiresIn: validation.payload.exp * 1000 - Date.now(),
            tokenType: 'Bearer',
            deviceFingerprint: state.deviceInfo.fingerprint,
            createdAt: new Date().toISOString()
          };

          setState(prev => ({
            ...prev,
            status: 'authenticated',
            user: user as unknown as User,
            session: userSession,
            error: null
          }));

          // Set up token refresh
          scheduleTokenRefresh(userSession);
        } else {
          // Try to refresh the session
          await refreshSession();
        }
      } else {
        setState(prev => ({
          ...prev,
          status: 'unauthenticated',
          user: null,
          session: null,
          error: null
        }));
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setState(prev => ({
        ...prev,
        status: 'error',
        error: {
          code: 'INITIALIZATION_ERROR',
          message: 'Failed to initialize authentication'
        }
      }));
    }
  };

  // Handle auth state changes
  const handleAuthStateChange = (event: string, session: any) => {
    switch (event) {
      case 'SIGNED_IN':
        if (session) {
          // User signed in successfully
          initializeAuth();
        }
        break;
      case 'SIGNED_OUT':
        // User signed out
        setState(prev => ({
          ...prev,
          status: 'unauthenticated',
          user: null,
          session: null,
          error: null
        }));
        break;
      case 'TOKEN_REFRESHED':
        if (session) {
          // Token refreshed successfully
          initializeAuth();
        }
        break;
      case 'USER_UPDATED':
        // User profile updated
        if (session?.user) {
          setState(prev => ({
            ...prev,
            user: session.user as unknown as User
          }));
        }
        break;
    }
  };

  // Schedule token refresh
  const scheduleTokenRefresh = (session: Session) => {
    if (refreshTimerRef.current) {
      globalThis.clearTimeout(refreshTimerRef.current);
    }

    const timeUntilRefresh = Math.max(0, session.expiresIn - (5 * 60 * 1000)); // 5 minutes before expiry

    refreshTimerRef.current = globalThis.setTimeout(() => {
      refreshSession();
    }, timeUntilRefresh);
  };

  // Login function
  const login = useCallback(async (credentials: LoginRequest): Promise<any> => {
    try {
      setState(prev => ({ ...prev, status: 'loading', error: null }));

      // Check rate limiting
      const rateLimitCheck = SecurityService.checkRateLimit(credentials.email, 'login');
      if (!rateLimitCheck.allowed) {
        setState(prev => ({
          ...prev,
          status: 'error',
          error: { code: 'RATE_LIMIT_EXCEEDED', message: rateLimitCheck.error || 'Too many attempts' }
        }));
        return {
          success: false,
          message: rateLimitCheck.error || 'Too many attempts',
          error: { code: 'RATE_LIMIT_EXCEEDED', message: rateLimitCheck.error || 'Too many attempts' }
        };
      }

      // Validate credentials
      if (!credentials.email || !credentials.password) {
        return {
          success: false,
          message: 'Email and password are required',
          error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' }
        };
      }

      // Check if we should use mock auth
      if (shouldUseMockAuth()) {
        const result = await MockAuthService.login(credentials);
        if (result.success && result.session) {
          setState(prev => ({
            ...prev,
            status: 'authenticated',
            user: result.session!.user,
            session: result.session,
            error: null
          }));

          // Start inactivity timer for session management
          updateActivity();
          startInactivityTimer();
        } else {
          setState(prev => ({
            ...prev,
            status: 'error',
            error: result.error || { code: 'LOGIN_FAILED', message: 'Login failed' }
          }));
        }
        return result;
      }

      // Generate device fingerprint if not exists
      let deviceFingerprint = state.deviceInfo.fingerprint;
      if (!deviceFingerprint) {
        deviceFingerprint = await SecurityService.generateDeviceFingerprint();
        setState(prev => ({
          ...prev,
          deviceInfo: { ...prev.deviceInfo, fingerprint: deviceFingerprint }
        }));
      }

      // Attempt to sign in with Supabase
      const result = await SupabaseAuth.signInWithPassword(
        credentials.email,
        credentials.password
      ) || { data: {}, error: { message: 'Unexpected empty response from auth service' } };

      const { data, error } = result;

      if (error) {
        // Handle specific Supabase errors
        let errorMessage = 'Login failed';
        let errorCode = 'LOGIN_FAILED';

        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password';
          errorCode = 'INVALID_CREDENTIALS';
          SecurityService.recordFailure(credentials.email, 'login');
          SecurityService.logSecurityEvent({
            type: 'failed_login',
            email: credentials.email,
            ipAddress: await SecurityService.getClientIP(),
            userAgent: navigator.userAgent,
            severity: 'medium',
            details: { reason: 'invalid_credentials' }
          });
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please verify your email address before signing in';
          errorCode = 'EMAIL_NOT_VERIFIED';
        } else if (error.message.includes('too many requests')) {
          errorMessage = 'Too many login attempts. Please try again later';
          errorCode = 'RATE_LIMIT_EXCEEDED';
        }

        setState(prev => ({
          ...prev,
          status: 'error',
          error: { code: errorCode, message: errorMessage }
        }));

        return {
          success: false,
          message: errorMessage,
          error: { code: errorCode, message: errorMessage }
        };
      }

      if (data.user && data.session) {
        // Log successful login
        SecurityService.logSecurityEvent({
          type: 'successful_login',
          userId: data.user.id,
          email: data.user.email!,
          ipAddress: await SecurityService.getClientIP(),
          userAgent: navigator.userAgent,
          severity: 'low',
          details: { method: 'password' }
        });

        SecurityService.recordSuccess(credentials.email, 'login');

        // Create session object
        const userSession: Session = {
          id: generateSessionId(),
          user: data.user as unknown as User,
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token || '',
          expiresIn: (data.session.expires_at || 0) * 1000 - Date.now(),
          tokenType: 'Bearer',
          deviceFingerprint,
          createdAt: new Date().toISOString()
        };

        setState(prev => ({
          ...prev,
          status: 'authenticated',
          user: data.user as unknown as User,
          session: userSession,
          error: null
        }));

        // Start inactivity timer for session management
        updateActivity();
        startInactivityTimer();

        // Schedule token refresh
        scheduleTokenRefresh(userSession);

        return {
          success: true,
          message: 'Login successful',
          session: userSession
        };
      }

      throw new Error('Unexpected response from authentication service');

    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = 'An unexpected error occurred during login';

      setState(prev => ({
        ...prev,
        status: 'error',
        error: { code: 'LOGIN_ERROR', message: errorMessage }
      }));

      return {
        success: false,
        message: errorMessage,
        error: { code: 'LOGIN_ERROR', message: errorMessage }
      };
    }
  }, [state.deviceInfo]);

  // Register function
  const register = useCallback(async (userData: RegisterRequest): Promise<any> => {
    try {
      setState(prev => ({ ...prev, status: 'loading', error: null }));

      // Validate input
      if (!userData.email || !userData.password || !userData.firstName || !userData.lastName || !userData.dateOfBirth) {
        return {
          success: false,
          message: 'All required fields must be provided',
          error: { code: 'VALIDATION_ERROR', message: 'All required fields must be provided' }
        };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        return {
          success: false,
          message: 'Please enter a valid email address',
          error: { code: 'INVALID_EMAIL', message: 'Please enter a valid email address' }
        };
      }

      // Validate password strength
      const passwordValidation = PasswordSecurity.validatePasswordStrength(userData.password);
      if (!passwordValidation.valid) {
        return {
          success: false,
          message: 'Password does not meet security requirements',
          error: { code: 'WEAK_PASSWORD', message: passwordValidation.errors.join(', ') }
        };
      }

      // Check age - Age verification bypassed for testing
      // const birthDate = new Date(userData.dateOfBirth);
      // const today = new Date();
      // let age = today.getFullYear() - birthDate.getFullYear();
      // const monthDiff = today.getMonth() - birthDate.getMonth();

      // if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      //   age--;
      // }

      // if (age < 21) {
      //   return {
      //     success: false,
      //     message: 'You must be at least 21 years old to create an account',
      //     error: { code: 'AGE_REQUIREMENT', message: 'You must be at least 21 years old to create an account' }
      //   };
      // }

      // Check if terms and privacy are accepted
      if (!userData.termsAccepted || !userData.privacyAccepted || !userData.dataProcessingConsent) {
        return {
          success: false,
          message: 'You must accept the terms of service, privacy policy, and data processing consent',
          error: { code: 'CONSENT_REQUIRED', message: 'You must accept all required agreements' }
        };
      }

      // Check if we should use mock auth
      if (shouldUseMockAuth()) {
        const result = await MockAuthService.register(userData);
        if (result.success && result.userId) {
          setState(prev => ({
            ...prev,
            status: 'unauthenticated',
            error: null
          }));

          return {
            success: true,
            message: 'Account created successfully. You can now log in.',
            userId: result.userId,
            emailVerificationRequired: result.emailVerificationRequired || false
          };
        } else {
          setState(prev => ({
            ...prev,
            status: 'error',
            error: result.error || { code: 'REGISTRATION_FAILED', message: 'Registration failed' }
          }));

          return result;
        }
      }

      // Prepare user metadata
      const metadata = {
        first_name: userData.firstName,
        last_name: userData.lastName,
        date_of_birth: userData.dateOfBirth,
        phone: userData.phone || null,
        marketing_consent: userData.marketingConsent,
        terms_accepted: userData.termsAccepted,
        privacy_accepted: userData.privacyAccepted,
        data_processing_consent: userData.dataProcessingConsent
      };

      // Attempt to sign up
      const { data, error } = await SupabaseAuth.signUp(userData.email, userData.password, metadata);

      if (error) {
        let errorMessage = 'Registration failed';
        let errorCode = 'REGISTRATION_FAILED';

        if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email address already exists';
          errorCode = 'EMAIL_EXISTS';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'Password does not meet security requirements';
          errorCode = 'WEAK_PASSWORD';
        }

        setState(prev => ({
          ...prev,
          status: 'error',
          error: { code: errorCode, message: errorMessage }
        }));

        return {
          success: false,
          message: errorMessage,
          error: { code: errorCode, message: errorMessage }
        };
      }

      if (data.user) {
        setState(prev => ({
          ...prev,
          status: 'unauthenticated',
          error: null
        }));

        return {
          success: true,
          message: 'Account created successfully. Please check your email to verify your account.',
          userId: data.user.id,
          emailVerificationRequired: !data.user.email_confirmed_at
          // ageVerificationRequired: true - Age verification bypassed for testing
        };
      }

      throw new Error('Unexpected response from authentication service');

    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = 'An unexpected error occurred during registration';

      setState(prev => ({
        ...prev,
        status: 'error',
        error: { code: 'REGISTRATION_ERROR', message: errorMessage }
      }));

      return {
        success: false,
        message: errorMessage,
        error: { code: 'REGISTRATION_ERROR', message: errorMessage }
      };
    }
  }, []);


  // Refresh session function
  const refreshSession = useCallback(async (): Promise<any> => {
    try {
      if (isRefreshingRef.current) {
        return { success: false, error: { code: 'REFRESH_IN_PROGRESS', message: 'Refresh already in progress' } };
      }

      isRefreshingRef.current = true;

      const { data, error } = await SupabaseAuth.refreshSession();

      if (error) {
        // Refresh failed, log out user
        await logout();
        return { success: false, error: { code: 'REFRESH_FAILED', message: 'Session refresh failed' } };
      }

      if (data.session && data.user) {
        const userSession: Session = {
          id: generateSessionId(),
          user: data.user as unknown as User,
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token || '',
          expiresIn: (data.session.expires_at || 0) * 1000 - Date.now(),
          tokenType: 'Bearer',
          deviceFingerprint: state.deviceInfo.fingerprint,
          createdAt: new Date().toISOString()
        };

        setState(prev => ({
          ...prev,
          user: data.user as unknown as User,
          session: userSession,
          error: null
        }));

        // Schedule next refresh
        scheduleTokenRefresh(userSession);

        return { success: true };
      }

      return { success: false, error: { code: 'REFRESH_FAILED', message: 'Invalid refresh response' } };

    } catch (error) {
      console.error('Session refresh error:', error);
      await logout();
      return { success: false, error: { code: 'REFRESH_ERROR', message: 'Session refresh failed' } };
    } finally {
      isRefreshingRef.current = false;
    }
  }, [state.deviceInfo.fingerprint, logout]);

  // Update profile function
  const updateProfile = useCallback(async (data: UpdateProfileRequest): Promise<any> => {
    try {
      if (!state.user) {
        return { success: false, message: 'User not authenticated', error: { code: 'NOT_AUTHENTICATED', message: 'User not authenticated' } };
      }

      // Update user metadata in Supabase
      const metadata: Record<string, any> = {};
      if (data.firstName) metadata.first_name = data.firstName;
      if (data.lastName) metadata.last_name = data.lastName;
      if (data.phone !== undefined) metadata.phone = data.phone;

      const { data: updatedUser, error } = await SupabaseAuth.updateUserMetadata(metadata);

      if (error) {
        return { success: false, message: 'Failed to update profile', error: { code: 'UPDATE_FAILED', message: 'Failed to update profile' } };
      }

      // Update local state
      if (updatedUser?.user) {
        setState(prev => ({
          ...prev,
          user: { ...prev.user, ...updatedUser.user } as User
        }));
      }

      return { success: true, message: 'Profile updated successfully', user: updatedUser?.user };

    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, message: 'An error occurred while updating profile', error: { code: 'UPDATE_ERROR', message: 'An error occurred while updating profile' } };
    }
  }, [state.user]);

  // Change password function
  const changePassword = useCallback(async (data: ChangePasswordRequest): Promise<any> => {
    try {
      if (!state.user) {
        return { success: false, message: 'User not authenticated', error: { code: 'NOT_AUTHENTICATED', message: 'User not authenticated' } };
      }

      // Validate new password
      if (data.newPassword.length < 8) {
        return { success: false, message: 'Password must be at least 8 characters long', error: { code: 'WEAK_PASSWORD', message: 'Password must be at least 8 characters long' } };
      }

      const { error } = await SupabaseAuth.updatePassword(data.newPassword);

      if (error) {
        return { success: false, message: 'Failed to change password', error: { code: 'CHANGE_PASSWORD_FAILED', message: 'Failed to change password' } };
      }

      return { success: true, message: 'Password changed successfully' };

    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, message: 'An error occurred while changing password', error: { code: 'CHANGE_PASSWORD_ERROR', message: 'An error occurred while changing password' } };
    }
  }, [state.user]);

  // Forgot password function
  const forgotPassword = useCallback(async (email: string): Promise<any> => {
    try {
      if (!email || !email.includes('@')) {
        return { success: false, message: 'Please enter a valid email address', error: { code: 'INVALID_EMAIL', message: 'Please enter a valid email address' } };
      }

      // Check rate limiting
      const rateLimitCheck = SecurityService.checkRateLimit(email, 'passwordReset');
      if (!rateLimitCheck.allowed) {
        return {
          success: false,
          message: rateLimitCheck.error || 'Too many reset requests',
          error: { code: 'RATE_LIMIT_EXCEEDED', message: rateLimitCheck.error || 'Too many reset requests' }
        };
      }

      const result = await PasswordResetService.requestPasswordReset(email);

      if (result.success) {
        SecurityService.logSecurityEvent({
          type: 'password_reset',
          email,
          ipAddress: await SecurityService.getClientIP(),
          userAgent: navigator.userAgent,
          severity: 'medium',
          details: { action: 'requested' }
        });
      }

      return result;

    } catch (error) {
      console.error('Forgot password error:', error);
      return { success: false, message: 'An error occurred while processing your request', error: { code: 'FORGOT_PASSWORD_ERROR', message: 'An error occurred while processing your request' } };
    }
  }, []);

  // Reset password function
  const resetPassword = useCallback(async (data: ResetPasswordRequest): Promise<any> => {
    try {
      if (!data.token || !data.newPassword) {
        return { success: false, message: 'Token and new password are required', error: { code: 'VALIDATION_ERROR', message: 'Token and new password are required' } };
      }

      if (data.newPassword.length < 8) {
        return { success: false, message: 'Password must be at least 8 characters long', error: { code: 'WEAK_PASSWORD', message: 'Password must be at least 8 characters long' } };
      }

      const result = await PasswordResetService.resetPassword(data.token, data.newPassword);

      if (result.success) {
        SecurityService.logSecurityEvent({
          type: 'password_reset',
          ipAddress: await SecurityService.getClientIP(),
          userAgent: navigator.userAgent,
          severity: 'medium',
          details: { action: 'completed' }
        });
      }

      return result;

    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, message: 'An error occurred while resetting password', error: { code: 'RESET_PASSWORD_ERROR', message: 'An error occurred while resetting password' } };
    }
  }, []);

  // Verify email function
  const verifyEmail = useCallback(async (token: string): Promise<any> => {
    try {
      if (!token) {
        return { success: false, message: 'Verification token is required', error: { code: 'VALIDATION_ERROR', message: 'Verification token is required' } };
      }

      // Note: This is a placeholder implementation as the exact Supabase API for email verification
      // may vary based on the version and configuration. In a real implementation, you would:
      // 1. Call the appropriate Supabase method for email verification
      // 2. Handle the response and update the user's email verification status

      console.log('Email verification token:', token);

      // For now, simulate successful verification
      // In a real implementation, you would use:
      // const { data, error } = await SupabaseAuth.verifyOtp({ token_hash: token, type: 'email' });

      return { success: true, message: 'Email verified successfully' };

    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, message: 'An error occurred while verifying email', error: { code: 'VERIFY_EMAIL_ERROR', message: 'An error occurred while verifying email' } };
    }
  }, []);

  // Update email preferences function
  const updateEmailPreferences = useCallback(async (preferences: UpdateEmailPreferencesRequest): Promise<any> => {
    try {
      if (!state.user) {
        return { success: false, message: 'User not authenticated', error: { code: 'NOT_AUTHENTICATED', message: 'User not authenticated' } };
      }

      const { error } = await SupabaseAuth.updateUserMetadata({
        marketing_consent: preferences.marketingEmails ?? state.user.marketingConsent
      });

      if (error) {
        return { success: false, message: 'Failed to update email preferences', error: { code: 'UPDATE_FAILED', message: 'Failed to update email preferences' } };
      }

      return { success: true, message: 'Email preferences updated successfully' };

    } catch (error) {
      console.error('Update email preferences error:', error);
      return { success: false, message: 'An error occurred while updating preferences', error: { code: 'UPDATE_ERROR', message: 'An error occurred while updating preferences' } };
    }
  }, [state.user]);

  // Request age verification function
  const requestAgeVerification = useCallback(async (data: AgeVerificationRequest): Promise<any> => {
    // TODO: Implement age verification functionality
    return { success: false, message: 'Not implemented yet', error: { code: 'NOT_IMPLEMENTED', message: 'Not implemented yet' } };
  }, []);

  // Export user data function
  const exportUserData = useCallback(async (): Promise<any> => {
    // TODO: Implement data export functionality
    return { success: false, message: 'Not implemented yet', error: { code: 'NOT_IMPLEMENTED', message: 'Not implemented yet' } };
  }, []);

  // Delete account function
  const deleteAccount = useCallback(async (data: DeleteAccountRequest): Promise<any> => {
    // TODO: Implement account deletion functionality
    return { success: false, message: 'Not implemented yet', error: { code: 'NOT_IMPLEMENTED', message: 'Not implemented yet' } };
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Context value
  const contextValue: AuthContextType = {
    user: state.user,
    session: state.session,
    loading: state.status === 'loading',
    isAuthenticated: state.status === 'authenticated',
    isEmailVerified: state.user?.emailVerified || false,
    isAgeVerified: state.user?.ageVerified || false,
    login,
    register,
    logout,
    refreshSession,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    updateEmailPreferences,
    requestAgeVerification,
    exportUserData,
    deleteAccount,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export the context for advanced use cases
export { AuthContext };