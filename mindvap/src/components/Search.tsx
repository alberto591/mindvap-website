import { useState, useEffect, useRef, useCallback } from 'react';
import { Search as SearchIcon, X, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface Product {
  id: string;
  name: {
    en: string;
    es: string;
    it: string;
  };
  price: number;
  category: {
    en: string;
    es: string;
    it: string;
  };
  image: string;
  shortDescription: {
    en: string;
    es: string;
    it: string;
  };
  herbs: string[];
}

interface PageResult {
  title: string;
  path: string;
  description: string;
}

interface SearchResults {
  products: Product[];
  pages: PageResult[];
}

// Page data for searching
const getPageData = (t: (key: string) => string): PageResult[] => [
  { title: t('nav.home'), path: '/', description: t('home.hero.subtitle') },
  { title: t('nav.shop'), path: '/shop', description: t('shop.subtitle') },
  { title: t('nav.about'), path: '/about', description: t('about.subtitle') },
  { title: t('nav.education'), path: '/education', description: t('education.subtitle') },
  { title: t('nav.contact'), path: '/contact', description: t('contact.subtitle') },
  { title: t('footer.legal.privacy'), path: '/privacy-policy', description: t('footer.legal.privacy') },
  { title: t('footer.legal.terms'), path: '/terms-of-service', description: t('footer.legal.terms') },
  { title: t('footer.legal.shipping'), path: '/shipping-returns', description: t('footer.legal.shipping') },
];

// Simple fuzzy search function
const fuzzyMatch = (text: string, query: string): boolean => {
  const normalizedText = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Check if query is contained in text
  if (normalizedText.includes(normalizedQuery)) return true;
  
  // Check word by word
  const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 0);
  return queryWords.every(word => normalizedText.includes(word));
};

interface SearchProps {
  mobile?: boolean;
  onClose?: () => void;
}

