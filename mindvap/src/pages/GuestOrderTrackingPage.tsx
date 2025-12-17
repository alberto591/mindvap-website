import { useState } from 'react';
import { Search, Package, CheckCircle, Clock, Truck, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  currency: string;
  customer_email: string;
  shipping_address: any;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price_at_time: number;
  product_image_url?: string;
}

export default function GuestOrderTrackingPage() {
  const [searchData, setSearchData] = useState({
    orderNumber: '',
    email: '',
  });
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchData.orderNumber || !searchData.email) {
      setError('Please provide both order number and email address.');
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      // Search for order by order number and email
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          total_amount,
          currency,
          customer_email,
          shipping_address,
          created_at,
          updated_at,
          order_items (
            id,
            product_name,
            quantity,
            price_at_time,
            product_image_url
          )
        `)
        .eq('order_number', searchData.orderNumber.trim())
        .eq('customer_email', searchData.email.trim())
        .single();

      if (orderError) {
        if (orderError.code === 'PGRST116') {
          setError('Order not found. Please check your order number and email address.');
        } else {
          setError('Error retrieving order information. Please try again.');
        }
        return;
      }

      setOrder(orderData);
    } catch (err: any) {
      console.error('Error searching for order:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'completed':
      case 'shipped':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
      case 'canceled':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Order Received';
      case 'processing':
        return 'Processing';
      case 'completed':
        return 'Completed';
      case 'shipped':
        return 'Shipped';
      case 'failed':
        return 'Failed';
      case 'canceled':
        return 'Canceled';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <div className="bg-background-primary min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl mb-4 text-text-primary">
            Track Your Order
          </h1>
          <p className="text-text-secondary">
            Enter your order number and email address to track your order status
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg p-8 shadow-sm mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label htmlFor="orderNumber" className="block text-sm font-medium text-text-primary mb-2">
                Order Number
              </label>
              <input
                type="text"
                id="orderNumber"
                value={searchData.orderNumber}
                onChange={(e) => setSearchData({ ...searchData, orderNumber: e.target.value })}
                placeholder="Enter your order number (e.g., MV-123456ABC)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={searchData.email}
                onChange={(e) => setSearchData({ ...searchData, email: e.target.value })}
                placeholder="Enter the email address used for the order"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-white hover:bg-brand-light font-semibold py-3 rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>Searching...</>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Track Order
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            {/* Order Header */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-serif text-2xl text-text-primary mb-2">
                    Order #{order.order_number}
                  </h2>
                  <p className="text-text-secondary">
                    Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <span className="font-semibold text-text-primary">
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-text-primary mb-3">Shipping Address</h3>
                  <div className="text-text-secondary">
                    <p>{order.shipping_address?.firstName} {order.shipping_address?.lastName}</p>
                    <p>{order.shipping_address?.address}</p>
                    <p>
                      {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zipCode}
                    </p>
                    <p>{order.shipping_address?.country}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-3">Order Total</h3>
                  <p className="text-2xl font-semibold text-text-primary">
                    ${order.total_amount.toFixed(2)} {order.currency.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="font-serif text-2xl text-text-primary mb-6">Order Items</h3>
              <div className="space-y-4">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4 border-b border-gray-200 last:border-b-0">
                    {item.product_image_url && (
                      <img
                        src={item.product_image_url}
                        alt={item.product_name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-text-primary">{item.product_name}</h4>
                      <p className="text-text-secondary">Quantity: {item.quantity}</p>
                      <p className="text-text-primary font-medium">
                        ${item.price_at_time.toFixed(2)} each
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-text-primary">
                        ${(item.price_at_time * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Status Timeline */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="font-serif text-2xl text-text-primary mb-6">Order Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <div>
                    <p className="font-medium text-text-primary">Order Received</p>
                    <p className="text-sm text-text-secondary">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                
                {(order.status === 'completed' || order.status === 'shipped') && (
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <div>
                      <p className="font-medium text-text-primary">Order Processed</p>
                      <p className="text-sm text-text-secondary">
                        {new Date(order.updated_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {order.status === 'shipped' && (
                  <div className="flex items-center gap-4">
                    <Truck className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-text-primary">Shipped</p>
                      <p className="text-sm text-text-secondary">
                        Your order is on its way
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h3 className="font-semibold text-text-primary mb-2">Need Help?</h3>
          <p className="text-text-secondary mb-4">
            If you're having trouble tracking your order, please contact our customer support.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 text-brand hover:text-brand-light font-medium"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}