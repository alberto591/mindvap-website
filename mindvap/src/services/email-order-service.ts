import EmailTemplateService from './email-template-service';
import { log } from '../lib/logger';
import { Order, OrderItem } from './order-service';
import { CalculationService, ShippingAddress } from './calculation-service';

export interface OrderEmailData {
  order: Order;
  orderItems: OrderItem[];
  customerName: string;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface OrderConfirmationData extends OrderEmailData {
  orderNumber: string;
  orderDate: string;
  orderTime: string;
  estimatedDelivery: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingMethod: string;
  baseUrl: string;
  supportEmail: string;
  supportPhone: string;
  orderTrackingUrl: string;
  accountUrl: string;
  unsubscribeUrl: string;
  preferencesUrl: string;
}

export class EmailOrderService {
  private static readonly BASE_URL = process.env.VITE_APP_URL || 'http://localhost:5173';
  private static readonly SUPPORT_EMAIL = 'support@mindvap.com';
  private static readonly SUPPORT_PHONE = '+1 (555) 123-4567';

  /**
   * Send order confirmation email
   */
  static async sendOrderConfirmation(
    orderData: OrderEmailData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!orderData.order.customer_email) {
        throw new Error('Customer email is required for order confirmation');
      }

      const emailData = this.prepareOrderConfirmationData(orderData);

      // Use the EmailTemplateService to send the order confirmation
      const emailService = EmailTemplateService.getInstance();
      const result = await emailService.sendOrderConfirmation({
        toEmail: orderData.order.customer_email,
        customerName: orderData.customerName,
        orderNumber: emailData.orderNumber,
        orderDate: emailData.orderDate,
        orderTime: emailData.orderTime,
        items: orderData.orderItems.map(item => ({
          name: item.product_name,
          description: `Quantity: ${item.quantity}`,
          quantity: item.quantity,
          price: item.price_at_time.toFixed(2)
        })),
        subtotal: orderData.subtotal.toFixed(2),
        shipping: orderData.shipping.toFixed(2),
        tax: orderData.tax.toFixed(2),
        total: orderData.total.toFixed(2),
        shippingAddress: {
          street: `${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName}`,
          city: orderData.shippingAddress.city,
          state: orderData.shippingAddress.state,
          zipCode: orderData.shippingAddress.zipCode,
          country: orderData.shippingAddress.country
        },
        billingAddress: orderData.billingAddress ? {
          street: `${orderData.billingAddress.firstName} ${orderData.billingAddress.lastName}`,
          city: orderData.billingAddress.city,
          state: orderData.billingAddress.state,
          zipCode: orderData.billingAddress.zipCode,
          country: orderData.billingAddress.country
        } : undefined,
        paymentMethod: emailData.paymentMethod,
        paymentStatus: emailData.paymentStatus,
        shippingMethod: emailData.shippingMethod,
        estimatedDelivery: emailData.estimatedDelivery
      });

