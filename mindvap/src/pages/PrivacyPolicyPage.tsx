import { Shield, Eye, Lock, Users, FileText, Mail } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-background-primary min-h-screen">
      {/* Hero Section */}
      <section className="bg-brand text-white py-24">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="font-serif text-5xl md:text-6xl mb-6 text-black">
            Privacy Policy
          </h1>
          <p className="text-xl text-black leading-relaxed">
            Your privacy is important to us. Learn how we collect, use, and protect your personal information.
          </p>
        </div>
      </section>

      {/* Quick Overview */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="font-serif text-4xl text-center mb-16 text-text-primary">
            Privacy Overview
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-sm text-center">
              <Shield className="w-12 h-12 text-brand mx-auto mb-4" />
              <h3 className="font-semibold text-text-primary mb-3">Data Protection</h3>
              <p className="text-text-secondary text-sm">
                We implement industry-standard security measures to protect your personal information.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-8 shadow-sm text-center">
              <Eye className="w-12 h-12 text-brand mx-auto mb-4" />
              <h3 className="font-semibold text-text-primary mb-3">Transparency</h3>
              <p className="text-text-secondary text-sm">
                Clear information about what data we collect and how we use it for your benefit.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-8 shadow-sm text-center">
              <Users className="w-12 h-12 text-brand mx-auto mb-4" />
              <h3 className="font-semibold text-text-primary mb-3">Your Rights</h3>
              <p className="text-text-secondary text-sm">
                You have full control over your personal data and how it's processed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-20 bg-background-accent">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg p-10 shadow-sm">
            
            {/* Last Updated */}
            <div className="mb-8 p-4 bg-brand-light rounded-lg">
              <p className="text-text-primary text-sm">
                <strong>Last Updated:</strong> December 16, 2025
              </p>
              <p className="text-text-secondary text-sm mt-2">
                This Privacy Policy explains how MindVap collects, uses, and protects your personal information when you use our website and services.
              </p>
            </div>

            <div className="space-y-8">
              {/* Information We Collect */}
              <div>
                <h3 className="font-serif text-2xl text-text-primary mb-4 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-brand" />
                  Information We Collect
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">Personal Information</h4>
                    <ul className="space-y-2 text-text-secondary text-sm">
                      <li>• Name and contact information (email address, phone number)</li>
                      <li>• Shipping and billing addresses</li>
                      <li>• Payment information (processed securely through third-party providers)</li>
                      <li>• Age verification information (21+ requirement)</li>
                      <li>• Communication preferences</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">Usage Information</h4>
                    <ul className="space-y-2 text-text-secondary text-sm">
                      <li>• Website browsing behavior and preferences</li>
                      <li>• Product views and purchase history</li>
                      <li>• Device information (IP address, browser type, operating system)</li>
                      <li>• Cookies and similar tracking technologies</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* How We Use Information */}
              <div>
                <h3 className="font-serif text-2xl text-text-primary mb-4 flex items-center gap-3">
                  <Lock className="w-6 h-6 text-brand" />
                  How We Use Your Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">Primary Purposes</h4>
                    <ul className="space-y-2 text-text-secondary text-sm">
                      <li>• Process and fulfill your orders</li>
                      <li>• Provide customer service and support</li>
                      <li>• Send order confirmations and shipping updates</li>
                      <li>• Verify age eligibility (21+ requirement)</li>
                      <li>• Process payments and prevent fraud</li>
                      <li>• Comply with legal and regulatory requirements</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">Marketing Communications</h4>
                    <ul className="space-y-2 text-text-secondary text-sm">
                      <li>• Send promotional emails (only with your consent)</li>
                      <li>• Provide product recommendations</li>
                      <li>• Share educational content about herbal wellness</li>
                      <li>• Notify you about new products and special offers</li>
                    </ul>
                    <p className="text-text-secondary text-sm mt-2">
                      <strong>Note:</strong> You can unsubscribe from marketing communications at any time.
                    </p>
                  </div>
                </div>
              </div>

              {/* Information Sharing */}
              <div>
                <h3 className="font-serif text-2xl text-text-primary mb-4">
                  Information Sharing and Disclosure
                </h3>
                
                <div className="space-y-4">
                  <p className="text-text-secondary text-sm">
                    We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                  </p>
                  
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">Service Providers</h4>
                    <ul className="space-y-2 text-text-secondary text-sm">
                      <li>• Payment processors (Stripe, PayPal) for secure transactions</li>
                      <li>• Shipping carriers for order fulfillment</li>
                      <li>• Email service providers for communications</li>
                      <li>• Age verification services for compliance</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">Legal Requirements</h4>
                    <ul className="space-y-2 text-text-secondary text-sm">
                      <li>• To comply with applicable laws and regulations</li>
                      <li>• To protect our rights and safety</li>
                      <li>• To prevent fraud or illegal activities</li>
                      <li>• In response to valid legal requests</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Data Security */}
              <div>
                <h3 className="font-serif text-2xl text-text-primary mb-4">
                  Data Security
                </h3>
                
                <div className="space-y-4">
                  <p className="text-text-secondary text-sm">
                    We implement appropriate technical and organizational measures to protect your personal information:
                  </p>
                  
                  <ul className="space-y-2 text-text-secondary text-sm">
                    <li>• SSL encryption for data transmission</li>
                    <li>• Secure payment processing through certified providers</li>
                    <li>• Regular security assessments and updates</li>
                    <li>• Limited access to personal data on a need-to-know basis</li>
                    <li>• Secure data storage with backup procedures</li>
                  </ul>
                </div>
              </div>

              {/* Your Rights */}
              <div>
                <h3 className="font-serif text-2xl text-text-primary mb-4">
                  Your Rights (GDPR Compliance)
                </h3>
                
                <div className="space-y-4">
                  <p className="text-text-secondary text-sm">
                    Under the General Data Protection Regulation (GDPR), you have the following rights:
                  </p>
                  
                  <ul className="space-y-2 text-text-secondary text-sm">
                    <li>• <strong>Right to Access:</strong> Request information about what personal data we have</li>
                    <li>• <strong>Right to Rectification:</strong> Correct inaccurate or incomplete information</li>
                    <li>• <strong>Right to Erasure:</strong> Request deletion of your personal data</li>
                    <li>• <strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
                    <li>• <strong>Right to Data Portability:</strong> Receive your data in a portable format</li>
                    <li>• <strong>Right to Object:</strong> Object to certain types of data processing</li>
                    <li>• <strong>Right to Withdraw Consent:</strong> Withdraw consent for marketing communications</li>
                  </ul>
                  
                  <p className="text-text-secondary text-sm">
                    To exercise any of these rights, please contact us at privacy@mindvap.com.
                  </p>
                </div>
              </div>

              {/* Cookies */}
              <div>
                <h3 className="font-serif text-2xl text-text-primary mb-4">
                  Cookies and Tracking Technologies
                </h3>
                
                <div className="space-y-4">
                  <p className="text-text-secondary text-sm">
                    We use cookies and similar technologies to enhance your browsing experience:
                  </p>
                  
                  <ul className="space-y-2 text-text-secondary text-sm">
                    <li>• <strong>Essential Cookies:</strong> Required for website functionality</li>
                    <li>• <strong>Analytical Cookies:</strong> Help us understand website usage</li>
                    <li>• <strong>Functional Cookies:</strong> Remember your preferences</li>
                    <li>• <strong>Marketing Cookies:</strong> Provide personalized content (with consent)</li>
                  </ul>
                  
                  <p className="text-text-secondary text-sm">
                    You can control cookie settings through your browser preferences.
                  </p>
                </div>
              </div>

              {/* Data Retention */}
              <div>
                <h3 className="font-serif text-2xl text-text-primary mb-4">
                  Data Retention
                </h3>
                
                <div className="space-y-4">
                  <p className="text-text-secondary text-sm">
                    We retain your personal information only as long as necessary:
                  </p>
                  
                  <ul className="space-y-2 text-text-secondary text-sm">
                    <li>• <strong>Account Data:</strong> Until you delete your account</li>
                    <li>• <strong>Order Information:</strong> 7 years for tax and legal compliance</li>
                    <li>• <strong>Marketing Data:</strong> Until you unsubscribe or withdraw consent</li>
                    <li>• <strong>Website Analytics:</strong> 26 months maximum</li>
                  </ul>
                </div>
              </div>

              {/* International Transfers */}
              <div>
                <h3 className="font-serif text-2xl text-text-primary mb-4">
                  International Data Transfers
                </h3>
                
                <p className="text-text-secondary text-sm">
                  Your information may be transferred to and processed in countries outside the European Economic Area (EEA). We ensure adequate protection through:
                </p>
                
                <ul className="space-y-2 text-text-secondary text-sm mt-4">
                  <li>• Adequacy decisions by the European Commission</li>
                  <li>• Standard Contractual Clauses (SCCs)</li>
                  <li>• Certification schemes and codes of conduct</li>
                </ul>
              </div>

              {/* Age Restrictions */}
              <div>
                <h3 className="font-serif text-2xl text-text-primary mb-4">
                  Age Restrictions
                </h3>
                
                <p className="text-text-secondary text-sm">
                  Our services are restricted to individuals 21 years of age and older. We do not knowingly collect personal information from individuals under 21. If we become aware that we someone under 21 have collected information from, we will delete it immediately.
                </p>
              </div>

              {/* Policy Updates */}
              <div>
                <h3 className="font-serif text-2xl text-text-primary mb-4">
                  Policy Updates
                </h3>
                
                <p className="text-text-secondary text-sm">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. Your continued use of our services after any changes constitutes acceptance of the updated policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-background-primary">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="font-serif text-3xl text-text-primary mb-6">
            Questions About Your Privacy?
          </h2>
          <p className="text-text-secondary mb-8">
            Contact our Data Protection Officer if you have any questions about this Privacy Policy or how we handle your personal information.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:privacy@mindvap.com" 
              className="bg-brand text-white px-8 py-3 rounded-full font-medium hover:bg-brand-hover transition-colors flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" />
              privacy@mindvap.com
            </a>
            <a 
              href="/contact" 
              className="bg-white text-brand border border-brand px-8 py-3 rounded-full font-medium hover:bg-brand-light transition-colors"
            >
              Contact Form
            </a>
          </div>
        </div>
      </section>

      {/* Compliance Notice */}
      <section className="py-8 bg-background-accent">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-sm text-text-secondary">
            This Privacy Policy complies with the General Data Protection Regulation (GDPR) and other applicable privacy laws. 
            For residents of California, additional rights may apply under the California Consumer Privacy Act (CCPA).
          </p>
        </div>
      </section>
    </div>
  );
}