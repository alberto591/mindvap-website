import { Truck, Package, RotateCcw, Shield, Clock, MapPin } from 'lucide-react';

export default function ShippingReturnsPage() {
  return (
    <div className="bg-background-primary min-h-screen">
      {/* Hero Section */}
      <section className="bg-brand text-white py-24">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="font-serif text-5xl md:text-6xl mb-6 text-black">
            Shipping & Returns
          </h1>
          <p className="text-xl text-black leading-relaxed">
            Fast, secure shipping throughout Spain and Europe with hassle-free returns.
          </p>
        </div>
      </section>

      {/* Shipping Information */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="font-serif text-4xl text-center mb-16 text-text-primary">
            Shipping Information
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Domestic Shipping */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-brand-light rounded-full flex items-center justify-center">
                  <Truck className="w-6 h-6 text-brand" />
                </div>
                <h3 className="font-serif text-2xl text-text-primary">Domestic Shipping (Spain)</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-text-secondary">Standard Shipping (2-3 business days)</span>
                  <span className="font-semibold text-text-primary">€4.99</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-text-secondary">Express Shipping (1-2 business days)</span>
                  <span className="font-semibold text-text-primary">€8.99</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-text-secondary font-medium">FREE Shipping on orders over €50</span>
                  <span className="font-bold text-brand">€0.00</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-brand-light rounded-lg">
                <p className="text-sm text-text-primary">
                  <strong>Free Shipping Threshold:</strong> Orders over €50 qualify for free standard shipping within Spain.
                </p>
              </div>
            </div>

            {/* International Shipping */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-brand-light rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-brand" />
                </div>
                <h3 className="font-serif text-2xl text-text-primary">International Shipping (EU)</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-text-secondary">EU Standard (3-7 business days)</span>
                  <span className="font-semibold text-text-primary">€12.99</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-text-secondary">EU Express (2-4 business days)</span>
                  <span className="font-semibold text-text-primary">€19.99</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-text-secondary font-medium">Free EU Shipping on orders over €75</span>
                  <span className="font-bold text-brand">€0.00</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                <p className="text-sm text-text-primary">
                  <strong>Note:</strong> Shipping restrictions may apply to certain EU countries. Eligibility confirmed at checkout.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shipping Features */}
      <section className="py-20 bg-background-accent">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="font-serif text-4xl text-center mb-16 text-text-primary">
            Shipping Features
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-sm text-center">
              <Package className="w-12 h-12 text-brand mx-auto mb-4" />
              <h3 className="font-semibold text-text-primary mb-3">Discrete Packaging</h3>
              <p className="text-text-secondary text-sm">
                All orders ship in plain, unmarked packaging to protect your privacy. No indication of contents on exterior.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-8 shadow-sm text-center">
              <Shield className="w-12 h-12 text-brand mx-auto mb-4" />
              <h3 className="font-semibold text-text-primary mb-3">Secure & Insured</h3>
              <p className="text-text-secondary text-sm">
                All shipments are fully insured and tracked. Signature confirmation required for orders over €100.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-8 shadow-sm text-center">
              <Clock className="w-12 h-12 text-brand mx-auto mb-4" />
              <h3 className="font-semibold text-text-primary mb-3">Fast Processing</h3>
              <p className="text-text-secondary text-sm">
                Orders placed before 2 PM ship same day. Processing time: 1 business day for in-stock items.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Returns Policy */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-serif text-4xl text-center mb-16 text-text-primary">
            Returns & Refunds
          </h2>
          
          <div className="bg-white rounded-lg p-10 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-brand-light rounded-full flex items-center justify-center">
                <RotateCcw className="w-6 h-6 text-brand" />
              </div>
              <h3 className="font-serif text-2xl text-text-primary">30-Day Satisfaction Guarantee</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-text-primary mb-2">Return Eligibility</h4>
                <ul className="space-y-2 text-text-secondary text-sm">
                  <li>• Items must be returned within 30 days of delivery</li>
                  <li>• Products must be unopened and in original packaging</li>
                  <li>• Proof of purchase required (order confirmation or receipt)</li>
                  <li>• Age verification required (21+ only)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-text-primary mb-2">Return Process</h4>
                <ol className="space-y-2 text-text-secondary text-sm">
                  <li>1. Contact us at support@mindvap.com to initiate return</li>
                  <li>2. Receive return authorization and shipping label</li>
                  <li>3. Package items securely with original materials</li>
                  <li>4. Drop off at designated shipping location</li>
                  <li>5. Refund processed within 5-7 business days after receipt</li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-semibold text-text-primary mb-2">Refund Details</h4>
                <ul className="space-y-2 text-text-secondary text-sm">
                  <li>• Full refund of product cost (shipping fees non-refundable)</li>
                  <li>• Refunds issued to original payment method</li>
                  <li>• Return shipping costs covered by MindVap for defective items</li>
                  <li>• Customer responsible for return shipping on change of mind</li>
                </ul>
              </div>
              
              <div className="bg-amber-50 p-6 rounded-lg">
                <h4 className="font-semibold text-text-primary mb-2">Important Notes</h4>
                <ul className="space-y-2 text-text-secondary text-sm">
                  <li>• Opened products cannot be returned due to safety regulations</li>
                  <li>• Custom or personalized items are non-returnable</li>
                  <li>• International returns subject to additional customs procedures</li>
                  <li>• Refused deliveries will be restocked with 15% handling fee</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact for Returns */}
      <section className="py-16 bg-background-accent">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="font-serif text-3xl text-text-primary mb-6">
            Need Help with Shipping or Returns?
          </h2>
          <p className="text-text-secondary mb-8">
            Our customer service team is here to assist you with any questions about shipping or returns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:support@mindvap.com" 
              className="bg-brand text-white px-8 py-3 rounded-full font-medium hover:bg-brand-hover transition-colors"
            >
              Email Support
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

      {/* Disclaimer */}
      <section className="py-8 bg-background-primary">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-sm text-text-secondary">
            Shipping policies subject to change. Some products may have shipping restrictions based on local regulations. 
            Age verification required for all purchases. Not for use by minors.
          </p>
        </div>
      </section>
    </div>
  );
}