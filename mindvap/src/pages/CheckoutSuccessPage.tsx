import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, Mail, MapPin, CreditCard, Download, Share2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Order, OrderService } from '../services/orderService';
import { OrderItem } from '../services/orderService';
import { getMockOrders } from '../services/payment.mock';

export default function CheckoutSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paymentIntentId = searchParams.get('payment_intent');
  const orderId = searchParams.get('order_id');

  // Helper function to convert mock order to Order format
  const convertMockOrderToOrder = (mockOrder: any): Order => {
    return {
      id: mockOrder.id,
      user_id: mockOrder.userId,
      stripe_payment_intent_id: mockOrder.stripePaymentIntentId,
      status: mockOrder.status,
      total_amount: mockOrder.totalAmount,
      currency: mockOrder.currency,
      shipping_address: mockOrder.shippingAddress,
      billing_address: mockOrder.billingAddress,
      customer_email: mockOrder.customerEmail,
      created_at: mockOrder.createdAt,
      updated_at: mockOrder.updatedAt
    };
  };

  useEffect(() => {
    const loadOrderData = async () => {
      try {
        setLoading(true);

        if (!paymentIntentId && !orderId) {
          setError('No order information found');
          return;
        }

        let foundOrder: Order | null = null;
        let foundOrderItems: OrderItem[] = [];

        // First, try to find mock orders in localStorage
        const mockOrders = getMockOrders();
        console.log('🎭 Checking mock orders:', mockOrders.length);

        // Look for mock order by payment intent ID or order ID
        const mockOrder = mockOrders.find((mock: any) =>
          (paymentIntentId && mock.stripePaymentIntentId === paymentIntentId) ||
          (orderId && mock.id === orderId)
        );

        if (mockOrder) {
          console.log('🎭 Found mock order:', mockOrder.orderNumber);
          foundOrder = convertMockOrderToOrder(mockOrder);
          // Convert mock order items to OrderItem format
          foundOrderItems = mockOrder.cartItems.map((item: any, index: number) => ({
            id: `mock_item_${index}`,
            order_id: mockOrder.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price_at_time: item.price,
            product_name: item.product_name,
            product_image_url: item.product_image_url,
            created_at: mockOrder.createdAt
          }));
        } else {
          console.log('🎭 No mock order found, trying database...');

          // If not found in mock orders, try to find order by payment intent ID first
          if (paymentIntentId) {
            foundOrder = await OrderService.getOrderByPaymentIntent(paymentIntentId);
          }

          // If not found by payment intent, try by order ID
          if (!foundOrder && orderId) {
            foundOrder = await OrderService.getOrder(orderId);
          }

          if (foundOrder) {
            // Load order items from database
            foundOrderItems = await OrderService.getOrderItems(foundOrder.id);
          }
        }

        if (!foundOrder) {
          setError('Order not found');
          return;
        }

        setOrder(foundOrder);
        setOrderItems(foundOrderItems);

      } catch (err) {
        console.error('Error loading order:', err);
        setError('Failed to load order information');
      } finally {
        setLoading(false);
      }
    };

    loadOrderData();
  }, [paymentIntentId, orderId]);

  const handleContinueShopping = () => {
    navigate('/');
  };

  const handleViewOrders = () => {
    if (user) {
      navigate('/account/orders');
    } else {
      navigate('/track-order');
    }
  };

  const handleTrackOrder = () => {
    if (order) {
      // For mock orders, redirect to guest tracking with mock order number
      if (order.stripe_payment_intent_id.startsWith('pi_mock_')) {
        navigate(`/track-order?orderNumber=${order.id.substring(0, 8).toUpperCase()}&email=${order.customer_email}`);
      } else {
        // For real orders, use normal flow
        if (user) {
          navigate(`/account/orders/${order.id}`);
        } else {
          navigate(`/track-order?orderNumber=${order.id.substring(0, 8).toUpperCase()}&email=${order.customer_email}`);
        }
      }
    }
  };

  const handlePrintOrder = () => {
    window.print();
  };

  const handleShareOrder = async () => {
    if (navigator.share && order) {
      try {
        await navigator.share({
          title: `Order ${order.id.substring(0, 8).toUpperCase()}`,
          text: `Check out my MindVap order!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Order link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="bg-background-primary min-h-screen py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading order confirmation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-background-primary min-h-screen py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <h1 className="font-serif text-2xl text-red-900 mb-4">Order Not Found</h1>
              <p className="text-red-700 mb-6">{error || 'We could not find your order information.'}</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate('/')}
                  className="bg-brand text-white px-6 py-3 rounded-full hover:bg-brand-hover font-semibold"
                >
                  Return Home
                </button>
                <button
                  onClick={() => navigate('/cart')}
                  className="border border-brand text-brand px-6 py-3 rounded-full hover:bg-brand-hover hover:text-white font-semibold"
                >
                  View Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const orderDate = new Date(order.created_at);
  const estimatedDelivery = new Date(orderDate);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price_at_time * item.quantity), 0);
  const shipping = order.total_amount - subtotal - (subtotal * 0.08);
  const tax = subtotal * 0.08;

  return (
    <div className="bg-background-primary min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-12">
          <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
          <h1 className="font-serif text-4xl md:text-5xl mb-4 text-text-primary">
            Order Confirmed!
          </h1>
          <p className="text-text-secondary text-lg mb-2">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
          <p className="text-sm text-text-tertiary mb-4">
            Order #{order.id.substring(0, 8).toUpperCase()} • {orderDate.toLocaleDateString()}
          </p>

          {/* Development Notice for Mock Orders */}
          {order.stripe_payment_intent_id.startsWith('pi_mock_') && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
              <p className="text-blue-800 text-sm">
                🎭 <strong>Development Mode:</strong> This is a mock order created for testing purposes.
                No real payment was processed.
              </p>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Status */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl text-text-primary">Order Status</h2>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {order.status.toUpperCase()}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-text-primary mb-3">Order Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Order Number:</span>
                      <span className="font-medium">#{order.id.substring(0, 8).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Order Date:</span>
                      <span className="font-medium">{orderDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Total Amount:</span>
                      <span className="font-medium">${order.total_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Payment Method:</span>
                      <span className="font-medium">Credit Card (Stripe)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-text-primary mb-3">Contact Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Email:</span>
                      <span className="font-medium">{order.customer_email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Status:</span>
                      <span className="font-medium">Being Processed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="font-serif text-2xl text-text-primary mb-6">Items Ordered</h2>
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

            {/* Shipping Information */}
            {order.shipping_address && (
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-6 h-6 text-brand" />
                  <h2 className="font-serif text-2xl text-text-primary">Shipping Information</h2>
                </div>
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="text-blue-900">
                    <p className="font-medium mb-1">
                      {order.shipping_address.firstName} {order.shipping_address.lastName}
                    </p>
                    <p>{order.shipping_address.address}</p>
                    <p>
                      {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}
                    </p>
                    <p>{order.shipping_address.country}</p>
                    <div className="mt-4 text-sm">
                      <p><strong>Shipping Method:</strong> {shipping === 0 ? 'Free Standard Shipping' : 'Standard Shipping'}</p>
                      <p><strong>Estimated Delivery:</strong> {estimatedDelivery.toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Order Summary */}
            <div className="bg-white rounded-lg p-8 shadow-sm sticky top-24">
              <h2 className="font-serif text-2xl text-text-primary mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Subtotal</span>
                  <span className="text-text-primary">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Shipping</span>
                  <span className="text-text-primary">
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Tax</span>
                  <span className="text-text-primary">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="font-semibold text-text-primary text-lg">Total</span>
                    <span className="font-semibold text-text-primary text-lg">
                      ${order.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleTrackOrder}
                  className="w-full bg-brand text-white hover:bg-brand-hover font-semibold py-3 px-6 rounded-full transition-all flex items-center justify-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  Track Your Order
                </button>

                <button
                  onClick={handleViewOrders}
                  className="w-full border border-brand text-brand hover:bg-brand-hover hover:text-white font-semibold py-3 px-6 rounded-full transition-all"
                >
                  View Order History
                </button>

                <button
                  onClick={handlePrintOrder}
                  className="w-full border border-gray-300 text-text-primary hover:bg-gray-50 font-semibold py-3 px-6 rounded-full transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Print Order
                </button>

                <button
                  onClick={handleShareOrder}
                  className="w-full border border-gray-300 text-text-primary hover:bg-gray-50 font-semibold py-3 px-6 rounded-full transition-all flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share Order
                </button>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-green-50 rounded-lg p-6 mt-6">
              <h3 className="font-serif text-lg text-green-900 mb-4">What happens next?</h3>
              <div className="space-y-3 text-green-800 text-sm">
                <div className="flex gap-3">
                  <Package className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Processing (1-2 business days)</p>
                    <p>We'll prepare your order for shipment</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Mail className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Shipping Confirmation</p>
                    <p>You'll receive an email with tracking information</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Delivery</p>
                    <p>Your order will arrive within 5-7 business days</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="text-center mt-6">
              <h3 className="font-medium text-text-primary mb-2">Need help with your order?</h3>
              <p className="text-text-secondary text-sm mb-4">
                If you have any questions, please contact our customer service team.
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
        </div>
      </div>
    </div>
  );
}