import React from 'react';
import { Mail, Phone, ArrowUpRight, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { useStore } from '../lib/store';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings } = useStore();

  return (
    <footer className="bg-[#121212] text-stone-300 pt-16 pb-12 border-t border-stone-800">
      {/* Trust Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-stone-800/80">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-stone-900 rounded-lg text-white border border-stone-800 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white font-display">Cash on Delivery</h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Pay in cash when your order reaches your doorstep anywhere in Pakistan.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-stone-900 rounded-lg text-white border border-stone-800 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white font-display">Japanese & Egyptian Cottons</h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Uncompromising textile density, custom hardware, and precision tailoring.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-stone-900 rounded-lg text-white border border-stone-800 shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white font-display">7-Day Easy Exchange</h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Hassle-free size or style replacements delivered directly to you.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-stone-900 rounded-lg text-[#25D366] border border-stone-800 shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white font-display">WhatsApp Concierge</h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Live sizing guidance and order updates at +92 300 1046010.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <span className="text-xl font-extrabold tracking-tight text-white font-display">
              THE VORTEX WEAR
            </span>
            <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
              Define Your Style. Modern menswear designed with architectural silhouettes, tactile fabrics, and effortless versatility. Proudly serving modern tastemakers across Pakistan.
            </p>
            <div className="pt-2 text-xs text-stone-400 space-y-1.5">
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-stone-400" />
                <a href={`mailto:${settings.business_email}`} className="hover:text-white transition-colors">
                  {settings.business_email}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-stone-400" />
                <span>Our other Email:</span>
                <a href="mailto:samiakram583@gmail.com" className="hover:text-white transition-colors underline">
                  samiakram583@gmail.com
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#25D366]" />
                <a
                  href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {settings.whatsapp_number}
                </a>
              </p>
            </div>
          </div>

          {/* Catalog */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
              Collections
            </h5>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <button onClick={() => onNavigate('/shop')} className="hover:text-white transition-colors">
                  All Collections
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/shirts')} className="hover:text-white transition-colors">
                  Men's Shirts & Overshirts
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/pants')} className="hover:text-white transition-colors">
                  Tailored Pants & Cargos
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/new-arrivals')} className="hover:text-white transition-colors">
                  New Arrivals
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/sale')} className="hover:text-white transition-colors">
                  Seasonal Sale
                </button>
              </li>
            </ul>
          </div>

          {/* Brand & Customer Care */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
              Customer Care
            </h5>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <button onClick={() => onNavigate('/about')} className="hover:text-white transition-colors">
                  About The Vortex Wear
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/contact')} className="hover:text-white transition-colors">
                  Contact Us
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/shipping-policy')} className="hover:text-white transition-colors">
                  Shipping Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/return-policy')} className="hover:text-white transition-colors">
                  Returns & Exchanges
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Policies */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
              Legal & Trust
            </h5>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <button onClick={() => onNavigate('/privacy-policy')} className="hover:text-white transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/terms')} className="hover:text-white transition-colors">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/admin')} className="text-stone-500 hover:text-amber-400 transition-colors flex items-center gap-1">
                  Admin Portal
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
        <p>© {new Date().getFullYear()} The Vortex Wear. All rights reserved. Registered Clothing Brand in Pakistan.</p>
        <p className="flex items-center gap-3">
          <span>Prices in Pakistani Rupees (₨)</span>
          <span aria-hidden="true">·</span>
          <span>Cash on Delivery</span>
        </p>
      </div>
    </footer>
  );
};
