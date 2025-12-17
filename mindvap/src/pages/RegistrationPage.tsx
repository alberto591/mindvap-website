// Registration Page
// Complete registration page with age verification integration

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import RegistrationForm from '../components/auth/RegistrationForm';
import AgeGate from '../components/AgeGate';

interface RegistrationPageProps {}

const RegistrationPage: React.FC<RegistrationPageProps> = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  
  const [ageVerified, setAgeVerified] = useState<boolean>(false);
  const [showAgeGate, setShowAgeGate] = useState<boolean>(true);
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect to dashboard or profile page if already logged in
      navigate('/profile');
    }
  }, [isAuthenticated, user, navigate]);

  // Handle age verification success/failure
  const handleAgeVerification = (verified: boolean) => {
    if (verified) {
      setAgeVerified(true);
      setShowAgeGate(false);
    } else {
      // User is not old enough, redirect to home or exit
      navigate('/');
    }
  };

  // Handle registration success
  const handleRegistrationSuccess = () => {
    setRegistrationStatus('success');
    setStatusMessage(t('register.registrationSuccess'));
    
    // Auto-redirect after 3 seconds
    setTimeout(() => {
      navigate('/login', { 
        state: { 
          message: t('register.checkEmailVerification'),
          type: 'success'
        }
      });
    }, 3000);
  };

  // Handle registration error
  const handleRegistrationError = (error: string) => {
    setRegistrationStatus('error');
    setStatusMessage(error);
    
    // Clear error after 5 seconds
    setTimeout(() => {
      setRegistrationStatus('idle');
      setStatusMessage('');
    }, 5000);
  };

  // Show loading state while checking authentication
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Age Gate Overlay */}
      {showAgeGate && (
        <AgeGate
          onVerify={handleAgeVerification}
        />
      )}

      {/* Main Registration Content */}
      {!showAgeGate && (
        <div className="container mx-auto px-4 py-8">
          {/* Registration Status Messages */}
          {registrationStatus !== 'idle' && (
            <div className={`max-w-md mx-auto mb-6 p-4 rounded-lg ${
              registrationStatus === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <div className="flex items-center">
                {registrationStatus === 'success' ? (
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                <p className="text-sm font-medium">{statusMessage}</p>
              </div>
            </div>
          )}

          {/* Success State */}
          {registrationStatus === 'success' ? (
            <div className="max-w-md mx-auto text-center">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {t('register.accountCreated')}
                </h2>
                <p className="text-gray-600 mb-4">
                  {t('register.checkEmailVerification')}
                </p>
                <div className="animate-pulse">
                  <p className="text-sm text-gray-500">
                    {t('register.redirecting')}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <div className="max-w-2xl mx-auto">
              {/* Page Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {t('register.pageTitle')}
                </h1>
                <p className="text-lg text-gray-600">
                  {t('register.pageSubtitle')}
                </p>
              </div>

              {/* Registration Form */}
              <RegistrationForm
                onSuccess={handleRegistrationSuccess}
                onError={handleRegistrationError}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RegistrationPage;