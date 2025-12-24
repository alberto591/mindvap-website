import { OrderService } from './order-service';
import { EmailOrderService } from './email-order-service';

/**
 * Stripe Webhook Handler for processing payment events
 * This would typically be deployed as a serverless function or API endpoint
 */

interface StripeWebhookEvent {
  id: string;
  object: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
}

interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  metadata?: {
    order_id?: string;
    user_id?: string;
  };
}

export class StripeWebhookHandler {
  constructor(
    private orderService: OrderService,
    private emailOrderService: EmailOrderService
  ) { }

  /**
   * Process Stripe webhook events
   */
  async handleWebhook(event: StripeWebhookEvent): Promise<void> {
    console.log('🔔 Processing Stripe webhook:', event.type, event.id);

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object as PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object as PaymentIntent);
          break;

        case 'payment_intent.canceled':
          await this.handlePaymentCanceled(event.data.object as PaymentIntent);
          break;

        default:
          console.log('ℹ️ Unhandled webhook event type:', event.type);
      }
    } catch (error) {
      console.error('❌ Error processing webhook:', error);
      throw error;
    }
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentSuccess(paymentIntent: PaymentIntent): Promise<void> {
    console.log('💳 Payment succeeded:', paymentIntent.id);

    const orderId = paymentIntent.metadata?.order_id;
    if (!orderId) {
      console.error('❌ No order_id in payment intent metadata');
      return;
    }

    try {
      // Update order status to completed
      await this.orderService.updateOrderStatus(orderId, 'completed');
      console.log('✅ Order status updated to completed:', orderId);

      // Get order details for email
      const order = await this.orderService.getOrder(orderId);
      if (!order) {
        console.error('❌ Order not found:', orderId);
        return;
      }

      const orderItems = await this.orderService.getOrderItems(orderId);

      // Send order confirmation email
      const customerName = order.shipping_address
        ? `${order.shipping_address.firstName} ${order.shipping_address.lastName}`
        : 'Valued Customer';

      const orderEmailData = {
        order,
        orderItems,
        customerName,
        shippingAddress: order.shipping_address,
        billingAddress: order.billing_address,
        subtotal: orderItems.reduce((sum, item) => sum + (item.price_at_time * item.quantity), 0),
        shipping: 6.0, // This should be calculated properly
        tax: 0, // This should be calculated properly
        total: order.total_amount
      };

      const emailResult = await this.emailOrderService.sendOrderConfirmation(orderEmailData);
      if (emailResult.success) {
        console.log('✅ Order confirmation email sent');
      } else {
        console.error('❌ Failed to send order confirmation email:', emailResult.error);
      }

    } catch (error) {
      console.error('❌ Error handling payment success:', error);
      throw error;
    }
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailure(paymentIntent: PaymentIntent): Promise<void> {
    console.log('❌ Payment failed:', paymentIntent.id);

    const orderId = paymentIntent.metadata?.order_id;
    if (!orderId) {
      console.error('❌ No order_id in payment intent metadata');
      return;
    }

    try {
      // Update order status to failed
      await this.orderService.updateOrderStatus(orderId, 'failed');
      console.log('✅ Order status updated to failed:', orderId);

      // TODO: Send payment failure notification email
      console.log('📧 Payment failure email should be sent here');

    } catch (error) {
      console.error('❌ Error handling payment failure:', error);
      throw error;
    }
  }

  /**
   * Handle canceled payment
   */
  private async handlePaymentCanceled(paymentIntent: PaymentIntent): Promise<void> {
    console.log('🚫 Payment canceled:', paymentIntent.id);

    const orderId = paymentIntent.metadata?.order_id;
    if (!orderId) {
      console.error('❌ No order_id in payment intent metadata');
      return;
    }

    try {
      // Update order status to canceled
      await this.orderService.updateOrderStatus(orderId, 'canceled');
      console.log('✅ Order status updated to canceled:', orderId);

      // TODO: Send payment cancellation notification email
      console.log('📧 Payment cancellation email should be sent here');

    } catch (error) {
      console.error('❌ Error handling payment cancellation:', error);
      throw error;
    }
  }

  /**
   * Verify webhook signature (important for security)
   * This should implement proper Stripe signature verification
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    // In a real implementation, use Stripe's webhook secret verification
    // const stripe = require('stripe')(secret);
    // return stripe.webhooks.constructEvent(payload, signature, secret);

    console.log('🔐 Webhook signature verification would happen here');
    return true; // Simplified for demo
  }
}