export default function Search({ mobile = false, onClose }: SearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({ products: [], pages: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // Load products on mount
  useEffect(() => {
    fetch('/data/products.json')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Failed to load products:', err));
  }, []);

  // Debounced search function
  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults({ products: [], pages: [] });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    // Simulate a small delay for better UX
    setTimeout(() => {
      // Search products
      const matchedProducts = products.filter(product =>
        fuzzyMatch(product.name[language], searchQuery) ||
        fuzzyMatch(product.category[language], searchQuery) ||
        fuzzyMatch(product.shortDescription[language], searchQuery) ||
        product.herbs.some(herb => fuzzyMatch(herb, searchQuery))
      ).slice(0, 5);

      // Search pages
      const pageData = getPageData(t);
      const matchedPages = pageData.filter(page =>
        fuzzyMatch(page.title, searchQuery) ||
        fuzzyMatch(page.description, searchQuery)
      ).slice(0, 4);

      setResults({
        products: matchedProducts,
        pages: matchedPages
      });
      setIsLoading(false);
    }, 150);
  }, [products, t]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
      onClose?.();
    } else if (e.key === 'Enter' && query.trim()) {
      // Navigate to shop with search query
      navigate(`/shop?search=${encodeURIComponent(query)}`);
      setIsOpen(false);
      setQuery('');
      onClose?.();
    }
  };

  const handleResultClick = () => {
    setIsOpen(false);
    setQuery('');
    onClose?.();
  };

  const clearSearch = () => {
    setQuery('');
    setResults({ products: [], pages: [] });
    inputRef.current?.focus();
  };

  const totalResults = results.products.length + results.pages.length;
  const hasResults = totalResults > 0;
  const showDropdown = isOpen && query.trim().length > 0;

  if (mobile) {
    return (
      <div className="w-full" ref={searchRef}>
        <div className="relative">
          <SearchIcon 
            size={18} 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" 
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={t('search.placeholder')}
            className="w-full pl-10 pr-10 py-3 bg-background-accent border border-border-light rounded-lg 
                       text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 
                       focus:ring-brand-primary/50 focus:border-brand-primary transition-all"
            aria-label={t('search.ariaLabel')}
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-background-surface rounded-full transition-colors"
              aria-label={t('search.clear')}
            >
              <X size={16} className="text-text-muted" />
            </button>
          )}
        </div>

        {showDropdown && (
          <div className="mt-2 bg-background-surface border border-border-light rounded-lg shadow-lg overflow-hidden search-results">
            {isLoading ? (
              <div className="p-4 flex items-center justify-center">
                <Loader2 size={20} className="animate-spin text-brand-primary" />
                <span className="ml-2 text-text-muted">{t('search.searching')}</span>
              </div>
            ) : hasResults ? (
              <div className="max-h-80 overflow-y-auto">
                {/* Products Section */}
                {results.products.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-background-accent text-xs font-semibold text-text-muted uppercase tracking-wide">
                      {t('search.products')} ({results.products.length})
                    </div>
                    {results.products.map(product => (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        onClick={handleResultClick}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-background-accent transition-colors"
                      >
                        <img
                          src={product.image}
                          alt={product.name[language]}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-text-primary truncate">{product.name[language]}</p>
                          <p className="text-sm text-text-muted truncate">{product.category[language]}</p>
                        </div>
                        <span className="text-brand-primary font-medium">${product.price}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Pages Section */}
                {results.pages.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-background-accent text-xs font-semibold text-text-muted uppercase tracking-wide">
                      {t('search.pages')} ({results.pages.length})
                    </div>
                    {results.pages.map(page => (
                      <Link
                        key={page.path}
                        to={page.path}
                        onClick={handleResultClick}
                        className="block px-4 py-3 hover:bg-background-accent transition-colors"
                      >
                        <p className="font-medium text-text-primary">{page.title}</p>
                        <p className="text-sm text-text-muted truncate">{page.description}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 text-center text-text-muted">
                <p>{t('search.noResults')}</p>
                <p className="text-sm mt-1">{t('search.tryDifferent')}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Desktop version
  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <SearchIcon 
          size={18} 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" 
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={t('search.placeholder')}
          className="w-48 lg:w-64 pl-10 pr-8 py-2 bg-background-accent border border-border-light rounded-lg 
                     text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 
                     focus:ring-brand-primary/50 focus:border-brand-primary focus:w-72 lg:focus:w-80
                     transition-all duration-200"
          aria-label={t('search.ariaLabel')}
        />
        {isLoading && (
          <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-brand-primary" />
        )}
        {!isLoading && query && (
          <button
            onClick={clearSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-background-surface rounded-full transition-colors"
            aria-label={t('search.clear')}
          >
            <X size={14} className="text-text-muted" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background-surface border border-border-light
                        rounded-lg shadow-xl overflow-hidden z-50 min-w-[320px] lg:min-w-[400px] search-results">
          {isLoading ? (
            <div className="p-4 flex items-center justify-center">
              <Loader2 size={20} className="animate-spin text-brand-primary" />
              <span className="ml-2 text-text-muted">{t('search.searching')}</span>
            </div>
          ) : hasResults ? (
            <div className="max-h-96 overflow-y-auto">
              {/* Products Section */}
              {results.products.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-background-accent text-xs font-semibold text-text-muted uppercase tracking-wide border-b border-border-light">
                    {t('search.products')} ({results.products.length})
                  </div>
                  {results.products.map(product => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      onClick={handleResultClick}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-background-accent transition-colors border-b border-border-light last:border-b-0"
                    >
                      <img
                        src={product.image}
                        alt={product.name[language]}
                        className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text-primary truncate">{product.name[language]}</p>
                        <p className="text-sm text-text-muted truncate">{product.category[language]}</p>
                      </div>
                      <span className="text-brand-primary font-semibold">${product.price}</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pages Section */}
              {results.pages.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-background-accent text-xs font-semibold text-text-muted uppercase tracking-wide border-b border-border-light">
                    {t('search.pages')} ({results.pages.length})
                  </div>
                  {results.pages.map(page => (
                    <Link
                      key={page.path}
                      to={page.path}
                      onClick={handleResultClick}
                      className="block px-4 py-3 hover:bg-background-accent transition-colors border-b border-border-light last:border-b-0"
                    >
                      <p className="font-medium text-text-primary">{page.title}</p>
                      <p className="text-sm text-text-muted line-clamp-1">{page.description}</p>
                    </Link>
                  ))}
                </div>
              )}

              {/* View All Results */}
              {totalResults > 0 && (
                <Link
                  to={`/shop?search=${encodeURIComponent(query)}`}
                  onClick={handleResultClick}
                  className="block px-4 py-3 text-center text-brand-primary font-medium hover:bg-background-accent transition-colors border-t border-border-light"
                >
                  {t('search.viewAll')} ({totalResults})
                </Link>
              )}
            </div>
          ) : (
            <div className="p-6 text-center">
              <SearchIcon size={32} className="mx-auto text-text-muted mb-2" />
              <p className="text-text-primary font-medium">{t('search.noResults')}</p>
              <p className="text-sm text-text-muted mt-1">{t('search.tryDifferent')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
