// Login Page Component
// Main login page with routing and navigation integration

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import { useLanguage } from '../contexts/language-context';
import LoginForm from '../components/auth/login-form';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  // Check for reset token in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    const type = urlParams.get('type');
    
    if (token && type === 'recovery') {
      setResetToken(token);
      setShowResetPassword(true);
      setShowForgotPassword(false);
    }
  }, [location.search]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Handle successful login
  const handleLoginSuccess = () => {
    const from = (location.state as any)?.from?.pathname || '/';
    navigate(from, { replace: true });
  };

  // Handle login error
  const handleLoginError = (error: string) => {
    console.error('Login error:', error);
    // Error handling is done within the form component
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  // Handle password reset success
  const handlePasswordResetSuccess = () => {
    setShowResetPassword(false);
    setResetToken(null);
    navigate('/login', { 
      replace: true,
      state: { 
        message: t('login.passwordResetSuccess'),
        type: 'success'
      }
    });
  };

  // Handle back to login
  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setShowResetPassword(false);
    setResetToken(null);
  };

  // Loading state while checking authentication
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo/Header */}
        <div className="text-center">
          <a href="/" className="inline-block">
            <div className="text-3xl font-bold text-green-600 mb-2">
              MindVap
            </div>
          </a>
          <h1 className="text-sm text-gray-600">
            Premium Herbal Wellness
          </h1>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Show success message from navigation state */}
        {location.state?.message && (
          <div className={`mb-6 p-4 rounded-md ${
            location.state.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {location.state.type === 'success' ? (
                  <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  location.state.type === 'success' ? 'text-green-800' : 'text-blue-800'
                }`}>
                  {location.state.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          {showResetPassword ? (
            <ResetPasswordForm 
              token={resetToken}
              onSuccess={handlePasswordResetSuccess}
              onBack={handleBackToLogin}
            />
          ) : showForgotPassword ? (
            <ForgotPasswordForm 
              onSuccess={() => {
                // Show success message for forgot password
                navigate('/login', {
                  replace: true,
                  state: {
                    message: t('login.resetEmailSent'),
                    type: 'success'
                  }
                });
              }}
              onBack={handleBackToLogin}
            />
          ) : (
            <LoginForm
              onSuccess={handleLoginSuccess}
              onError={handleLoginError}
              onForgotPassword={handleForgotPassword}
            />
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">{t('login.securityNotice')}</p>
                <p>{t('login.secureConnection')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Help Links */}
        <div className="mt-6 text-center space-y-2">
          <div className="flex justify-center space-x-6 text-sm">
            <a href="/help" className="text-gray-600 hover:text-gray-900 underline">
              {t('login.needHelp')}
            </a>
            <a href="/contact" className="text-gray-600 hover:text-gray-900 underline">
              {t('login.contactSupport')}
            </a>
          </div>
          <div className="text-xs text-gray-500">
            <a href="/privacy-policy" className="hover:underline">{t('login.privacyPolicy')}</a>
            {' • '}
            <a href="/terms-of-service" className="hover:underline">{t('login.termsOfService')}</a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Forgot Password Form Component
interface ForgotPasswordFormProps {
  onSuccess: () => void;
  onBack: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSuccess, onBack }) => {
  const { forgotPassword } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await forgotPassword(email);
      if (result.success) {
        onSuccess();
      } else {
        setError(result.message || t('login.resetEmailError'));
      }
    } catch (error) {
      setError(t('error.unknown'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('login.forgotPasswordTitle')}
        </h2>
        <p className="text-gray-600">
          {t('login.forgotPasswordSubtitle')}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-1">
            {t('login.email')}
          </label>
          <input
            type="email"
            id="resetEmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder={t('login.enterEmail')}
            required
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !email}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? t('login.sending') : t('login.sendResetLink')}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={onBack}
          className="text-sm text-gray-600 hover:text-gray-900 underline"
          disabled={isSubmitting}
        >
          ← {t('login.backToLogin')}
        </button>
      </div>
    </div>
  );
};

// Reset Password Form Component
interface ResetPasswordFormProps {
  token: string | null;
  onSuccess: () => void;
  onBack: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token, onSuccess, onBack }) => {
  const { resetPassword } = useAuth();
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('login.passwordMismatch'));
      return;
    }

    if (password.length < 8) {
      setError(t('login.passwordTooShort'));
      return;
    }

    if (!token) {
      setError(t('login.invalidResetToken'));
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await resetPassword({ token, newPassword: password });
      if (result.success) {
        onSuccess();
      } else {
        setError(result.message || t('login.resetPasswordError'));
      }
    } catch (error) {
      setError(t('error.unknown'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {t('login.invalidResetToken')}
        </h2>
        <p className="text-gray-600 mb-4">
          {t('login.resetTokenExpired')}
        </p>
        <button
          onClick={onBack}
          className="text-green-600 hover:text-green-500 underline"
        >
          {t('login.backToLogin')}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('login.resetPasswordTitle')}
        </h2>
        <p className="text-gray-600">
          {t('login.resetPasswordSubtitle')}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
            {t('login.newPassword')}
          </label>
          <input
            type="password"
            id="newPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder={t('login.newPasswordPlaceholder')}
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">
            {t('login.confirmNewPassword')}
          </label>
          <input
            type="password"
            id="confirmNewPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder={t('login.confirmNewPasswordPlaceholder')}
            required
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !password || !confirmPassword}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? t('login.resetting') : t('login.resetPassword')}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={onBack}
          className="text-sm text-gray-600 hover:text-gray-900 underline"
          disabled={isSubmitting}
        >
          ← {t('login.backToLogin')}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;