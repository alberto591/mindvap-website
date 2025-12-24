import { Link } from 'react-router-dom';
import { ArrowRight, Award, Truck, Shield, FileText, Leaf, Moon, Brain } from 'lucide-react';
import { useEffect, useState } from 'react';
import ProductCard from '../components/ui/product-card';
import { Product } from '../types';
import { useLanguage } from '../contexts/language-context';

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
      <section className="relative min-h-[90vh] flex items-center overflow-hidden pb-24 md:pb-32">
        {/* Immersive Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero_bg_premium.webp"
            alt={t('home.hero.microTrust.lab')}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background-surface/90 via-background-surface/40 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 w-full">
          <div className="max-w-2xl animate-in fade-in slide-in-from-left-8 duration-luxe ease-luxury">
            <div className="inline-block bg-brand-primary text-white px-4 py-1 rounded-pill text-badge font-bold uppercase tracking-widest mb-6 shadow-sm">
              {t('home.hero.tagline')}
            </div>

            <h1 className="font-headline text-hero-headline md:text-7xl lg:text-hero-headline font-medium text-text-primary mb-6 leading-[1.05] tracking-tight">
              {t('home.hero.title')}
            </h1>

            <p className="text-body-large md:text-xl text-text-secondary mb-10 leading-relaxed max-w-xl">
              {t('home.hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-3 bg-cta-primary hover:bg-cta-hover text-cta-text font-bold py-5 px-10 rounded-sm transition-all duration-standard hover:-translate-y-1 shadow-cta hover:shadow-card-hover uppercase tracking-widest text-button"
              >
                {t('home.hero.cta')}
                <ArrowRight size={20} />
              </Link>

              <Link
                to="/about"
                className="inline-flex items-center justify-center gap-3 bg-white/40 backdrop-blur-md border border-white/60 hover:bg-white/60 text-text-primary font-bold py-5 px-10 rounded-sm transition-all duration-standard hover:-translate-y-1 uppercase tracking-widest text-button"
              >
                {t('common.learnMore')}
              </Link>
            </div>

            {/* Micro-Trust Signals in Hero */}
            <div className="mt-12 flex items-center gap-6 text-text-tertiary">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-brand-primary" />
                <span className="text-badge font-semibold uppercase tracking-wider">{t('home.hero.microTrust.lab')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Leaf size={16} className="text-brand-primary" />
                <span className="text-badge font-semibold uppercase tracking-wider">{t('home.hero.microTrust.organic')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
          <div className="w-px h-12 bg-gradient-to-b from-brand-primary to-transparent"></div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="relative z-30 -mt-12 md:-mt-16 mb-10 px-4">
        <div className="max-w-[1200px] mx-auto bg-white shadow-modal rounded-md p-8 md:p-10 border border-border-light">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 flex items-center justify-center rounded-sm bg-brand-light text-brand-primary group-hover:scale-110 transition-transform duration-standard">
                <Award size={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-body-small font-bold text-text-primary uppercase tracking-wider">{t('home.trust.lab')}</p>
                <p className="text-[12px] text-text-tertiary">{t('home.trust.lab.desc')}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 flex items-center justify-center rounded-sm bg-brand-light text-brand-primary group-hover:scale-110 transition-transform duration-standard">
                <Truck size={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-body-small font-bold text-text-primary uppercase tracking-wider">{t('home.trust.shipping')}</p>
                <p className="text-[12px] text-text-tertiary">{t('home.trust.shipping.desc')}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 flex items-center justify-center rounded-sm bg-brand-light text-brand-primary group-hover:scale-110 transition-transform duration-standard">
                <Shield size={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-body-small font-bold text-text-primary uppercase tracking-wider">{t('home.trust.verified')}</p>
                <p className="text-[12px] text-text-tertiary">{t('home.trust.verified.desc')}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 flex items-center justify-center rounded-sm bg-brand-light text-brand-primary group-hover:scale-110 transition-transform duration-standard">
                <FileText size={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-body-small font-bold text-text-primary uppercase tracking-wider">{t('home.trust.coa')}</p>
                <p className="text-[12px] text-text-tertiary">{t('home.trust.coa.desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-24 md:py-32 bg-background-primary overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="font-headline text-section-header md:text-5xl font-medium text-text-primary mb-6 leading-tight">
                {t('home.categories.title')}
              </h2>
              <p className="text-body-large text-text-secondary">
                {t('home.categories.subtitle')}
              </p>
            </div>
            <Link
              to="/shop"
              className="group inline-flex items-center gap-2 text-brand-primary font-bold uppercase tracking-widest text-button border-b-2 border-brand-primary pb-1 transition-all"
            >
              {t('home.categories.viewAll')}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Link
                  key={index}
                  to={`/shop?category=${category.slug}`}
                  className={`${category.color} relative aspect-[4/5] p-8 rounded-md flex flex-col justify-between overflow-hidden group hover:shadow-card-hover transition-all duration-luxe ease-luxury hover:-translate-y-2`}
                >
                  {/* Background Ornament */}
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-slow"></div>

                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-sm bg-white/80 backdrop-blur-sm flex items-center justify-center text-brand-primary mb-6 shadow-sm">
                      <Icon size={28} />
                    </div>
                    <h3 className="text-2xl font-bold text-text-primary mb-2">
                      {category.name}
                    </h3>
                    <p className="text-body-small text-text-secondary font-medium uppercase tracking-wider">
                      {category.keyHerbs.split(',')[0]} {t('common.andMore')}
                    </p>
                  </div>

                  <div className="relative z-10">
                    <span className="inline-flex items-center gap-2 text-brand-primary font-bold text-button group-hover:gap-3 transition-all uppercase tracking-widest">
                      {t('common.explore')}
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 md:py-32 bg-background-accent">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="font-headline text-section-header md:text-5xl font-medium text-text-primary mb-6">
              {t('home.featured.title')}
            </h2>
            <p className="text-body-large text-text-secondary max-w-2xl mx-auto">
              {t('home.featured.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 bg-brand-primary hover:bg-brand-hover text-white font-bold py-5 px-10 rounded-sm transition-all duration-standard shadow-lg hover:shadow-card-hover hover:-translate-y-1 uppercase tracking-widest text-button"
            >
              {t('home.featured.cta')}
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Overview */}
      <section className="py-24 md:py-32 bg-background-primary">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-in fade-in slide-in-from-left-8 duration-slow">
              <div className="inline-block bg-brand-light text-brand-primary px-3 py-1 rounded-sm text-badge font-bold uppercase tracking-widest mb-6">
                {t('home.benefits.tagline')}
              </div>
              <h2 className="font-headline text-section-header md:text-5xl font-medium text-text-primary mb-8 leading-tight">
                {t('home.benefits.title')}
              </h2>
              <div className="space-y-10">
                <div className="flex gap-6 group">
                  <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-sm bg-brand-light text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors duration-standard">
                    <Leaf size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-text-primary mb-2 uppercase tracking-wide">{t('home.benefits.ashwagandha.title')}</h3>
                    <p className="text-text-secondary leading-relaxed max-w-lg">
                      {t('home.benefits.ashwagandha.desc')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-6 group">
                  <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-sm bg-brand-light text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors duration-standard">
                    <Leaf size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-text-primary mb-2 uppercase tracking-wide">{t('home.benefits.chamomile.title')}</h3>
                    <p className="text-text-secondary leading-relaxed max-w-lg">
                      {t('home.benefits.chamomile.desc')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-6 group">
                  <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-sm bg-brand-light text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors duration-standard">
                    <Leaf size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-text-primary mb-2 uppercase tracking-wide">{t('home.benefits.lavender.title')}</h3>
                    <p className="text-text-secondary leading-relaxed max-w-lg">
                      {t('home.benefits.lavender.desc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-brand-primary rounded-md p-16 md:p-20 text-center relative overflow-hidden shadow-modal">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
                <div className="relative z-10">
                  <div className="text-7xl md:text-8xl font-headline text-white mb-6">12+</div>
                  <p className="text-2xl font-bold text-white mb-4 uppercase tracking-widest">{t('home.benefits.researched')}</p>
                  <p className="text-white/80 leading-relaxed text-body-large max-w-md mx-auto">
                    {t('home.benefits.researched.desc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 md:py-32 bg-background-accent">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="text-center mb-20">
            <h2 className="font-headline text-section-header md:text-5xl font-medium text-text-primary mb-6">
              {t('home.howto.title')}
            </h2>
            <p className="text-body-large text-text-secondary max-w-2xl mx-auto">
              {t('home.howto.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Visual Connector - Desktop Only */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-border-light to-transparent -translate-y-24 z-0"></div>

            <div className="relative z-10 group">
              <div className="w-20 h-20 bg-white shadow-card rounded-md flex items-center justify-center text-3xl font-headline text-brand-primary mb-8 group-hover:bg-brand-primary group-hover:text-white transition-all duration-slow group-hover:-translate-y-2">
                1
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-4 uppercase tracking-widest">{t('home.howto.step1.title')}</h3>
              <p className="text-text-secondary leading-relaxed">
                {t('home.howto.step1.desc')}
              </p>
            </div>

            <div className="relative z-10 group">
              <div className="w-20 h-20 bg-white shadow-card rounded-md flex items-center justify-center text-3xl font-headline text-brand-primary mb-8 group-hover:bg-brand-primary group-hover:text-white transition-all duration-slow group-hover:-translate-y-2">
                2
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-4 uppercase tracking-widest">{t('home.howto.step2.title')}</h3>
              <p className="text-text-secondary leading-relaxed">
                {t('home.howto.step2.desc')}
              </p>
            </div>

            <div className="relative z-10 group">
              <div className="w-20 h-20 bg-white shadow-card rounded-md flex items-center justify-center text-3xl font-headline text-brand-primary mb-8 group-hover:bg-brand-primary group-hover:text-white transition-all duration-slow group-hover:-translate-y-2">
                3
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-4 uppercase tracking-widest">{t('home.howto.step3.title')}</h3>
              <p className="text-text-secondary leading-relaxed">
                {t('home.howto.step3.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 md:py-32 bg-brand-primary text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mt-48 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mb-48 blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 text-center">
          <h2 className="font-headline text-5xl md:text-7xl font-light mb-8 leading-tight">
            {t('home.cta.title')}
          </h2>
          <p className="text-xl md:text-2xl mb-12 text-white/90 max-w-2xl mx-auto leading-relaxed">
            {t('home.cta.subtitle')}
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 bg-white text-brand-primary hover:bg-brand-light font-bold py-5 px-10 rounded-sm transition-all duration-standard hover:-translate-y-1 shadow-xl uppercase tracking-widest text-button"
          >
            {t('home.cta.cta')}
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
