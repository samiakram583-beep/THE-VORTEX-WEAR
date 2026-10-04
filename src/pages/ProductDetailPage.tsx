import React, { useState } from 'react';
import {
  Heart,
  ShoppingBag,
  Zap,
  MessageCircle,
  Truck,
  RefreshCw,
  Ruler,
  Star,
  Check,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '../lib/store';
import { ProductCard } from '../components/ProductCard';
import { SizeChartModal } from '../components/SizeChartModal';
import { Product } from '../lib/types';

interface ProductDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
  onSelectProduct: (slug: string) => void;
  onInstantBuy: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  slug,
  onNavigate,
  onSelectProduct,
  onInstantBuy,
}) => {
  const { products, addToCart, isInWishlist, toggleWishlist, reviews, submitReview, settings } = useStore();

  const product = products.find((p) => p.slug === slug);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold font-display text-stone-900 mb-2">Product Not Found</h2>
        <p className="text-xs text-stone-500 mb-6">The requested garment may have been removed or discontinued.</p>
        <button
          onClick={() => onNavigate('/shop')}
          className="py-2.5 px-6 bg-stone-900 text-white text-xs font-bold rounded-lg"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  // Active state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(() => {
    const defaultVar = product.variants.find((v) => v.is_active && v.stock_quantity > 0) || product.variants[0];
    return defaultVar ? defaultVar.id : '';
  });
  const [quantity, setQuantity] = useState(1);
  const [showSizeModal, setShowSizeModal] = useState(false);

  // Review Form state
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];
  const isWishlisted = isInWishlist(product.id);

  // Color grouping
  const uniqueColors = Array.from(new Set(product.variants.map((v) => v.color)));
  const currentColor = selectedVariant?.color || uniqueColors[0];
  const sizesForCurrentColor = product.variants.filter((v) => v.color === currentColor);

  const currentPrice = selectedVariant?.sale_price ?? (product.sale_price ?? product.base_price);
  const isDiscounted = Boolean(product.sale_price || selectedVariant?.sale_price);
  const originalPrice = product.base_price;
  const discountPercent = isDiscounted ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  const isOutOfStock = !selectedVariant || selectedVariant.stock_quantity <= 0;

  // Reviews for this product
  const productReviews = reviews.filter((r) => r.product_id === product.id && r.is_approved);
  const avgRating =
    productReviews.length > 0
      ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
      : '5.0';

  // Related products (same category)
  const relatedProducts = products
    .filter((p) => p.category_id === product.category_id && p.id !== product.id && p.is_active)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (selectedVariant && !isOutOfStock) {
      addToCart(product, selectedVariant, quantity);
    }
  };

  const handleBuyNow = () => {
    if (selectedVariant && !isOutOfStock) {
      addToCart(product, selectedVariant, quantity);
      onInstantBuy();
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewText) return;
    submitReview(product.id, reviewName, reviewRating, reviewText);
    setReviewSubmitted(true);
    setReviewText('');
    setReviewName('');
  };

  const currentImage = product.images[selectedImageIndex]?.image_url || product.images[0]?.image_url;

  // WhatsApp Inquiry URL
  const whatsappUrl = `https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Hello The Vortex Wear! I would like to inquire about "${product.name}" (${selectedVariant?.color || ''} - Size ${selectedVariant?.size || ''}). Price: ${settings.currency_symbol} ${currentPrice.toLocaleString()}. Is this ready to dispatch?`
  )}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 mb-8">
        <button onClick={() => onNavigate('/')} className="hover:text-stone-900">Home</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button
          onClick={() => onNavigate(product.category_id.includes('shirt') ? '/shirts' : '/pants')}
          className="hover:text-stone-900"
        >
          {product.category_name || (product.category_id.includes('shirt') ? 'Shirts' : 'Pants')}
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-stone-900 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left Gallery (7 cols) */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto shrink-0 py-1">
              {product.images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-20 rounded-md overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIndex === idx ? 'border-stone-900 shadow-xs' : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.image_url}
                    alt={img.alt_text || product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Primary Viewport Image */}
          <div className="flex-1 relative aspect-[3/4] bg-[#F4F4F2] rounded-xl overflow-hidden border border-stone-200/80">
            {currentImage ? (
              <img
                src={currentImage}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
                The Vortex Wear
              </div>
            )}

            {isDiscounted && (
              <div className="absolute top-4 left-4 bg-stone-950 text-white text-[11px] font-bold px-2.5 py-1 rounded-sm tracking-wider uppercase">
                {discountPercent}% OFF
              </div>
            )}
          </div>
        </div>

        {/* Right Purchase Module (5 cols - Contiguous Module) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div>
            {/* Header info */}
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
              <span>{product.sku}</span>
              <div className="flex items-center gap-1 text-amber-500 font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span className="text-stone-900">{avgRating}</span>
                <span className="text-stone-400">({productReviews.length || product.review_count || 12} reviews)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-950 font-display tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Price display */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-bold text-stone-950 font-display tabular-nums">
                {settings.currency_symbol} {currentPrice.toLocaleString()}
              </span>
              {isDiscounted && (
                <span className="text-sm sm:text-base text-stone-400 line-through tabular-nums">
                  {settings.currency_symbol} {originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            <p className="text-xs text-stone-500 mt-1">
              Inclusive of all taxes · Cash on Delivery available across Pakistan
            </p>

            <div className="my-6 border-t border-stone-200/80" />

            {/* Color Selection */}
            {uniqueColors.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-800 mb-2.5">
                  <span>Color: <strong className="text-stone-950 font-bold">{currentColor}</strong></span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {uniqueColors.map((col) => {
                    const sampleVariant = product.variants.find((v) => v.color === col);
                    const isSelected = col === currentColor;
                    return (
                      <button
                        key={col}
                        onClick={() => {
                          const matchVar = product.variants.find((v) => v.color === col && v.size === selectedVariant?.size) ||
                            product.variants.find((v) => v.color === col);
                          if (matchVar) setSelectedVariantId(matchVar.id);
                        }}
                        className={`flex items-center gap-2 py-1.5 px-3 rounded-lg border text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-stone-950 bg-stone-50 text-stone-950 font-semibold shadow-xs'
                            : 'border-stone-200 text-stone-700 hover:border-stone-400'
                        }`}
                      >
                        {sampleVariant?.color_code && (
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20"
                            style={{ backgroundColor: sampleVariant.color_code }}
                          />
                        )}
                        <span>{col}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selection & Sizing Guide */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-800 mb-2.5">
                <span>Size: <strong className="text-stone-950 font-bold">{selectedVariant?.size}</strong></span>
                <button
                  onClick={() => setShowSizeModal(true)}
                  className="text-stone-600 hover:text-stone-950 flex items-center gap-1 font-semibold underline underline-offset-2"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  Size Guide
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {sizesForCurrentColor.map((variant) => {
                  const isSelected = variant.id === selectedVariantId;
                  const isAvailable = variant.is_active && variant.stock_quantity > 0;
                  return (
                    <button
                      key={variant.id}
                      disabled={!isAvailable}
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`py-2.5 text-xs font-bold rounded-lg border transition-all relative ${
                        isSelected
                          ? 'border-stone-950 bg-stone-950 text-white shadow-xs'
                          : isAvailable
                          ? 'border-stone-200 bg-white text-stone-800 hover:border-stone-400'
                          : 'border-stone-100 bg-stone-100 text-stone-300 cursor-not-allowed line-through'
                      }`}
                    >
                      {variant.size}
                    </button>
                  );
                })}
              </div>

              {/* Stock status indicator */}
              <div className="mt-3 text-xs flex items-center gap-2">
                {isOutOfStock ? (
                  <span className="text-rose-600 font-semibold">Out of Stock in this variant</span>
                ) : selectedVariant && selectedVariant.stock_quantity <= 5 ? (
                  <span className="text-amber-700 font-semibold">
                    Low Stock: Only {selectedVariant.stock_quantity} left to ship!
                  </span>
                ) : (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    In Stock — Ready for immediate dispatch
                  </span>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="mb-6 flex items-center gap-4">
                <span className="text-xs font-semibold text-stone-800">Quantity</span>
                <div className="flex items-center border border-stone-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="py-1 px-3 text-sm text-stone-600 hover:text-stone-900 disabled:opacity-30"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="py-1 px-3 text-xs font-bold tabular-nums text-stone-950">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(selectedVariant.stock_quantity, quantity + 1))}
                    className="py-1 px-3 text-sm text-stone-600 hover:text-stone-900 disabled:opacity-30"
                    disabled={quantity >= selectedVariant.stock_quantity}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="space-y-2.5">
              <div className="flex gap-2">
                <button
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 px-4 bg-[#121212] hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-md active:scale-98"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {isOutOfStock ? 'Sold Out' : 'Add to Bag'}
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  aria-label="Wishlist"
                  className={`p-3.5 rounded-lg border transition-colors ${
                    isWishlisted ? 'border-rose-500 bg-rose-50 text-rose-500' : 'border-stone-200 hover:border-stone-400 text-stone-700'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
                </button>
              </div>

              {!isOutOfStock && (
                <button
                  onClick={handleBuyNow}
                  className="w-full py-3.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 border border-stone-300/80"
                >
                  <Zap className="w-4 h-4 fill-stone-900" />
                  Buy Now with Cash on Delivery
                </button>
              )}

              {/* WhatsApp direct inquiry */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 border border-emerald-200"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                Ask about this garment on WhatsApp
              </a>
            </div>
          </div>

          {/* Delivery & Trust Highlights */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-3 text-xs text-stone-600">
            <div className="flex items-center gap-3">
              <Truck className="w-4 h-4 text-stone-800 shrink-0" />
              <span>
                <strong>Nationwide COD:</strong> 2–4 business days delivery across Karachi, Lahore, Islamabad, and all cities.
              </span>
            </div>
            <div className="flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-stone-800 shrink-0" />
              <span>
                <strong>7-Day Size Exchange:</strong> Inconvenient fit? Exchange seamlessly for another size.
              </span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-stone-800 shrink-0" />
              <span>
                <strong>Authentic Textile Guarantee:</strong> Custom twill weaves, reinforced seams, and true color fastness.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Technical Fabric Details */}
      <section className="mt-16 pt-12 border-t border-stone-200">
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
            Fabric & Architecture
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-950 mt-1 mb-4">
            Design Philosophy & Craft
          </h2>
          <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line mb-6">
            {product.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-stone-50 p-6 rounded-xl border border-stone-200/80">
            <div>
              <p className="font-semibold text-stone-900 mb-1">Textile Composition:</p>
              <p className="text-stone-600">
                {product.category_id.includes('shirt')
                  ? 'Heavy 100% long-staple combed cotton twill with enzyme bio-wash.'
                  : 'High-density ripstop cotton with articulated construction.'}
              </p>
            </div>
            <div>
              <p className="font-semibold text-stone-900 mb-1">Care Instructions:</p>
              <p className="text-stone-600">
                Machine wash cold at 30°C on delicate cycle. Line dry inside-out in shade. Warm iron if desired.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews & Submission */}
      <section className="mt-16 pt-12 border-t border-stone-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
              Customer Feedback
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-950 mt-1">
              Reviews & Ratings ({productReviews.length})
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-4">
            {productReviews.length === 0 ? (
              <div className="p-8 bg-stone-50 rounded-xl text-center text-xs text-stone-500">
                Be the first verified customer to leave a review for this garment!
              </div>
            ) : (
              productReviews.map((rev) => (
                <div key={rev.id} className="p-5 bg-white rounded-xl border border-stone-200 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[11px] text-stone-400">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-800 leading-relaxed mb-2">
                    "{rev.review_text}"
                  </p>
                  <p className="text-xs font-semibold text-stone-900">
                    {rev.customer_name} <span className="text-emerald-700 text-[11px] font-normal">· Verified Purchaser</span>
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Submit Review Box */}
          <div className="p-6 bg-stone-50 rounded-xl border border-stone-200/80 h-fit">
            <h3 className="text-sm font-bold text-stone-950 font-display mb-1">Write a Review</h3>
            <p className="text-xs text-stone-500 mb-4">Share your thoughts on the drape, fit, and textile quality.</p>

            {reviewSubmitted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>Your review has been submitted for store moderation. Thank you!</span>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bilal A."
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="w-full py-1.5 px-3 bg-white border border-stone-300 rounded-md focus:outline-hidden focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Rating</label>
                  <div className="flex gap-2">
                    {[5, 4, 3, 2, 1].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setReviewRating(num)}
                        className={`py-1 px-2.5 rounded-md border font-semibold flex items-center gap-1 ${
                          reviewRating === num ? 'bg-stone-950 text-white border-stone-950' : 'bg-white text-stone-700 border-stone-300'
                        }`}
                      >
                        <Star className="w-3 h-3 fill-current" />
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Your Review</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe the fabric feel, shoulder fit, length..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full py-1.5 px-3 bg-white border border-stone-300 rounded-md focus:outline-hidden focus:border-stone-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-stone-950 hover:bg-stone-800 text-white font-bold rounded-lg transition-colors shadow-xs"
                >
                  Submit Review
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 pt-12 border-t border-stone-200">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
                Complete The Look
              </span>
              <h2 className="text-2xl font-bold font-display text-stone-950 mt-1">
                You May Also Like
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onNavigate={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}

      {/* Sizing Modal */}
      {showSizeModal && (
        <SizeChartModal
          categorySlug={product.category_id}
          onClose={() => setShowSizeModal(false)}
        />
      )}
    </div>
  );
};
