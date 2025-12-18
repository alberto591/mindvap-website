// Login Form Component
// Secure, user-friendly login form with comprehensive validation

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { generateDeviceFingerprint } from '../../lib/tokenManager';
import { sanitizeEmail, sanitizePassword } from '../../lib/utils';
import { LoginRequest } from '../../types/auth';

interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onForgotPassword?: () => void;
  redirectTo?: string;
}

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  [key: string]: string;
}

interface RateLimitInfo {
  attempts: number;
  lockedUntil?: Date;
  lastAttempt?: Date;
}

const LoginForm: React.FC<LoginFormProps> = ({ 
  onSuccess, 
  onError, 
  onForgotPassword,
  redirectTo 
}) => {
  const { login, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo>({
    attempts: 0
  });
  const [showPassword, setShowPassword] = useState(false);

  // Load saved email from localStorage on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('mindvap_saved_email');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
    }

    // Load rate limit info
    const rateLimitData = localStorage.getItem('mindvap_rate_limit');
    if (rateLimitData) {
      try {
        const parsed = JSON.parse(rateLimitData);
        setRateLimitInfo(parsed);
      } catch (error) {
        console.error('Failed to parse rate limit data:', error);
      }
    }
  }, []);

  // Check if account is locked
  const isAccountLocked = (): boolean => {
    if (!rateLimitInfo.lockedUntil) return false;
    return new Date() < new Date(rateLimitInfo.lockedUntil);
  };

  // Get time until unlock
  const getTimeUntilUnlock = (): string => {
    if (!rateLimitInfo.lockedUntil) return '';
    const now = new Date().getTime();
    const unlockTime = new Date(rateLimitInfo.lockedUntil).getTime();
    const diff = unlockTime - now;
    
    if (diff <= 0) return '';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  // Update rate limit info
  const updateRateLimit = (failed: boolean = false) => {
    const now = new Date();
    const newAttempts = failed ? rateLimitInfo.attempts + 1 : 0;
    let lockedUntil: Date | undefined;
    
    // Lock account after 5 failed attempts
    if (newAttempts >= 5) {
      // Exponential backoff: 5min, 15min, 1hr, 24hr
      const lockMinutes = Math.min(Math.pow(3, newAttempts - 4) * 5, 1440);
      lockedUntil = new Date(now.getTime() + lockMinutes * 60 * 1000);
    }

    const newRateLimitInfo = {
      attempts: newAttempts,
      lastAttempt: now,
      lockedUntil
    };

    setRateLimitInfo(newRateLimitInfo);
    localStorage.setItem('mindvap_rate_limit', JSON.stringify(newRateLimitInfo));
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Check if account is locked
    if (isAccountLocked()) {
      newErrors.general = t('login.accountLocked').replace('{time}', getTimeUntilUnlock());
      setErrors(newErrors);
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = t('error.required');
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = t('error.email');
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = t('error.required');
    } else if (formData.password.length < 6) {
      newErrors.password = t('login.passwordTooShort');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Sanitize inputs
      const sanitizedEmail = sanitizeEmail(formData.email);
      const sanitizedPassword = sanitizePassword(formData.password);

      // Generate device fingerprint
      const deviceFingerprint = await generateDeviceFingerprint(
        navigator.userAgent,
        `${window.screen.width}x${window.screen.height}`,
        Intl.DateTimeFormat().resolvedOptions().timeZone
      );

      const loginData: LoginRequest = {
        email: sanitizedEmail,
        password: sanitizedPassword,
        deviceInfo: {
          fingerprint: deviceFingerprint,
          userAgent: navigator.userAgent
        }
      };

      const result = await login(loginData);

      if (result.success) {
        // Clear rate limit on successful login
        updateRateLimit(false);
        
        // Save email if "remember me" is checked
        if (formData.rememberMe) {
          localStorage.setItem('mindvap_saved_email', formData.email);
        } else {
          localStorage.removeItem('mindvap_saved_email');
        }

        onSuccess?.();
      } else {
        // Update rate limit on failed login
        updateRateLimit(true);
        
        // Handle specific error messages
        let errorMessage = result.message;
        
        if (result.error?.code === 'INVALID_CREDENTIALS') {
          errorMessage = t('login.invalidCredentials');
        } else if (result.error?.code === 'EMAIL_NOT_VERIFIED') {
          errorMessage = t('login.emailNotVerified');
        } else if (result.error?.code === 'RATE_LIMIT_EXCEEDED') {
          errorMessage = t('login.rateLimitExceeded');
        } else if (result.error?.code === 'ACCOUNT_LOCKED') {
          errorMessage = t('login.accountLocked').replace('{time}', getTimeUntilUnlock());
        }

        onError?.(errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      updateRateLimit(true);
      onError?.(t('error.unknown'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear general error
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  // Show loading state
  if (isAccountLocked()) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('login.accountLockedTitle')}
          </h2>
          <p className="text-gray-600 mb-4">
            {t('login.tooManyAttempts')}
          </p>
          <p className="text-sm text-gray-500">
            {t('login.tryAgainIn').replace('{time}', getTimeUntilUnlock())}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('login.title')}
        </h2>
        <p className="text-gray-600">
          {t('login.subtitle')}
        </p>
      </div>

      {/* General Error Message */}
      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm text-red-800">{errors.general}</p>
          </div>
        </div>
      )}

      {/* Rate Limit Warning */}
      {rateLimitInfo.attempts > 0 && rateLimitInfo.attempts < 5 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex">
            <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm text-yellow-800">
              {t('login.attemptsRemaining').replace('{count}', (5 - rateLimitInfo.attempts).toString())}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            {t('login.email')}
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={t('login.emailPlaceholder')}
            autoComplete="email"
            disabled={isSubmitting || loading}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            {t('login.password')}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('login.passwordPlaceholder')}
              autoComplete="current-password"
              disabled={isSubmitting || loading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isSubmitting || loading}
            >
              {showPassword ? (
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              checked={formData.rememberMe}
              onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              disabled={isSubmitting || loading}
            />
            <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
              {t('login.rememberMe')}
            </label>
          </div>
          
          {onForgotPassword && (
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-green-600 hover:text-green-500 underline"
              disabled={isSubmitting || loading}
            >
              {t('login.forgotPassword')}
            </button>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting || loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('login.signingIn')}
            </div>
          ) : (
            t('login.signIn')
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          {t('login.dontHaveAccount')}{' '}
          <button 
            onClick={() => navigate('/register')}
            className="text-green-600 hover:text-green-500 underline"
          >
            {t('login.createAccount')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;