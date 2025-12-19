// Enhanced Email Template Service
// Comprehensive email notification system with template management, rendering, and analytics

import emailjs from '@emailjs/browser';
import { getEnvVariable } from '../lib/envUtils';

// EmailJS Configuration - Load from environment variables
const EMAILJS_SERVICE_ID = getEnvVariable('VITE_EMAILJS_SERVICE_ID') || 'service_mindvap';
const EMAILJS_PUBLIC_KEY = getEnvVariable('VITE_EMAILJS_PUBLIC_KEY') || 'YOUR_EMAILJS_PUBLIC_KEY';

// Email Template Types
export type EmailTemplateType =
  | 'welcome'
  | 'email-verification'
  | 'password-reset'
  | 'password-changed'
  | 'order-confirmation'
  | 'order-shipped'
  | 'order-delivered'
  | 'order-cancelled'
  | 'order-refunded'
  | 'login-alert'
  | 'account-locked'
  | 'suspicious-activity'
  | 'gdpr-consent'
  | 'data-export'
  | 'account-deletion'
  | 'newsletter'
  | 'product-launch'
  | 'special-offer';

// Email Context Interface
export interface EmailContext {
  // User Information
  firstName?: string;
  lastName?: string;
  toEmail: string;
  customerName?: string;
  customerEmail?: string;

  // Company Information
  companyName: string;
  supportEmail: string;
  supportPhone: string;
  baseUrl: string;
  currentYear: string;

  // Email Specific Data
  templateType: EmailTemplateType;

  // Authentication Data
  verificationLink?: string;
  resetLink?: string;
  loginUrl?: string;
  expiresIn?: string;
  requestTime?: string;
  userAgent?: string;
  ipAddress?: string;
  changeTime?: string;
  changeMethod?: string;

  // Order Data
  orderNumber?: string;
  orderDate?: string;
  orderTime?: string;
  items?: Array<{
    name: string;
    description: string;
    quantity: number;
    price: string;
  }>;
  subtotal?: string;
  shipping?: string;
  tax?: string;
  total?: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod?: string;
  paymentStatus?: string;
  shippingMethod?: string;
  estimatedDelivery?: string;
  estimatedDeliveryDate?: string;
  deliveryTimeframe?: string;

  // Shipping Data
  trackingNumber?: string;
  carrier?: string;
  trackingUrl?: string;
  carrierTrackingUrl?: string;
  shipDate?: string;
  shipTime?: string;

  // Security Data
  deviceType?: string;
  browser?: string;
  operatingSystem?: string;
  location?: string;
  loginTime?: string;
  loginLocation?: string;

  // GDPR Data
  consentUrl?: string;
  declineUrl?: string;
  consentDeadline?: string;
  privacyPolicyUrl?: string;
  contactGdprUrl?: string;

  // URLs
  accountUrl?: string;
  orderTrackingUrl?: string;
  accountSettingsUrl?: string;
  securitySettingsUrl?: string;
  twoFactorUrl?: string;
  accountActivityUrl?: string;
  passwordChangeUrl?: string;
  confirmLoginUrl?: string;
  secureAccountUrl?: string;
  supportUrl?: string;
  supportEmailUrl?: string;
  preferencesUrl?: string;
  unsubscribeUrl?: string;

  // Newsletter/Marketing Data
  newsletterTitle?: string;
  newsletterContent?: string;
  offerCode?: string;
  discountPercentage?: string;
  productName?: string;
  productDescription?: string;

  // Additional Metadata
  [key: string]: any;
}

// Email Service Response
export interface EmailServiceResponse {
  success: boolean;
  messageId?: string;
  message?: string;
  error?: string;
  metadata?: {
    templateType: EmailTemplateType;
    recipient: string;
    sentAt: string;
    deliveryTime?: number;
  };
}

// Email Analytics Interface
export interface EmailAnalytics {
  templateType: EmailTemplateType;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
  unsubscribed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  complaintRate: number;
  unsubscribedRate: number;
  period: string;
}

