// Unified Authentication Button Component
// Modern, unified authentication interface with dropdown menu

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, ChevronDown, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface UnifiedAuthButtonProps {
  mobile?: boolean;
  className?: string;
}

export default function UnifiedAuthButton({ mobile = false, className = '' }: UnifiedAuthButtonProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setDropdownOpen(false);
      if (mobile) {
        navigate('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLoginClick = () => {
    setDropdownOpen(false);
    navigate('/login');
  };

  const handleRegisterClick = () => {
    setDropdownOpen(false);
    navigate('/register');
  };

  const handleAccountClick = () => {
    setDropdownOpen(false);
    navigate('/account');
  };

  const handleOrderHistoryClick = () => {
    setDropdownOpen(false);
    navigate('/account/orders');
  };

  const handleProfileSettingsClick = () => {
    setDropdownOpen(false);
    navigate('/account/profile');
  };

  // Authenticated user menu
  if (isAuthenticated && user) {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={`flex items-center gap-2 p-2 hover:bg-background-accent rounded-md transition-colors ${
            mobile ? 'w-full justify-start' : ''
          }`}
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
        >
          <User size={24} className="text-text-primary" />
          {!mobile && (
            <>
              <span className="text-sm font-medium text-text-primary">
                {user.firstName}
              </span>
              <ChevronDown 
                size={16} 
                className={`text-text-primary transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180' : ''
                }`} 
              />
            </>
          )}
        </button>

        {dropdownOpen && (
          <div className={`absolute bg-white rounded-md shadow-lg py-1 z-50 border border-border-light ${
            mobile ? 'left-0 mt-2 w-full' : 'right-0 mt-2 w-48'
          }`}>
            {/* User info */}
            <div className="px-4 py-2 border-b border-border-light">
              <p className="text-sm font-medium text-text-primary">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.email}
              </p>
            </div>

            {/* Menu items */}
            <button
              onClick={handleAccountClick}
              className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-accent flex items-center gap-2 transition-colors"
            >
              <User size={16} />
              {t('nav.account')}
            </button>
            
            <button
              onClick={handleOrderHistoryClick}
              className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-accent transition-colors"
            >
              {t('nav.orderHistory')}
            </button>
            
            <button
              onClick={handleProfileSettingsClick}
              className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-accent transition-colors"
            >
              {t('nav.profileSettings')}
            </button>
            
            <div className="border-t border-border-light my-1"></div>
            
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-accent flex items-center gap-2 transition-colors"
            >
              <LogOut size={16} />
              {t('auth.logout')}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Non-authenticated unified button
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className={`flex items-center gap-2 p-2 hover:bg-background-accent rounded-md transition-colors ${
          mobile 
            ? 'w-full justify-center bg-cta-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-cta-hover' 
            : 'bg-cta-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-cta-hover'
        }`}
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
      >
        <User size={mobile ? 20 : 16} />
        <span>{t('auth.account')}</span>
        {!mobile && (
          <ChevronDown 
            size={14} 
            className={`text-white transition-transform duration-200 ${
              dropdownOpen ? 'rotate-180' : ''
            }`} 
          />
        )}
      </button>

      {dropdownOpen && (
        <div className={`absolute bg-white rounded-md shadow-lg py-1 z-50 border border-border-light ${
          mobile ? 'left-0 mt-2 w-full' : 'right-0 mt-2 w-56'
        }`}>
          {/* Header */}
          <div className="px-4 py-3 border-b border-border-light">
            <h3 className="text-sm font-medium text-text-primary">
              {t('auth.accountAccess')}
            </h3>
            <p className="text-xs text-gray-500">
              {t('auth.loginOrRegister')}
            </p>
          </div>

          {/* Login option */}
          <button
            onClick={handleLoginClick}
            className="w-full text-left px-4 py-3 text-sm text-text-primary hover:bg-background-accent flex items-center gap-3 transition-colors"
          >
            <div className="w-8 h-8 bg-brand-primary bg-opacity-10 rounded-full flex items-center justify-center">
              <LogIn size={16} className="text-brand-primary" />
            </div>
            <div>
              <div className="font-medium">{t('auth.signIn')}</div>
              <div className="text-xs text-gray-500">
                {t('auth.existingAccount')}
              </div>
            </div>
          </button>

          {/* Register option */}
          <button
            onClick={handleRegisterClick}
            className="w-full text-left px-4 py-3 text-sm text-text-primary hover:bg-background-accent flex items-center gap-3 transition-colors border-t border-border-light"
          >
            <div className="w-8 h-8 bg-cta-primary bg-opacity-10 rounded-full flex items-center justify-center">
              <UserPlus size={16} className="text-cta-primary" />
            </div>
            <div>
              <div className="font-medium">{t('auth.createAccount')}</div>
              <div className="text-xs text-gray-500">
                {t('auth.newMember')}
              </div>
            </div>
          </button>

          {/* Additional info */}
          <div className="px-4 py-2 border-t border-border-light">
            <p className="text-xs text-gray-500 text-center">
              {t('auth.secureAccess')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}