// Account Settings Page
// User account settings and preferences

import React, { useState } from 'react';
import { useAuth } from '../contexts/auth-context';
import { useLanguage } from '../contexts/language-context';
import { AccountService } from '../../application/services/account-service';
import AccountLayout from '../components/account/account-layout';

const AccountSettingsPage: React.FC = () => {
  const { user, changePassword, updateEmailPreferences } = useAuth();
  const { language, setLanguage } = useLanguage();
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [emailPreferences, setEmailPreferences] = useState({
    marketingEmails: user?.marketingConsent || false,
    orderUpdates: true,
    newsletter: true,
    abandonedCart: true,
    priceAlerts: true,
    securityAlerts: true
  });
  
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill in all password fields' });
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters long' });
      return;
    }

    try {
      setLoading(true);
      
      const result = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Password changed successfully' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to change password' });
      }
    } catch (error) {
      console.error('Change password error:', error);
      setMessage({ type: 'error', text: 'An error occurred while changing password' });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailPreferencesChange = async () => {
    try {
      setLoading(true);
      
      const result = await updateEmailPreferences(emailPreferences);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Email preferences updated successfully' });
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update email preferences' });
      }
    } catch (error) {
      console.error('Update email preferences error:', error);
      setMessage({ type: 'error', text: 'An error occurred while updating email preferences' });
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as any);
    setMessage({ type: 'success', text: 'Language updated successfully' });
  };

  return (
    <AccountLayout title="Account Settings">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Change Password */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
              <p className="text-sm text-gray-600 mt-1">Update your account password</p>
            </div>
            
            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  Current Password *
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password *
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  required
                  minLength={8}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>

          {/* Language Settings */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Language & Region</h3>
              <p className="text-sm text-gray-600 mt-1">Choose your preferred language</p>
            </div>
            
            <div className="p-6">
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                  Language
                </label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="it">Italiano</option>
                </select>
              </div>
            </div>
          </div>

          {/* Email Preferences */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Email Preferences</h3>
              <p className="text-sm text-gray-600 mt-1">Manage your email notification settings</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Marketing Emails</h4>
                  <p className="text-xs text-gray-500">Receive promotional offers and product updates</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailPreferences.marketingEmails}
                  onChange={(e) => setEmailPreferences(prev => ({ ...prev, marketingEmails: e.target.checked }))}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Order Updates</h4>
                  <p className="text-xs text-gray-500">Get notified about your order status</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailPreferences.orderUpdates}
                  onChange={(e) => setEmailPreferences(prev => ({ ...prev, orderUpdates: e.target.checked }))}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Newsletter</h4>
                  <p className="text-xs text-gray-500">Receive our weekly wellness newsletter</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailPreferences.newsletter}
                  onChange={(e) => setEmailPreferences(prev => ({ ...prev, newsletter: e.target.checked }))}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Abandoned Cart</h4>
                  <p className="text-xs text-gray-500">Reminders about items left in your cart</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailPreferences.abandonedCart}
                  onChange={(e) => setEmailPreferences(prev => ({ ...prev, abandonedCart: e.target.checked }))}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Price Alerts</h4>
                  <p className="text-xs text-gray-500">Notifications when items in your wishlist go on sale</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailPreferences.priceAlerts}
                  onChange={(e) => setEmailPreferences(prev => ({ ...prev, priceAlerts: e.target.checked }))}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Security Alerts</h4>
                  <p className="text-xs text-gray-500">Important security notifications</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailPreferences.securityAlerts}
                  onChange={(e) => setEmailPreferences(prev => ({ ...prev, securityAlerts: e.target.checked }))}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
              </div>
              
              <button
                onClick={handleEmailPreferencesChange}
                disabled={loading}
                className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Email Preferences'}
              </button>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
              <p className="text-sm text-gray-600 mt-1">View your account details</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Email</h4>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900">Account Created</h4>
                <p className="text-sm text-gray-600">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900">Last Updated</h4>
                <p className="text-sm text-gray-600">
                  {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <a
                  href="/account/privacy"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Privacy & Data Management →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AccountLayout>
  );
};

export default AccountSettingsPage;