class EmailTemplateService {
  private static instance: EmailTemplateService;
  private analytics: Map<EmailTemplateType, EmailAnalytics> = new Map();
  private templateCache: Map<string, string> = new Map();
  private isProduction: boolean = process.env.NODE_ENV === 'production';
  private simulationMode: boolean = getEnvVariable('EMAIL_SIMULATION_MODE') === 'true' ||
    getEnvVariable('ENABLE_REAL_EMAIL_SENDING') === 'false';

  private constructor() {
    this.initializeAnalytics();
  }

  public static getInstance(): EmailTemplateService {
    if (!EmailTemplateService.instance) {
      EmailTemplateService.instance = new EmailTemplateService();
    }
    return EmailTemplateService.instance;
  }

  /**
   * Initialize analytics data structure
   */
  private initializeAnalytics(): void {
    const templateTypes: EmailTemplateType[] = [
      'welcome', 'email-verification', 'password-reset', 'password-changed',
      'order-confirmation', 'order-shipped', 'order-delivered', 'order-cancelled', 'order-refunded',
      'login-alert', 'account-locked', 'suspicious-activity',
      'gdpr-consent', 'data-export', 'account-deletion',
      'newsletter', 'product-launch', 'special-offer'
    ];

    templateTypes.forEach(type => {
      this.analytics.set(type, {
        templateType: type,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        complained: 0,
        unsubscribed: 0,
        deliveryRate: 0,
        openRate: 0,
        clickRate: 0,
        bounceRate: 0,
        complaintRate: 0,
        unsubscribedRate: 0,
        period: 'current'
      });
    });
  }

  /**
   * Load email template from file system
   */
  private async loadTemplate(templateType: EmailTemplateType): Promise<string> {
    if (this.templateCache.has(templateType)) {
      return this.templateCache.get(templateType)!;
    }

    try {
      const templatePath = this.getTemplatePath(templateType);
      const response = await fetch(templatePath);

      if (!response.ok) {
        throw new Error(`Failed to load template: ${templateType}`);
      }

      const template = await response.text();
      this.templateCache.set(templateType, template);
      return template;
    } catch (error) {
      console.error(`Error loading template ${templateType}:`, error);
      throw new Error(`Template not found: ${templateType}`);
    }
  }

  /**
   * Get template file path based on template type
   */
  private getTemplatePath(templateType: EmailTemplateType): string {
    const templateMap: Record<EmailTemplateType, string> = {
      'welcome': '/src/email-templates/authentication/welcome.html',
      'email-verification': '/src/email-templates/authentication/email-verification.html',
      'password-reset': '/src/email-templates/authentication/password-reset.html',
      'password-changed': '/src/email-templates/authentication/password-changed.html',
      'order-confirmation': '/src/email-templates/orders/order-confirmation.html',
      'order-shipped': '/src/email-templates/orders/order-shipped.html',
      'order-delivered': '/src/email-templates/orders/order-delivered.html',
      'order-cancelled': '/src/email-templates/orders/order-cancelled.html',
      'order-refunded': '/src/email-templates/orders/order-refunded.html',
      'login-alert': '/src/email-templates/security/login-alert.html',
      'account-locked': '/src/email-templates/security/account-locked.html',
      'suspicious-activity': '/src/email-templates/security/suspicious-activity.html',
      'gdpr-consent': '/src/email-templates/compliance/gdpr-consent.html',
      'data-export': '/src/email-templates/compliance/data-export.html',
      'account-deletion': '/src/email-templates/compliance/account-deletion.html',
      'newsletter': '/src/email-templates/marketing/newsletter.html',
      'product-launch': '/src/email-templates/marketing/product-launch.html',
      'special-offer': '/src/email-templates/marketing/special-offer.html'
    };

    return templateMap[templateType];
  }

