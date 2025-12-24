import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Product } from '../../types';
import { useLanguage } from '../../contexts/language-context';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { t, language } = useLanguage();

  return (
    <Link
      to={`/product/${product.id}`}
      className="group block bg-background-surface rounded-md shadow-card hover:shadow-card-hover transition-all duration-standard hover:-translate-y-1"
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden rounded-t-md">
        <img
          src={product.image}
          alt={product.name[language]}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-standard"
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-background-surface text-text-primary px-4 py-2 rounded-md font-semibold">
              {t('shop.outOfStock')}
            </span>
          </div>
        )}
        {product.inStock && product.stockLevel <= 5 && (
          <div className="absolute top-2 right-2 bg-background-surface border border-brand-primary text-brand-primary px-3 py-1 rounded-pill text-badge font-semibold uppercase">
            {t('shop.onlyLeft').replace('{count}', product.stockLevel.toString())}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6">
        <div className="mb-2">
          <span className="text-badge uppercase font-semibold text-brand-primary tracking-widest">
            {product.category[language]}
          </span>
        </div>

        <h3 className="text-card-title font-semibold text-text-primary mb-2 line-clamp-2">
          {product.name[language]}
        </h3>

        <p className="text-body-small text-text-secondary mb-3 line-clamp-1">
          {product.shortDescription[language]}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < Math.floor(product.rating) ? 'fill-cta-primary text-cta-primary' : 'text-border-medium'}
              />
            ))}
          </div>
          <span className="text-body-small text-text-tertiary">
            ({product.reviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-price-card font-bold text-cta-primary">
            {t('common.price')}{product.price.toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  );
}
