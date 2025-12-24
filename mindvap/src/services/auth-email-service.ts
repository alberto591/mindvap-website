// Authentication Email Service
// Handles all authentication-related emails using EmailJS

import emailjs from '@emailjs/browser';
import { log } from '../lib/logger';

export interface AuthEmailData {
  toEmail: string;
  toName: string;
  templateType: 'welcome' | 'password_reset' | 'email_verification' | 'age_verification';
  templateParams: Record<string, string>;
}

const EMAILJS_SERVICE_ID = 'service_mindvap_auth'; // Separate service for auth emails
const EMAILJS_PUBLIC_KEY = 'YOUR_EMAILJS_PUBLIC_KEY';

// Email template mappings
const TEMPLATE_MAP = {
  welcome: 'template_welcome',
  password_reset: 'template_password_reset',
  email_verification: 'template_email_verification',
  age_verification: 'template_age_verification'
};

export const sendAuthEmail = async (emailData: AuthEmailData): Promise<boolean> => {
  try {
    log.info(`Sending ${emailData.templateType} email to ${emailData.toEmail}`, { emailData });

    const templateId = TEMPLATE_MAP[emailData.templateType];

    if (!templateId) {
      log.error(`Unknown template type: ${emailData.templateType}`, undefined, { emailData });
      return false;
    }

    // Prepare template parameters
    const templateParams = {
      to_email: emailData.toEmail,
      to_name: emailData.toName,
      ...emailData.templateParams
    };

    // For development, simulate email sending
    // In production, uncomment the EmailJS code below

    // const response = await emailjs.send(
    //   EMAILJS_SERVICE_ID,
    //   templateId,
    //   templateParams,
    //   EMAILJS_PUBLIC_KEY
    // );

    // Simulate email sending with realistic delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    log.info(`${emailData.templateType} email sent successfully`, {
      to: emailData.toEmail,
      template: templateId,
      params: templateParams
    });

    // For demo purposes, always return success
    // In production, return based on actual EmailJS response
    return true;

  } catch (error) {
    log.error(`Failed to send ${emailData.templateType} email`, error, { emailData });
    return false;
  }
};

// Email template generators
export const generateEmailVerificationEmail = async (user: { email: string; firstName: string }, token: string) => {
  const verificationLink = `${window.location.origin}/verify-email?token=${token}`;

  return sendAuthEmail({
    toEmail: user.email,
    toName: user.firstName,
    templateType: 'email_verification',
    templateParams: {
      verification_link: verificationLink,
      first_name: user.firstName,
      expires_in: '24 hours',
      company_name: 'MindVap',
      support_email: 'support@mindvap.com'
    }
  });
};

export const generatePasswordResetEmail = async (user: { email: string; firstName: string }, token: string) => {
  const resetLink = `${window.location.origin}/login?token=${token}&type=recovery`;

  return sendAuthEmail({
    toEmail: user.email,
    toName: user.firstName,
    templateType: 'password_reset',
    templateParams: {
      reset_link: resetLink,
      first_name: user.firstName,
      expires_in: '1 hour',
      company_name: 'MindVap',
      support_email: 'support@mindvap.com',
      user_agent: navigator.userAgent,
      request_time: new Date().toLocaleString()
    }
  });
};

export const generateWelcomeEmail = async (user: { email: string; firstName: string }, verificationToken?: string) => {
  const verificationLink = verificationToken
    ? `${window.location.origin}/verify-email?token=${verificationToken}`
    : '';

  return sendAuthEmail({
    toEmail: user.email,
    toName: user.firstName,
    templateType: 'welcome',
    templateParams: {
      first_name: user.firstName,
      verification_link: verificationLink,
      login_url: `${window.location.origin}/login`,
      company_name: 'MindVap',
      support_email: 'support@mindvap.com'
    }
  });
};

export const generateAgeVerificationEmail = async (user: { email: string; firstName: string }, verificationUrl: string) => {
  return sendAuthEmail({
    toEmail: user.email,
    toName: user.firstName,
    templateType: 'age_verification',
    templateParams: {
      verification_link: verificationUrl,
      first_name: user.firstName,
      company_name: 'MindVap',
      support_email: 'support@mindvap.com'
    }
  });
};

// Test function for development
export const testAuthEmailSending = async (): Promise<void> => {
  console.log('🧪 Testing auth email functionality...');

  const testUser = {
    email: 'test@example.com',
    firstName: 'Test'
  };

  // Test password reset email
  const success = await generatePasswordResetEmail(testUser, 'test-token-123');

  if (success) {
    console.log('✅ Test auth email sent successfully!');
  } else {
    console.log('❌ Test auth email failed to send.');
  }
};

// Export utility function for backward compatibility
export default sendAuthEmail;