  /**
   * Get EmailJS template ID for the template type
   */
  private getEmailJSTemplateId(templateType: EmailTemplateType): string {
    const templateIdMap: Record<EmailTemplateType, string> = {
      'welcome': 'template_welcome',
      'email-verification': 'template_email_verification',
      'password-reset': 'template_password_reset',
      'password-changed': 'template_password_changed',
      'order-confirmation': 'template_order_confirmation',
      'order-shipped': 'template_order_shipped',
      'order-delivered': 'template_order_delivered',
      'order-cancelled': 'template_order_cancelled',
      'order-refunded': 'template_order_refunded',
      'login-alert': 'template_login_alert',
      'account-locked': 'template_account_locked',
      'suspicious-activity': 'template_suspicious_activity',
      'gdpr-consent': 'template_gdpr_consent',
      'data-export': 'template_data_export',
      'account-deletion': 'template_account_deletion',
      'newsletter': 'template_newsletter',
      'product-launch': 'template_product_launch',
      'special-offer': 'template_special_offer'
    };

    return templateIdMap[templateType];
  }

  /**
   * Render template with context data
   */
  private renderTemplate(template: string, context: EmailContext): string {
    let rendered = template;

    // Replace simple variables
    Object.keys(context).forEach(key => {
      const value = context[key];
      if (typeof value === 'string') {
        const regex = new RegExp(`{{${key}}}`, 'g');
        rendered = rendered.replace(regex, value);
      }
    });

    // Handle arrays (like items in order confirmation)
    rendered = this.renderArrays(rendered, context);

    // Handle conditional sections
    rendered = this.renderConditionals(rendered, context);

    return rendered;
  }

