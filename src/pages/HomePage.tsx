import React from 'react';
import {
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  MessageCircle,
  Star,
} from 'lucide-react';
import { useStore } from '../lib/store';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../lib/types';

import heroImage from '../assets/images/hero_vortex_fashion_1790956344973.jpg';
import categoryShirts from '../assets/images/category_shirts_vortex_1790956364111.jpg';
import categoryPants from '../assets/images/category_pants_vortex_1790956382275.jpg';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onSelectProduct: (slug: string) => void;
  onQuickView?: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectProduct,
  onQuickView,
}) => {
  const { products, banners, reviews, settings } = useStore();

  const heroBanner = banners.find((b) => b.is_active) || banners[0] || {
    id: 'default-hero',
    title: 'Define Your Style.',
    description:
      'Modern clothing designed for your everyday style. High-density fabrics, structured tailoring, and contemporary silhouettes.',
    image_url: heroImage,
    button_text: 'Explore Collection',
    button_url: '/shop',
    is_active: true,
    sort_order: 1,
  };

  const newArrivals = products
    .filter((p) => p.is_new_arrival && p.is_active)
    .slice(0, 4);

  const featuredProducts = products
    .filter((p) => p.is_featured && p.is_active)
    .slice(0, 4);

  const saleProducts = products
    .filter((p) => p.is_on_sale && p.is_active)
    .slice(0, 4);

  const approvedReviews = reviews
    .filter((r) => r.is_approved)
    .slice(0, 3);

  return (
    <div className="space-y-12 sm:space-y-20 pb-20">
      {/* 1. Large Fashion Hero Section */}
      <section className="relative min-h-[500px] sm:min-h-[620px] lg:min-h-[700px] flex items-center bg-[#121212] text-white overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={heroBanner.image_url || heroImage}
            alt={
              heroBanner.title ||
              'The Vortex Wear Modern Menswear Campaign'
            }
            referrerPolicy="no-referrer"
            loading="eager"
            // @ts-ignore
            fetchPriority="high"
            onError={(e) => {
              if (e.currentTarget.src !== heroImage) {
                e.currentTarget.src = heroImage;
              }
            }}
            className="w-full h-full object-cover object-center sm:object-center opacity-75 scale-102 animate-hero-zoom transition-transform duration-1000"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#121212]/95 via-[#121212]/60 sm:via-[#121212]/30 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full">
          <div className="max-w-xl space-y-4 sm:space-y-6 animate-slide-up">
            <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs uppercase tracking-widest text-stone-300 font-semibold bg-white/10 backdrop-blur-xs px-3 py-1 rounded-full border border-white/10 w-fit">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>The Vortex Wear · Menswear</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display text-white leading-[1.1] text-balance">
              {heroBanner.title}
            </h1>

            {heroBanner.description && (
              <p className="text-xs sm:text-sm lg:text-base text-stone-300 leading-relaxed font-normal line-clamp-3 sm:line-clamp-none">
                {heroBanner.description}
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2">
              <button
                onClick={() =>
                  onNavigate(heroBanner.button_url || '/shop')
                }
                className="py-3.5 px-6 bg-white hover:bg-stone-200 text-stone-950 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg btn-press min-h-[48px]"
              >
                <span>
                  {heroBanner.button_text || 'Explore Collection'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3">
                <button
                  onClick={() => onNavigate('/shirts')}
                  className="py-3.5 px-5 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold rounded-lg border border-white/20 backdrop-blur-xs transition-all flex items-center justify-center gap-1.5 btn-press min-h-[48px]"
                >
                  <span>Shirts</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white/70" />
                </button>

                <button
                  onClick={() => onNavigate('/pants')}
                  className="py-3.5 px-5 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold rounded-lg border border-white/20 backdrop-blur-xs transition-all flex items-center justify-center gap-1.5 btn-press min-h-[48px]"
                >
                  <span>Pants</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white/70" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Visual Category Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
              Curated Wardrobe
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-950 font-display mt-1">
              Shop by Category
            </h2>
          </div>

          <button
            onClick={() => onNavigate('/shop')}
            className="text-xs font-bold text-stone-900 hover:text-stone-600 transition-colors flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shirts */}
          <div
            onClick={() => onNavigate('/shirts')}
            className="group cursor-pointer relative h-96 sm:h-[420px] rounded-xl overflow-hidden bg-stone-900 shadow-md border border-stone-200/80"
          >
            <img
              src={categoryShirts}
              alt="The Vortex Wear Modern Shirts"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 opacity-85"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-stone-300 font-semibold">
                  Collection 01
                </span>

                <h3 className="text-2xl sm:text-3xl font-bold text-white font-display mt-0.5">
                  Shirts & Overshirts
                </h3>

                <p className="text-xs text-stone-300 mt-1 max-w-sm">
                  Heavyweight Japanese twill overshirts, crisp Egyptian oxford cotton, and breathable resort linens.
                </p>
              </div>

              <span className="hidden sm:inline-flex p-3 bg-white text-stone-950 rounded-full group-hover:scale-110 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Pants */}
          <div
            onClick={() => onNavigate('/pants')}
            className="group cursor-pointer relative h-96 sm:h-[420px] rounded-xl overflow-hidden bg-stone-900 shadow-md border border-stone-200/80"
          >
            <img
              src={categoryPants}
              alt="The Vortex Wear Tailored Pants"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 opacity-85"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-stone-300 font-semibold">
                  Collection 02
                </span>

                <h3 className="text-2xl sm:text-3xl font-bold text-white font-display mt-0.5">
                  Trousers & Utility Cargos
                </h3>

                <p className="text-xs text-stone-300 mt-1 max-w-sm">
                  Tactical ripstop cargos, pleated wool-blend trousers, and everyday comfort stretch chinos.
                </p>
              </div>

              <span className="hidden sm:inline-flex p-3 bg-white text-stone-950 rounded-full group-hover:scale-110 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
              Fresh Drops
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-950 font-display mt-1">
              New Arrivals
            </h2>
          </div>

          <button
            onClick={() => onNavigate('/new-arrivals')}
            className="text-xs font-bold text-stone-900 hover:text-stone-600 transition-colors flex items-center gap-1"
          >
            Explore All New
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onNavigate={onSelectProduct}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      </section>

      {/* 4. Seasonal Sale */}
      {saleProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-stone-900 text-white rounded-2xl p-6 sm:p-10 mb-8 border border-stone-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                  Limited Seasonal Offer
                </span>

                <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-display mt-1">
                  End of Season Showcase
                </h2>

                <p className="text-xs sm:text-sm text-stone-300 mt-2 max-w-xl">
                  Save up to 25% on select essential shirts and tactical cargos. Use code{' '}
                  <strong className="text-white underline">WELCOME10</strong> at checkout for extra savings.
                </p>
              </div>

              <button
                onClick={() => onNavigate('/sale')}
                className="py-3 px-6 bg-white hover:bg-stone-200 text-stone-950 text-xs font-bold rounded-lg transition-colors whitespace-nowrap self-start md:self-auto"
              >
                Shop Sale Items
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {saleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onNavigate={onSelectProduct}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        </section>
      )}

      {/* 5. Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
              The Vortex Wear Icons
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-950 font-display mt-1">
              Featured Products
            </h2>
          </div>

          <button
            onClick={() => onNavigate('/shop')}
            className="text-xs font-bold text-stone-900 hover:text-stone-600 transition-colors flex items-center gap-1"
          >
            All Products
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onNavigate={onSelectProduct}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      </section>

      {/* 6. Why The Vortex Wear */}
      <section className="bg-white border-y border-stone-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
              Precision & Craft
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-950 font-display mt-1">
              Why Tastemakers Choose The Vortex Wear
            </h2>

            <p className="text-xs sm:text-sm text-stone-600 mt-2">
              Every garment is engineered from scratch, rejecting synthetic fast-fashion in favor of substantial yarns and architectural tailoring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-stone-50 rounded-xl border border-stone-200/60">
              <div className="w-10 h-10 rounded-lg bg-[#121212] text-white flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>

              <h3 className="text-base font-bold text-stone-900 font-display mb-1">
                Substantial Textile Weights
              </h3>

              <p className="text-xs text-stone-600 leading-relaxed">
                We utilize heavy 320 GSM cotton twills, genuine French flax linens, and durable ripstop weaves designed to hold clean lines over years of wear.
              </p>
            </div>

            <div className="p-6 bg-stone-50 rounded-xl border border-stone-200/60">
              <div className="w-10 h-10 rounded-lg bg-[#121212] text-white flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>

              <h3 className="text-base font-bold text-stone-900 font-display mb-1">
                Tailored for Pakistan
              </h3>

              <p className="text-xs text-stone-600 leading-relaxed">
                Breathable weaves optimized for our climate, paired with frictionless nationwide Cash on Delivery and prompt customer service.
              </p>
            </div>

            <div className="p-6 bg-stone-50 rounded-xl border border-stone-200/60">
              <div className="w-10 h-10 rounded-lg bg-[#121212] text-white flex items-center justify-center mb-4">
                <ShoppingBag className="w-5 h-5" />
              </div>

              <h3 className="text-base font-bold text-stone-900 font-display mb-1">
                Effortless Everyday Dressing
              </h3>

              <p className="text-xs text-stone-600 leading-relaxed">
                Cohesive color stories across shirts and pants ensure that any piece from our collection pairs harmoniously with any other.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Approved Customer Reviews */}
      {approvedReviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
              Verified Customers
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-950 font-display mt-1">
              Trusted Across Pakistan
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {approvedReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-6 bg-white rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-3">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-amber-400"
                      />
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                    "{rev.review_text}"
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-900">
                    {rev.customer_name}
                  </span>

                  <span className="text-emerald-700 text-[11px] font-medium">
                    Verified Purchase
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8. WhatsApp Concierge */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0c1a12] text-white rounded-2xl p-8 sm:p-12 border border-emerald-900/40 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#25D366] uppercase tracking-wider">
              <MessageCircle className="w-4 h-4" />
              <span>Personal Styling & Sizing Support</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Have Questions Before Ordering?
            </h3>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Reach our store founder and stylist Bilal Akram directly on WhatsApp at{' '}
              <strong className="text-white">
                {settings.whatsapp_number}
              </strong>
              . We help you choose the ideal size and track your delivery.
            </p>
          </div>

          <a
            href={`https://wa.me/${settings.whatsapp_number.replace(
              /[^0-9]/g,
              ''
            )}?text=${encodeURIComponent(
              'Hello The Vortex Wear! I would like to inquire about your modern clothing collection.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-3.5 px-6 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2.5 shadow-lg whitespace-nowrap shrink-0 hover:scale-105 active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            Chat on WhatsApp (+92 300 1046010)
          </a>
        </div>
      </section>
    </div>
  );
};
