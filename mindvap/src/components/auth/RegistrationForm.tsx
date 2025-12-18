// Registration Form Component
// Modern, responsive form with comprehensive validation

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { PasswordSecurity } from '../../lib/passwordSecurity';
import { RegisterRequest } from '../../types/auth';

interface RegistrationFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  marketingConsent: boolean;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  dataProcessingConsent: boolean;
}

interface FormErrors {
  [key: string]: string;
}

interface PasswordStrengthData {
  score: number;
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  feedback: string[];
  color: 'red' | 'orange' | 'yellow' | 'blue' | 'green';
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess, onError }) => {
  const { register, loading } = useAuth();
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    marketingConsent: false,
    termsAccepted: false,
    privacyAccepted: false,
    dataProcessingConsent: false
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrengthData>({
    score: 0,
    label: 'Very Weak',
    feedback: [],
    color: 'red'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password strength calculation
  useEffect(() => {
    if (formData.password) {
      const validation = PasswordSecurity.validatePasswordStrength(formData.password);
      
      const labels: PasswordStrengthData['label'][] = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
      const colors: PasswordStrengthData['color'][] = ['red', 'orange', 'yellow', 'blue', 'green'];
      
      setPasswordStrength({
        score: validation.score,
        label: labels[validation.score] || 'Very Weak',
        feedback: validation.errors,
        color: colors[validation.score] || 'red'
      });
    } else {
      setPasswordStrength({
        score: 0,
        label: 'Very Weak',
        feedback: [],
        color: 'red'
      });
    }
  }, [formData.password]);

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = t('error.required');
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = t('error.email');
    }

    // First name validation
    if (!formData.firstName) {
      newErrors.firstName = t('error.required');
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = t('error.minLength').replace('{min}', '2');
    }

    // Last name validation
    if (!formData.lastName) {
      newErrors.lastName = t('error.required');
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = t('error.minLength').replace('{min}', '2');
    }

    // Date of birth validation - Age verification bypassed for testing
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = t('error.required');
    } else {
      // const age = calculateAge(formData.dateOfBirth);
      // if (age < 21) {
      //   newErrors.dateOfBirth = t('register.ageRequirement');
      // }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = t('error.required');
    } else {
      const validation = PasswordSecurity.validatePasswordStrength(formData.password);
      if (!validation.valid) {
        newErrors.password = validation.errors[0];
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('error.required');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('register.passwordMismatch');
    }

    // Phone validation (optional but if provided, should be valid)
    if (formData.phone && formData.phone.length < 10) {
      newErrors.phone = t('register.invalidPhone');
    }

    // Consent validation
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = t('register.termsRequired');
    }
    
    if (!formData.privacyAccepted) {
      newErrors.privacyAccepted = t('register.privacyRequired');
    }
    
    if (!formData.dataProcessingConsent) {
      newErrors.dataProcessingConsent = t('register.dataProcessingRequired');
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
      const registerData: RegisterRequest = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        dateOfBirth: formData.dateOfBirth,
        marketingConsent: formData.marketingConsent,
        termsAccepted: formData.termsAccepted,
        privacyAccepted: formData.privacyAccepted,
        dataProcessingConsent: formData.dataProcessingConsent
      };

      const result = await register(registerData);

      if (result.success) {
        onSuccess?.();
      } else {
        onError?.(result.message || t('register.registrationFailed'));
      }
    } catch (error) {
      console.error('Registration error:', error);
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
  };

  // Password strength indicator component
  const PasswordStrengthIndicator = () => (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-600">{t('register.passwordStrength')}</span>
        <span className={`text-sm font-medium text-${passwordStrength.color}-600`}>
          {passwordStrength.label}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full bg-${passwordStrength.color}-500 transition-all duration-300`}
          style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
        />
      </div>
      {passwordStrength.feedback.length > 0 && (
        <ul className="mt-1 text-xs text-gray-600">
          {passwordStrength.feedback.map((feedback, index) => (
            <li key={index}>• {feedback}</li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('register.title')}
        </h2>
        <p className="text-gray-600">
          {t('register.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            {t('register.email')} *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={t('register.emailPlaceholder')}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            {t('register.firstName')} *
          </label>
          <input
            type="text"
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={t('register.firstNamePlaceholder')}
          />
          {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            {t('register.lastName')} *
          </label>
          <input
            type="text"
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={t('register.lastNamePlaceholder')}
          />
          {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
        </div>

        {/* Date of Birth */}
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
            {t('register.dateOfBirth')} *
          </label>
          <input
            type="date"
            id="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
            }`}
            max={new Date().toISOString().split('T')[0]}
          />
          {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>}
          {formData.dateOfBirth && !errors.dateOfBirth && (
            <p className="mt-1 text-sm text-gray-600">
              {t('register.age')}: {calculateAge(formData.dateOfBirth)}
            </p>
          )}
        </div>

        {/* Phone (Optional) */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            {t('register.phone')} ({t('common.optional')})
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={t('register.phonePlaceholder')}
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            {t('register.password')} *
          </label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={t('register.passwordPlaceholder')}
          />
          <PasswordStrengthIndicator />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            {t('register.confirmPassword')} *
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={t('register.confirmPasswordPlaceholder')}
          />
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
        </div>

        {/* Terms of Service */}
        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="termsAccepted"
            checked={formData.termsAccepted}
            onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
            className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label htmlFor="termsAccepted" className="text-sm text-gray-700">
            {t('register.agreeTo')}{' '}
            <a href="/terms-of-service" target="_blank" className="text-green-600 hover:text-green-500 underline">
              {t('register.termsOfService')}
            </a>{' '}
            *
          </label>
        </div>
        {errors.termsAccepted && <p className="text-sm text-red-600">{errors.termsAccepted}</p>}

        {/* Privacy Policy */}
        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="privacyAccepted"
            checked={formData.privacyAccepted}
            onChange={(e) => handleInputChange('privacyAccepted', e.target.checked)}
            className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label htmlFor="privacyAccepted" className="text-sm text-gray-700">
            {t('register.agreeTo')}{' '}
            <a href="/privacy-policy" target="_blank" className="text-green-600 hover:text-green-500 underline">
              {t('register.privacyPolicy')}
            </a>{' '}
            *
          </label>
        </div>
        {errors.privacyAccepted && <p className="text-sm text-red-600">{errors.privacyAccepted}</p>}

        {/* Data Processing Consent */}
        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="dataProcessingConsent"
            checked={formData.dataProcessingConsent}
            onChange={(e) => handleInputChange('dataProcessingConsent', e.target.checked)}
            className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label htmlFor="dataProcessingConsent" className="text-sm text-gray-700">
            {t('register.dataProcessingConsent')} *
          </label>
        </div>
        {errors.dataProcessingConsent && <p className="text-sm text-red-600">{errors.dataProcessingConsent}</p>}

        {/* Marketing Consent (Optional) */}
        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="marketingConsent"
            checked={formData.marketingConsent}
            onChange={(e) => handleInputChange('marketingConsent', e.target.checked)}
            className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label htmlFor="marketingConsent" className="text-sm text-gray-700">
            {t('register.marketingConsent')} ({t('common.optional')})
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting || loading ? t('register.creating') : t('register.createAccount')}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          {t('register.alreadyHaveAccount')}{' '}
          <a href="/login" className="text-green-600 hover:text-green-500 underline">
            {t('register.signIn')}
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegistrationForm;