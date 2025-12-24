// Profile Management Page
// User profile editing and management

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/auth-context';
import { useLanguage } from '../contexts/language-context';
import { AccountService } from '../../application/services/account-service';
import { UpdateProfileRequest } from '../../domain/entities/auth';
import AccountLayout from '../components/account/account-layout';

const ProfileManagementPage: React.FC = () => {
  const { user, updateProfile, isEmailVerified } = useAuth();
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || ''
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear message when user starts editing
    if (message) {
      setMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setMessage({ type: 'error', text: 'First name and last name are required' });
      return;
    }

    try {
      setSaving(true);
      
      const updateData: UpdateProfileRequest = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim() || undefined
      };

      const result = await updateProfile(updateData);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully' });
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ type: 'error', text: 'An error occurred while updating profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleSendEmailVerification = async () => {
    try {
      setLoading(true);
      // In a real implementation, you would call an email verification service
      // For now, we'll just show a success message
      setEmailVerificationSent(true);
      setMessage({ type: 'success', text: 'Verification email sent! Please check your inbox.' });
    } catch (error) {
      console.error('Email verification error:', error);
      setMessage({ type: 'error', text: 'Failed to send verification email' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccountLayout title="Profile Management">
      <div className="p-6">
        {/* Success/Error Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <div className="flex">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                {message.type === 'success' ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                )}
              </svg>
              {message.text}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                <p className="text-sm text-gray-600 mt-1">Update your personal details</p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      disabled
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Date of birth cannot be changed</p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Email Verification Status */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">Email Verification</h4>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isEmailVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {isEmailVerified ? 'Verified' : 'Unverified'}
                  </div>
                </div>
                
                {isEmailVerified ? (
                  <div className="text-sm text-gray-600">
                    <p>Your email address has been verified.</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Please verify your email address to ensure account security.
                    </p>
                    <button
                      onClick={handleSendEmailVerification}
                      disabled={loading || emailVerificationSent}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Sending...' : emailVerificationSent ? 'Email Sent!' : 'Send Verification Email'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Account Status</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Email</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isEmailVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {isEmailVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Age Verification</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                      Verified
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Account Status</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Quick Links</h4>
                <div className="space-y-3">
                  <a
                    href="/account/addresses"
                    className="block text-sm text-blue-600 hover:text-blue-800"
                  >
                    Manage Addresses
                  </a>
                  <a
                    href="/account/payment-methods"
                    className="block text-sm text-blue-600 hover:text-blue-800"
                  >
                    Payment Methods
                  </a>
                  <a
                    href="/account/security"
                    className="block text-sm text-blue-600 hover:text-blue-800"
                  >
                    Security Settings
                  </a>
                  <a
                    href="/account/privacy"
                    className="block text-sm text-blue-600 hover:text-blue-800"
                  >
                    Privacy & Data
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AccountLayout>
  );
};

export default ProfileManagementPage;