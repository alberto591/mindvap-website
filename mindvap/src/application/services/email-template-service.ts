
import emailjs from '@emailjs/browser';
import { getEnvVariable } from '../../infrastructure/lib/env-utils';
import { EmailTemplateType, EmailTemplateRegistry } from './email-template-registry';
import { EmailContext, EmailServiceResponse, EmailAnalytics } from './email-types';
import { EmailRenderer } from './email-renderer';
import { EmailAnalyticsService } from './email-analytics-service';
import { DeviceDetectorService } from './device-detector-service';

// EmailJS Configuration - Load from environment variables
const EMAILJS_SERVICE_ID = getEnvVariable('VITE_EMAILJS_SERVICE_ID') || 'service_mindvap';
const EMAILJS_PUBLIC_KEY = getEnvVariable('VITE_EMAILJS_PUBLIC_KEY') || 'YOUR_EMAILJS_PUBLIC_KEY';

export class EmailTemplateService {
  private analyticsService: EmailAnalyticsService;
  private deviceDetector: DeviceDetectorService;
  private templateCache: Map<string, string> = new Map();
  private simulationMode: boolean = getEnvVariable('EMAIL_SIMULATION_MODE') === 'true' ||
    getEnvVariable('ENABLE_REAL_EMAIL_SENDING') === 'false';

  public constructor() {
    this.analyticsService = new EmailAnalyticsService();
    this.deviceDetector = new DeviceDetectorService();
  }

  /**
   * Load email template from file system or cache
   */
  private async loadTemplate(templateType: EmailTemplateType): Promise<string> {
    if (this.templateCache.has(templateType)) {
      return this.templateCache.get(templateType)!;
    }

    try {
      const templatePath = EmailTemplateRegistry.getTemplatePath(templateType);
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
   * Send email using EmailJS
   */
  public async sendEmail(templateType: EmailTemplateType, context: EmailContext): Promise<EmailServiceResponse> {
    try {
      // Load and render template
      const template = await this.loadTemplate(templateType);
      const htmlContent = EmailRenderer.renderTemplate(template, context);
      const textContent = EmailRenderer.generatePlainText(htmlContent);

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
          EmailTemplateRegistry.getEmailJSTemplateId(templateType),
          templateParams,
          EMAILJS_PUBLIC_KEY
        );

        // Update analytics
        this.analyticsService.updateAnalytics(templateType, 'sent');

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
          mode: 'simulation'
        });

        // Update analytics
        this.analyticsService.updateAnalytics(templateType, 'sent');

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
      this.analyticsService.updateAnalytics(templateType, 'bounced');

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
    };

    return { ...baseParams, ...(templateParams[templateType] || {}) };
  }

  /**
   * Public methods for sending specific email types
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
      deviceType: context.deviceType || this.deviceDetector.detectDeviceType(),
      browser: context.browser || this.deviceDetector.detectBrowser(),
      operatingSystem: context.operatingSystem || this.deviceDetector.detectOS(),
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

  public async sendGDPRConsent(context: Omit<EmailContext, 'templateType' | 'companyName' | 'supportEmail' | 'supportPhone' | 'baseUrl' | 'currentYear'> & { toEmail: string }): Promise<EmailServiceResponse> {
    const consentDeadline = new Date();
    consentDeadline.setDate(consentDeadline.getDate() + 30);

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

  public getAnalytics(templateType?: EmailTemplateType): EmailAnalytics | EmailAnalytics[] {
    return this.analyticsService.getAnalytics(templateType);
  }

  public resetAnalytics(): void {
    this.analyticsService.resetAnalytics();
  }

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
    const html = EmailRenderer.renderTemplate(template, fullContext);
    const text = EmailRenderer.generatePlainText(html);
    const subject = this.getEmailSubject(templateType, fullContext);

    return { html, text, subject };
  }
}

export default EmailTemplateService;