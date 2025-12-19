# Comprehensive EmailJS Setup Guide for MindVap

## 🎯 Overview

This guide provides complete setup instructions for the MindVap email notification system using EmailJS. The system includes:

- **18+ Email Templates** for authentication, orders, security, compliance, and marketing
- **Automated Email Triggers** for user registration, login, password reset, orders, etc.
- **GDPR Compliance** features with consent management
- **Email Analytics** and delivery tracking
- **Rate Limiting** and anti-spam protection
- **Bulk Email Capabilities** for marketing campaigns

## 🚀 Quick Setup (15 minutes)

### Step 1: Create EmailJS Account
1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Free tier includes 200 emails/month (sufficient for development/testing)
4. For production, consider paid plans starting at $15/month for 1,000 emails

### Step 2: Add Email Service
1. In EmailJS Dashboard, go to **"Email Services"**
2. Click **"Add New Service"**
3. Choose your email provider:
   - **Gmail** (easiest setup)
   - **Outlook/Hotmail**
   - **Yahoo Mail**
   - **Custom SMTP** (for business emails)
4. Follow authentication steps
5. **Save the Service ID** (e.g., `service_mindvap`)

### Step 3: Create Email Templates

You need to create 18 different email templates. Here's the complete list:

#### Authentication Templates
1. **Welcome Email** (`template_welcome`)
   - Subject: `Welcome to {{company_name}} - Your Journey Begins!`
   - Use the template from `/src/email-templates/authentication/welcome.html`

2. **Email Verification** (`template_email_verification`)
   - Subject: `Verify Your Email Address - {{company_name}}`
   - Use the template from `/src/email-templates/authentication/email-verification.html`

3. **Password Reset** (`template_password_reset`)
   - Subject: `Reset Your {{company_name}} Password`
   - Use the template from `/src/email-templates/authentication/password-reset.html`

4. **Password Changed** (`template_password_changed`)
   - Subject: `Password Changed Successfully - {{company_name}}`
   - Use the template from `/src/email-templates/authentication/password-changed.html`

#### Order Templates
5. **Order Confirmation** (`template_order_confirmation`)
   - Subject: `Order Confirmation #{{order_number}} - {{company_name}}`
   - Use the template from `/src/email-templates/orders/order-confirmation.html`

6. **Order Shipped** (`template_order_shipped`)
   - Subject: `Your Order #{{order_number}} Has Shipped!`
   - Use the template from `/src/email-templates/orders/order-shipped.html`

7. **Order Delivered** (`template_order_delivered`)
   - Subject: `Order #{{order_number}} Delivered - {{company_name}}`
   - Create template based on order confirmation structure

8. **Order Cancelled** (`template_order_cancelled`)
   - Subject: `Order #{{order_number}} Cancelled - {{company_name}}`
   - Create template based on order confirmation structure

9. **Order Refunded** (`template_order_refunded`)
   - Subject: `Refund Processed - Order #{{order_number}}`
   - Create template based on order confirmation structure

#### Security Templates
10. **Login Alert** (`template_login_alert`)
    - Subject: `New Login Detected - {{company_name}} Account`
    - Use the template from `/src/email-templates/security/login-alert.html`

11. **Account Locked** (`template_account_locked`)
    - Subject: `Account Security Alert - {{company_name}}`
    - Create template based on login alert structure

12. **Suspicious Activity** (`template_suspicious_activity`)
    - Subject: `Suspicious Account Activity - {{company_name}}`
    - Create template based on login alert structure

#### Compliance Templates
13. **GDPR Consent** (`template_gdpr_consent`)
    - Subject: `GDPR Data Processing Consent - {{company_name}}`
    - Use the template from `/src/email-templates/compliance/gdpr-consent.html`

14. **Data Export** (`template_data_export`)
    - Subject: `Your Data Export is Ready - {{company_name}}`
    - Create template based on GDPR consent structure

15. **Account Deletion** (`template_account_deletion`)
    - Subject: `Account Deletion Request - {{company_name}}`
    - Create template based on GDPR consent structure

#### Marketing Templates
16. **Newsletter** (`template_newsletter`)
    - Subject: `{{company_name}} Newsletter`
    - Create template based on welcome email structure

17. **Product Launch** (`template_product_launch`)
    - Subject: `New Product Launch - {{product_name}}`
    - Create template based on welcome email structure

18. **Special Offer** (`template_special_offer`)
    - Subject: `Special Offer for You - {{discount_percentage}}% Off`
    - Create template based on welcome email structure

### Step 4: Configure Template Variables

