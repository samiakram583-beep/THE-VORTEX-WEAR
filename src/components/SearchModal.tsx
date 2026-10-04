import React, { useState, useMemo } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { useStore } from '../lib/store';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (slug: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectProduct }) => {
  const { products, settings } = useStore();
  const [query, setQuery] = useState('');

  const suggestions = ['Overshirt', 'Cargo Pants', 'Pleated Trousers', 'Oxford Shirt', 'Linen', 'Black'];

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter((p) => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchCategory = p.category_name?.toLowerCase().includes(q) || p.category_slug?.toLowerCase().includes(q);
      const matchVariant = p.variants.some((v) => v.color.toLowerCase().includes(q) || v.size.toLowerCase().includes(q));
      return (matchName || matchSku || matchDesc || matchCategory || matchVariant) && p.is_active;
    });
  }, [products, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 sm:p-6 md:p-20">
      <div className="bg-white rounded-xl shadow-2xl border border-stone-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-stone-200 gap-3">
          <Search className="w-5 h-5 text-stone-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search shirts, tailored pants, fabrics, or SKU..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent border-none outline-hidden text-stone-900 placeholder:text-stone-400"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-stone-400 hover:text-stone-700">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="text-xs font-semibold text-stone-500 hover:text-stone-950 px-2 py-1">
            ESC
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-3 bg-stone-50 border-b border-stone-200/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-stone-400 font-medium">Suggestions:</span>
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setQuery(s)}
              className="px-2.5 py-1 bg-white hover:bg-stone-200 text-stone-700 rounded-md border border-stone-200 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-4 divide-y divide-stone-100">
          {query.trim() === '' ? (
            <div className="text-center py-8 text-xs text-stone-400">
              Type keywords above to instantly locate products across our catalog.
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-stone-500 text-xs">
              No matching products found for "<span className="font-semibold text-stone-900">{query}</span>".
              <p className="text-stone-400 mt-1">Try searching for "Overshirt", "Cargo", or "Trousers".</p>
            </div>
          ) : (
            results.map((product) => {
              const img = product.images[0]?.image_url;
              return (
                <div
                  key={product.id}
                  onClick={() => {
                    onSelectProduct(product.slug);
                    onClose();
                  }}
                  className="py-3 px-2 flex items-center justify-between gap-4 hover:bg-stone-50 rounded-lg cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-14 bg-stone-100 rounded-md overflow-hidden shrink-0 border border-stone-200">
                      {img ? (
                        <img src={img} alt={product.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400 text-center px-0.5">The Vortex Wear</div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-stone-900 group-hover:text-stone-700 line-clamp-1">
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                        <span>{product.sku}</span>
                        <span aria-hidden="true">·</span>
                        <span>{product.category_name || (product.category_id.includes('shirt') ? 'Shirts' : 'Pants')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-stone-950 tabular-nums font-display">
                      {settings.currency_symbol} {(product.sale_price ?? product.base_price).toLocaleString()}
                    </span>
                    <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
