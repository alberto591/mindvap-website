// Comprehensive Email Notification Service
// Integrates with authentication system and provides email triggers for all user interactions

import { EmailTemplateService, EmailContext, EmailTemplateType, EmailServiceResponse } from './email-template-service';
import { User } from '../../domain/entities/auth';
import { log } from '../../infrastructure/lib/logger';

export interface EmailNotificationConfig {
  enableWelcomeEmail: boolean;
  enableEmailVerification: boolean;
  enablePasswordReset: boolean;
  enablePasswordChangeNotification: boolean;
  enableLoginAlerts: boolean;
  enableOrderNotifications: boolean;
  enableSecurityAlerts: boolean;
  enableGDPRNotifications: boolean;
  enableMarketingEmails: boolean;
  emailFrequencyLimits: {
    passwordReset: number; // minutes between password reset emails
    loginAlert: number; // minutes between login alerts
    marketing: number; // days between marketing emails
  };
}

export interface OrderNotificationData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    description: string;
    quantity: number;
    price: string;
  }>;
  subtotal: string;
  shipping: string;
  tax: string;
  total: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  shippingMethod: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  carrier?: string;
}

export interface SecurityEventData {
  eventType: 'login' | 'failed_login' | 'password_change' | 'suspicious_activity' | 'account_lock';
  userEmail: string;
  firstName: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  deviceInfo?: {
    type: string;
    browser: string;
    os: string;
  };
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface GDPRNotificationData {
  userEmail: string;
  firstName: string;
  consentType: 'consent_request' | 'consent_withdrawn' | 'data_export' | 'account_deletion';
  consentDeadline?: Date;
  dataTypes?: string[];
  exportUrl?: string;
  deletionScheduled?: Date;
}

export class EmailNotificationService {
  private config: EmailNotificationConfig;
  private rateLimitCache: Map<string, { lastSent: number; count: number }> = new Map();

  constructor(private emailService: EmailTemplateService) {
    this.config = this.getDefaultConfig();
    this.initializeRateLimiting();
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): EmailNotificationConfig {
    return {
      enableWelcomeEmail: true,
      enableEmailVerification: true,
      enablePasswordReset: true,
      enablePasswordChangeNotification: true,
      enableLoginAlerts: true,
      enableOrderNotifications: true,
      enableSecurityAlerts: true,
      enableGDPRNotifications: true,
      enableMarketingEmails: true,
      emailFrequencyLimits: {
        passwordReset: 60, // 1 hour
        loginAlert: 30, // 30 minutes
        marketing: 7 // 7 days
      }
    };
  }

