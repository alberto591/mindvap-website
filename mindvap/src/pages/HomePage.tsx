import { Link } from 'react-router-dom';
import { ArrowRight, Award, Truck, Shield, FileText, Leaf, Moon, Brain } from 'lucide-react';
import { useEffect, useState } from 'react';
import ProductCard from '../components/ui/ProductCard';
import { Product } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export default function HomePage() {
  const { t } = useLanguage();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch('/data/products.json')
      .then(res => res.json())
      .then((data: Product[]) => {
        // Get top 4 products by rating
        const featured = [...data]
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 4);
        setFeaturedProducts(featured);
      });
  }, []);

  const categories = [
    {
      name: t('home.categories.anxiety'),
      slug: 'anxiety-relief',
      icon: Leaf,
      keyHerbs: 'Chamomile, Lavender, Lemon Balm',
      color: 'bg-brand-light',
    },
    {
      name: t('home.categories.sleep'),
      slug: 'sleep-support',
      icon: Moon,
      keyHerbs: 'Valerian, Passionflower, Hops',
      color: 'bg-background-accent',
    },
    {
      name: t('home.categories.focus'),
      slug: 'focus-clarity',
      icon: Brain,
      keyHerbs: 'Rosemary, Peppermint, Ginger',
      color: 'bg-brand-light',
    },
    {
      name: t('home.categories.stress'),
      slug: 'stress-relief',
      icon: Leaf,
      keyHerbs: 'Lavender, Tulsi, Ashwagandha',
      color: 'bg-background-accent',
    },
    {
      name: t('home.categories.mood'),
      slug: 'mood-support',
      icon: Brain,
      keyHerbs: 'Damiana, Rose, St. John\'s Wort',
      color: 'bg-brand-light',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-light to-background-primary py-20 md:py-32">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="max-w-3xl">
            <h1 className="font-headline text-hero-headline md:text-6xl lg:text-hero-headline font-light text-text-primary mb-6 leading-tight">
              {t('home.hero.title')}
            </h1>
            <p className="text-body-large text-text-secondary mb-8 leading-relaxed max-w-2xl">
              {t('home.hero.subtitle')}
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-cta-primary hover:bg-cta-hover text-cta-text font-semibold py-4 px-8 rounded-sm transition-all duration-standard hover:-translate-y-1 shadow-cta hover:shadow-card-hover uppercase tracking-wider"
            >
              {t('home.hero.cta')}
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-border-light bg-background-surface py-8">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center text-center">
              <Award size={32} className="text-brand-primary mb-2" />
              <p className="text-body-small font-semibold text-text-primary">{t('home.trust.lab')}</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Truck size={32} className="text-brand-primary mb-2" />
              <p className="text-body-small font-semibold text-text-primary">{t('home.trust.shipping')}</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Shield size={32} className="text-brand-primary mb-2" />
              <p className="text-body-small font-semibold text-text-primary">{t('home.trust.verified')}</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <FileText size={32} className="text-brand-primary mb-2" />
              <p className="text-body-small font-semibold text-text-primary">{t('home.trust.coa')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-20 md:py-24 bg-background-primary">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="font-headline text-section-header font-medium text-text-primary mb-4">
              {t('home.categories.title')}
            </h2>
            <p className="text-body-large text-text-secondary max-w-2xl mx-auto">
              {t('home.categories.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Link
                  key={index}
                  to={`/shop?category=${category.slug}`}
                  className={`${category.color} p-8 rounded-lg hover:shadow-card-hover transition-all duration-standard hover:-translate-y-1 group`}
                >
                  <Icon size={40} className="text-brand-primary mb-4" />
                  <h3 className="text-2xl font-semibold text-text-primary mb-2">
                    {category.name}
                  </h3>
                  <p className="text-body-small text-text-secondary mb-4">
                    {t('home.categories.keyHerbs')} {category.keyHerbs}
                  </p>
                  <span className="inline-flex items-center gap-2 text-brand-primary font-semibold group-hover:gap-3 transition-all">
                    {t('common.explore')}
                    <ArrowRight size={16} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 md:py-24 bg-background-accent">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="font-headline text-section-header font-medium text-text-primary mb-4">
              {t('home.featured.title')}
            </h2>
            <p className="text-body-large text-text-secondary max-w-2xl mx-auto">
              {t('home.featured.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-hover text-white font-semibold py-3 px-6 rounded-sm transition-colors uppercase tracking-wider"
            >
              {t('home.featured.cta')}
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Overview */}
      <section className="py-20 md:py-24 bg-background-primary">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-headline text-section-header font-medium text-text-primary mb-6">
                {t('home.benefits.title')}
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">{t('home.benefits.ashwagandha.title')}</h3>
                  <p className="text-text-secondary leading-relaxed">
                    {t('home.benefits.ashwagandha.desc')}
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">{t('home.benefits.chamomile.title')}</h3>
                  <p className="text-text-secondary leading-relaxed">
                    {t('home.benefits.chamomile.desc')}
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">{t('home.benefits.lavender.title')}</h3>
                  <p className="text-text-secondary leading-relaxed">
                    {t('home.benefits.lavender.desc')}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-brand-light rounded-lg p-12 text-center">
              <div className="text-6xl font-bold text-brand-primary mb-4">12+</div>
              <p className="text-xl font-semibold text-text-primary mb-2">{t('home.benefits.researched')}</p>
              <p className="text-text-secondary">
                {t('home.benefits.researched.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-24 bg-background-accent">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="font-headline text-section-header font-medium text-text-primary mb-4">
              {t('home.howto.title')}
            </h2>
            <p className="text-body-large text-text-secondary max-w-2xl mx-auto">
              {t('home.howto.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background-surface rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-brand-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">{t('home.howto.step1.title')}</h3>
              <p className="text-text-secondary leading-relaxed">
                {t('home.howto.step1.desc')}
              </p>
            </div>
            <div className="bg-background-surface rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-brand-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">{t('home.howto.step2.title')}</h3>
              <p className="text-text-secondary leading-relaxed">
                {t('home.howto.step2.desc')}
              </p>
            </div>
            <div className="bg-background-surface rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-brand-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">{t('home.howto.step3.title')}</h3>
              <p className="text-text-secondary leading-relaxed">
                {t('home.howto.step3.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-brand-primary text-white">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 text-center">
          <h2 className="font-headline text-5xl md:text-6xl font-light mb-6">
            {t('home.cta.title')}
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            {t('home.cta.subtitle')}
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-cta-primary hover:bg-cta-hover text-cta-text font-semibold py-4 px-8 rounded-sm transition-all duration-standard hover:-translate-y-1 shadow-cta uppercase tracking-wider"
          >
            {t('home.cta.cta')}
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
