import React from 'react';
import { Home, Compass, Search, Heart, ShoppingBag } from 'lucide-react';
import { useStore } from '../lib/store';

interface MobileBottomNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenCart: () => void;
  onOpenSearch: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentPath,
  onNavigate,
  onOpenCart,
  onOpenSearch,
}) => {
  const { cartCount, wishlist } = useStore();

  const isHome = currentPath === '/';
  const isShop = currentPath.startsWith('/shop') || currentPath === '/shirts' || currentPath === '/pants';
  const isWishlist = currentPath === '/wishlist';

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 safe-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.05)] transition-transform duration-200"
    >
      <div className="flex items-center justify-around h-15 max-w-lg mx-auto px-2">
        {/* 1. Home */}
        <button
          onClick={() => {
            if (isHome) {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              onNavigate('/');
            }
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 btn-press ${
            isHome ? 'text-stone-950 font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
          aria-label="Home"
        >
          <Home className={`w-5 h-5 ${isHome ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight mt-0.5">Home</span>
        </button>

        {/* 2. Shop Collections */}
        <button
          onClick={() => onNavigate('/shop')}
          className={`flex-1 flex flex-col items-center justify-center py-1 btn-press ${
            isShop ? 'text-stone-950 font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
          aria-label="Shop"
        >
          <Compass className={`w-5 h-5 ${isShop ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight mt-0.5">Shop</span>
        </button>

        {/* 3. Search */}
        <button
          onClick={onOpenSearch}
          className="flex-1 flex flex-col items-center justify-center py-1 text-stone-500 hover:text-stone-800 btn-press"
          aria-label="Search"
        >
          <Search className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] tracking-tight mt-0.5">Search</span>
        </button>

        {/* 4. Wishlist */}
        <button
          onClick={() => onNavigate('/wishlist')}
          className={`flex-1 flex flex-col items-center justify-center py-1 relative btn-press ${
            isWishlist ? 'text-stone-950 font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
          aria-label={`Wishlist (${wishlist.length} items)`}
        >
          <div className="relative">
            <Heart className={`w-5 h-5 ${isWishlist ? 'stroke-[2.4] fill-stone-950 text-stone-950' : 'stroke-[1.8]'}`} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-stone-950 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Wishlist</span>
        </button>

        {/* 5. Cart / Bag */}
        <button
          onClick={onOpenCart}
          className="flex-1 flex flex-col items-center justify-center py-1 relative text-stone-500 hover:text-stone-800 btn-press"
          aria-label={`Shopping Bag (${cartCount} items)`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-amber-500 text-stone-950 text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Bag</span>
        </button>
      </div>
    </nav>
  );
};
