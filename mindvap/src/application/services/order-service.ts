import { log } from '../../infrastructure/lib/logger';
import { IOrderRepository } from '../../domain/ports/i-order-repository';
import { Order, OrderItem, CreateOrderData } from '../../domain/entities/order';

export class OrderService {
  constructor(private orderRepository: IOrderRepository) { }

  /**
   * Create a new order with items
   */
  async createOrder(orderData: CreateOrderData): Promise<Order> {
    try {
      return await this.orderRepository.createOrder(orderData);
    } catch (error) {
      log.error('Order creation error', error, { orderData });
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<Order | null> {
    try {
      return await this.orderRepository.getOrder(orderId);
    } catch (error) {
      log.error('Error fetching order', error, { orderId });
      throw error;
    }
  }

  /**
   * Get order by Stripe payment intent ID
   */
  async getOrderByPaymentIntent(paymentIntentId: string): Promise<Order | null> {
    try {
      return await this.orderRepository.getOrderByPaymentIntent(paymentIntentId);
    } catch (error) {
      log.error('Error fetching order by payment intent', error, { paymentIntentId });
      throw error;
    }
  }

  /**
   * Get orders for a user
   */
  async getUserOrders(userId: string, limit = 10): Promise<Order[]> {
    try {
      return await this.orderRepository.getUserOrders(userId, limit);
    } catch (error) {
      log.error('Error fetching user orders', error, { userId });
      throw error;
    }
  }

  /**
   * Get order items for an order
   */
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    try {
      return await this.orderRepository.getOrderItems(orderId);
    } catch (error) {
      log.error('Error fetching order items', error, { orderId });
      throw error;
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    try {
      await this.orderRepository.updateOrderStatus(orderId, status);
    } catch (error) {
      log.error('Error updating order status', error, { orderId, status });
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
  async getOrderStats() {
    try {
      return await this.orderRepository.getOrderStats();
    } catch (error) {
      log.error('Error fetching order stats', error);
      throw error;
    }
  }
}