Each template uses these common variables:
- `{{company_name}}` = "MindVap"
- `{{support_email}}` = "support@mindvap.com"
- `{{support_phone}}` = "1-800-MINDVAP"
- `{{base_url}}` = Your website URL
- `{{current_year}}` = Current year
- `{{unsubscribe_url}}` = Unsubscribe link
- `{{preferences_url}}` = Email preferences link

### Step 5: Get Public Key
1. Go to **"Account"** → **"General"**
2. Copy your **Public Key**
3. It looks like: `user_xxxxxxxxxxxx`

### Step 6: Update Configuration Files

#### Update Email Template Service
Edit `/src/services/emailTemplateService.ts`:

```typescript
const EMAILJS_SERVICE_ID = 'service_mindvap'; // Your actual Service ID
const EMAILJS_PUBLIC_KEY = 'YOUR_EMAILJS_PUBLIC_KEY'; // Your actual Public Key
```

#### Update EmailJS Service
Edit `/src/services/email.ts`:

```typescript
const EMAILJS_SERVICE_ID = 'service_mindvap'; // Your actual Service ID
const EMAILJS_TEMPLATE_ID = 'template_contact'; // Contact form template ID
const EMAILJS_PUBLIC_KEY = 'YOUR_EMAILJS_PUBLIC_KEY'; // Your actual Public Key
```

### Step 7: Enable Real Email Sending

In development, emails are simulated. To enable real sending:

1. **For Development**: Keep simulation mode for testing
2. **For Production**: Uncomment the EmailJS sending code in the services

#### Enable in EmailTemplateService.ts
```typescript
// In the sendEmail method, uncomment this section:
if (this.isProduction) {
  const response = await emailjs.send(
    EMAILJS_SERVICE_ID,
    this.getEmailJSTemplateId(templateType),
    templateParams,
    EMAILJS_PUBLIC_KEY
  );
  // ... rest of production code
}
```

#### Enable in email.ts
```typescript
// Uncomment these lines:
const response = await emailjs.send(
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID,
  templateParams,
  EMAILJS_PUBLIC_KEY
);
```

## 🧪 Testing

### Test Individual Email Types

```typescript
import EmailNotificationService from './services/emailNotificationService';

const emailService = EmailNotificationService.getInstance();

// Test welcome email
await emailService.sendWelcomeEmail({
  email: 'test@example.com',
  firstName: 'Test'
});

// Test password reset
await emailService.sendPasswordReset(user, resetToken);

// Test order confirmation
await emailService.sendOrderConfirmation(orderData);

// Test GDPR consent
await emailService.sendGDPRConsent(gdprData);
```

### Generate Email Previews

```typescript
// Preview any email template
const preview = await emailService.generateEmailPreview('welcome', {
  firstName: 'John',
  toEmail: 'john@example.com'
});

console.log('HTML:', preview.html);
console.log('Subject:', preview.subject);
```

### View Analytics

```typescript
// Get email analytics
const analytics = emailService.getEmailAnalytics('welcome');
console.log('Welcome email stats:', analytics);

// Get all analytics
const allAnalytics = emailService.getEmailAnalytics();
console.log('All email stats:', allAnalytics);
```

## 🔧 Advanced Configuration

### Rate Limiting Settings

Edit `/src/services/emailNotificationService.ts`:

```typescript
private getDefaultConfig(): EmailNotificationConfig {
  return {
    // Enable/disable email types
    enableWelcomeEmail: true,
    enableEmailVerification: true,
    enablePasswordReset: true,
    enableLoginAlerts: true,
    enableOrderNotifications: true,
    enableSecurityAlerts: true,
    enableGDPRNotifications: true,
    enableMarketingEmails: true,
    
    // Rate limiting (minutes)
    emailFrequencyLimits: {
      passwordReset: 60,    // 1 hour between password reset emails
      loginAlert: 30,       // 30 minutes between login alerts
      marketing: 7          // 7 days between marketing emails
    }
  };
}
```

### Custom Email Triggers

The system automatically triggers emails for these events:

```typescript
// User Registration
await emailService.onUserRegistered(user);

// User Login
await emailService.onUserLoggedIn(user, deviceInfo);

// Password Change
await emailService.onPasswordChanged(user, 'manual');

// Order Creation
await emailService.onOrderCreated(orderData);

// Order Shipped
await emailService.onOrderShipped(orderDataWithTracking);
```

### Bulk Email Campaigns

