import React from 'react';
import { ShoppingCart, Edit3, MapPin } from 'lucide-react';
import { CartItem } from '../../types';
import { CalculationService, ShippingAddress } from '../../services/calculationService';
import { useLanguage } from '../../contexts/LanguageContext';

interface OrderSummaryProps {
  cart: CartItem[];
  shippingAddress: ShippingAddress | null;
  onEditCart: () => void;
  onEditAddress: () => void;
  showEditButtons?: boolean;
}

export default function OrderSummary({
  cart,
  shippingAddress,
  onEditCart,
  onEditAddress,
  showEditButtons = true
}: OrderSummaryProps) {
  const { language } = useLanguage();
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // Calculate totals based on current shipping address
  let totals = {
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0
  };

  if (shippingAddress) {
    const cartItems = cart.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.price
    }));

    totals = CalculationService.calculateTotals(cartItems, shippingAddress);
  }

  return (
    <div className="bg-white rounded-lg p-8 shadow-sm sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl text-text-primary">Order Summary</h2>
        {showEditButtons && (
          <button
            onClick={onEditCart}
            className="flex items-center gap-2 text-brand hover:text-brand-light font-medium text-sm"
          >
            <Edit3 className="w-4 h-4" />
            Edit Cart
          </button>
        )}
      </div>

      {/* Cart Items */}
      <div className="space-y-4 mb-6">
        {cart.map((item) => (
          <div key={item.product.id} className="flex gap-4">
            <img
              src={item.product.image}
              alt={item.product.name[language]}
              loading="lazy"
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-text-primary">
                {item.product.name[language]}
              </h3>
              <p className="text-sm text-text-secondary">
                Quantity: {item.quantity}
              </p>
              <p className="text-sm font-medium text-text-primary">
                ${(item.product.price * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Shipping Address Summary */}
      {shippingAddress && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand" />
              <h3 className="text-sm font-medium text-text-primary">Shipping Address</h3>
            </div>
            {showEditButtons && (
              <button
                onClick={onEditAddress}
                className="text-brand hover:text-brand-light text-xs font-medium"
              >
                Edit
              </button>
            )}
          </div>
          <div className="text-sm text-text-secondary">
            <p className="font-medium text-text-primary">
              {shippingAddress.firstName} {shippingAddress.lastName}
            </p>
            <p>{shippingAddress.address}</p>
            <p>
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
            </p>
            <p>{shippingAddress.country}</p>
          </div>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-3 pt-6 border-t border-gray-200">
        <div className="flex justify-between text-text-secondary">
          <span>Subtotal</span>
          <span>${totals.subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-text-secondary">
          <span>Shipping</span>
          <span>
            {totals.shipping === 0 ? (
              <span className="text-green-600 font-medium">FREE</span>
            ) : (
              `$${totals.shipping.toFixed(2)}`
            )}
          </span>
        </div>

        <div className="flex justify-between text-text-secondary">
          <span>Tax</span>
          <span>${totals.tax.toFixed(2)}</span>
        </div>

        <div className="pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-text-primary text-lg">Total</span>
            <span className="font-semibold text-text-primary text-2xl">
              ${totals.total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Shipping Information */}
      {shippingAddress && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Shipping Information</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>
              <strong>Method:</strong> {totals.shipping === 0 ? 'Free Standard Shipping' : 'Standard Shipping'}
            </p>
            <p>
              <strong>Estimated Delivery:</strong> {CalculationService.estimateDeliveryDate(shippingAddress).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-text-tertiary">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        <span>Secure SSL encrypted checkout</span>
      </div>
    </div>
  );
}