import { Scale, AlertTriangle, FileText, Shield, Gavel, Users } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="bg-background-primary min-h-screen">
      {/* Hero Section */}
      <section className="bg-brand text-white py-24">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="font-serif text-5xl md:text-6xl mb-6 text-black">
            Terms of Service
          </h1>
          <p className="text-xl text-black leading-relaxed">
            Please read these terms carefully before using our website and purchasing our products.
          </p>
        </div>
      </section>

      {/* Quick Overview */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="font-serif text-4xl text-center mb-16 text-text-primary">
            Terms Overview
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-sm text-center">
              <Scale className="w-12 h-12 text-brand mx-auto mb-4" />
              <h3 className="font-semibold text-text-primary mb-3">Legal Agreement</h3>
              <p className="text-text-secondary text-sm">
                These terms constitute a legally binding agreement between you and MindVap.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-8 shadow-sm text-center">
              <Shield className="w-12 h-12 text-brand mx-auto mb-4" />
              <h3 className="font-semibold text-text-primary mb-3">Age Requirement</h3>
              <p className="text-text-secondary text-sm">
                You must be 21 years or older to use our services and purchase our products.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-8 shadow-sm text-center">
              <AlertTriangle className="w-12 h-12 text-brand mx-auto mb-4" />
              <h3 className="font-semibold text-text-primary mb-3">Health Disclaimer</h3>
              <p className="text-text-secondary text-sm">
                Our products have not been evaluated by the FDA and are not intended to diagnose, treat, cure, or prevent any disease.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Terms of Service Content */}
      <section className="py-20 bg-background-accent">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg p-10 shadow-sm">
            
            {/* Last Updated */}
            <div className="mb-8 p-4 bg-brand-light rounded-lg">
              <p className="text-text-primary text-sm">
                <strong>Last Updated:</strong> December 16, 2025
              </p>
              <p className="text-text-secondary text-sm mt-2">
                These Terms of Service ("Terms") govern your use of the MindVap website and the purchase of our products.
              </p>
            </div>

            <div className="space-y-8">
              {/* Acceptance of Terms */}
              <div>
                <h3 className="font-serif text-2xl text-text-primary mb-4 flex items-center gap-3">
                  <Gavel className="w-6 h-6 text-brand" />
                  1. Acceptance of Terms
                </h3>
                
                <div className="space-y-4">
                  <p className="text-text-secondary text-sm">
                    By accessing and using this website, creating an account, or making a purchase, you accept and agree to be bound by the terms and provision of this agreement.
                  </p>
                  
                  <p className="text-text-secondary text-sm">
                    If you do not agree to abide by the above, please do not use this service. These Terms apply to all visitors, users, and others who access or use the service.
                  </p>
                </div>
              </div>

              {/* Age Requirement */}
              <div>
                <h3 className="font-serif text-2xl text-text-primary mb-4">
                  2. Age Requirement and Eligibility
                </h3>
                
                <div className="space-y-4">
                  <p className="text-text-secondary text-sm">
                    <strong>You must be at least 21 years old</strong> to use this website and purchase our products. By using our service, you represent and warrant that:
                  </p>
                  
                  <ul className="space-y-2 text-text-secondary text-sm">
                    <li>• You are at least 21 years of age</li>
                    <li>• You have the legal authority to enter into this agreement</li>
                    <li>• Your use of the service is in compliance with all applicable laws</li>
                    <li>• You will provide accurate and complete information</li>
                  </ul>
                  
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <p className="text-text-primary text-sm">
                      <strong>Age Verification:</strong> We reserve the right to request age verification at any time. Failure to provide satisfactory age verification may result in suspension or termination of your account.
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Information */}
              <div>
                <h3 className="font-serif text-2xl text-text-primary mb-4">
                  3. Product Information and Disclaimers
                </h3>
                
                <div className="space-y-4">
                  <p className="text-text-secondary text-sm">
                    Our products are herbal vaping blends intended for adults 21+ as part of a wellness routine. All product information is provided for educational purposes only.
                  </p>
                  
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">Health and Safety Disclaimers</h4>
                    <ul className="space-y-2 text-text-secondary text-sm">
                      <li>• These statements have not been evaluated by the Food and Drug Administration</li>
                      <li>• Our products are not intended to diagnose, treat, cure, or prevent any disease</li>
                      <li>• Products are intended for adults 21+ only</li>
                      <li>• Not for use during pregnancy or nursing</li>
                      <li>• Consult a healthcare provider before use if you have medical conditions or take medications</li>
                      <li>• Do not operate vehicles or machinery after use</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">Product Representations</h4>
                    <p className="text-text-secondary text-sm">
                      While we strive for accuracy, we do not warrant that product descriptions, pricing, or other content on the website is accurate, complete, reliable, current, or error-free. We reserve the right to correct any errors and to change or update information at any time without prior notice.
                    </p>
                  </div>
                </div>
              </div>

              {/* Orders and Payment */}
              <div>
                <h3 className="font-serif text-2xl text-text-primary mb-4">
                  4. Orders, Payment, and Pricing
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">Order Acceptance</h4>
                    <p className="text-text-secondary text-sm">
                      All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason, including but not limited to limitations on quantities, inaccuracies in product information, or suspected fraudulent activity.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">Payment Terms</h4>
                    <ul className="space-y-2 text-text-secondary text-sm">
                      <li>• Payment is due at the time of order placement</li>
                      <li>• We accept major credit cards and other approved payment methods</li>
                      <li>• All prices are displayed in EUR and include applicable taxes</li>
                      <li>• We reserve the right to change prices without prior notice</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">Taxes</h4>
                    <p className="text-text-secondary text-sm">
                      You are responsible for all taxes, duties, and customs fees associated with your order. These costs are not included in the product price unless specifically stated.
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping and Delivery */}
              <div>
                <h3 className="font-serif text-2xl text-text-primary mb-4">
                  5. Shipping and Delivery
                </h3>
                
                <div className="space-y-4">
                  <p className="text-text-secondary text-sm">
                    Shipping terms and conditions are detailed in our Shipping & Returns policy. Key points include:
                  </p>
                  
                  <ul className="space-y-2 text-text-secondary text-sm">
                    <li>• Shipping costs are calculated at checkout</li>
                    <li>• Risk of loss passes to you upon delivery to the shipping address</li>
                    <li>• We are not responsible for delays caused by shipping carriers</li>
                    <li>• International orders may be subject to customs procedures</li>
                    <li>• Signature confirmation required for orders over €100</li>
                  </ul>
                </div>
              </div>

              {/* Returns and Refunds */}
              <div>
                <h3 className="font-serif text-2xl text-text-primary mb-4">
                  6. Returns and Refunds
                </h3>
                
                <div className="space-y-4">
                  <p className="text-text-secondary text-sm">
                    We offer a 30-day satisfaction guarantee on unopened products. Return terms include:
                  </p>
                  
                  <ul className="space-y-2 text-text-secondary text-sm">
                    <li>• Items must be returned within 30 days of delivery</li>
                    <li>• Products must be unopened and in original packaging</li>
                    <li>• Proof of purchase required</li>
                    <li>• Return shipping costs may apply</li>
                    <li>• Refunds issued to original payment method</li>
                  </ul>
                  
                  <p className="text-text-secondary text-sm">
                    For complete return policy details, please refer to our <a href="/shipping-returns" className="text-brand hover:underline">Shipping & Returns</a> page.
                  </p>
                </div>
              </div>

              {/* User Accounts */}
              <div>
                <h3 className="font-serif text-2xl text-text-primary mb-4">
                  7. User Accounts and Responsibilities
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">Account Security</h4>
                    <ul className="space-y-2 text-text-secondary text-sm">
                      <li>• You are responsible for maintaining the confidentiality of your account</li>
                      <li>• You must provide accurate and complete information</li>
                      <li>• You are responsible for all activities under your account</li>
                      <li>• Notify us immediately of any unauthorized use</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">Prohibited Uses</h4>
                    <p className="text-text-secondary text-sm">You may not use our service:</p>
                    <ul className="space-y-2 text-text-secondary text-sm mt-2">
                      <li>• For any unlawful purpose or to solicit unlawful acts</li>
                      <li>• To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                      <li>• To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                      <li>• To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                      <li>• To submit false or misleading information</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Intellectual Property */}
              <div>
                <h3 className="font-serif text-2xl text-text-primary mb-4">
                  8. Intellectual Property Rights
                </h3>
                
                <div className="space-y-4">
                  <p className="text-text-secondary text-sm">
                    The service and its original content, features, and functionality are and will remain the exclusive property of MindVap and its licensors. The service is protected by copyright, trademark, and other laws.
                  </p>
                  
                  <p className="text-text-secondary text-sm">
                    Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
                  </p>
                </div>
              </div>

              {/* Limitation of Liability */}
              <div>
                <h3 className="font-serif text-2xl text-text-primary mb-4">
                  9. Limitation of Liability
                </h3>
                
                <div className="space-y-4">
                  <p className="text-text-secondary text-sm">
                    In no case shall MindVap, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.
                  </p>
                  
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <p className="text-text-primary text-sm">
                      <strong>Important:</strong> Our liability is limited to the maximum extent permitted by law. Some jurisdictions do not allow the exclusion or limitation of liability for consequential or incidental damages.
                    </p>
                  </div>
                </div>
              </div>

              {/* Governing Law */}
              <div>
                <h3 className="font-serif text-2xl text-text-primary mb-4">
                  10. Governing Law and Disputes
                </h3>
                
                <div className="space-y-4">
                  <p className="text-text-secondary text-sm">
                    These Terms shall be interpreted and governed by the laws of Spain, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be resolved in the courts of Spain.
                  </p>
                  
                  <p className="text-text-secondary text-sm">
                    You agree to resolve any dispute through binding arbitration in accordance with the arbitration rules of Spain, except where prohibited by law.
                  </p>
                </div>
              </div>

              {/* Changes to Terms */}
              <div>
                <h3 className="font-serif text-2xl text-text-primary mb-4">
                  11. Changes to Terms
                </h3>
                
                <div className="space-y-4">
                  <p className="text-text-secondary text-sm">
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
                  </p>
                  
                  <p className="text-text-secondary text-sm">
                    Your continued use of our service following the posting of any changes constitutes acceptance of those changes.
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="font-serif text-2xl text-text-primary mb-4">
                  12. Contact Information
                </h3>
                
                <div className="space-y-4">
                  <p className="text-text-secondary text-sm">
                    If you have any questions about these Terms of Service, please contact us:
                  </p>
                  
                  <div className="bg-brand-light p-6 rounded-lg">
                    <ul className="space-y-2 text-text-primary text-sm">
                      <li><strong>Email:</strong> legal@mindvap.com</li>
                      <li><strong>Contact Form:</strong> <a href="/contact" className="text-brand hover:underline">mindvap.com/contact</a></li>
                      <li><strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM CET</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-background-primary">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="font-serif text-3xl text-text-primary mb-6">
            Questions About These Terms?
          </h2>
          <p className="text-text-secondary mb-8">
            If you have any questions about our Terms of Service, please don't hesitate to contact our legal team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:legal@mindvap.com" 
              className="bg-brand text-white px-8 py-3 rounded-full font-medium hover:bg-brand-hover transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              legal@mindvap.com
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

      {/* Legal Notice */}
      <section className="py-8 bg-background-accent">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-sm text-text-secondary">
            These Terms of Service are effective as of December 16, 2025. Continued use of our service constitutes acceptance of these terms.
            For the most current version, please visit this page regularly.
          </p>
        </div>
      </section>
    </div>
  );
}