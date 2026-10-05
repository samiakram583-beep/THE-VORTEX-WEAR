import React from 'react';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { Product } from '../lib/types';
import { useStore } from '../lib/store';
import { categoryShirtsVortex, resolveImageUrl } from '../assets/images';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  onNavigate: (slug: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView, onNavigate }) => {
  const { isInWishlist, toggleWishlist, addToCart, settings } = useStore();
  const isWishlisted = isInWishlist(product.id);

  const rawPrimary = product.images.find((img) => img.is_primary)?.image_url || product.images[0]?.image_url;
  const primaryImage = resolveImageUrl(rawPrimary, categoryShirtsVortex);

  const defaultVariant = product.variants.find((v) => v.is_active && v.stock_quantity > 0) || product.variants[0];
  const isSoldOut = !product.variants.some((v) => v.is_active && v.stock_quantity > 0);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (defaultVariant && !isSoldOut) {
      addToCart(product, defaultVariant, 1);
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      onClick={() => onNavigate(product.slug)}
      className="group cursor-pointer flex flex-col bg-white rounded-lg overflow-hidden border border-stone-200/80 hover:border-stone-400 transition-all duration-300 hover:shadow-lg active:scale-[0.985] btn-press"
    >
      {/* Visual Image Container */}
      <div className="relative aspect-[3/4] bg-[#F4F4F2] overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={(e) => {
              // Safe fallback image
              e.currentTarget.src = categoryShirtsVortex;
            }}
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400 text-xs">
            The Vortex Wear
          </div>
        )}

        {/* Status indicator (single, unboxed subtle label) */}
        <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex flex-col gap-1">
          {isSoldOut ? (
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-rose-600 bg-white/95 px-2 py-0.5 rounded-xs shadow-xs">
              Sold Out
            </span>
          ) : product.sale_price ? (
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-stone-900 bg-white/95 px-2 py-0.5 rounded-xs shadow-xs">
              Sale
            </span>
          ) : product.is_new_arrival ? (
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-stone-600 bg-white/95 px-2 py-0.5 rounded-xs shadow-xs">
              New
            </span>
          ) : null}
        </div>

        {/* Wishlist Button - comfortable touch target */}
        <button
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-stone-700 hover:text-stone-950 hover:bg-white shadow-xs transition-transform active:scale-90"
        >
          <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Hover Quick Actions */}
        <div className="absolute inset-x-2.5 bottom-2.5 sm:inset-x-3 sm:bottom-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 flex gap-2">
          {!isSoldOut && (
            <button
              onClick={handleQuickAdd}
              className="flex-1 py-2 px-3 bg-[#121212] hover:bg-stone-800 text-white text-xs font-semibold rounded-md shadow-md flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap btn-press"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Quick Add
            </button>
          )}
          {onQuickView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              className="p-2 bg-white hover:bg-stone-100 text-stone-800 rounded-md shadow-md transition-colors btn-press"
              title="Quick view"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content & Metadata */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-2">
        <div>
          {/* Unboxed metadata separator */}
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-stone-500 mb-1">
            <span>{product.category_name || (product.category_id.includes('shirt') ? 'Shirts' : 'Pants')}</span>
            <span aria-hidden="true">·</span>
            <span>{product.sku}</span>
          </div>

          <h3 className="text-sm font-semibold text-stone-900 group-hover:text-stone-700 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </div>

        {/* Price & Stock */}
        <div className="flex items-baseline justify-between pt-1 border-t border-stone-100">
          <div className="flex items-baseline gap-2 tabular-nums">
            {product.sale_price ? (
              <>
                <span className="text-sm font-bold text-stone-950 font-display">
                  {settings.currency_symbol} {product.sale_price.toLocaleString()}
                </span>
                <span className="text-xs text-stone-400 line-through">
                  {settings.currency_symbol} {product.base_price.toLocaleString()}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-stone-950 font-display">
                {settings.currency_symbol} {product.base_price.toLocaleString()}
              </span>
            )}
          </div>

          <div className="text-[11px] text-stone-500">
            {product.variants.length > 1 ? `${product.variants.length} options` : `${defaultVariant?.size || 'Standard'}`}
          </div>
        </div>
      </div>
    </div>
  );
};
