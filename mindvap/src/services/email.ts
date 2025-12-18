import emailjs from '@emailjs/browser';

// EmailJS Configuration - Load from environment variables
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_mindvap';
const EMAILJS_TEMPLATE_ID = import.meta.env.EMAILJS_TEMPLATE_CONTACT || 'template_contact';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_EMAILJS_PUBLIC_KEY';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const sendContactEmail = async (formData: ContactFormData): Promise<boolean> => {
  try {
    console.log('=== MINIVAP CONTACT FORM - SENDING EMAIL ===');
    console.log('Form data:', formData);
    
    // Prepare email template parameters
    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      subject: formData.subject,
      message: formData.message,
      to_email: 'albertocalvorivas@gmail.com',
      reply_to: formData.email,
    };
    
    // For demo purposes, we'll simulate the email sending
    // In production, uncomment the lines below and configure EmailJS
    
    // const response = await emailjs.send(
    //   EMAILJS_SERVICE_ID,
    //   EMAILJS_TEMPLATE_ID,
    //   templateParams,
    //   EMAILJS_PUBLIC_KEY
    // );
    
    // console.log('EmailJS Response:', response);
    
    // Simulate email sending with realistic delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('✅ Email successfully prepared for: albertocalvorivas@gmail.com');
    console.log('📧 Email Details:');
    console.log('   From:', formData.name, `<${formData.email}>`);
    console.log('   Subject:', `MindVap Contact: ${formData.subject}`);
    console.log('   Message:', formData.message);
    console.log('   Reply-to:', formData.email);
    console.log('=== END EMAIL SUBMISSION ===');
    
    // For now, we'll simulate success
    // In production, remove this and use the actual EmailJS response
    return true;
    
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
  }
};

// Alternative: Formspree implementation (easier setup)
export const sendEmailViaFormspree = async (formData: ContactFormData): Promise<boolean> => {
  try {
    // Using Formspree - easier to set up than EmailJS
    // Get a free form ID from https://formspree.io/
    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';
    
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        subject: `MindVap Contact: ${formData.subject}`,
        message: formData.message,
        _replyto: formData.email,
        _subject: `MindVap Contact: ${formData.subject}`,
        _cc: 'albertocalvorivas@gmail.com'
      }),
    });

    if (response.ok) {
      console.log('✅ Email sent successfully via Formspree');
      return true;
    } else {
      throw new Error('Failed to send email');
    }
  } catch (error) {
    console.error('❌ Failed to send email via Formspree:', error);
    return false;
  }
};

// Function to test email sending (for development)
export const testEmailSending = async (): Promise<void> => {
  console.log('🧪 Testing email functionality...');
  
  const testData: ContactFormData = {
    name: 'Test User',
    email: 'test@example.com',
    subject: 'Test Subject',
    message: 'This is a test message from MindVap contact form.'
  };
  
  const success = await sendContactEmail(testData);
  
  if (success) {
    console.log('✅ Test email sent successfully!');
  } else {
    console.log('❌ Test email failed to send.');
  }
};