import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CartItem } from '../types';
import { ShippingAddress } from '../services/calculationService';
import CheckoutProgress from '../components/checkout/CheckoutProgress';
import OrderSummary from '../components/checkout/OrderSummary';

interface OrderSummaryPageProps {
  cart: CartItem[];
  onCartUpdate?: (cart: CartItem[]) => void;
}

export default function OrderSummaryPage({ cart, onCartUpdate }: OrderSummaryPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);

  useEffect(() => {
    // Get shipping address from navigation state or redirect if not available
    if (location.state?.shippingAddress) {
      setShippingAddress(location.state.shippingAddress);
    } else {
      navigate('/checkout/shipping', { 
        state: { cart },
        replace: true 
      });
    }
  }, [location.state, navigate, cart]);

  const handleEditCart = () => {
    navigate('/cart');
  };

  const handleEditAddress = () => {
    navigate('/checkout/shipping', { 
      state: { cart } 
    });
  };

  const handleContinue = () => {
    navigate('/checkout/payment', { 
      state: { 
        cart,
        shippingAddress 
      } 
    });
  };

  const steps = [
    { id: 'cart', name: 'Cart', icon: '🛒' },
    { id: 'shipping', name: 'Shipping', icon: '🚚' },
    { id: 'summary', name: 'Summary', icon: '📋' },
    { id: 'payment', name: 'Payment', icon: '💳' },
    { id: 'confirmation', name: 'Confirmation', icon: '✅' }
  ];

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  if (!shippingAddress) {
    return (
      <div className="bg-background-primary min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center">
            <p className="text-text-secondary">Loading shipping information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-primary min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="font-serif text-4xl md:text-5xl mb-8 text-text-primary">
          Order Summary
        </h1>

        <CheckoutProgress currentStep="summary" steps={steps} />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="font-serif text-2xl text-text-primary mb-6">
                Review Your Order
              </h2>
              
              <p className="text-text-secondary mb-6">
                Please review your order details below. If everything looks correct, 
                you can proceed to payment.
              </p>

              {/* Order Items Summary */}
              <div className="space-y-4 mb-6">
                <h3 className="font-semibold text-text-primary">Items in Your Order</h3>
                {cart.map((item) => (
                  <div key={item.product.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-text-primary">{item.product.name}</h4>
                      <p className="text-sm text-text-secondary">Quantity: {item.quantity}</p>
                      <p className="text-sm text-text-secondary">
                        ${item.product.price.toFixed(2)} each
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-text-primary">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => navigate('/checkout/shipping')}
                  className="flex-1 px-6 py-3 border border-gray-300 text-text-primary hover:bg-gray-50 font-semibold rounded-full transition-all"
                >
                  Back to Shipping
                </button>
                <button
                  onClick={handleContinue}
                  className="flex-1 bg-brand text-white hover:bg-brand-light font-semibold py-3 rounded-full transition-all"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <OrderSummary
              cart={cart}
              shippingAddress={shippingAddress}
              onEditCart={handleEditCart}
              onEditAddress={handleEditAddress}
            />
          </div>
        </div>
      </div>
    </div>
  );
}