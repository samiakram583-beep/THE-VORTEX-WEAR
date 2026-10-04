import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useStore } from '../lib/store';

interface WhatsAppFloatingButtonProps {
  productContext?: {
    name: string;
    url?: string;
  };
}

export const WhatsAppFloatingButton: React.FC<WhatsAppFloatingButtonProps> = ({ productContext }) => {
  const { settings } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  // Clean phone number for wa.me URL
  const rawNumber = settings.whatsapp_number.replace(/[^0-9]/g, '');

  const defaultText = encodeURIComponent(
    productContext
      ? `Hello The Vortex Wear! I would like to inquire about "${productContext.name}". Can you share availability and sizing guidance?`
      : 'Hello The Vortex Wear! I would like to inquire about your modern clothing collection.'
  );

  const whatsappUrl = `https://wa.me/${rawNumber}?text=${defaultText}`;

  return (
    <div className="fixed bottom-6 left-6 z-40">
      {isOpen && (
        <div className="mb-3 p-4 bg-white rounded-xl shadow-2xl border border-stone-200 w-72 text-sm animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-semibold text-stone-900">The Vortex Wear Support</p>
              <p className="text-xs text-stone-500">Typical reply in under 15 minutes</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-stone-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-stone-600 text-xs mb-3">
            Have questions about sizes, fabrics, or COD delivery in Pakistan? Chat directly with our customer concierge.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            Start WhatsApp Chat
          </a>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-4 py-3 bg-[#121212] hover:bg-stone-800 text-white rounded-full shadow-lg border border-white/10 transition-all hover:scale-105 active:scale-95 group"
        aria-label="Contact The Vortex Wear on WhatsApp"
      >
        <div className="w-3 h-3 rounded-full bg-[#25D366] animate-pulse" />
        <MessageCircle className="w-4 h-4 text-[#25D366]" />
        <span className="text-xs font-medium tracking-wide">WhatsApp Concierge</span>
      </button>
    </div>
  );
};