  /**
   * Initialize rate limiting cache
   */
  private initializeRateLimiting(): void {
    // Load rate limiting data from localStorage if available
    try {
      const stored = localStorage.getItem('email_rate_limits');
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([key, value]) => {
          this.rateLimitCache.set(key, value as { lastSent: number; count: number });
        });
      }
    } catch (error) {
      log.warn('Failed to load rate limiting data', { error });
    }
  }

  /**
   * Save rate limiting data to localStorage
   */
  private saveRateLimitData(): void {
    try {
      const data: Record<string, { lastSent: number; count: number }> = {};
      this.rateLimitCache.forEach((value, key) => {
        data[key] = value;
      });
      localStorage.setItem('email_rate_limits', JSON.stringify(data));
    } catch (error) {
      log.warn('Failed to save rate limiting data', { error });
    }
  }

  /**
   * Check if email can be sent based on rate limiting
   */
  private checkRateLimit(emailType: string, email: string): boolean {
    const key = `${emailType}_${email}`;
    const now = Date.now();
    const rateLimit = this.rateLimitCache.get(key);

    if (!rateLimit) {
      this.rateLimitCache.set(key, { lastSent: now, count: 1 });
      this.saveRateLimitData();
      return true;
    }

    const timeDiff = now - rateLimit.lastSent;
    const configLimit = this.getRateLimitForType(emailType);

    if (timeDiff >= configLimit * 60 * 1000) { // Convert minutes to milliseconds
      this.rateLimitCache.set(key, { lastSent: now, count: 1 });
      this.saveRateLimitData();
      return true;
    }

    return false;
  }

  /**
   * Get rate limit for email type
   */
  private getRateLimitForType(emailType: string): number {
    const limitMap: Record<string, number> = {
      'password_reset': this.config.emailFrequencyLimits.passwordReset,
      'login_alert': this.config.emailFrequencyLimits.loginAlert,
      'marketing': this.config.emailFrequencyLimits.marketing * 24 * 60 // Convert days to minutes
    };

    return limitMap[emailType] || 60; // Default 60 minutes
  }

  /**
   * Send welcome email for new user registration
   */
  public async sendWelcomeEmail(user: User, verificationToken?: string): Promise<EmailServiceResponse> {
    if (!this.config.enableWelcomeEmail) {
      return { success: false, message: 'Welcome emails are disabled' };
    }

    try {
      const verificationLink = verificationToken
        ? `${window.location.origin}/verify-email?token=${verificationToken}`
        : '';

      const response = await this.emailService.sendWelcomeEmail({
        toEmail: user.email!,
        firstName: user.firstName || 'Valued Customer',
        verificationLink,
        verificationToken,
        expiresIn: '24 hours',
        loginUrl: `${window.location.origin}/login`,
        supportEmail: 'support@mindvap.com',
        supportPhone: '1-800-MINDVAP',
        baseUrl: window.location.origin
      });

      if (response.success) {
        log.info('Welcome email sent successfully', { userEmail: user.email });
      }

      return response;
    } catch (error) {
      log.error('Failed to send welcome email', error, { userEmail: user.email });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Send email verification request
   */
  public async sendEmailVerification(user: User, verificationToken: string): Promise<EmailServiceResponse> {
    if (!this.config.enableEmailVerification) {
      return { success: false, message: 'Email verification is disabled' };
    }

    try {
      const verificationLink = `${window.location.origin}/verify-email?token=${verificationToken}`;

      const response = await this.emailService.sendEmailVerification({
        toEmail: user.email!,
        firstName: user.firstName || 'Valued Customer',
        verificationLink,
        expiresIn: '24 hours',
        supportEmail: 'support@mindvap.com',
        supportPhone: '1-800-MINDVAP',
        baseUrl: window.location.origin
      });

      if (response.success) {
        log.info('Email verification sent', { userEmail: user.email });
      }

      return response;
    } catch (error) {
      log.error('Failed to send email verification', error, { userEmail: user.email });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Send password reset email
   */
  public async sendPasswordReset(user: User, resetToken: string): Promise<EmailServiceResponse> {
    if (!this.config.enablePasswordReset) {
      return { success: false, message: 'Password reset emails are disabled' };
    }

    // Check rate limiting
    const rateLimitKey = `password_reset_${user.email}`;
    if (!this.checkRateLimit('password_reset', user.email!)) {
      return {
        success: false,
        message: 'Password reset email recently sent. Please wait before requesting another.'
      };
    }

    try {
      const resetLink = `${window.location.origin}/login?token=${resetToken}&type=recovery`;

      const response = await this.emailService.sendPasswordReset({
        toEmail: user.email!,
        firstName: user.firstName || 'Valued Customer',
        resetLink,
        expiresIn: '1 hour',
        requestTime: new Date().toLocaleString(),
        userAgent: navigator.userAgent,
        supportEmail: 'support@mindvap.com',
        supportPhone: '1-800-MINDVAP',
        baseUrl: window.location.origin
      });

      if (response.success) {
        log.info('Password reset email sent', { userEmail: user.email });
      }

      return response;
    } catch (error) {
      log.error('Failed to send password reset email', error, { userEmail: user.email });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Send password changed confirmation
   */
  public async sendPasswordChanged(user: User, changeMethod: string = 'manual'): Promise<EmailServiceResponse> {
    if (!this.config.enablePasswordChangeNotification) {
      return { success: false, message: 'Password change notifications are disabled' };
    }

    try {
      const response = await this.emailService.sendPasswordChanged({
        toEmail: user.email!,
        firstName: user.firstName || 'Valued Customer',
        changeMethod,
        ipAddress: await this.getClientIP(),
        supportEmail: 'support@mindvap.com',
        supportPhone: '1-800-MINDVAP',
        baseUrl: window.location.origin
      });

      if (response.success) {
        log.info('Password change notification sent', { userEmail: user.email });
      }

      return response;
    } catch (error) {
      log.error('Failed to send password change notification', error, { userEmail: user.email });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Send login alert for new device/location
   */
  public async sendLoginAlert(user: User, eventData: SecurityEventData): Promise<EmailServiceResponse> {
    if (!this.config.enableLoginAlerts) {
      return { success: false, message: 'Login alerts are disabled' };
    }

    // Check rate limiting for login alerts
    const rateLimitKey = `login_alert_${user.email}`;
    if (!this.checkRateLimit('login_alert', user.email!)) {
      return {
        success: false,
        message: 'Login alert recently sent. Please wait before sending another.'
      };
    }

    try {
      const response = await this.emailService.sendLoginAlert({
        toEmail: user.email!,
        firstName: user.firstName || 'Valued Customer',
        deviceType: eventData.deviceInfo?.type || this.detectDeviceType(),
        browser: eventData.deviceInfo?.browser || this.detectBrowser(),
        operatingSystem: eventData.deviceInfo?.os || this.detectOS(),
        ipAddress: eventData.ipAddress,
        location: eventData.location,
        loginTime: eventData.timestamp.toLocaleString(),
        loginLocation: eventData.location || 'Unknown Location',
        supportEmail: 'support@mindvap.com',
        supportPhone: '1-800-MINDVAP',
        baseUrl: window.location.origin
      });

      if (response.success) {
        log.info('Login alert sent', { userEmail: user.email });
      }

      return response;
    } catch (error) {
      log.error('Failed to send login alert', error, { userEmail: user.email, eventData });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Send order confirmation email
   */
  public async sendOrderConfirmation(orderData: OrderNotificationData): Promise<EmailServiceResponse> {
    if (!this.config.enableOrderNotifications) {
      return { success: false, message: 'Order notifications are disabled' };
    }

    try {
      const response = await this.emailService.sendOrderConfirmation({
        toEmail: orderData.customerEmail,
        customerName: orderData.customerName,
        orderNumber: orderData.orderNumber,
        items: orderData.items,
        subtotal: orderData.subtotal,
        shipping: orderData.shipping,
        tax: orderData.tax,
        total: orderData.total,
        shippingAddress: orderData.shippingAddress,
        billingAddress: orderData.billingAddress,
        paymentMethod: orderData.paymentMethod,
        shippingMethod: orderData.shippingMethod,
        estimatedDelivery: orderData.estimatedDelivery,
        supportEmail: 'support@mindvap.com',
        supportPhone: '1-800-MINDVAP',
        baseUrl: window.location.origin
      });

      if (response.success) {
        log.info('Order confirmation sent', { orderNumber: orderData.orderNumber });
      }

      return response;
    } catch (error) {
      log.error('Failed to send order confirmation', error, { orderNumber: orderData.orderNumber });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Send order shipped email
   */
  public async sendOrderShipped(orderData: OrderNotificationData & {
    trackingNumber: string;
    carrier: string;
    estimatedDeliveryDate: string;
    trackingUrl: string;
  }): Promise<EmailServiceResponse> {
    if (!this.config.enableOrderNotifications) {
      return { success: false, message: 'Order notifications are disabled' };
    }

    try {
      const response = await this.emailService.sendOrderShipped({
        toEmail: orderData.customerEmail,
        customerName: orderData.customerName,
        orderNumber: orderData.orderNumber,
        trackingNumber: orderData.trackingNumber,
        carrier: orderData.carrier,
        estimatedDeliveryDate: orderData.estimatedDeliveryDate,
        trackingUrl: orderData.trackingUrl,
        items: orderData.items,
        supportEmail: 'support@mindvap.com',
        supportPhone: '1-800-MINDVAP',
        baseUrl: window.location.origin
      });

      if (response.success) {
        log.info('Order shipped notification sent', { orderNumber: orderData.orderNumber });
      }

      return response;
    } catch (error) {
      log.error('Failed to send order shipped notification', error, { orderNumber: orderData.orderNumber });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Send GDPR consent request
   */
  public async sendGDPRConsent(gdprData: GDPRNotificationData): Promise<EmailServiceResponse> {
    if (!this.config.enableGDPRNotifications) {
      return { success: false, message: 'GDPR notifications are disabled' };
    }

    try {
      const response = await this.emailService.sendGDPRConsent({
        toEmail: gdprData.userEmail,
        firstName: gdprData.firstName,
        verificationLink: gdprData.exportUrl || '', // Reuse for token
        consentDeadline: gdprData.consentDeadline?.toLocaleDateString(),
        supportEmail: 'support@mindvap.com',
        supportPhone: '1-800-MINDVAP',
        baseUrl: window.location.origin
      });

      if (response.success) {
        log.info('GDPR consent request sent', { userEmail: gdprData.userEmail });
      }

      return response;
    } catch (error) {
      log.error('Failed to send GDPR consent request', error, { userEmail: gdprData.userEmail });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Send newsletter email (simplified for bulk sending)
   */
  private async sendNewsletterEmail(recipient: any, content: any): Promise<EmailServiceResponse> {
    // Use welcome email template as base for newsletter
    return this.emailService.sendWelcomeEmail({
      toEmail: recipient.email,
      firstName: recipient.firstName || 'Valued Customer',
      verificationLink: content.newsletterUrl || '',
      expiresIn: '',
      loginUrl: content.loginUrl || `${window.location.origin}/login`,
      supportEmail: 'support@mindvap.com',
      supportPhone: '1-800-MINDVAP',
      baseUrl: window.location.origin
    });
  }

  /**
   * Send product launch email (simplified for bulk sending)
   */
  private async sendProductLaunchEmail(recipient: any, content: any): Promise<EmailServiceResponse> {
    return this.emailService.sendWelcomeEmail({
      toEmail: recipient.email,
      firstName: recipient.firstName || 'Valued Customer',
      verificationLink: content.productUrl || '',
      expiresIn: '',
      loginUrl: content.loginUrl || `${window.location.origin}/login`,
      supportEmail: 'support@mindvap.com',
      supportPhone: '1-800-MINDVAP',
      baseUrl: window.location.origin
    });
  }

  /**
   * Send special offer email (simplified for bulk sending)
   */
  private async sendSpecialOfferEmail(recipient: any, content: any): Promise<EmailServiceResponse> {
    return this.emailService.sendWelcomeEmail({
      toEmail: recipient.email,
      firstName: recipient.firstName || 'Valued Customer',
      verificationLink: content.offerUrl || '',
      expiresIn: '',
      loginUrl: content.loginUrl || `${window.location.origin}/login`,
      supportEmail: 'support@mindvap.com',
      supportPhone: '1-800-MINDVAP',
      baseUrl: window.location.origin
    });
  }

  /**
   * Send bulk marketing email
   */
  public async sendBulkEmail(
    templateType: EmailTemplateType,
    recipients: Array<{ email: string; firstName?: string;[key: string]: any }>,
    subject: string,
    content: any
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    if (!this.config.enableMarketingEmails) {
      return { success: 0, failed: recipients.length, errors: ['Marketing emails are disabled'] };
    }

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const recipient of recipients) {
      try {
        // Check rate limiting for marketing emails
        const rateLimitKey = `marketing_${recipient.email}`;
        if (!this.checkRateLimit('marketing', recipient.email)) {
          failed++;
          errors.push(`Rate limited for ${recipient.email}`);
          continue;
        }

        // Send email using appropriate method
        let response: EmailServiceResponse;

        switch (templateType) {
          case 'newsletter':
            response = await this.sendNewsletterEmail(recipient, content);
            break;
          case 'product-launch':
            response = await this.sendProductLaunchEmail(recipient, content);
            break;
          case 'special-offer':
            response = await this.sendSpecialOfferEmail(recipient, content);
            break;
          default:
            // Fallback - use welcome email method as base
            response = await this.emailService.sendWelcomeEmail({
              toEmail: recipient.email,
              firstName: recipient.firstName || 'Valued Customer',
              ...content
            });
        }

        if (response.success) {
          success++;
        } else {
          failed++;
          errors.push(`${recipient.email}: ${response.error}`);
        }

        // Add delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        failed++;
        errors.push(`${recipient.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    log.info(`Bulk email completed: ${success} sent, ${failed} failed`);
    return { success, failed, errors };
  }

  /**
   * Integration hooks for authentication events
   */

  /**
   * Handle user registration completion
   */
  public async onUserRegistered(user: User): Promise<void> {
    try {
      // Send welcome email
      await this.sendWelcomeEmail(user);

      // Send email verification if required
      if (!user.emailVerified) {
        const verificationToken = this.generateVerificationToken();
        await this.sendEmailVerification(user, verificationToken);
      }

      // Send GDPR consent if applicable
      if (this.shouldSendGDPRConsent(user)) {
        await this.sendGDPRConsent({
          userEmail: user.email!,
          firstName: user.firstName || 'Valued Customer',
          consentType: 'consent_request',
          consentDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        });
      }

    } catch (error) {
      log.error('Error handling user registration', error, { userEmail: user.email });
    }
  }

  /**
   * Handle successful login
   */
  public async onUserLoggedIn(user: User, deviceInfo: any): Promise<void> {
    try {
      // Determine if this is a new device/location
      const isNewDevice = this.isNewDevice(deviceInfo);
      const isNewLocation = this.isNewLocation(deviceInfo);

      if (isNewDevice || isNewLocation) {
        const eventData: SecurityEventData = {
          eventType: 'login',
          userEmail: user.email!,
          firstName: user.firstName || 'Valued Customer',
          ipAddress: await this.getClientIP(),
          userAgent: navigator.userAgent,
          location: await this.getLocation(),
          deviceInfo: {
            type: this.detectDeviceType(),
            browser: this.detectBrowser(),
            os: this.detectOS()
          },
          timestamp: new Date(),
          metadata: { isNewDevice, isNewLocation }
        };

        await this.sendLoginAlert(user, eventData);
      }

    } catch (error) {
      log.error('Error handling user login', error, { userEmail: user.email });
    }
  }

  /**
   * Handle password change
   */
  public async onPasswordChanged(user: User, changeMethod: string = 'manual'): Promise<void> {
    try {
      await this.sendPasswordChanged(user, changeMethod);
    } catch (error) {
      log.error('Error handling password change', error, { userEmail: user.email });
    }
  }

  /**
   * Handle order creation
   */
  public async onOrderCreated(orderData: OrderNotificationData): Promise<void> {
    try {
      await this.sendOrderConfirmation(orderData);
    } catch (error) {
      log.error('Error handling order creation', error, { orderNumber: orderData.orderNumber });
    }
  }

  /**
   * Handle order shipped
   */
  public async onOrderShipped(orderData: OrderNotificationData & {
    trackingNumber: string;
    carrier: string;
    estimatedDeliveryDate: string;
    trackingUrl: string;
  }): Promise<void> {
    try {
      await this.sendOrderShipped(orderData);
    } catch (error) {
      log.error('Error handling order shipped', error, { orderNumber: orderData.orderNumber });
    }
  }

  /**
   * Utility methods
   */

  /**
   * Generate verification token
   */
  private generateVerificationToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Check if GDPR consent should be sent
   */
  private shouldSendGDPRConsent(user: User): boolean {
    // Check if user is in EU or if GDPR applies
    const gdprCountries = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'];
    // This is a simplified check - in reality you'd check the user's location
    return true; // Always send for demo purposes
  }

  /**
   * Check if device is new
   */
  private isNewDevice(deviceInfo: any): boolean {
    // Simple implementation - in reality you'd store device fingerprints
    const storedDevices = localStorage.getItem('known_devices') || '[]';
    const knownDevices = JSON.parse(storedDevices);
    const deviceFingerprint = this.generateDeviceFingerprint(deviceInfo);

    return !knownDevices.includes(deviceFingerprint);
  }

  /**
   * Check if location is new
   */
  private isNewLocation(deviceInfo: any): boolean {
    // Simple implementation - in reality you'd track IP/location history
    return Math.random() > 0.7; // 30% chance for demo
  }

  /**
   * Generate device fingerprint
   */
  private generateDeviceFingerprint(deviceInfo: any): string {
    const data = `${navigator.userAgent}_${navigator.platform}_${screen.width}x${screen.height}`;
    return btoa(data).slice(0, 16);
  }

  /**
   * Get client IP (placeholder - would need backend)
   */
  private async getClientIP(): Promise<string> {
    // In a real implementation, this would come from the server
    return '192.168.1.1';
  }

  /**
   * Get location (placeholder - would need geolocation API)
   */
  private async getLocation(): Promise<string> {
    // In a real implementation, this would use geolocation or IP geolocation
    return 'Unknown Location';
  }

  /**
   * Device detection utilities
   */
  private detectDeviceType(): string {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'Tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) return 'Mobile';
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
   * Configuration management
   */
  public updateConfig(newConfig: Partial<EmailNotificationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): EmailNotificationConfig {
    return { ...this.config };
  }

  /**
   * Analytics and reporting
   */
  public getEmailAnalytics(templateType?: EmailTemplateType) {
    return this.emailService.getAnalytics(templateType);
  }

  public resetAnalytics(): void {
    this.emailService.resetAnalytics();
  }

  /**
   * Generate email preview
   */
  public async generateEmailPreview(templateType: EmailTemplateType, context: Partial<EmailContext>) {
    return this.emailService.generatePreview(templateType, context);
  }
}

export default EmailNotificationService;