import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CreditCard, CheckCircle, UserPlus, User } from 'lucide-react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '../lib/stripe';
import { createPaymentIntent } from '../services/payment';
import { useAuth } from '../contexts/AuthContext';
import { CartItem } from '../types';
import { getCitiesForCountry, getPostalCodeInfo, getCountryData } from '../data/europeanAddresses';

interface CheckoutPageProps {
  cart: CartItem[];
  clearCart: () => void;
}

export default function CheckoutPage({ cart, clearCart }: CheckoutPageProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    ageVerification: false,
    createAccount: false,
    password: '',
    confirmPassword: '',
  });
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  // Get European address data
  const cities = getCitiesForCountry(formData.country);
  const postalCodeInfo = getPostalCodeInfo(formData.country);
  const countryData = getCountryData(formData.country);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleCreatePaymentIntent = async () => {
    if (!formData.ageVerification) {
      setError('You must verify that you are 21 years of age or older to complete this purchase.');
      return;
    }

    if (!formData.email || !formData.firstName || !formData.lastName || !formData.address || !formData.city || !formData.state || !formData.zipCode) {
      setError('Please fill in all required fields.');
      return;
    }

    // If user wants to create account but is not logged in, validate password
    if (formData.createAccount && !isAuthenticated) {
      if (!formData.password || !formData.confirmPassword) {
        setError('Please create a password to continue with account creation.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
      }
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      const cartItems = cart.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        product_image_url: item.product.image,
      }));

      const shippingAddress = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
      };

      const response = await createPaymentIntent({
        amount: total,
        currency: 'usd',
        cartItems,
        customerEmail: formData.email,
        shippingAddress,
        billingAddress: shippingAddress,
        userId: isAuthenticated ? user?.id : null,
        createAccount: formData.createAccount && !isAuthenticated,
        password: formData.createAccount ? formData.password : undefined,
      });

      setClientSecret(response.data.clientSecret);
      setOrderId(response.data.orderId);
      setOrderNumber(response.data.orderNumber);
    } catch (err: any) {
      console.error('Error creating payment intent:', err);
      setError(err.message || 'Failed to initialize payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0 && !orderComplete) {
    navigate('/cart');
    return null;
  }

  if (orderComplete) {
    return (
      <div className="bg-background-primary min-h-screen py-20">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <CheckCircle className="w-24 h-24 text-green-600 mx-auto mb-6" />
          <h1 className="font-serif text-4xl md:text-5xl mb-4 text-text-primary">
            Order Complete!
          </h1>
          <p className="text-text-secondary mb-8">
            Thank you for your purchase. You'll receive a confirmation email shortly with tracking information.
          </p>
          <div className="bg-white rounded-lg p-8 shadow-sm mb-8">
            <h2 className="font-serif text-2xl mb-4 text-text-primary">Order Summary</h2>
            <div className="space-y-3 text-left">
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-text-secondary">
                    {item.product.name} x {item.quantity}
                  </span>
                  <span className="text-text-primary font-medium">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between font-semibold">
                  <span className="text-text-primary">Total</span>
                  <span className="text-text-primary text-xl">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          {orderNumber && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Order Number</h3>
              <p className="text-blue-800 font-mono text-lg">{orderNumber}</p>
              <p className="text-sm text-blue-700 mt-2">
                Save this number to track your order. You can also track your order using your email address.
              </p>
            </div>
          )}
          <p className="text-sm text-text-tertiary">
            Redirecting to homepage...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-primary min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="font-serif text-4xl md:text-5xl mb-12 text-text-primary">
          Secure Checkout
        </h1>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="space-y-8">
              {/* Checkout Options */}
              {!isAuthenticated && (
                <div className="bg-white rounded-lg p-8 shadow-sm">
                  <h2 className="font-serif text-2xl mb-6 text-text-primary">
                    Checkout Options
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        id="guest-checkout"
                        name="checkoutType"
                        checked={!formData.createAccount}
                        onChange={() => setFormData({...formData, createAccount: false})}
                        className="w-5 h-5 text-brand focus:ring-brand"
                      />
                      <label htmlFor="guest-checkout" className="flex items-center gap-2 text-text-primary font-medium">
                        <User className="w-5 h-5" />
                        Continue as Guest
                      </label>
                    </div>
                    <p className="text-sm text-text-secondary ml-8">
                      Complete your purchase without creating an account
                    </p>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        id="create-account"
                        name="checkoutType"
                        checked={formData.createAccount}
                        onChange={() => setFormData({...formData, createAccount: true})}
                        className="w-5 h-5 text-brand focus:ring-brand"
                      />
                      <label htmlFor="create-account" className="flex items-center gap-2 text-text-primary font-medium">
                        <UserPlus className="w-5 h-5" />
                        Create Account & Save Information
                      </label>
                    </div>
                    <p className="text-sm text-text-secondary ml-8">
                      Faster checkout next time and access to order history
                    </p>
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <h2 className="font-serif text-2xl mb-6 text-text-primary">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                    />
                  </div>
                  
                  {/* Password fields for account creation */}
                  {formData.createAccount && !isAuthenticated && (
                    <>
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                          Create Password *
                        </label>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                          placeholder="At least 8 characters"
                        />
                      </div>
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-2">
                          Confirm Password *
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <h2 className="font-serif text-2xl mb-6 text-text-primary">
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-text-primary mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-text-primary mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-text-primary mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-text-primary mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                        placeholder="Enter city name"
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-text-primary mb-2">
                        State/Region *
                      </label>
                      <select
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                      >
                        <option value="">Select State/Region</option>
                        {cities.map((city) => (
                          <option key={city.name} value={city.name}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium text-text-primary mb-2">
                        {formData.country === 'GB' ? 'Postcode' : 
                         formData.country === 'CH' ? 'Postleitzahl' : 
                         formData.country === 'NL' ? 'Postcode' : 
                         formData.country === 'IE' ? 'Eircode' :
                         'Postal Code'} *
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        required
                        pattern={postalCodeInfo.pattern}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                        placeholder={postalCodeInfo.placeholder}
                      />
                      {countryData && (
                        <p className="text-xs text-gray-500 mt-1">
                          VAT Rate: {(countryData.vatRate * 100).toFixed(1)}% | Currency: {countryData.currency}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-text-primary mb-2">
                        Country *
                      </label>
                      <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                      >
                        <optgroup label="Europe">
                          <option value="DE">Germany</option>
                          <option value="FR">France</option>
                          <option value="ES">Spain</option>
                          <option value="IT">Italy</option>
                          <option value="NL">Netherlands</option>
                          <option value="BE">Belgium</option>
                          <option value="AT">Austria</option>
                          <option value="CH">Switzerland</option>
                          <option value="SE">Sweden</option>
                          <option value="NO">Norway</option>
                          <option value="DK">Denmark</option>
                          <option value="FI">Finland</option>
                          <option value="GB">United Kingdom</option>
                          <option value="PL">Poland</option>
                          <option value="PT">Portugal</option>
                          <option value="IE">Ireland</option>
                        </optgroup>
                        <optgroup label="United States">
                          <option value="US">United States</option>
                        </optgroup>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              {!clientSecret ? (
                <div className="bg-white rounded-lg p-8 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <CreditCard className="w-6 h-6 text-brand" />
                    <h2 className="font-serif text-2xl text-text-primary">
                      Payment Information
                    </h2>
                  </div>
                  <p className="text-text-secondary mb-4">
                    Complete the information above, then click the button below to proceed to payment.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-lg p-8 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <CreditCard className="w-6 h-6 text-brand" />
                    <h2 className="font-serif text-2xl text-text-primary">
                      Payment Information
                    </h2>
                  </div>
                  <StripePaymentForm 
                    clientSecret={clientSecret}
                    onSuccess={() => {
                      setOrderComplete(true);
                      setTimeout(() => {
                        clearCart();
                        navigate('/');
                      }, 3000);
                    }}
                    onError={(errorMessage) => setError(errorMessage)}
                  />
                </div>
              )}

              {/* Age Verification */}
              <div className="bg-amber-50 border-l-4 border-cta rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="ageVerification"
                    name="ageVerification"
                    checked={formData.ageVerification}
                    onChange={handleChange}
                    required
                    className="mt-1 w-5 h-5 text-brand focus:ring-brand rounded"
                  />
                  <label htmlFor="ageVerification" className="text-sm text-text-primary">
                    <strong>I certify that I am 21 years of age or older.</strong> I understand that these products are not intended to diagnose, treat, cure, or prevent any disease and have not been evaluated by the FDA.
                  </label>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              {!clientSecret ? (
                <button
                  type="button"
                  onClick={handleCreatePaymentIntent}
                  disabled={isProcessing}
                  className="w-full bg-white border-2 border-brand text-brand hover:bg-brand-light font-semibold py-4 rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>Preparing Payment...</>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Continue to Payment
                    </>
                  )}
                </button>
              ) : null}

              <div className="flex items-center justify-center gap-2 text-sm text-text-tertiary">
                <Lock className="w-4 h-4" />
                <span>Secure SSL encrypted payment</span>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-8 shadow-sm sticky top-24">
              <h2 className="font-serif text-2xl mb-6 text-text-primary">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex gap-4">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-text-secondary">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-medium text-text-primary">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-gray-200">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-text-primary text-lg">Total</span>
                    <span className="font-semibold text-text-primary text-2xl">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stripe Payment Form Component
interface StripePaymentFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}

function StripePaymentForm({ clientSecret, onSuccess, onError }: StripePaymentFormProps) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentForm onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
}

// Payment Form Component
interface PaymentFormProps {
  onSuccess: () => void;
  onError: (message: string) => void;
}

function PaymentForm({ onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    onError('');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/checkout',
        },
        redirect: 'if_required',
      });

      if (error) {
        onError(error.message || 'Payment failed. Please try again.');
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess();
      } else {
        onError('Payment status unknown. Please contact support.');
        setIsProcessing(false);
      }
    } catch (err: any) {
      onError(err.message || 'An unexpected error occurred.');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <PaymentElement />
      </div>
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-white border-2 border-brand text-brand hover:bg-brand-light font-semibold py-4 rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>Processing Payment...</>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            Complete Secure Purchase
          </>
        )}
      </button>
    </form>
  );
}
