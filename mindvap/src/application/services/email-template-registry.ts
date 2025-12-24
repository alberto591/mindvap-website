
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

export class EmailTemplateRegistry {
    private static readonly templateMap: Record<EmailTemplateType, string> = {
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

    private static readonly templateIdMap: Record<EmailTemplateType, string> = {
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

    static getTemplatePath(type: EmailTemplateType): string {
        return this.templateMap[type];
    }

    static getEmailJSTemplateId(type: EmailTemplateType): string {
        return this.templateIdMap[type];
    }

    static getAllTemplateTypes(): EmailTemplateType[] {
        return Object.keys(this.templateMap) as EmailTemplateType[];
    }
}
