import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import { CartItem } from '../../domain/entities';
import { ShippingAddress, CalculationService } from '../../application/services/calculation-service';
import ShippingForm from '../components/checkout/shipping-form';
import AddressSelector from '../components/checkout/address-selector';
import CheckoutProgress from '../components/checkout/checkout-progress';
import OrderSummary from '../components/checkout/order-summary';

interface ShippingPageProps {
  cart: CartItem[];
  onCartUpdate?: (cart: CartItem[]) => void;
}

export default function ShippingPage({ cart, onCartUpdate }: ShippingPageProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  const isLoggedIn = !!user;

  const handleAddressChange = (address: ShippingAddress) => {
    setShippingAddress(address);
  };

  const handleContinue = () => {
    if (!shippingAddress) {
      alert('Please select or enter a shipping address');
      return;
    }
    navigate('/checkout/order-summary', { 
      state: { 
        shippingAddress,
        cart 
      } 
    });
  };

  const handleEditCart = () => {
    navigate('/cart');
  };

  const handleAddNewAddress = () => {
    setIsAddingNewAddress(true);
  };

  const handleEditAddress = (address: any) => {
    setEditingAddress(address);
    setIsAddingNewAddress(true);
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

  return (
    <div className="bg-background-primary min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="font-serif text-4xl md:text-5xl mb-8 text-text-primary">
          Shipping Information
        </h1>

        <CheckoutProgress currentStep="shipping" steps={steps} />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {isLoggedIn && !isAddingNewAddress ? (
              <AddressSelector
                selectedAddress={shippingAddress}
                onAddressSelect={handleAddressChange}
                onAddNew={handleAddNewAddress}
                onEdit={handleEditAddress}
                userId={user!.id}
              />
            ) : (
              <ShippingForm
                cart={cart}
                initialAddress={editingAddress}
                onAddressChange={handleAddressChange}
                onContinue={handleContinue}
                isLoggedIn={isLoggedIn}
              />
            )}

            {/* Continue Button */}
            {isAddingNewAddress && (
              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => {
                    setIsAddingNewAddress(false);
                    setEditingAddress(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-text-primary hover:bg-gray-50 font-semibold rounded-full transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleContinue}
                  disabled={!shippingAddress}
                  className="flex-1 bg-brand text-white hover:bg-brand-light font-semibold py-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Summary
                </button>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <OrderSummary
              cart={cart}
              shippingAddress={shippingAddress}
              onEditCart={handleEditCart}
              onEditAddress={() => setIsAddingNewAddress(true)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}