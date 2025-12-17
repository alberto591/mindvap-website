// Security Page
// Account security settings and monitoring

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AccountLayout from '../components/account/AccountLayout';

const SecurityPage: React.FC = () => {
  const { user } = useAuth();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [activeSessions] = useState([
    {
      id: '1',
      device: 'Chrome on macOS',
      location: 'Madrid, Spain',
      lastActive: '2024-12-17T10:30:00Z',
      current: true
    },
    {
      id: '2',
      device: 'Safari on iPhone',
      location: 'Madrid, Spain',
      lastActive: '2024-12-16T15:45:00Z',
      current: false
    }
  ]);

  const handleToggleTwoFactor = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AccountLayout title="Security Settings">
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Two-Factor Authentication */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600 mt-1">Add an extra layer of security to your account</p>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">2FA Status</h4>
                  <p className="text-xs text-gray-500">
                    {twoFactorEnabled ? 'Two-factor authentication is enabled' : 'Two-factor authentication is disabled'}
                  </p>
                </div>
                <button
                  onClick={handleToggleTwoFactor}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    twoFactorEnabled ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {twoFactorEnabled ? (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex">
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        Your account is protected with two-factor authentication.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Enable Two-Factor Authentication
                </button>
              )}
            </div>
          </div>

          {/* Login Activity */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Login Activity</h3>
              <p className="text-sm text-gray-600 mt-1">Recent sessions on your account</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {activeSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {session.device}
                          {session.current && (
                            <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              Current
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">{session.location}</p>
                        <p className="text-xs text-gray-500">Last active: {formatDate(session.lastActive)}</p>
                      </div>
                    </div>
                    {!session.current && (
                      <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Password Security */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Password Security</h3>
              <p className="text-sm text-gray-600 mt-1">Manage your password and security settings</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Password Last Changed</h4>
                  <p className="text-xs text-gray-500">
                    {user?.passwordChangedAt ? formatDate(user.passwordChangedAt) : 'Never'}
                  </p>
                </div>
                <a
                  href="/account/settings"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Change Password
                </a>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Failed Login Attempts</h4>
                  <p className="text-xs text-gray-500">
                    {user?.failedLoginAttempts || 0} attempts
                  </p>
                </div>
                {user?.failedLoginAttempts > 0 && (
                  <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                    Review
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Account Locked</h4>
                  <p className="text-xs text-gray-500">
                    {user?.accountLockedUntil ? 'Until ' + formatDate(user.accountLockedUntil) : 'No'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notifications */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Security Notifications</h3>
              <p className="text-sm text-gray-600 mt-1">Configure security alert preferences</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Login Alerts</h4>
                  <p className="text-xs text-gray-500">Get notified of new sign-ins</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Password Changes</h4>
                  <p className="text-xs text-gray-500">Alert when password is changed</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Unusual Activity</h4>
                  <p className="text-xs text-gray-500">Alert for suspicious account activity</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AccountLayout>
  );
};

export default SecurityPage;