import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Header from './presentation/components/layout/Header';
import Footer from './presentation/components/layout/Footer';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./presentation/pages/home-page'));
const ShopPage = lazy(() => import('./presentation/pages/shop-page'));
const ProductDetailPage = lazy(() => import('./presentation/pages/product-detail-page'));
const AboutPage = lazy(() => import('./presentation/pages/about-page'));
const EducationPage = lazy(() => import('./presentation/pages/education-page'));
const ContactPage = lazy(() => import('./presentation/pages/contact-page'));
const CartPage = lazy(() => import('./presentation/pages/cart-page'));
const CheckoutPage = lazy(() => import('./presentation/pages/checkout-page'));
const RegistrationPage = lazy(() => import('./presentation/pages/registration-page'));
const LoginPage = lazy(() => import('./presentation/pages/login-page'));
const ShippingReturnsPage = lazy(() => import('./presentation/pages/shipping-returns-page'));
const PrivacyPolicyPage = lazy(() => import('./presentation/pages/privacy-policy-page'));
const TermsOfServicePage = lazy(() => import('./presentation/pages/terms-of-service-page'));
const GuestOrderTrackingPage = lazy(() => import('./presentation/pages/guest-order-tracking-page'));
const CheckoutSuccessPage = lazy(() => import('./presentation/pages/checkout-success-page'));

// Account Management Pages (lazy loaded)
const AccountDashboardPage = lazy(() => import('./presentation/pages/account-dashboard-page'));
const ProfileManagementPage = lazy(() => import('./presentation/pages/profile-management-page'));
const AddressManagementPage = lazy(() => import('./presentation/pages/address-management-page'));
const OrderHistoryPage = lazy(() => import('./presentation/pages/order-history-page'));
const PaymentMethodsPage = lazy(() => import('./presentation/pages/payment-methods-page'));
const WishlistPage = lazy(() => import('./presentation/pages/wishlist-page'));
const AccountSettingsPage = lazy(() => import('./presentation/pages/account-settings-page'));
const SecurityPage = lazy(() => import('./presentation/pages/security-page'));
const PrivacyPage = lazy(() => import('./presentation/pages/privacy-page'));

// Admin Pages
const AdminLayout = lazy(() => import('./presentation/components/admin/admin-layout'));
const AdminRoute = lazy(() => import('./presentation/components/admin/admin-route'));
const AdminDashboardPage = lazy(() => import('./presentation/pages/admin/admin-dashboard-page'));
const SourcingAgentPage = lazy(() => import('./presentation/pages/admin/sourcing-agent-page'));
const LegalResearchPage = lazy(() => import('./presentation/pages/admin/legal-research-page'));
const FormulationAgentPage = lazy(() => import('./presentation/pages/admin/formulation-agent-page'));
const AdminTutorialsPage = lazy(() => import('./presentation/pages/admin/admin-tutorials-page'));

// Chat Component
import Chat from './presentation/components/chat/Chat';

import ProtectedRoute from './presentation/components/auth/protected-route';
import { LanguageProvider } from './presentation/contexts/language-context';
import { AuthProvider } from './presentation/contexts/auth-context';
import { CartProvider } from './presentation/contexts/cart-context';

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
