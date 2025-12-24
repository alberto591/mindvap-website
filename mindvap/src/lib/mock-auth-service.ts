// Mock Authentication Service for Development
// Provides mock authentication when Supabase is not available

import { User, Session, AuthContextType, AuthState, AuthError, DeviceInfo, LoginRequest, RegisterRequest, UpdateProfileRequest, ChangePasswordRequest, ForgotPasswordRequest, ResetPasswordRequest, VerifyEmailRequest, UpdateEmailPreferencesRequest, AgeVerificationRequest, DataExportRequest, DeleteAccountRequest } from '../types/auth';

// Mock user data
const mockUsers: User[] = [
  {
    id: '1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    phone: '+1234567890',
    dateOfBirth: '1990-01-01',
    ageVerified: true,
    ageVerifiedAt: new Date().toISOString(),
    emailVerified: true,
    emailVerifiedAt: new Date().toISOString(),
    marketingConsent: true,
    marketingConsentAt: new Date().toISOString(),
    termsAccepted: true,
    termsAcceptedAt: new Date().toISOString(),
    privacyAccepted: true,
    privacyAcceptedAt: new Date().toISOString(),
    status: 'active',
    failedLoginAttempts: 0,
    passwordChangedAt: new Date().toISOString(),
    dataProcessingConsent: true,
    dataProcessingConsentAt: new Date().toISOString(),
    dataRetentionPeriod: 2555,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    email: 'dummy@example.com',
    firstName: 'Dummy',
    lastName: 'User',
    phone: '+1234567891',
    dateOfBirth: '1995-01-01',
    ageVerified: true,
    ageVerifiedAt: new Date().toISOString(),
    emailVerified: true,
    emailVerifiedAt: new Date().toISOString(),
    marketingConsent: true,
    marketingConsentAt: new Date().toISOString(),
    termsAccepted: true,
    termsAcceptedAt: new Date().toISOString(),
    privacyAccepted: true,
    privacyAcceptedAt: new Date().toISOString(),
    status: 'active',
    failedLoginAttempts: 0,
    passwordChangedAt: new Date().toISOString(),
    dataProcessingConsent: true,
    dataProcessingConsentAt: new Date().toISOString(),
    dataRetentionPeriod: 2555,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    email: 'testuser@mindvap.com',
    firstName: 'Test',
    lastName: 'MindVap',
    phone: '+1234567892',
    dateOfBirth: '1985-05-15',
    ageVerified: true,
    ageVerifiedAt: new Date().toISOString(),
    emailVerified: true,
    emailVerifiedAt: new Date().toISOString(),
    marketingConsent: true,
    marketingConsentAt: new Date().toISOString(),
    termsAccepted: true,
    termsAcceptedAt: new Date().toISOString(),
    privacyAccepted: true,
    privacyAcceptedAt: new Date().toISOString(),
    status: 'active',
    failedLoginAttempts: 0,
    passwordChangedAt: new Date().toISOString(),
    dataProcessingConsent: true,
    dataProcessingConsentAt: new Date().toISOString(),
    dataRetentionPeriod: 2555,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Mock session storage
let mockSession: Session | null = null;

// Mock authentication service
export class MockAuthService {
  // Login with mock authentication
  static async login(credentials: LoginRequest): Promise<{ success: boolean; message: string; session?: Session; error?: AuthError }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find user by email
    const user = mockUsers.find(u => u.email === credentials.email);
    
    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password',
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
      };
    }
    
    // For mock purposes, accept any password
    if (!credentials.password) {
      return {
        success: false,
        message: 'Password is required',
        error: { code: 'VALIDATION_ERROR', message: 'Password is required' }
      };
    }
    
    // Create mock session
    const session: Session = {
      id: `session_${Date.now()}`,
      user,
      accessToken: `mock_access_token_${Date.now()}`,
      refreshToken: `mock_refresh_token_${Date.now()}`,
      expiresIn: 900000, // 15 minutes
      tokenType: 'Bearer',
      deviceFingerprint: 'mock_fingerprint',
      createdAt: new Date().toISOString()
    };
    
    mockSession = session;
    
    return {
      success: true,
      message: 'Login successful',
      session
    };
  }
  
  // Register new user
  static async register(userData: RegisterRequest): Promise<{ success: boolean; message: string; userId?: string; emailVerificationRequired?: boolean; ageVerificationRequired?: boolean; error?: AuthError }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Validate required fields
    if (!userData.email || !userData.password || !userData.firstName || !userData.lastName || !userData.dateOfBirth) {
      return {
        success: false,
        message: 'All required fields must be provided',
        error: { code: 'VALIDATION_ERROR', message: 'All required fields must be provided' }
      };
    }
    
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      return {
        success: false,
        message: 'An account with this email address already exists',
        error: { code: 'EMAIL_EXISTS', message: 'An account with this email address already exists' }
      };
    }
    
    // Create new user
    const newUser: User = {
      id: String(mockUsers.length + 1),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone || null,
      dateOfBirth: userData.dateOfBirth,
      ageVerified: true, // Auto-verify for mock
      ageVerifiedAt: new Date().toISOString(),
      emailVerified: true, // Auto-verify for mock
      emailVerifiedAt: new Date().toISOString(),
      marketingConsent: userData.marketingConsent || false,
      marketingConsentAt: userData.marketingConsent ? new Date().toISOString() : undefined,
      termsAccepted: userData.termsAccepted,
      termsAcceptedAt: userData.termsAccepted ? new Date().toISOString() : undefined,
      privacyAccepted: userData.privacyAccepted,
      privacyAcceptedAt: userData.privacyAccepted ? new Date().toISOString() : undefined,
      status: 'active',
      failedLoginAttempts: 0,
      passwordChangedAt: new Date().toISOString(),
      dataProcessingConsent: userData.dataProcessingConsent,
      dataProcessingConsentAt: userData.dataProcessingConsent ? new Date().toISOString() : undefined,
      dataRetentionPeriod: 2555,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockUsers.push(newUser);
    
    return {
      success: true,
      message: 'Account created successfully',
      userId: newUser.id,
      emailVerificationRequired: false,
      ageVerificationRequired: false
    };
  }
  
  // Logout
  static async logout(): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    mockSession = null;
  }
  
  // Get current session
  static getSession(): Session | null {
    return mockSession;
  }
  
  // Update profile
  static async updateProfile(data: UpdateProfileRequest): Promise<{ success: boolean; message: string; user?: User; error?: AuthError }> {
    if (!mockSession) {
      return {
        success: false,
        message: 'User not authenticated',
        error: { code: 'NOT_AUTHENTICATED', message: 'User not authenticated' }
      };
    }
    
    // Find and update user
    const userIndex = mockUsers.findIndex(u => u.id === mockSession!.user.id);
    if (userIndex === -1) {
      return {
        success: false,
        message: 'User not found',
        error: { code: 'USER_NOT_FOUND', message: 'User not found' }
      };
    }
    
    const updatedUser = {
      ...mockUsers[userIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    mockUsers[userIndex] = updatedUser;
    
    // Update session user
    if (mockSession) {
      mockSession.user = updatedUser;
    }
    
    return {
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    };
  }
  
  // Change password
  static async changePassword(data: ChangePasswordRequest): Promise<{ success: boolean; message: string; error?: AuthError }> {
    if (!mockSession) {
      return {
        success: false,
        message: 'User not authenticated',
        error: { code: 'NOT_AUTHENTICATED', message: 'User not authenticated' }
      };
    }
    
    if (!data.newPassword || data.newPassword.length < 8) {
      return {
        success: false,
        message: 'Password must be at least 8 characters long',
        error: { code: 'WEAK_PASSWORD', message: 'Password must be at least 8 characters long' }
      };
    }
    
    // For mock, just simulate password change
    return {
      success: true,
      message: 'Password changed successfully'
    };
  }
  
  // Forgot password
  static async forgotPassword(email: string): Promise<{ success: boolean; message: string; error?: AuthError }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = mockUsers.find(u => u.email === email);
    
    if (!user) {
      // For security, don't reveal if user exists
      return {
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent'
      };
    }
    
    return {
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent'
    };
  }
  
  // Reset password
  static async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string; error?: AuthError }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!newPassword || newPassword.length < 8) {
      return {
        success: false,
        message: 'Password must be at least 8 characters long',
        error: { code: 'WEAK_PASSWORD', message: 'Password must be at least 8 characters long' }
      };
    }
    
    return {
      success: true,
      message: 'Password reset successfully'
    };
  }
  
  // Verify email
  static async verifyEmail(token: string): Promise<{ success: boolean; message: string; error?: AuthError }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      message: 'Email verified successfully'
    };
  }
  
  // Update email preferences
  static async updateEmailPreferences(preferences: UpdateEmailPreferencesRequest): Promise<{ success: boolean; message: string; error?: AuthError }> {
    if (!mockSession) {
      return {
        success: false,
        message: 'User not authenticated',
        error: { code: 'NOT_AUTHENTICATED', message: 'User not authenticated' }
      };
    }
    
    // Update user preferences
    const userIndex = mockUsers.findIndex(u => u.id === mockSession!.user.id);
    if (userIndex === -1) {
      return {
        success: false,
        message: 'User not found',
        error: { code: 'USER_NOT_FOUND', message: 'User not found' }
      };
    }
    
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      marketingConsent: preferences.marketingEmails ?? mockUsers[userIndex].marketingConsent
    };
    
    return {
      success: true,
      message: 'Email preferences updated successfully'
    };
  }
  
  // Request age verification
  static async requestAgeVerification(data: AgeVerificationRequest): Promise<{ success: boolean; message: string; error?: AuthError }> {
    if (!mockSession) {
      return {
        success: false,
        message: 'User not authenticated',
        error: { code: 'NOT_AUTHENTICATED', message: 'User not authenticated' }
      };
    }
    
    // Mock age verification
    return {
      success: true,
      message: 'Age verification requested successfully'
    };
  }
  
  // Export user data
  static async exportUserData(): Promise<{ success: boolean; message: string; data?: any; error?: AuthError }> {
    if (!mockSession) {
      return {
        success: false,
        message: 'User not authenticated',
        error: { code: 'NOT_AUTHENTICATED', message: 'User not authenticated' }
      };
    }
    
    // Return mock user data
    return {
      success: true,
      message: 'Data exported successfully',
      data: {
        user: mockSession.user,
        exportDate: new Date().toISOString()
      }
    };
  }
  
  // Delete account
  static async deleteAccount(data: DeleteAccountRequest): Promise<{ success: boolean; message: string; error?: AuthError }> {
    if (!mockSession) {
      return {
        success: false,
        message: 'User not authenticated',
        error: { code: 'NOT_AUTHENTICATED', message: 'User not authenticated' }
      };
    }
    
    // Remove user from mock array
    const userIndex = mockUsers.findIndex(u => u.id === mockSession!.user.id);
    if (userIndex !== -1) {
      mockUsers.splice(userIndex, 1);
    }
    
    // Clear session
    mockSession = null;
    
    return {
      success: true,
      message: 'Account deleted successfully'
    };
  }
}