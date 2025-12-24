import { useState } from 'react';
import { Mail, Clock, MapPin, Send } from 'lucide-react';
import { sendContactEmail, type ContactFormData } from '../../application/services/email';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Test function for development - can be called from browser console
  const testEmailFunction = async () => {
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
      alert('Test email sent successfully! Check console for details.');
    } else {
      console.log('❌ Test email failed to send.');
      alert('Test email failed. Check console for errors.');
    }
  };

  // Make test function available globally for testing
  if (typeof window !== 'undefined') {
    (window as any).testMindVapEmail = testEmailFunction;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Send email using the email service
      const success = await sendContactEmail(formData as ContactFormData);

      if (success) {
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => {
          setSubmitted(false);
        }, 5000);
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="bg-background-primary">
      {/* Hero Section */}
      <section className="bg-background-primary py-16 md:py-24 border-b border-border-light">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="font-headline text-section-header font-medium text-text-primary mb-6">
            Contact Us
          </h1>
          <p className="text-body-large text-text-secondary leading-relaxed">
            Have questions? We're here to help. Reach out to our support team.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-5 gap-12">
            {/* Contact Form */}
            <div className="md:col-span-3">
              <div className="bg-white rounded-lg p-10 shadow-sm">
                <h2 className="font-serif text-3xl mb-6 text-text-primary">
                  Send us a message
                </h2>
                {submitted ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <p className="text-green-800 font-medium mb-2">Message sent successfully!</p>
                    <p className="text-green-600 text-sm">Thank you for contacting us. We'll get back to you within 1-2 business days at albertocalvorivas@gmail.com.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-text-primary mb-2">
                        Subject
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                      >
                        <option value="">Select a subject...</option>
                        <option value="product-inquiry">Product Inquiry</option>
                        <option value="order-status">Order Status</option>
                        <option value="shipping">Shipping Question</option>
                        <option value="returns">Returns & Refunds</option>
                        <option value="safety">Safety & Usage</option>
                        <option value="wholesale">Wholesale Inquiry</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-2">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full font-semibold py-4 rounded-full transition-all flex items-center justify-center gap-2 ${isLoading
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-black hover:bg-gray-800'
                        } text-white`}
                    >
                      <Send className="w-5 h-5" />
                      {isLoading ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-light rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-brand" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary mb-2">Email</h3>
                    <p className="text-text-secondary text-sm mb-1">support@mindvap.com</p>
                    <p className="text-text-tertiary text-xs">Response within 1-2 business days</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-8 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-light rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-brand" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary mb-2">Business Hours</h3>
                    <p className="text-text-secondary text-sm mb-1">Monday - Friday</p>
                    <p className="text-text-secondary text-sm">9:00 AM - 6:00 PM EST</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-8 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-light rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-brand" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary mb-2">Location</h3>
                    <p className="text-text-secondary text-sm">
                      Spain
                    </p>
                    <p className="text-text-tertiary text-xs mt-2">
                      We ship throughout Spain and Europe (where permitted)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background-accent">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-serif text-4xl text-center mb-12 text-text-primary">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="font-semibold text-text-primary mb-3">How do I track my order?</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                You'll receive a tracking number via email once your order ships. Use this number to track your package on the carrier's website. Most orders arrive within 3-5 business days.
              </p>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="font-semibold text-text-primary mb-3">What is your return policy?</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                We offer a 30-day satisfaction guarantee on unopened products. If you're not satisfied, contact us for a full refund. Opened products cannot be returned due to safety regulations.
              </p>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="font-semibold text-text-primary mb-3">How do I choose the right product?</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Browse by category (Anxiety Relief, Sleep Support, Focus & Clarity, etc.) or consult our Education Hub for detailed herb benefits. Start with core blends if you're new to herbal vaping.
              </p>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="font-semibold text-text-primary mb-3">Do you ship to my state?</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                We ship to most US states. Some shipping restrictions may apply based on local regulations. Your shipping eligibility will be confirmed at checkout.
              </p>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="font-semibold text-text-primary mb-3">Are your products lab tested?</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Yes! Every batch undergoes third-party laboratory testing for purity, potency, and contaminants. Certificate of Analysis (COA) available via QR code on product packaging or upon request.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 bg-background-primary">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-sm text-text-secondary">
            For adults 21+ only. Not intended to diagnose, treat, cure, or prevent any disease.
          </p>
        </div>
      </section>
    </div>
  );
}