```typescript
// Send bulk marketing emails
const result = await emailService.sendBulkEmail(
  'newsletter',
  [
    { email: 'user1@example.com', firstName: 'John' },
    { email: 'user2@example.com', firstName: 'Jane' }
  ],
  'Monthly Newsletter',
  {
    newsletterTitle: 'November Newsletter',
    newsletterContent: 'Your content here...',
    loginUrl: 'https://yoursite.com/login'
  }
);

console.log(`Sent: ${result.success}, Failed: ${result.failed}`);
```

## 🛡️ Security & GDPR Compliance

### GDPR Features
- **Consent Management**: Automatic consent requests for EU users
- **Data Export**: Email notifications for data export requests
- **Account Deletion**: Confirmation emails for account deletion
- **Unsubscribe Links**: All emails include unsubscribe options
- **Privacy Links**: Links to privacy policy and terms of service

### Security Features
- **Rate Limiting**: Prevents email abuse
- **Device Tracking**: Login alerts for new devices/locations
- **Secure Tokens**: All sensitive links use secure tokens
- **Email Validation**: Prevents sending to invalid addresses

### SPF/DKIM Setup (Recommended for Production)

For better deliverability, set up these DNS records:

```
# SPF Record
TXT @ v=spf1 include:emailjs.com ~all

# DKIM (get from EmailJS dashboard)
TXT emailjs._domainkey v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY
```

## 📊 Email Analytics & Monitoring

### Built-in Analytics
The system tracks:
- **Delivery Rate**: Percentage of emails successfully delivered
- **Open Rate**: Percentage of emails opened by recipients
- **Click Rate**: Percentage of links clicked
- **Bounce Rate**: Percentage of emails that bounced
- **Complaint Rate**: Spam complaint rate
- **Unsubscribe Rate**: Unsubscribe rate

### Email Queue Management
- **Rate Limiting**: Automatic rate limiting to prevent spam
- **Retry Logic**: Failed emails are automatically retried
- **Delivery Tracking**: Real-time delivery status updates

## 🚀 Production Deployment

### Environment Variables
Set these in your production environment:

```bash
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=service_mindvap
VITE_EMAILJS_PUBLIC_KEY=your_production_public_key

# Email Settings
VITE_EMAIL_FROM_NAME=MindVap
VITE_EMAIL_FROM_ADDRESS=noreply@mindvap.com
VITE_SUPPORT_EMAIL=support@mindvap.com
```

### Production Checklist
- [ ] Create all 18 email templates in EmailJS dashboard
- [ ] Configure production EmailJS service and public key
- [ ] Set up SPF/DKIM records for better deliverability
- [ ] Test all email types with real email addresses
- [ ] Configure rate limiting for production volume
- [ ] Set up email analytics monitoring
- [ ] Enable real email sending (remove simulation)
- [ ] Test GDPR compliance features
- [ ] Configure backup email service for redundancy

## 🔍 Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check EmailJS credentials
   - Verify template IDs match
   - Check browser console for errors
   - Ensure production mode is enabled

2. **Templates not rendering**
   - Check template file paths
   - Verify template variables match
   - Check template syntax

3. **Rate limiting issues**
   - Check rate limit configuration
   - Clear localStorage rate limit data
   - Adjust frequency limits as needed

4. **Delivery problems**
   - Check spam folders
   - Verify recipient email addresses
   - Set up SPF/DKIM records
   - Check EmailJS service status

### Debug Mode
Enable debug logging:

```typescript
// In development, add this to see detailed logs
localStorage.setItem('email_debug', 'true');
```

### Reset Email System
To reset all email data and settings:

```typescript
// Clear rate limiting cache
localStorage.removeItem('email_rate_limits');

// Reset analytics
emailService.resetAnalytics();

// Clear template cache (reload page)
location.reload();
```

## 📞 Support

### EmailJS Support
- **Documentation**: [EmailJS Docs](https://www.emailjs.com/docs/)
- **Support**: support@emailjs.com
- **Community**: [EmailJS Community](https://github.com/emailjs-com/emailjs)

### MindVap Email System Support
- **Email**: support@mindvap.com
- **Documentation**: This file and code comments
- **Issues**: Check browser console and network tab

## 🎉 You're Ready!

Once setup is complete, your MindVap website will have:

✅ **Professional email notifications** for all user interactions
✅ **Automated email triggers** for authentication and orders
✅ **GDPR compliance** features built-in
✅ **Email analytics** and delivery tracking
✅ **Rate limiting** and spam protection
✅ **Bulk email capabilities** for marketing
✅ **Security alerts** for account protection
✅ **Order notifications** for customer updates

Your users will receive beautiful, branded emails that enhance their experience and keep them engaged with your MindVap platform!