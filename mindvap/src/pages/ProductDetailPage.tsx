import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, Share2, Heart, Award, Truck, Shield, FileText, AlertCircle } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailPageProps {
  onAddToCart: (product: Product, quantity: number) => void;
}

export default function ProductDetailPage({ onAddToCart }: ProductDetailPageProps) {
  const { productId } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('overview');
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    fetch('/data/products.json')
      .then(res => res.json())
      .then((data: Product[]) => {
        const found = data.find(p => p.id === productId);
        setProduct(found || null);
      });
  }, [productId]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-text-secondary">Product not found</p>
          <Link to="/shop" className="text-brand-primary hover:text-brand-hover font-semibold mt-4 inline-block">
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'benefits', label: 'Benefits' },
    { id: 'usage', label: 'Usage Guidelines' },
    { id: 'safety', label: 'Safety & Contraindications' },
  ];

  return (
    <div className="min-h-screen bg-background-primary py-8">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-body-small text-text-secondary">
          <Link to="/" className="hover:text-brand-primary">Home</Link>
          {' / '}
          <Link to="/shop" className="hover:text-brand-primary">Shop</Link>
          {' / '}
          <span className="text-text-primary">{product.name}</span>
        </nav>

        {/* Product Section */}
        <div className="grid md:grid-cols-5 gap-8 mb-12">
          {/* Product Image - 60% */}
          <div className="md:col-span-3">
            <div className="sticky top-24">
              <div className="aspect-square rounded-lg overflow-hidden bg-background-surface">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Buy Box - 40% */}
          <div className="md:col-span-2">
            <div className="sticky top-24 bg-background-surface rounded-lg p-8 shadow-card">
              <h1 className="font-headline text-product-title font-medium text-text-primary mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={i < Math.floor(product.rating) ? 'fill-cta-primary text-cta-primary' : 'text-border-medium'}
                    />
                  ))}
                </div>
                <span className="text-body text-text-secondary">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-price-large font-bold text-cta-primary">
                  ${product.price.toFixed(2)}
                </span>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.inStock ? (
                  product.stockLevel <= 5 ? (
                    <div className="flex items-center gap-2 text-semantic-warning">
                      <AlertCircle size={18} />
                      <span className="font-semibold">Only {product.stockLevel} left in stock!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-semantic-success">
                      <Shield size={18} />
                      <span className="font-semibold">In Stock</span>
                    </div>
                  )
                ) : (
                  <div className="text-text-tertiary">Out of Stock</div>
                )}
              </div>

              {/* Category */}
              <div className="mb-6">
                <span className="inline-block bg-brand-light text-brand-primary px-3 py-1 rounded-pill text-badge font-semibold uppercase">
                  {product.category}
                </span>
              </div>

              {/* Quantity Picker */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-border-medium rounded-sm hover:bg-background-accent transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 h-10 text-center border border-border-medium rounded-sm"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 border border-border-medium rounded-sm hover:bg-background-accent transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`w-full py-4 px-6 rounded-sm font-semibold uppercase tracking-wider transition-all duration-standard mb-4 ${
                  addedToCart
                    ? 'bg-semantic-success text-white'
                    : product.inStock
                    ? 'bg-cta-primary hover:bg-cta-hover text-cta-text hover:-translate-y-1 shadow-cta hover:shadow-card-hover'
                    : 'bg-border-light text-text-tertiary cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <ShoppingCart size={20} />
                  {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
                </div>
              </button>

              {/* Secondary Actions */}
              <div className="flex gap-3 mb-6">
                <button className="flex-1 py-3 px-4 border-2 border-brand-primary text-brand-primary rounded-sm hover:bg-brand-light transition-colors">
                  <Heart size={18} className="inline mr-2" />
                  Wishlist
                </button>
                <button className="flex-1 py-3 px-4 border-2 border-brand-primary text-brand-primary rounded-sm hover:bg-brand-light transition-colors">
                  <Share2 size={18} className="inline mr-2" />
                  Share
                </button>
              </div>

              {/* Trust Signals */}
              <div className="space-y-3 pt-6 border-t border-border-light">
                <div className="flex items-center gap-3">
                  <Award size={18} className="text-brand-primary" />
                  <span className="text-body-small text-text-secondary">Lab Tested with COA</span>
                </div>
                <div className="flex items-center gap-3">
                  <Truck size={18} className="text-brand-primary" />
                  <span className="text-body-small text-text-secondary">Free Shipping on Orders $50+</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield size={18} className="text-brand-primary" />
                  <span className="text-body-small text-text-secondary">Easy 30-Day Returns</span>
                </div>
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-brand-primary" />
                  <span className="text-body-small text-text-secondary">Age 21+ Verified</span>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="mt-6 pt-6 border-t border-border-light">
                <p className="text-xs text-text-tertiary leading-relaxed">
                  This product has not been evaluated by the FDA and is not intended to diagnose, treat, cure, or prevent any disease. Not for use by minors. Avoid during pregnancy or nursing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Content */}
        <div className="bg-background-surface rounded-lg p-8 shadow-card mb-12">
          {/* Tab Headers */}
          <div className="flex border-b border-border-light mb-8 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-brand-primary border-b-2 border-brand-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="prose max-w-none">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-2xl font-semibold text-text-primary mb-4">Product Description</h3>
                <p className="text-body text-text-secondary leading-relaxed mb-6">
                  {product.description}
                </p>
                <div className="bg-background-accent rounded-md p-6 mb-6">
                  <h4 className="font-semibold text-text-primary mb-3">Key Herbs</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.herbs.map(herb => (
                      <span
                        key={herb}
                        className="bg-brand-light text-brand-primary px-3 py-1 rounded-pill text-body-small font-medium"
                      >
                        {herb}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-background-accent rounded-md p-6">
                  <h4 className="font-semibold text-text-primary mb-2">Temperature Range</h4>
                  <p className="text-body text-text-secondary">{product.temperature}</p>
                </div>
              </div>
            )}

            {activeTab === 'benefits' && (
              <div>
                <h3 className="text-2xl font-semibold text-text-primary mb-4">Evidence-Based Benefits</h3>
                <ul className="space-y-4">
                  {product.benefits.map((benefit, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="text-brand-primary mt-1">•</span>
                      <span className="text-body text-text-secondary leading-relaxed">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'usage' && (
              <div>
                <h3 className="text-2xl font-semibold text-text-primary mb-4">Usage Guidelines</h3>
                <p className="text-body text-text-secondary leading-relaxed whitespace-pre-line">
                  {product.usage}
                </p>
              </div>
            )}

            {activeTab === 'safety' && (
              <div>
                <h3 className="text-2xl font-semibold text-text-primary mb-4">Safety & Contraindications</h3>
                <div className="bg-semantic-warning/10 border border-semantic-warning rounded-md p-6 mb-6">
                  <div className="flex gap-3">
                    <AlertCircle size={24} className="text-semantic-warning flex-shrink-0 mt-1" />
                    <p className="text-body text-text-primary leading-relaxed">
                      {product.safety}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
