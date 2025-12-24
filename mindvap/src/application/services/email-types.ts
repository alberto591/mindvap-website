
import { EmailTemplateType } from './email-template-registry';

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
