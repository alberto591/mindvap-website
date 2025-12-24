import { SupabaseOrderRepository } from '../infrastructure/database/supabase-order-repository';
import { OrderService } from '../application/services/order-service';
import { StripeWebhookHandler } from '../application/services/stripe-webhook-handler';
import { EmailTemplateService } from '../application/services/email-template-service';
import { EmailOrderService } from '../application/services/email-order-service';
import { EmailNotificationService } from '../application/services/email-notification-service';
import { InMemorySecurityService } from '../infrastructure/security/in-memory-security-service';

// Adapters / Infrastructure
const orderRepository = new SupabaseOrderRepository();
const emailTemplateService = new EmailTemplateService();
const securityService = new InMemorySecurityService();

// Domain Services / Application Layer
export const orderService = new OrderService(orderRepository);
export const emailOrderService = new EmailOrderService(orderService, emailTemplateService);
export const emailNotificationService = new EmailNotificationService(emailTemplateService, emailOrderService);
export const stripeWebhookHandler = new StripeWebhookHandler(orderService, emailOrderService);

// Security
export const security = securityService;
