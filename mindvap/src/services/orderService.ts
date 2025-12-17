import { supabase } from '../lib/supabase';

export interface Order {
  id: string;
  user_id?: string;
  stripe_payment_intent_id: string;
  status: 'pending' | 'completed' | 'failed' | 'canceled' | 'shipped';
  total_amount: number;
  currency: string;
  shipping_address: any;
  billing_address?: any;
  customer_email?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
  product_name: string;
  product_image_url?: string;
  created_at: string;
}

export interface CreateOrderData {
  user_id?: string;
  stripe_payment_intent_id: string;
  total_amount: number;
  currency: string;
  shipping_address: any;
  billing_address?: any;
  customer_email?: string;
  cartItems: {
    product_id: string;
    quantity: number;
    price: number;
    product_name: string;
    product_image_url?: string;
  }[];
}

export class OrderService {
  /**
   * Create a new order with items
   */
  static async createOrder(orderData: CreateOrderData): Promise<Order> {
    try {
      // Create order record
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: orderData.user_id,
          stripe_payment_intent_id: orderData.stripe_payment_intent_id,
          status: 'pending',
          total_amount: orderData.total_amount,
          currency: orderData.currency,
          shipping_address: orderData.shipping_address,
          billing_address: orderData.billing_address,
          customer_email: orderData.customer_email
        })
        .select()
        .single();

      if (orderError) {
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      // Create order items
      const orderItems = orderData.cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_time: item.price,
        product_name: item.product_name,
        product_image_url: item.product_image_url
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        // If order items creation fails, delete the order
        await supabase.from('orders').delete().eq('id', order.id);
        throw new Error(`Failed to create order items: ${itemsError.message}`);
      }

      return order;
    } catch (error) {
      console.error('Order creation error:', error);
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  static async getOrder(orderId: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Order not found
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  /**
   * Get order by Stripe payment intent ID
   */
  static async getOrderByPaymentIntent(paymentIntentId: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('stripe_payment_intent_id', paymentIntentId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Order not found
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching order by payment intent:', error);
      throw error;
    }
  }

  /**
   * Get orders for a user
   */
  static async getUserOrders(userId: string, limit = 10): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  }

  /**
   * Get order items for an order
   */
  static async getOrderItems(orderId: string): Promise<OrderItem[]> {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching order items:', error);
      throw error;
    }
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  /**
   * Generate order number
   */
  static generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `MV-${timestamp.slice(-6)}${random}`;
  }

  /**
   * Get order statistics (for admin)
   */
  static async getOrderStats() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('status, total_amount, created_at');

      if (error) {
        throw error;
      }

      const stats = {
        total: data.length,
        pending: data.filter(o => o.status === 'pending').length,
        completed: data.filter(o => o.status === 'completed').length,
        failed: data.filter(o => o.status === 'failed').length,
        canceled: data.filter(o => o.status === 'canceled').length,
        totalRevenue: data
          .filter(o => o.status === 'completed')
          .reduce((sum, o) => sum + o.total_amount, 0)
      };

      return stats;
    } catch (error) {
      console.error('Error fetching order stats:', error);
      throw error;
    }
  }
}