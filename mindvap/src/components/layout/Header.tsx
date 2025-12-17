import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import LanguageSelector from '../LanguageSelector';

interface HeaderProps {
  cartItemCount: number;
}

export default function Header({ cartItemCount }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setUserMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navLinks = [
    { to: '/shop', label: t('nav.shop') },
    { to: '/about', label: t('nav.about') },
    { to: '/education', label: t('nav.education') },
    { to: '/contact', label: t('nav.contact') },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background-surface border-b border-border-light">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="font-headline text-2xl md:text-3xl font-medium text-brand-primary hover:text-brand-hover transition-colors">
            MindVap
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-text-primary hover:text-brand-primary font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <LanguageSelector />
          </nav>

          {/* Cart, User Menu & Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            <Link
              to="/cart"
              className="relative p-2 hover:bg-background-accent rounded-md transition-colors"
            >
              <ShoppingCart size={24} className="text-text-primary" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-cta-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-background-accent rounded-md transition-colors"
                >
                  <User size={24} className="text-text-primary" />
                  <span className="hidden md:block text-sm font-medium text-text-primary">
                    {user.firstName}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-border-light">
                    <Link
                      to="/account"
                      className="block px-4 py-2 text-sm text-text-primary hover:bg-background-accent"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      My Account
                    </Link>
                    <Link
                      to="/account/orders"
                      className="block px-4 py-2 text-sm text-text-primary hover:bg-background-accent"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Order History
                    </Link>
                    <Link
                      to="/account/profile"
                      className="block px-4 py-2 text-sm text-text-primary hover:bg-background-accent"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Profile Settings
                    </Link>
                    <div className="border-t border-border-light my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-accent flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="hidden md:block text-sm font-medium text-text-primary hover:text-brand-primary transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="hidden md:block bg-cta-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-cta-hover transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-background-accent rounded-md transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border-light">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 text-text-primary hover:text-brand-primary font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
            
            {/* Mobile Auth Links */}
            <div className="pt-4 border-t border-border-light">
              {isAuthenticated && user ? (
                <div className="space-y-2">
                  <div className="py-2 text-sm text-text-primary">
                    Welcome, {user.firstName}!
                  </div>
                  <Link
                    to="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-text-primary hover:text-brand-primary font-medium transition-colors"
                  >
                    My Account
                  </Link>
                  <Link
                    to="/account/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-text-primary hover:text-brand-primary font-medium transition-colors"
                  >
                    Order History
                  </Link>
                  <Link
                    to="/account/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-text-primary hover:text-brand-primary font-medium transition-colors"
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 text-text-primary hover:text-brand-primary font-medium transition-colors flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-text-primary hover:text-brand-primary font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block bg-cta-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-cta-hover transition-colors text-center"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
              
              <div className="pt-4">
                <LanguageSelector />
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
