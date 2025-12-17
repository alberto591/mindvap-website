// Privacy & Data Management Page
// GDPR compliance and data management

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AccountService } from '../services/accountService';
import AccountLayout from '../components/account/AccountLayout';

const PrivacyPage: React.FC = () => {
  const { user, deleteAccount, exportUserData } = useAuth();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteForm, setDeleteForm] = useState({
    reason: '',
    password: '',
    confirmText: ''
  });

  const handleExportData = async () => {
    try {
      setLoading(true);
      const result = await exportUserData();
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Data export request submitted. You will receive an email with download instructions.' });
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to export data' });
      }
    } catch (error) {
      console.error('Export data error:', error);
      setMessage({ type: 'error', text: 'An error occurred while exporting data' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (deleteForm.confirmText !== 'DELETE') {
      setMessage({ type: 'error', text: 'Please type DELETE to confirm account deletion' });
      return;
    }
    
    if (!deleteForm.reason || !deleteForm.password) {
      setMessage({ type: 'error', text: 'Please provide a reason and your password' });
      return;
    }

    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const result = await deleteAccount({
        reason: deleteForm.reason,
        password: deleteForm.password
      });
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Account deletion request submitted. Your account will be deleted within 30 days.' });
        setDeleteForm({ reason: '', password: '', confirmText: '' });
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to delete account' });
      }
    } catch (error) {
      console.error('Delete account error:', error);
      setMessage({ type: 'error', text: 'An error occurred while deleting account' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccountLayout title="Privacy & Data Management">
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
          {/* Data Export */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Data Export</h3>
              <p className="text-sm text-gray-600 mt-1">Download a copy of your personal data</p>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">What's included:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Personal profile information</li>
                  <li>• Order history and details</li>
                  <li>• Address book</li>
                  <li>• Payment method information (last 4 digits only)</li>
                  <li>• Wishlist items</li>
                  <li>• Account preferences and settings</li>
                  <li>• Communication preferences</li>
                </ul>
              </div>
              
              <button
                onClick={handleExportData}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Request Data Export'}
              </button>
              
              <p className="text-xs text-gray-500 mt-2">
                You will receive an email with download instructions within 24 hours.
              </p>
            </div>
          </div>

          {/* Data Retention */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Data Retention</h3>
              <p className="text-sm text-gray-600 mt-1">How long we keep your data</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Account Data</h4>
                <p className="text-sm text-gray-600">
                  We retain your account data for 7 years after account closure for legal and tax purposes.
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900">Order Information</h4>
                <p className="text-sm text-gray-600">
                  Order details are kept for 7 years for warranty and legal compliance.
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900">Marketing Data</h4>
                <p className="text-sm text-gray-600">
                  Marketing preferences are kept until you unsubscribe or delete your account.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Rights */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Your Privacy Rights</h3>
              <p className="text-sm text-gray-600 mt-1">Under GDPR and other privacy laws</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Right to Access</h4>
                    <p className="text-sm text-gray-600">Request a copy of your personal data</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Right to Rectification</h4>
                    <p className="text-sm text-gray-600">Correct inaccurate or incomplete data</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Right to Erasure</h4>
                    <p className="text-sm text-gray-600">Request deletion of your personal data</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Right to Data Portability</h4>
                    <p className="text-sm text-gray-600">Transfer your data to another service</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Right to Object</h4>
                    <p className="text-sm text-gray-600">Object to processing of your personal data</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Deletion */}
          <div className="bg-white rounded-lg border border-red-200">
            <div className="p-6 border-b border-red-200">
              <h3 className="text-lg font-semibold text-red-900">Delete Account</h3>
              <p className="text-sm text-red-600 mt-1">Permanently delete your account and all data</p>
            </div>
            
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <div className="flex">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Warning</h3>
                    <p className="text-sm text-red-700 mt-1">
                      This action cannot be undone. All your data will be permanently deleted.
                    </p>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleDeleteAccount} className="space-y-4">
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                    Reason for deletion *
                  </label>
                  <select
                    id="reason"
                    value={deleteForm.reason}
                    onChange={(e) => setDeleteForm(prev => ({ ...prev, reason: e.target.value }))}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Select a reason...</option>
                    <option value="no_longer_needed">No longer need the service</option>
                    <option value="privacy_concerns">Privacy concerns</option>
                    <option value="too_many_emails">Too many emails</option>
                    <option value="poor_experience">Poor customer experience</option>
                    <option value="found_alternative">Found an alternative service</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Confirm with password *
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={deleteForm.password}
                    onChange={(e) => setDeleteForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmText" className="block text-sm font-medium text-gray-700">
                    Type "DELETE" to confirm *
                  </label>
                  <input
                    type="text"
                    id="confirmText"
                    value={deleteForm.confirmText}
                    onChange={(e) => setDeleteForm(prev => ({ ...prev, confirmText: e.target.value }))}
                    placeholder="DELETE"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Delete Account'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AccountLayout>
  );
};

export default PrivacyPage;