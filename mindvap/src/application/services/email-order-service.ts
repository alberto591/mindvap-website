import { EmailTemplateService } from './email-template-service';
import { log } from '../../infrastructure/lib/logger';
import { Order, OrderItem } from '../../domain/entities/order';
import { orderService } from '../../config/container';
import { CalculationService, ShippingAddress } from './calculation-service';
import { OrderService } from './order-service';

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
  private readonly BASE_URL = process.env.VITE_APP_URL || 'http://localhost:5173';
  private readonly SUPPORT_EMAIL = 'support@mindvap.com';
  private readonly SUPPORT_PHONE = '+1 (555) 123-4567';

  constructor(
    private orderService: OrderService,
    private emailTemplateService: EmailTemplateService
  ) { }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(
    orderData: OrderEmailData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!orderData.order.customer_email) {
        throw new Error('Customer email is required for order confirmation');
      }

      const emailData = this.prepareOrderConfirmationData(orderData);

      const result = await this.emailTemplateService.sendOrderConfirmation({
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
  async sendOrderShipped(
    orderData: OrderEmailData & { trackingNumber: string; carrier: string }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!orderData.order.customer_email) {
        throw new Error('Customer email is required for order shipped notification');
      }

      const emailData = this.prepareOrderConfirmationData(orderData);

      const result = await this.emailTemplateService.sendOrderShipped({
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
  async sendOrderCancellation(
    orderData: OrderEmailData & { cancellationReason: string }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!orderData.order.customer_email) {
        throw new Error('Customer email is required for order cancellation');
      }

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
  async sendRefundConfirmation(
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
  private prepareOrderConfirmationData(orderData: OrderEmailData): OrderConfirmationData {
    const orderDate = new Date(orderData.order.created_at);
    // Use CalculationService via static for now as it doesn't have state
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
  async sendBulkOrderStatusUpdate(
    orders: Order[],
    status: 'shipped' | 'delivered' | 'cancelled',
    additionalData?: any
  ): Promise<{ sent: number; failed: number; errors: string[] }> {
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const order of orders) {
      try {
        const orderItems = await this.orderService.getOrderItems(order.id);

        const orderData: OrderEmailData = {
          order,
          orderItems,
          customerName: 'Valued Customer',
          shippingAddress: order.shipping_address,
          billingAddress: order.billing_address,
          subtotal: order.total_amount - 6.0,
          shipping: 6.0,
          tax: (order.total_amount - 6.0) * 0.08,
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
            result = { success: true };
            break;
          case 'cancelled':
            result = await this.sendOrderCancellation({
              ...orderData,
              cancellationReason: additionalData?.reason || 'Customer request'
            });
            break;
        }

        if (result && result.success) {
          sent++;
        } else {
          failed++;
          errors.push(`Order ${order.id}: ${result?.error}`);
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