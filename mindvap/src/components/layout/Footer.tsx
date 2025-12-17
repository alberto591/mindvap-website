import { Link } from 'react-router-dom';
import { Shield, Truck, Award, FileText } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-primary text-white mt-auto">
      {/* Trust Badges */}
      <div className="border-b border-brand-hover">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center text-center">
              <Award size={32} className="mb-2" />
              <p className="text-sm font-semibold">Lab Tested</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Truck size={32} className="mb-2" />
              <p className="text-sm font-semibold">Free Shipping $50+</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Shield size={32} className="mb-2" />
              <p className="text-sm font-semibold">Age 21+ Verified</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <FileText size={32} className="mb-2" />
              <p className="text-sm font-semibold">COA Available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-headline text-xl font-medium mb-4">MindVap</h3>
            <p className="text-sm text-white/80 leading-relaxed">
              Premium vaping herbs focused on natural mental wellness solutions. Quality-first, evidence-based formulations.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop" className="text-white/80 hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/shop?category=anxiety-relief" className="text-white/80 hover:text-white transition-colors">Anxiety Relief</Link></li>
              <li><Link to="/shop?category=sleep-support" className="text-white/80 hover:text-white transition-colors">Sleep Support</Link></li>
              <li><Link to="/shop?category=focus-clarity" className="text-white/80 hover:text-white transition-colors">Focus & Clarity</Link></li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="font-semibold mb-4">Information</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-white/80 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/education" className="text-white/80 hover:text-white transition-colors">Education Hub</Link></li>
              <li><Link to="/contact" className="text-white/80 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy-policy" className="text-white/80 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="text-white/80 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/shipping-returns" className="text-white/80 hover:text-white transition-colors">Shipping & Returns</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-brand-hover">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6">
          <div className="text-center space-y-4">
            <p className="text-xs text-white/60">
              This product has not been evaluated by the FDA and is not intended to diagnose, treat, cure, or prevent any disease. Not for use by minors. Avoid during pregnancy or nursing.
            </p>
            <p className="text-xs text-white/60">
              &copy; 2025 MindVap. All rights reserved. Must be 21+ to purchase.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
