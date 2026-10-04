import React, { useState } from 'react';
import { Search, ShoppingBag, Heart, User, Menu, X, Shield } from 'lucide-react';
import { useStore } from '../lib/store';
import { AdminAuthService } from '../lib/adminAuth';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPath,
  onNavigate,
  onOpenCart,
  onOpenAuth,
  onOpenSearch,
}) => {
  const { cartCount, wishlist, currentUser, settings } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/shop' },
    { label: 'Pants', path: '/pants' },
    { label: 'Shirts', path: '/shirts' },
    { label: 'About', path: '/about' },
    { label: 'New Arrivals', path: '/new-arrivals' },
    { label: 'Sale', path: '/sale' },
  ];

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  const handleBrandLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (window.location.pathname === '/' && !window.location.search && !window.location.hash) {
      window.location.reload();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <>
      {/* Slim Promotional Announcement */}
      {showAnnouncement && settings.announcement && (
        <div className="bg-[#121212] text-white/90 text-[11px] sm:text-xs py-2 px-4 flex items-center justify-between text-center tracking-wide font-medium border-b border-white/5">
          <div className="w-6" /> {/* spacer */}
          <div className="truncate px-2">{settings.announcement}</div>
          <button
            onClick={() => setShowAnnouncement(false)}
            className="text-white/60 hover:text-white p-0.5"
            aria-label="Dismiss announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Top Bar - Strict 3-zone Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-stone-700 hover:text-stone-950 -ml-2"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <button
              onClick={handleBrandLogoClick}
              className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-950 font-display hover:opacity-90 transition-opacity"
            >
              THE VORTEX WEAR
            </button>
          </div>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-stone-600">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className={`transition-colors whitespace-nowrap hover:text-stone-950 relative py-1 ${
                    isActive ? 'text-stone-950 font-semibold' : ''
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-950 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search trigger */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-full transition-colors"
              aria-label="Search clothing"
              title="Search products"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <button
              onClick={() => handleNavClick('/wishlist')}
              className="relative p-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-full transition-colors hidden sm:flex"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-stone-900 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Account */}
            <button
              onClick={onOpenAuth}
              className="p-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-full transition-colors flex items-center gap-1.5"
              aria-label="Account"
              title={currentUser ? currentUser.full_name : 'Sign in'}
            >
              <User className="w-5 h-5" />
            </button>

            {/* Admin Badge if authenticated */}
            {AdminAuthService.isAuthenticated() && (
              <button
                onClick={() => handleNavClick('/admin')}
                className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200"
              >
                <Shield className="w-3 h-3" />
                Admin
              </button>
            )}

            {/* Cart trigger */}
            <button
              onClick={onOpenCart}
              className="relative py-2 px-3 bg-[#121212] hover:bg-stone-800 text-white rounded-lg transition-all flex items-center gap-2 text-xs font-semibold shadow-xs"
              aria-label="Open Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Bag</span>
              <span className="bg-white/20 text-white px-1.5 py-0.5 rounded text-[11px] tabular-nums">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between p-6 animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
                <button
                  onClick={handleBrandLogoClick}
                  className="text-lg font-extrabold tracking-tight font-display text-stone-950 hover:opacity-90 text-left transition-opacity"
                >
                  THE VORTEX WEAR
                </button>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-stone-500 hover:text-stone-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-4 text-base font-medium text-stone-800">
                {navLinks.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => handleNavClick(link.path)}
                    className={`text-left py-2 hover:text-stone-950 transition-colors ${
                      currentPath === link.path ? 'font-bold text-stone-950 border-l-2 border-stone-950 pl-3' : ''
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
                <div className="pt-4 border-t border-stone-100 flex flex-col gap-3">
                  <button
                    onClick={() => handleNavClick('/track-order')}
                    className="text-left py-2 text-stone-700 font-semibold flex items-center justify-between hover:text-stone-950"
                  >
                    <span>Track My Order</span>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Live</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('/wishlist')}
                    className="text-left py-2 text-stone-600 flex items-center justify-between"
                  >
                    <span>My Wishlist</span>
                    <span className="tabular-nums font-semibold">{wishlist.length}</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth();
                    }}
                    className="text-left py-2 text-stone-600"
                  >
                    {currentUser ? `Signed in as ${currentUser.full_name}` : 'Login / Register'}
                  </button>
                  {AdminAuthService.isAuthenticated() && (
                    <button
                      onClick={() => handleNavClick('/admin')}
                      className="text-left py-2 font-semibold text-amber-700 flex items-center gap-1.5"
                    >
                      <Shield className="w-4 h-4" />
                      Admin Control Center
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-stone-100 text-xs text-stone-500">
              <p className="font-semibold text-stone-900 mb-1">The Vortex Wear Concierge</p>
              <p>Email: {settings.business_email}</p>
              <p>WhatsApp: {settings.whatsapp_number}</p>
            </div>
          </div>

          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </>
  );
};
