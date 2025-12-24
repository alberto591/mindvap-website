import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Header from './components/layout/header';
import Footer from './components/layout/footer';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/home-page'));
const ShopPage = lazy(() => import('./pages/shop-page'));
const ProductDetailPage = lazy(() => import('./pages/product-detail-page'));
const AboutPage = lazy(() => import('./pages/about-page'));
const EducationPage = lazy(() => import('./pages/education-page'));
const ContactPage = lazy(() => import('./pages/contact-page'));
const CartPage = lazy(() => import('./pages/cart-page'));
const CheckoutPage = lazy(() => import('./pages/checkout-page'));
const RegistrationPage = lazy(() => import('./pages/registration-page'));
const LoginPage = lazy(() => import('./pages/login-page'));
const ShippingReturnsPage = lazy(() => import('./pages/shipping-returns-page'));
const PrivacyPolicyPage = lazy(() => import('./pages/privacy-policy-page'));
const TermsOfServicePage = lazy(() => import('./pages/terms-of-service-page'));
const GuestOrderTrackingPage = lazy(() => import('./pages/guest-order-tracking-page'));
const CheckoutSuccessPage = lazy(() => import('./pages/checkout-success-page'));

// Account Management Pages (lazy loaded)
const AccountDashboardPage = lazy(() => import('./pages/account-dashboard-page'));
const ProfileManagementPage = lazy(() => import('./pages/profile-management-page'));
const AddressManagementPage = lazy(() => import('./pages/address-management-page'));
const OrderHistoryPage = lazy(() => import('./pages/order-history-page'));
const PaymentMethodsPage = lazy(() => import('./pages/payment-methods-page'));
const WishlistPage = lazy(() => import('./pages/wishlist-page'));
const AccountSettingsPage = lazy(() => import('./pages/account-settings-page'));
const SecurityPage = lazy(() => import('./pages/security-page'));
const PrivacyPage = lazy(() => import('./pages/privacy-page'));

// Admin Pages
const AdminLayout = lazy(() => import('./components/admin/admin-layout'));
const AdminRoute = lazy(() => import('./components/admin/admin-route'));
const AdminDashboardPage = lazy(() => import('./pages/admin/admin-dashboard-page'));
const SourcingAgentPage = lazy(() => import('./pages/admin/sourcing-agent-page'));
const LegalResearchPage = lazy(() => import('./pages/admin/legal-research-page'));
const FormulationAgentPage = lazy(() => import('./pages/admin/formulation-agent-page'));
const AdminTutorialsPage = lazy(() => import('./pages/admin/admin-tutorials-page'));

// Chat Component
import Chat from './components/chat/chat';

import ProtectedRoute from './components/auth/protected-route';
import { LanguageProvider } from './contexts/language-context';
import { AuthProvider } from './contexts/auth-context';
import { CartProvider } from './contexts/cart-context';

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
  </div>
);

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen bg-background-primary">
              <Header />
              <main>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/product/:productId" element={<ProductDetailPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/education" element={<EducationPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/register" element={<RegistrationPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
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
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
