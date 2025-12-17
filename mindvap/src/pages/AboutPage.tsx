import { Award, Shield, Leaf, FileCheck, Truck } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-background-primary">
      {/* Hero Section */}
      <section className="bg-brand text-white py-24">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="font-serif text-5xl md:text-6xl mb-6 text-black">
            Our Mission
          </h1>
          <p className="text-xl text-black leading-relaxed">
            We're dedicated to providing premium herbal vaping products that support mental wellness through natural, evidence-based botanical blends.
          </p>
        </div>
      </section>

      {/* Quality Standards */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="font-serif text-4xl text-center mb-16 text-text-primary">
            Our Quality Standards
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="w-16 h-16 bg-brand-light rounded-full flex items-center justify-center mb-6">
                <Leaf className="w-8 h-8 text-brand" />
              </div>
              <h3 className="font-serif text-2xl mb-4 text-text-primary">
                Additive-Free
              </h3>
              <p className="text-text-secondary leading-relaxed">
                100% pure botanical ingredients with no artificial additives, fillers, or cutting agents. Just herbs.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="w-16 h-16 bg-brand-light rounded-full flex items-center justify-center mb-6">
                <FileCheck className="w-8 h-8 text-brand" />
              </div>
              <h3 className="font-serif text-2xl mb-4 text-text-primary">
                Lab Verified
              </h3>
              <p className="text-text-secondary leading-relaxed">
                Third-party laboratory testing for purity, potency, and contaminants. Every batch includes a Certificate of Analysis (COA).
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="w-16 h-16 bg-brand-light rounded-full flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-brand" />
              </div>
              <h3 className="font-serif text-2xl mb-4 text-text-primary">
                Compliance First
              </h3>
              <p className="text-text-secondary leading-relaxed">
                Strict adherence to age verification (21+), transparent labeling, and shipping regulations. Your safety is our priority.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-20 bg-background-accent">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-serif text-4xl text-center mb-12 text-text-primary">
            Evidence-Based Formulation
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-text-secondary leading-relaxed mb-6">
              Our approach to herbal wellness is rooted in scientific research. Each blend is carefully formulated based on clinical studies, meta-analyses, and randomized controlled trials (RCTs) that demonstrate the efficacy of our chosen botanicals.
            </p>
            <p className="text-text-secondary leading-relaxed mb-6">
              We focus on herbs with established safety profiles and documented benefits for mental wellness. From Ashwagandha's stress-reducing properties (with effect sizes of SMD -1.75 in meta-analyses) to Chamomile's anxiolytic effects through GABA pathway modulation, we rely on peer-reviewed evidence to guide our formulations.
            </p>
            <p className="text-text-secondary leading-relaxed">
              This commitment to science ensures that every product we offer is backed by research, not just tradition. We believe in transparency, which is why we provide detailed information about the benefits, usage guidelines, and safety considerations for each herb in our collection.
            </p>
          </div>
        </div>
      </section>

      {/* Compliance Commitment */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-serif text-4xl text-center mb-12 text-text-primary">
            Our Compliance Commitment
          </h2>
          <div className="bg-white rounded-lg p-10 shadow-sm">
            <div className="space-y-6 text-text-secondary leading-relaxed">
              <div>
                <h3 className="font-semibold text-text-primary mb-2 text-lg">Age Verification</h3>
                <p>All purchases require verification that you are 21 years of age or older. We use industry-standard age verification protocols to ensure compliance with federal regulations.</p>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-2 text-lg">FDA Disclaimer</h3>
                <p>These statements have not been evaluated by the Food and Drug Administration. Our products are not intended to diagnose, treat, cure, or prevent any disease. They are intended for adults 21+ as part of a wellness routine.</p>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-2 text-lg">Transparent Labeling</h3>
                <p>Every product includes a complete ingredient list, batch code, and QR code linking to the Certificate of Analysis (COA). We believe in complete transparency about what goes into our products.</p>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-2 text-lg">Responsible Shipping</h3>
                <p>We comply with all state and federal shipping regulations. Some products may have shipping restrictions based on your location. We use discrete packaging to respect your privacy.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-brand-light">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <Award className="w-12 h-12 text-brand mx-auto mb-3" />
              <p className="text-sm font-medium text-text-primary">Lab Tested</p>
            </div>
            <div className="text-center">
              <Shield className="w-12 h-12 text-brand mx-auto mb-3" />
              <p className="text-sm font-medium text-text-primary">21+ Verified</p>
            </div>
            <div className="text-center">
              <FileCheck className="w-12 h-12 text-brand mx-auto mb-3" />
              <p className="text-sm font-medium text-text-primary">COA Available</p>
            </div>
            <div className="text-center">
              <Truck className="w-12 h-12 text-brand mx-auto mb-3" />
              <p className="text-sm font-medium text-text-primary">Free Shipping $50+</p>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 bg-background-accent">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-sm text-text-secondary">
            Not for use by minors. Avoid during pregnancy or nursing. Consult a healthcare provider before use if you have medical conditions or take medications.
          </p>
        </div>
      </section>
    </div>
  );
}
