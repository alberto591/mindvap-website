import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X } from 'lucide-react';
import ProductCard from '../components/ui/ProductCard';
import { Product } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export default function ShopPage() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const categories = [
    t('shop.filter.anxiety'),
    t('shop.filter.stress'),
    t('shop.filter.focus'),
    t('shop.filter.sleep'),
    t('shop.filter.mood'),
  ];

  useEffect(() => {
    fetch('/data/products.json')
      .then(res => res.json())
      .then((data: Product[]) => {
        setProducts(data);
        setFilteredProducts(data);

        // Check for category filter from URL
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
          const categoryName = categoryParam
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          setSelectedCategories([categoryName]);
        }
      });
  }, []);

  useEffect(() => {
    let filtered = [...products];

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product =>
        selectedCategories.includes(product.category)
      );
    }

    // Filter by price
    filtered = filtered.filter(
      product => product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    setFilteredProducts(filtered);
  }, [selectedCategories, priceRange, products]);

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 50]);
    setSearchParams({});
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <h3 className="font-semibold text-text-primary mb-4">{t('shop.filter.category')}</h3>
        <div className="space-y-2">
          {categories.map(category => (
            <label key={category} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => toggleCategory(category)}
                className="w-4 h-4 rounded border-border-medium text-brand-primary focus:ring-brand-primary"
              />
              <span className="text-body text-text-secondary">
                {category}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <h3 className="font-semibold text-text-primary mb-4">{t('shop.filter.priceRange')}</h3>
        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max="50"
            step="5"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
            className="w-full"
          />
          <div className="flex justify-between text-body-small text-text-secondary">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      {(selectedCategories.length > 0 || priceRange[1] < 50) && (
        <button
          onClick={clearFilters}
          className="w-full text-brand-primary hover:text-brand-hover font-semibold py-2 transition-colors"
        >
          {t('shop.filter.clearAll')}
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background-primary py-8">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-headline text-section-header font-medium text-text-primary mb-2">
            {t('shop.title')}
          </h1>
          <p className="text-body-large text-text-secondary">
            {filteredProducts.length} {t('shop.productsAvailable')}
          </p>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden md:block w-72 flex-shrink-0">
            <div className="sticky top-24 bg-background-accent rounded-md p-6">
              <FilterSidebar />
            </div>
          </aside>

          {/* Mobile Filter Button */}
          <div className="md:hidden fixed bottom-4 right-4 z-40">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="bg-brand-primary text-white p-4 rounded-full shadow-modal hover:bg-brand-hover transition-colors"
            >
              <Filter size={24} />
            </button>
          </div>

          {/* Mobile Filter Panel */}
          {mobileFiltersOpen && (
            <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileFiltersOpen(false)}>
              <div
                className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-background-surface p-6 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-text-primary">{t('shop.filter.filters')}</h2>
                  <button onClick={() => setMobileFiltersOpen(false)}>
                    <X size={24} />
                  </button>
                </div>
                <FilterSidebar />
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full bg-brand-primary text-white font-semibold py-3 px-6 rounded-sm mt-6 hover:bg-brand-hover transition-colors"
                >
                  {t('shop.filter.applyFilters')}
                </button>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl text-text-secondary mb-4">{t('shop.filter.noProducts')}</p>
                <button
                  onClick={clearFilters}
                  className="text-brand-primary hover:text-brand-hover font-semibold"
                >
                  {t('shop.filter.clearFilters')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
