import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import { CartItem } from '../types';
import { Order, OrderService } from '../services/order-service';
import { EmailOrderService } from '../services/email-order-service';
import OrderConfirmation from '../components/checkout/order-confirmation';

interface OrderConfirmationPageProps {
  cart: CartItem[];
  clearCart: () => void;
}

export default function OrderConfirmationPage({ cart, clearCart }: OrderConfirmationPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get order data from navigation state or try to fetch it
    const loadOrderConfirmation = async () => {
      try {
        setLoading(true);
        
        // Get order ID from navigation state
        const orderId = location.state?.orderId;
        const orderData = location.state?.order;
        
        if (orderData) {
          setOrder(orderData);
        } else if (orderId) {
          // Try to fetch order by ID
          const fetchedOrder = await OrderService.getOrder(orderId);
          if (fetchedOrder) {
            setOrder(fetchedOrder);
          } else {
            setError('Order not found');
          }
        } else {
          setError('No order information available');
        }
      } catch (err) {
        console.error('Error loading order confirmation:', err);
        setError('Failed to load order information');
      } finally {
        setLoading(false);
      }
    };

    loadOrderConfirmation();
  }, [location.state]);

  const handleContinueShopping = () => {
    clearCart();
    navigate('/');
  };

  const handleViewOrders = () => {
    navigate('/account/orders');
  };

  const handleTrackOrder = () => {
    if (order) {
      navigate(`/account/orders/${order.id}`);
    }
  };

  // Send order confirmation email
  useEffect(() => {
    const sendConfirmationEmail = async () => {
      if (order && order.customer_email) {
        try {
          const orderItems = await OrderService.getOrderItems(order.id);
          
          const orderEmailData = {
            order,
            orderItems,
            customerName: 'Valued Customer', // In real implementation, get from user data
            shippingAddress: order.shipping_address,
            billingAddress: order.billing_address,
            subtotal: order.total_amount - 6.0, // Approximate
            shipping: 6.0, // Approximate
            tax: (order.total_amount - 6.0) * 0.08, // Approximate
            total: order.total_amount
          };

          await EmailOrderService.sendOrderConfirmation(orderEmailData);
          console.log('Order confirmation email sent');
        } catch (error) {
          console.error('Failed to send order confirmation email:', error);
        }
      }
    };

    if (order && !loading) {
      sendConfirmationEmail();
    }
  }, [order, loading]);

  // Auto-redirect timer
  useEffect(() => {
    const timer = setTimeout(() => {
      handleContinueShopping();
    }, 30000);
    return () => clearTimeout(timer);
  }, []);

  const steps = [
    { id: 'cart', name: 'Cart', icon: '🛒' },
    { id: 'shipping', name: 'Shipping', icon: '🚚' },
    { id: 'summary', name: 'Summary', icon: '📋' },
    { id: 'payment', name: 'Payment', icon: '💳' },
    { id: 'confirmation', name: 'Confirmation', icon: '✅' }
  ];

  if (loading) {
    return (
      <div className="bg-background-primary min-h-screen py-8">
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
      <div className="bg-background-primary min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <h1 className="font-serif text-2xl text-red-900 mb-4">Order Not Found</h1>
              <p className="text-red-700 mb-6">{error || 'We could not find your order information.'}</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate('/')}
                  className="bg-brand text-white px-6 py-3 rounded-full hover:bg-brand-light font-semibold"
                >
                  Return Home
                </button>
                <button
                  onClick={() => navigate('/cart')}
                  className="border border-brand text-brand px-6 py-3 rounded-full hover:bg-brand-light hover:text-white font-semibold"
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

  return (
    <div className="bg-background-primary min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="font-serif text-4xl md:text-5xl mb-8 text-text-primary text-center">
          Thank You for Your Order!
        </h1>

        {/* Order Confirmation */}
        <OrderConfirmation
          order={order}
          orderItems={[]} // This would be populated from the service
          cart={cart}
          customerEmail={order.customer_email || ''}
        />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={handleTrackOrder}
            className="flex-1 bg-brand text-white hover:bg-brand-light font-semibold py-3 px-6 rounded-full transition-all"
          >
            Track Your Order
          </button>
          <button
            onClick={handleViewOrders}
            className="flex-1 border border-brand text-brand hover:bg-brand-light hover:text-white font-semibold py-3 px-6 rounded-full transition-all"
          >
            View Order History
          </button>
          <button
            onClick={handleContinueShopping}
            className="flex-1 border border-gray-300 text-text-primary hover:bg-gray-50 font-semibold py-3 px-6 rounded-full transition-all"
          >
            Continue Shopping
          </button>
        </div>

        {/* Auto-redirect notice */}
        <div className="text-center mt-8">
          <p className="text-sm text-text-tertiary">
            Redirecting to homepage in 30 seconds...
          </p>
          <button
            onClick={handleContinueShopping}
            className="text-brand hover:text-brand-light text-sm font-medium mt-2"
          >
            Continue now
          </button>
        </div>
      </div>
    </div>
  );
}