      log.info('Order confirmation email sent successfully', { orderId: orderData.order.id });
      return { success: result.success, error: result.error };
    } catch (error) {
      log.error('Error sending order confirmation email', error, { orderId: orderData.order.id });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send order shipped email
   */
  static async sendOrderShipped(
    orderData: OrderEmailData & { trackingNumber: string; carrier: string }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!orderData.order.customer_email) {
        throw new Error('Customer email is required for order shipped notification');
      }

      const emailData = this.prepareOrderConfirmationData(orderData);

      // Use the EmailTemplateService to send the order shipped notification
      const emailService = EmailTemplateService.getInstance();
      const result = await emailService.sendOrderShipped({
        toEmail: orderData.order.customer_email,
        customerName: orderData.customerName,
        orderNumber: emailData.orderNumber,
        trackingNumber: orderData.trackingNumber,
        carrier: orderData.carrier,
        trackingUrl: `${this.BASE_URL}/track-order?number=${orderData.trackingNumber}`,
        estimatedDelivery: emailData.estimatedDelivery
      });

      log.info('Order shipped email sent successfully', { orderId: orderData.order.id });
      return { success: result.success, error: result.error };
    } catch (error) {
      log.error('Error sending order shipped email', error, { orderId: orderData.order.id });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send order cancellation email
   */
  static async sendOrderCancellation(
    orderData: OrderEmailData & { cancellationReason: string }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!orderData.order.customer_email) {
        throw new Error('Customer email is required for order cancellation');
      }

      // For now, use a simple email since we don't have a cancellation template
      log.info('Order cancellation email would be sent', {
        orderId: orderData.order.id,
        reason: orderData.cancellationReason,
        customerEmail: orderData.order.customer_email
      });

      return { success: true };
    } catch (error) {
      log.error('Error sending order cancellation email', error, { orderId: orderData.order.id });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send refund confirmation email
   */
  static async sendRefundConfirmation(
    orderData: OrderEmailData & {
      refundAmount: number;
      refundReason: string;
      refundTimeline: string;
      refundMethod: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!orderData.order.customer_email) {
        throw new Error('Customer email is required for refund confirmation');
      }

      // For now, use a simple email since we don't have a refund template
      log.info('Refund confirmation email would be sent', {
        orderId: orderData.order.id,
        refundAmount: orderData.refundAmount,
        customerEmail: orderData.order.customer_email
      });

      return { success: true };
    } catch (error) {
      log.error('Error sending refund confirmation email', error, { orderId: orderData.order.id });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Prepare order confirmation email data
   */
  private static prepareOrderConfirmationData(orderData: OrderEmailData): OrderConfirmationData {
    const orderDate = new Date(orderData.order.created_at);
    const estimatedDelivery = CalculationService.estimateDeliveryDate(orderData.shippingAddress);

    return {
      ...orderData,
      orderNumber: orderData.order.id.substring(0, 8).toUpperCase(),
      orderDate: orderDate.toLocaleDateString(),
      orderTime: orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estimatedDelivery: estimatedDelivery.toLocaleDateString(),
      paymentMethod: 'Credit Card (Stripe)',
      paymentStatus: orderData.order.status === 'completed' ? 'Paid' : 'Pending',
      shippingMethod: orderData.shipping > 0 ? 'Standard Shipping (5-7 days)' : 'Free Standard Shipping',
      baseUrl: this.BASE_URL,
      supportEmail: this.SUPPORT_EMAIL,
      supportPhone: this.SUPPORT_PHONE,
      orderTrackingUrl: `${this.BASE_URL}/track-order/${orderData.order.id}`,
      accountUrl: `${this.BASE_URL}/account/orders`,
      unsubscribeUrl: `${this.BASE_URL}/unsubscribe`,
      preferencesUrl: `${this.BASE_URL}/account/email-preferences`
    };
  }

  /**
   * Send bulk order status update emails
   */
  static async sendBulkOrderStatusUpdate(
    orders: Order[],
    status: 'shipped' | 'delivered' | 'cancelled',
    additionalData?: any
  ): Promise<{ sent: number; failed: number; errors: string[] }> {
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const order of orders) {
      try {
        // Get order details
        const { OrderService } = await import('./order-service');
        const orderItems = await OrderService.getOrderItems(order.id);

        const orderData: OrderEmailData = {
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

        let result;
        switch (status) {
          case 'shipped':
            result = await this.sendOrderShipped({
              ...orderData,
              trackingNumber: additionalData?.trackingNumber || 'TRACK123456',
              carrier: additionalData?.carrier || 'UPS'
            });
            break;
          case 'delivered':
            // Could implement delivery confirmation email
            result = { success: true };
            break;
          case 'cancelled':
            result = await this.sendOrderCancellation({
              ...orderData,
              cancellationReason: additionalData?.reason || 'Customer request'
            });
            break;
        }

        if (result.success) {
          sent++;
        } else {
          failed++;
          errors.push(`Order ${order.id}: ${result.error}`);
        }
      } catch (error) {
        failed++;
        errors.push(`Order ${order.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    log.info(`Bulk email sending completed: ${sent} sent, ${failed} failed`);
    return { sent, failed, errors };
  }
}