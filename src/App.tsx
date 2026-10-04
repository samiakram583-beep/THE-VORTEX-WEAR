/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './lib/store';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { AuthModal } from './components/AuthModal';
import { ToastContainer } from './components/ToastContainer';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { MobileBottomNav } from './components/MobileBottomNav';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import {
  AboutPage,
  ContactPage,
  ShippingPolicyPage,
  ReturnPolicyPage,
  PrivacyTermsPage,
  WishlistPage,
  AccountOrdersPage,
} from './pages/StaticPages';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminAuthService } from './lib/adminAuth';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

function MainStoreApp() {
  const { currentUser } = useStore();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState<string>('');

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (slug: string) => {
    navigate(`/product/${slug}`);
  };

  const handleOrderSuccess = (orderNumber: string) => {
    setConfirmedOrderNumber(orderNumber);
    navigate(`/order-confirmation/${orderNumber}`);
  };

  // Determine current view
  const renderCurrentView = () => {
    // 1. DEDICATED ADMIN LOGIN ROUTE
    if (currentPath === '/admin/login') {
      return (
        <AdminLogin
          onLoginSuccess={() => navigate('/admin/dashboard')}
          onExit={() => navigate('/')}
        />
      );
    }

    // 2. PROTECTED ADMIN ROUTES: /admin, /admin/dashboard, /admin/products, /admin/orders, /admin/customers, /admin/inventory, /admin/categories, /admin/coupons, /admin/reviews, /admin/banners, /admin/settings, /admin/analytics
    if (currentPath.startsWith('/admin')) {
      const isAuthorizedAdmin = AdminAuthService.isAuthenticated();

      // Case A: Not authenticated as Admin
      if (!isAuthorizedAdmin) {
        // If logged in as customer on storefront, show strict 403 Forbidden Access Denied
        if (currentUser && currentUser.role === 'customer') {
          return (
            <div className="min-h-screen bg-[#0F0F10] text-stone-200 flex flex-col items-center justify-center p-6 text-center">
              <div className="max-w-md w-full bg-[#171719] rounded-2xl border border-rose-900/50 p-8 shadow-2xl space-y-4">
                <div className="w-14 h-14 rounded-full bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-rose-400 block">
                  HTTP 403 · FORBIDDEN
                </span>
                <h1 className="text-2xl font-bold font-display text-white">Access Denied</h1>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Customer account <code>{currentUser.email}</code> does not possess administrator clearance. Access to <code>{currentPath}</code> is restricted exclusively to authorized The Vortex Wear administrative staff.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => navigate('/')}
                    className="flex-1 py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Return to Store
                  </button>
                  <button
                    onClick={() => navigate('/admin/login')}
                    className="flex-1 py-2.5 px-4 bg-white hover:bg-stone-200 text-stone-950 text-xs font-bold rounded-lg transition-colors"
                  >
                    Admin Sign In
                  </button>
                </div>
              </div>
            </div>
          );
        }

        // Unauthenticated visitor -> Redirect to Admin Login with notification
        return (
          <AdminLogin
            onLoginSuccess={() => navigate('/admin/dashboard')}
            onExit={() => navigate('/')}
            unauthorizedNotice="Authentication required. Please sign in with verified administrator credentials."
          />
        );
      }

      // Case B: Authorized Administrator with active session & verified MFA
      return (
        <AdminDashboard
          currentPath={currentPath}
          onNavigate={navigate}
          onExitAdmin={() => navigate('/')}
          onNavigateToProduct={(slug) => navigate(`/product/${slug}`)}
        />
      );
    }

    if (currentPath.startsWith('/product/')) {
      const slug = currentPath.replace('/product/', '');
      return (
        <ProductDetailPage
          slug={slug}
          onNavigate={navigate}
          onSelectProduct={handleSelectProduct}
          onInstantBuy={() => navigate('/checkout')}
        />
      );
    }

    if (currentPath.startsWith('/order-confirmation/')) {
      const num = currentPath.replace('/order-confirmation/', '') || confirmedOrderNumber;
      return <OrderConfirmationPage orderNumber={num} onNavigate={navigate} />;
    }

    if (currentPath.startsWith('/track/') || currentPath.startsWith('/track-order/')) {
      const orderQuery = currentPath.replace(/^\/(track|track-order)\//, '');
      return <TrackOrderPage onNavigate={navigate} initialOrderQuery={orderQuery} />;
    }

    switch (currentPath) {
      case '/':
        return (
          <HomePage
            onNavigate={navigate}
            onSelectProduct={handleSelectProduct}
          />
        );

      case '/shop':
        return (
          <ShopPage
            onNavigate={navigate}
            onSelectProduct={handleSelectProduct}
          />
        );

      case '/shirts':
        return (
          <ShopPage
            initialCategory="shirts"
            onNavigate={navigate}
            onSelectProduct={handleSelectProduct}
          />
        );

      case '/pants':
        return (
          <ShopPage
            initialCategory="pants"
            onNavigate={navigate}
            onSelectProduct={handleSelectProduct}
          />
        );

      case '/new-arrivals':
        return (
          <ShopPage
            filterNewOnly={true}
            onNavigate={navigate}
            onSelectProduct={handleSelectProduct}
          />
        );

      case '/sale':
        return (
          <ShopPage
            filterSaleOnly={true}
            onNavigate={navigate}
            onSelectProduct={handleSelectProduct}
          />
        );

      case '/checkout':
        return (
          <CheckoutPage
            onNavigate={navigate}
            onOrderSuccess={handleOrderSuccess}
          />
        );

      case '/about':
        return <AboutPage onNavigate={navigate} />;

      case '/contact':
        return <ContactPage onNavigate={navigate} />;

      case '/shipping-policy':
        return <ShippingPolicyPage onNavigate={navigate} />;

      case '/return-policy':
        return <ReturnPolicyPage onNavigate={navigate} />;

      case '/privacy-policy':
        return <PrivacyTermsPage type="privacy" onNavigate={navigate} />;

      case '/terms':
        return <PrivacyTermsPage type="terms" onNavigate={navigate} />;

      case '/wishlist':
        return (
          <WishlistPage
            onNavigate={navigate}
            onSelectProduct={handleSelectProduct}
          />
        );

      case '/account':
      case '/orders':
        return <AccountOrdersPage onNavigate={navigate} />;

      case '/track-order':
      case '/track':
      case '/order-tracking':
        return <TrackOrderPage onNavigate={navigate} />;

      case '/cart':
        return (
          <ShopPage
            onNavigate={navigate}
            onSelectProduct={handleSelectProduct}
          />
        );

      default:
        return (
          <HomePage
            onNavigate={navigate}
            onSelectProduct={handleSelectProduct}
          />
        );
    }
  };

  const isAdminView = currentPath.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9] text-[#121212]">
      {!isAdminView && (
        <Header
          currentPath={currentPath}
          onNavigate={navigate}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
        />
      )}

      <main className="flex-1">{renderCurrentView()}</main>

      {!isAdminView && <Footer onNavigate={navigate} />}

      {/* Global Modals & Drawers */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false);
          navigate('/checkout');
        }}
        onNavigate={navigate}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={handleSelectProduct}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onNavigateToAdmin={() => navigate('/admin/dashboard')}
        onNavigateToOrders={() => navigate('/account')}
      />

      {/* Floating WhatsApp Concierge (+92 300 1046010) */}
      {!isAdminView && <WhatsAppFloatingButton />}

      {/* Mobile Bottom Navigation Bar (<1024px) */}
      {!isAdminView && (
        <MobileBottomNav
          currentPath={currentPath}
          onNavigate={navigate}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
        />
      )}

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <MainStoreApp />
    </StoreProvider>
  );
}
