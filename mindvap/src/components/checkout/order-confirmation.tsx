import React from 'react';
import { CheckCircle, Package, MapPin, CreditCard, Mail } from 'lucide-react';
import { CartItem } from '../../types';
import { Order, OrderItem } from '../../services/order-service';

interface OrderConfirmationProps {
  order: Order;
  orderItems: OrderItem[];
  cart: CartItem[];
  customerEmail: string;
}

export default function OrderConfirmation({
  order,
  orderItems,
  cart,
  customerEmail
}: OrderConfirmationProps) {
  const orderDate = new Date(order.created_at);
  const estimatedDelivery = new Date(orderDate);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5); // 5 days from order

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price_at_time * item.quantity), 0);
  const shipping = order.total_amount - subtotal - (subtotal * 0.08); // Approximate calculation
  const tax = subtotal * 0.08;

  return (
    <div className="bg-white rounded-lg p-8 shadow-sm">
      {/* Success Header */}
      <div className="text-center mb-8">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h1 className="font-serif text-3xl md:text-4xl text-text-primary mb-2">
          Order Confirmed!
        </h1>
        <p className="text-text-secondary text-lg">
          Thank you for your purchase. Your order has been successfully placed.
        </p>
      </div>

      {/* Order Details Card */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl text-text-primary">Order Details</h2>
          <span className="text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
            {order.status.toUpperCase()}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-text-primary mb-2">Order Information</h3>
            <div className="space-y-1 text-sm text-text-secondary">
              <p><strong>Order Number:</strong> #{order.id.substring(0, 8).toUpperCase()}</p>
              <p><strong>Order Date:</strong> {orderDate.toLocaleDateString()}</p>
              <p><strong>Order Time:</strong> {orderDate.toLocaleTimeString()}</p>
              <p><strong>Total Amount:</strong> ${order.total_amount.toFixed(2)}</p>
              <p><strong>Payment Method:</strong> Credit Card (Stripe)</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-text-primary mb-2">Contact Information</h3>
            <div className="space-y-1 text-sm text-text-secondary">
              <p><strong>Email:</strong> {customerEmail}</p>
              <p><strong>Order Status:</strong> Being Processed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-6">
        <h2 className="font-serif text-xl text-text-primary mb-4">Items Ordered</h2>
        <div className="space-y-4">
          {orderItems.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
              <img
                src={item.product_image_url || '/images/placeholder-product.webp'}
                alt={item.product_name}
                loading="lazy"
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-medium text-text-primary">{item.product_name}</h3>
                <p className="text-sm text-text-secondary">Quantity: {item.quantity}</p>
                <p className="text-sm text-text-secondary">
                  ${item.price_at_time.toFixed(2)} each
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-text-primary">
                  ${(item.price_at_time * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h2 className="font-serif text-xl text-text-primary mb-4">Price Summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-text-secondary">Subtotal</span>
            <span className="text-text-primary">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Shipping</span>
            <span className="text-text-primary">
              {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Tax</span>
            <span className="text-text-primary">${tax.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between">
              <span className="font-semibold text-text-primary text-lg">Total</span>
              <span className="font-semibold text-text-primary text-lg">
                ${order.total_amount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Information */}
      {order.shipping_address && (
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h2 className="font-serif text-xl text-blue-900">Shipping Information</h2>
          </div>
          <div className="text-blue-800">
            <p className="font-medium mb-1">
              {order.shipping_address.firstName} {order.shipping_address.lastName}
            </p>
            <p>{order.shipping_address.address}</p>
            <p>
              {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}
            </p>
            <p>{order.shipping_address.country}</p>
            <div className="mt-3 text-sm">
              <p><strong>Shipping Method:</strong> {shipping === 0 ? 'Free Standard Shipping' : 'Standard Shipping'}</p>
              <p><strong>Estimated Delivery:</strong> {estimatedDelivery.toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="bg-green-50 rounded-lg p-6 mb-6">
        <h2 className="font-serif text-xl text-green-900 mb-4">What happens next?</h2>
        <div className="space-y-3 text-green-800">
          <div className="flex gap-3">
            <Package className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Processing (1-2 business days)</p>
              <p className="text-sm">We'll prepare your order for shipment</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Mail className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Shipping Confirmation</p>
              <p className="text-sm">You'll receive an email with tracking information</p>
            </div>
          </div>
          <div className="flex gap-3">
            <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Delivery</p>
              <p className="text-sm">Your order will arrive within 5-7 business days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Email Confirmation Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Mail className="w-5 h-5 text-amber-600" />
          <h3 className="font-medium text-amber-900">Confirmation Email Sent</h3>
        </div>
        <p className="text-amber-800 text-sm">
          We've sent a detailed order confirmation to <strong>{customerEmail}</strong>.
          Please check your email (including spam folder) for your order details and tracking information.
        </p>
      </div>

      {/* Support Information */}
      <div className="text-center">
        <h3 className="font-medium text-text-primary mb-2">Need help with your order?</h3>
        <p className="text-text-secondary text-sm mb-4">
          If you have any questions about your order, please contact our customer service team.
        </p>
        <div className="flex justify-center gap-4 text-sm">
          <a href="mailto:support@mindvap.com" className="text-brand hover:text-brand-light">
            📧 support@mindvap.com
          </a>
          <a href="tel:+15551234567" className="text-brand hover:text-brand-light">
            📞 +1 (555) 123-4567
          </a>
        </div>
      </div>
    </div>
  );
}