  /**
   * Render array sections in templates
   */
  private renderArrays(template: string, context: EmailContext): string {
    // Handle items array in order templates
    if (context.items && Array.isArray(context.items)) {
      const itemTemplate = this.extractArraySection(template, 'items');
      if (itemTemplate) {
        const itemsHtml = context.items
          .map(item => this.renderTemplate(itemTemplate, { ...context, ...item }))
          .join('');
        template = template.replace(/{{#each items}}[\s\S]*?{{\/each}}/g, itemsHtml);
      }
    }

    return template;
  }

  /**
   * Render conditional sections in templates
   */
  private renderConditionals(template: string, context: EmailContext): string {
    // Handle conditional blocks like {{#if ipAddress}}...{{/if}}
    const conditionalRegex = /{{#if (\w+)}}([\s\S]*?){{\/if}}/g;

    return template.replace(conditionalRegex, (match, condition, content) => {
      if (context[condition]) {
        return this.renderTemplate(content, context);
      }
      return '';
    });
  }

  /**
   * Extract array section from template
   */
  private extractArraySection(template: string, arrayName: string): string | null {
    const regex = new RegExp(`{{#each ${arrayName}}}([\\s\\S]*?){{/each}}`);
    const match = template.match(regex);
    return match ? match[1] : null;
  }

  /**
   * Generate plain text version from HTML
   */
  private generatePlainText(html: string): string {
    return html
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Send email using EmailJS
   */
  private async sendEmail(templateType: EmailTemplateType, context: EmailContext): Promise<EmailServiceResponse> {
    try {
      // Load and render template
      const template = await this.loadTemplate(templateType);
      const htmlContent = this.renderTemplate(template, context);
      const textContent = this.generatePlainText(htmlContent);

      // Prepare EmailJS parameters
      const templateParams = {
        to_email: context.toEmail,
        to_name: context.firstName || context.customerName || '',
        subject: this.getEmailSubject(templateType, context),
        html_content: htmlContent,
        text_content: textContent,
        ...this.getTemplateSpecificParams(templateType, context)
      };

      // Send email using EmailJS (or simulate in development)
      if (!this.simulationMode) {
        const response = await emailjs.send(
          EMAILJS_SERVICE_ID,
          this.getEmailJSTemplateId(templateType),
          templateParams,
          EMAILJS_PUBLIC_KEY
        );

        // Update analytics
        this.updateAnalytics(templateType, 'sent', 1);

        return {
          success: true,
          messageId: response.text,
          message: 'Email sent successfully',
          metadata: {
            templateType,
            recipient: context.toEmail,
            sentAt: new Date().toISOString()
          }
        };
      } else {
        // Simulation mode - simulate sending
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('📧 Email sent (simulated):', {
          templateType,
          to: context.toEmail,
          subject: templateParams.subject,
          htmlLength: htmlContent.length,
          textLength: textContent.length,
          mode: this.simulationMode ? 'simulation' : 'production'
        });

        // Update analytics
        this.updateAnalytics(templateType, 'sent', 1);

        return {
          success: true,
          messageId: `sim_${Date.now()}`,
          message: 'Email sent successfully (simulated)',
          metadata: {
            templateType,
            recipient: context.toEmail,
            sentAt: new Date().toISOString()
          }
        };
      }

    } catch (error) {
      console.error('Email sending failed:', error);

      // Update analytics for failed send
      this.updateAnalytics(templateType, 'bounced', 1);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          templateType,
          recipient: context.toEmail,
          sentAt: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Get email subject based on template type and context
   */
  private getEmailSubject(templateType: EmailTemplateType, context: EmailContext): string {
    const subjects: Record<EmailTemplateType, string> = {
      'welcome': `Welcome to ${context.companyName} - Your Journey Begins!`,
      'email-verification': `Verify Your Email Address - ${context.companyName}`,
      'password-reset': `Reset Your ${context.companyName} Password`,
      'password-changed': `Password Changed Successfully - ${context.companyName}`,
      'order-confirmation': `Order Confirmation #${context.orderNumber} - ${context.companyName}`,
      'order-shipped': `Your Order #${context.orderNumber} Has Shipped!`,
      'order-delivered': `Order #${context.orderNumber} Delivered - ${context.companyName}`,
      'order-cancelled': `Order #${context.orderNumber} Cancelled - ${context.companyName}`,
      'order-refunded': `Refund Processed - Order #${context.orderNumber}`,
      'login-alert': `New Login Detected - ${context.companyName} Account`,
      'account-locked': `Account Security Alert - ${context.companyName}`,
      'suspicious-activity': `Suspicious Account Activity - ${context.companyName}`,
      'gdpr-consent': `GDPR Data Processing Consent - ${context.companyName}`,
      'data-export': `Your Data Export is Ready - ${context.companyName}`,
      'account-deletion': `Account Deletion Request - ${context.companyName}`,
      'newsletter': context.newsletterTitle || `${context.companyName} Newsletter`,
      'product-launch': `New Product Launch - ${context.productName}`,
      'special-offer': `Special Offer for You - ${context.discountPercentage}% Off`
    };

    return subjects[templateType] || `${context.companyName} Notification`;
  }

  /**
   * Get template-specific parameters for EmailJS
   */
  private getTemplateSpecificParams(templateType: EmailTemplateType, context: EmailContext): Record<string, any> {
    const baseParams = {
      company_name: context.companyName,
      support_email: context.supportEmail,
      base_url: context.baseUrl,
      current_year: context.currentYear,
      unsubscribe_url: context.unsubscribeUrl || `${context.baseUrl}/unsubscribe`,
      preferences_url: context.preferencesUrl || `${context.baseUrl}/account/email-preferences`
    };

    // Add template-specific parameters
    const templateParams: Partial<Record<EmailTemplateType, Record<string, any>>> = {
      'welcome': {
        first_name: context.firstName,
        verification_link: context.verificationLink,
        expires_in: context.expiresIn || '24 hours',
        login_url: context.loginUrl
      },
      'email-verification': {
        first_name: context.firstName,
        verification_link: context.verificationLink,
        expires_in: context.expiresIn || '24 hours'
      },
      'password-reset': {
        first_name: context.firstName,
        reset_link: context.resetLink,
        expires_in: context.expiresIn || '1 hour',
        user_agent: context.userAgent,
        request_time: context.requestTime
      },
      'password-changed': {
        first_name: context.firstName,
        change_time: context.changeTime,
        change_method: context.changeMethod,
        user_agent: context.userAgent,
        ip_address: context.ipAddress
      },
      'order-confirmation': {
        customer_name: context.customerName,
        order_number: context.orderNumber,
        order_date: context.orderDate,
        order_time: context.orderTime,
        total: context.total,
        shipping_address: JSON.stringify(context.shippingAddress),
        billing_address: JSON.stringify(context.billingAddress),
        payment_method: context.paymentMethod
      },
      'order-shipped': {
        customer_name: context.customerName,
        order_number: context.orderNumber,
        tracking_number: context.trackingNumber,
        carrier: context.carrier,
        estimated_delivery: context.estimatedDeliveryDate
      },
      // Add more template-specific params as needed...
    };

    return { ...baseParams, ...(templateParams[templateType] || {}) };
  }

  /**
   * Update analytics counters
   */
  private updateAnalytics(templateType: EmailTemplateType, metric: keyof EmailAnalytics, count: number): void {
    const analytics = this.analytics.get(templateType);
    if (analytics) {
      (analytics[metric] as number) += count;

      // Recalculate rates
      if (analytics.sent > 0) {
        analytics.deliveryRate = (analytics.delivered / analytics.sent) * 100;
        analytics.openRate = (analytics.opened / analytics.sent) * 100;
        analytics.clickRate = (analytics.clicked / analytics.sent) * 100;
        analytics.bounceRate = (analytics.bounced / analytics.sent) * 100;
        analytics.complaintRate = (analytics.complained / analytics.sent) * 100;
        analytics.unsubscribedRate = (analytics.unsubscribed / analytics.sent) * 100;
      }

      this.analytics.set(templateType, analytics);
    }
  }

  /**
   * Public methods for sending specific email types
   */

  /**
   * Send welcome email
   */
  public async sendWelcomeEmail(context: Omit<EmailContext, 'templateType' | 'companyName' | 'supportEmail' | 'supportPhone' | 'baseUrl' | 'currentYear'> & { toEmail: string }): Promise<EmailServiceResponse> {
    const fullContext: EmailContext = {
      ...context,
      templateType: 'welcome',
      companyName: 'MindVap',
      supportEmail: 'support@mindvap.com',
      supportPhone: '1-800-MINDVAP',
      baseUrl: window.location.origin,
      currentYear: new Date().getFullYear().toString(),
      expiresIn: '24 hours',
      loginUrl: `${window.location.origin}/login`
    };

    return this.sendEmail('welcome', fullContext);
  }

  /**
   * Send email verification
   */
  public async sendEmailVerification(context: Omit<EmailContext, 'templateType' | 'companyName' | 'supportEmail' | 'supportPhone' | 'baseUrl' | 'currentYear'> & { toEmail: string }): Promise<EmailServiceResponse> {
    const fullContext: EmailContext = {
      ...context,
      templateType: 'email-verification',
      companyName: 'MindVap',
      supportEmail: 'support@mindvap.com',
      supportPhone: '1-800-MINDVAP',
      baseUrl: window.location.origin,
      currentYear: new Date().getFullYear().toString(),
      expiresIn: '24 hours'
    };

    return this.sendEmail('email-verification', fullContext);
  }

  /**
   * Send password reset email
   */
  public async sendPasswordReset(context: Omit<EmailContext, 'templateType' | 'companyName' | 'supportEmail' | 'supportPhone' | 'baseUrl' | 'currentYear'> & { toEmail: string }): Promise<EmailServiceResponse> {
    const fullContext: EmailContext = {
      ...context,
      templateType: 'password-reset',
      companyName: 'MindVap',
      supportEmail: 'support@mindvap.com',
      supportPhone: '1-800-MINDVAP',
      baseUrl: window.location.origin,
      currentYear: new Date().getFullYear().toString(),
      expiresIn: '1 hour',
      requestTime: new Date().toLocaleString(),
      userAgent: navigator.userAgent,
      supportEmailUrl: 'mailto:support@mindvap.com'
    };

    return this.sendEmail('password-reset', fullContext);
  }

  /**
   * Send password changed confirmation
   */
  public async sendPasswordChanged(context: Omit<EmailContext, 'templateType' | 'companyName' | 'supportEmail' | 'supportPhone' | 'baseUrl' | 'currentYear'> & { toEmail: string }): Promise<EmailServiceResponse> {
    const fullContext: EmailContext = {
      ...context,
      templateType: 'password-changed',
      companyName: 'MindVap',
      supportEmail: 'support@mindvap.com',
      supportPhone: '1-800-MINDVAP',
      baseUrl: window.location.origin,
      currentYear: new Date().getFullYear().toString(),
      changeTime: new Date().toLocaleString(),
      changeMethod: context.changeMethod || 'password_reset',
      userAgent: navigator.userAgent,
      ipAddress: context.ipAddress || 'Unknown',
      loginUrl: `${window.location.origin}/login`,
      accountSettingsUrl: `${window.location.origin}/account/settings`,
      securitySettingsUrl: `${window.location.origin}/account/security`,
      supportEmailUrl: 'mailto:support@mindvap.com'
    };

    return this.sendEmail('password-changed', fullContext);
  }

  /**
   * Send order confirmation email
   */
  public async sendOrderConfirmation(context: Omit<EmailContext, 'templateType' | 'companyName' | 'supportEmail' | 'supportPhone' | 'baseUrl' | 'currentYear'> & { toEmail: string }): Promise<EmailServiceResponse> {
    const fullContext: EmailContext = {
      ...context,
      templateType: 'order-confirmation',
      companyName: 'MindVap',
      supportEmail: 'support@mindvap.com',
      supportPhone: '1-800-MINDVAP',
      baseUrl: window.location.origin,
      currentYear: new Date().getFullYear().toString(),
      orderDate: new Date().toLocaleDateString(),
      orderTime: new Date().toLocaleTimeString(),
      orderTrackingUrl: `${window.location.origin}/account/orders/${context.orderNumber}`,
      accountUrl: `${window.location.origin}/account`,
      customerEmail: context.toEmail
    };

    return this.sendEmail('order-confirmation', fullContext);
  }

  /**
   * Send order shipped email
   */
  public async sendOrderShipped(context: Omit<EmailContext, 'templateType' | 'companyName' | 'supportEmail' | 'supportPhone' | 'baseUrl' | 'currentYear'> & { toEmail: string }): Promise<EmailServiceResponse> {
    const fullContext: EmailContext = {
      ...context,
      templateType: 'order-shipped',
      companyName: 'MindVap',
      supportEmail: 'support@mindvap.com',
      supportPhone: '1-800-MINDVAP',
      baseUrl: window.location.origin,
      currentYear: new Date().getFullYear().toString(),
      shipDate: new Date().toLocaleDateString(),
      shipTime: new Date().toLocaleTimeString(),
      carrierTrackingUrl: context.trackingUrl,
      orderTrackingUrl: `${window.location.origin}/account/orders/${context.orderNumber}`,
      supportUrl: `${window.location.origin}/contact`,
      customerEmail: context.toEmail
    };

    return this.sendEmail('order-shipped', fullContext);
  }

  /**
   * Send login alert email
   */
  public async sendLoginAlert(context: Omit<EmailContext, 'templateType' | 'companyName' | 'supportEmail' | 'supportPhone' | 'baseUrl' | 'currentYear'> & { toEmail: string }): Promise<EmailServiceResponse> {
    const fullContext: EmailContext = {
      ...context,
      templateType: 'login-alert',
      companyName: 'MindVap',
      supportEmail: 'support@mindvap.com',
      supportPhone: '1-800-MINDVAP',
      baseUrl: window.location.origin,
      currentYear: new Date().getFullYear().toString(),
      loginTime: new Date().toLocaleString(),
      loginLocation: context.location || 'Unknown Location',
      deviceType: context.deviceType || this.detectDeviceType(),
      browser: context.browser || this.detectBrowser(),
      operatingSystem: context.operatingSystem || this.detectOS(),
      ipAddress: context.ipAddress || 'Unknown',
      location: context.location || 'Unknown',
      confirmLoginUrl: `${window.location.origin}/account/security/confirm-login`,
      secureAccountUrl: `${window.location.origin}/account/security`,
      passwordChangeUrl: `${window.location.origin}/account/security/change-password`,
      twoFactorUrl: `${window.location.origin}/account/security/two-factor`,
      securitySettingsUrl: `${window.location.origin}/account/security`,
      accountActivityUrl: `${window.location.origin}/account/activity`,
      supportEmailUrl: 'mailto:security@mindvap.com'
    };

    return this.sendEmail('login-alert', fullContext);
  }

  /**
   * Send GDPR consent email
   */
  public async sendGDPRConsent(context: Omit<EmailContext, 'templateType' | 'companyName' | 'supportEmail' | 'supportPhone' | 'baseUrl' | 'currentYear'> & { toEmail: string }): Promise<EmailServiceResponse> {
    const consentDeadline = new Date();
    consentDeadline.setDate(consentDeadline.getDate() + 30); // 30 days from now

    const fullContext: EmailContext = {
      ...context,
      templateType: 'gdpr-consent',
      companyName: 'MindVap',
      supportEmail: 'support@mindvap.com',
      supportPhone: '1-800-MINDVAP',
      baseUrl: window.location.origin,
      currentYear: new Date().getFullYear().toString(),
      consentUrl: `${window.location.origin}/gdpr/consent?token=${context.verificationLink}`,
      declineUrl: `${window.location.origin}/gdpr/decline?token=${context.verificationLink}`,
      consentDeadline: consentDeadline.toLocaleDateString(),
      privacyPolicyUrl: `${window.location.origin}/privacy`,
      contactGdprUrl: 'mailto:privacy@mindvap.com'
    };

    return this.sendEmail('gdpr-consent', fullContext);
  }

  /**
   * Utility methods for device detection
   */
  private detectDeviceType(): string {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'Tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'Mobile';
    }
    return 'Desktop';
  }

  private detectBrowser(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Unknown';
  }

  private detectOS(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  /**
   * Get analytics for a specific template type
   */
  public getAnalytics(templateType?: EmailTemplateType): EmailAnalytics | Map<EmailTemplateType, EmailAnalytics> {
    if (templateType) {
      return this.analytics.get(templateType) || {
        templateType,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        complained: 0,
        unsubscribed: 0,
        deliveryRate: 0,
        openRate: 0,
        clickRate: 0,
        bounceRate: 0,
        complaintRate: 0,
        unsubscribedRate: 0,
        period: 'current'
      };
    }
    return this.analytics;
  }

  /**
   * Reset analytics data
   */
  public resetAnalytics(): void {
    this.initializeAnalytics();
  }

  /**
   * Generate email preview
   */
  public async generatePreview(templateType: EmailTemplateType, context: Partial<EmailContext>): Promise<{
    html: string;
    text: string;
    subject: string;
  }> {
    const fullContext: EmailContext = {
      ...context,
      templateType,
      companyName: 'MindVap',
      supportEmail: 'support@mindvap.com',
      supportPhone: '1-800-MINDVAP',
      baseUrl: window.location.origin,
      currentYear: new Date().getFullYear().toString()
    } as EmailContext;

    const template = await this.loadTemplate(templateType);
    const html = this.renderTemplate(template, fullContext);
    const text = this.generatePlainText(html);
    const subject = this.getEmailSubject(templateType, fullContext);

    return { html, text, subject };
  }
}

export default EmailTemplateService;