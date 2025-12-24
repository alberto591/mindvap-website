import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../../contexts/language-context';
import { useAuth } from '../../contexts/auth-context';
import LanguageSelector from '../language-selector';
import UnifiedAuthButton from '../auth/unified-auth-button';
import Search from '../Search';
import { useCart } from '../../contexts/cart-context';

export default function Header() {
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

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

          {/* Search, Cart, User Menu & Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            {/* Desktop Search */}
            <div className="hidden lg:block">
              <Search />
            </div>

            <Link
              to="/cart"
              className="relative p-2 hover:bg-background-accent rounded-md transition-colors"
            >
              <ShoppingCart size={24} className="text-text-primary" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-cta-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Unified Authentication Button */}
            <UnifiedAuthButton />

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
            {/* Mobile Search */}
            <div className="mb-4">
              <Search mobile={true} onClose={() => setMobileMenuOpen(false)} />
            </div>

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
              <UnifiedAuthButton mobile={true} />

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
