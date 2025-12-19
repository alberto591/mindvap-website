import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect, Suspense, lazy } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const EducationPage = lazy(() => import('./pages/EducationPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const RegistrationPage = lazy(() => import('./pages/RegistrationPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ShippingReturnsPage = lazy(() => import('./pages/ShippingReturnsPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));
const GuestOrderTrackingPage = lazy(() => import('./pages/GuestOrderTrackingPage'));
const CheckoutSuccessPage = lazy(() => import('./pages/CheckoutSuccessPage'));

// Account Management Pages (lazy loaded)
const AccountDashboardPage = lazy(() => import('./pages/AccountDashboardPage'));
const ProfileManagementPage = lazy(() => import('./pages/ProfileManagementPage'));
const AddressManagementPage = lazy(() => import('./pages/AddressManagementPage'));
const OrderHistoryPage = lazy(() => import('./pages/OrderHistoryPage'));
const PaymentMethodsPage = lazy(() => import('./pages/PaymentMethodsPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const AccountSettingsPage = lazy(() => import('./pages/AccountSettingsPage'));
const SecurityPage = lazy(() => import('./pages/SecurityPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));

// Admin Pages
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminRoute = lazy(() => import('./components/admin/AdminRoute'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const SourcingAgentPage = lazy(() => import('./pages/admin/SourcingAgentPage'));
const LegalResearchPage = lazy(() => import('./pages/admin/LegalResearchPage'));
const FormulationAgentPage = lazy(() => import('./pages/admin/FormulationAgentPage'));
const AdminTutorialsPage = lazy(() => import('./pages/admin/AdminTutorialsPage'));

// Chat Component
import Chat from './components/chat/Chat';

import ProtectedRoute from './components/auth/ProtectedRoute';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartItem } from './types';

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
  </div>
);

function App() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const addToCart = (product: any, quantity: number = 1) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    let newCart: CartItem[];

    if (existingItem) {
      newCart = cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newCart = [...cart, { product, quantity }];
    }

    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(productId);
      return;
    }

    const newCart = cart.map(item =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const removeFromCart = (productId: string) => {
    const newCart = cart.filter(item => item.product.id !== productId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background-primary">
            <Header cartItemCount={cart.reduce((sum, item) => sum + item.quantity, 0)} />
            <main>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/product/:productId" element={<ProductDetailPage onAddToCart={addToCart} />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/education" element={<EducationPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/register" element={<RegistrationPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route
                    path="/cart"
                    element={
                      <CartPage
                        cart={cart}
                        updateQuantity={updateCartQuantity}
                        removeItem={removeFromCart}
                      />
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <CheckoutPage cart={cart} clearCart={clearCart} />
                    }
                  />
                  <Route path="/shipping-returns" element={<ShippingReturnsPage />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                  <Route path="/track-order" element={<GuestOrderTrackingPage />} />
                  <Route path="/checkout/success" element={<CheckoutSuccessPage />} />

                  {/* Account Management Routes */}
                  <Route
                    path="/account"
                    element={
                      <ProtectedRoute>
                        <AccountDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/profile"
                    element={
                      <ProtectedRoute>
                        <ProfileManagementPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/addresses"
                    element={
                      <ProtectedRoute>
                        <AddressManagementPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/orders"
                    element={
                      <ProtectedRoute>
                        <OrderHistoryPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/payment-methods"
                    element={
                      <ProtectedRoute>
                        <PaymentMethodsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/wishlist"
                    element={
                      <ProtectedRoute>
                        <WishlistPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/settings"
                    element={
                      <ProtectedRoute>
                        <AccountSettingsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/security"
                    element={
                      <ProtectedRoute>
                        <SecurityPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/privacy"
                    element={
                      <ProtectedRoute>
                        <PrivacyPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminRoute />}>
                    <Route element={<AdminLayout />}>
                      <Route index element={<AdminDashboardPage />} />
                      <Route path="sourcing" element={<SourcingAgentPage />} />
                      <Route path="legal" element={<LegalResearchPage />} />
                      <Route path="formulation" element={<FormulationAgentPage />} />
                      <Route path="tutorials" element={<AdminTutorialsPage />} />
                      <Route path="settings" element={<div className="p-4">Settings Placeholder</div>} />
                    </Route>
                  </Route>
                </Routes>
              </Suspense>
            </main>
            <Footer />
            <Chat />
          </div>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
