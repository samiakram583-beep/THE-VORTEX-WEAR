import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, X, RotateCcw } from 'lucide-react';
import { useStore } from '../lib/store';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../lib/types';

interface ShopPageProps {
  initialCategory?: string; // 'shirts' | 'pants' | undefined
  filterSaleOnly?: boolean;
  filterNewOnly?: boolean;
  onNavigate: (path: string) => void;
  onSelectProduct: (slug: string) => void;
  onQuickView?: (product: Product) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  initialCategory,
  filterSaleOnly = false,
  filterNewOnly = false,
  onNavigate: _onNavigate,
  onSelectProduct,
  onQuickView,
}) => {
  const { products, settings, categories } = useStore();

  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategory || 'all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(7000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'rating'>('newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Extract unique colors and sizes from current catalog
  const availableColors = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.variants.forEach((v) => set.add(v.color)));
    return Array.from(set);
  }, [products]);

  const availableSizes = ['S', 'M', 'L', 'XL', 'XXL'];

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (!p.is_active) return false;

        // Specific promo flags
        if (filterSaleOnly && !p.is_on_sale && !p.sale_price) return false;
        if (filterNewOnly && !p.is_new_arrival) return false;

        // Category filter
        if (categoryFilter !== 'all') {
          const cat = categoryFilter.toLowerCase();
          const matchCat =
            p.category_slug?.toLowerCase().includes(cat) ||
            p.category_id.toLowerCase().includes(cat) ||
            p.category_name?.toLowerCase().includes(cat);
          if (!matchCat) return false;
        }

        // Price filter
        const price = p.sale_price ?? p.base_price;
        if (price > maxPrice) return false;

        // Size filter
        if (selectedSize !== 'all') {
          const hasSize = p.variants.some((v) => v.size === selectedSize && v.is_active && v.stock_quantity > 0);
          if (!hasSize) return false;
        }

        // Color filter
        if (selectedColor !== 'all') {
          const hasColor = p.variants.some((v) => v.color === selectedColor && v.is_active);
          if (!hasColor) return false;
        }

        // In-stock filter
        if (inStockOnly) {
          const hasStock = p.variants.some((v) => v.is_active && v.stock_quantity > 0);
          if (!hasStock) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = a.sale_price ?? a.base_price;
        const priceB = b.sale_price ?? b.base_price;

        if (sortBy === 'price-asc') return priceA - priceB;
        if (sortBy === 'price-desc') return priceB - priceA;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [products, categoryFilter, maxPrice, selectedSize, selectedColor, inStockOnly, sortBy, filterSaleOnly, filterNewOnly]);

  const resetFilters = () => {
    setCategoryFilter('all');
    setSelectedSize('all');
    setSelectedColor('all');
    setMaxPrice(7000);
    setInStockOnly(false);
    setSortBy('newest');
  };

  const hasActiveFilters =
    categoryFilter !== 'all' ||
    selectedSize !== 'all' ||
    selectedColor !== 'all' ||
    maxPrice < 7000 ||
    inStockOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Title & Breadcrumb */}
      <div className="pb-8 border-b border-stone-200">
        <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
          The Vortex Wear Wardrobe
        </span>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mt-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-950 font-display">
            {filterSaleOnly
              ? 'Seasonal Sale'
              : filterNewOnly
              ? 'New Arrivals'
              : categoryFilter === 'shirts'
              ? "Men's Shirts & Overshirts"
              : categoryFilter === 'pants'
              ? 'Tailored Pants & Cargos'
              : 'All Menswear Collections'}
          </h1>
          <p className="text-xs text-stone-500 tabular-nums">
            Showing {filteredProducts.length} results
          </p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="py-4 flex items-center justify-between gap-4 border-b border-stone-100 text-xs">
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="lg:hidden flex items-center gap-2 py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-900 font-semibold rounded-md transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters {hasActiveFilters && '•'}
        </button>

        {/* Desktop Quick Category Buttons */}
        <div className="hidden lg:flex items-center gap-1.5 p-1 bg-stone-100 rounded-lg">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 font-semibold rounded-md transition-colors cursor-pointer ${
              categoryFilter === 'all' ? 'bg-white text-stone-950 shadow-xs' : 'text-stone-600 hover:text-stone-950'
            }`}
          >
            All Pieces
          </button>
          {categories.filter((c) => c.is_active).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.slug)}
              className={`px-3 py-1.5 font-semibold rounded-md transition-colors cursor-pointer ${
                categoryFilter === cat.slug || categoryFilter === cat.id
                  ? 'bg-white text-stone-950 shadow-xs'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-stone-500 font-medium hidden sm:inline">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="py-1.5 px-3 bg-white border border-stone-200 rounded-md text-xs font-medium text-stone-800 focus:outline-hidden focus:border-stone-900"
          >
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6 pr-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-950">Refine Selection</h3>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-[11px] text-stone-500 hover:text-stone-950 flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-2">
              Max Price: {settings.currency_symbol} {maxPrice.toLocaleString()}
            </label>
            <input
              type="range"
              min={3000}
              max={7000}
              step={200}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-stone-950 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 mt-1">
              <span>{settings.currency_symbol} 3,000</span>
              <span>{settings.currency_symbol} 7,000+</span>
            </div>
          </div>

          {/* Sizes */}
          <div className="pt-4 border-t border-stone-100">
            <label className="block text-xs font-semibold text-stone-800 mb-2.5">Size</label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedSize('all')}
                className={`py-1 px-2.5 text-xs font-semibold rounded-md border transition-colors ${
                  selectedSize === 'all'
                    ? 'bg-stone-950 text-white border-stone-950'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                All
              </button>
              {availableSizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(selectedSize === sz ? 'all' : sz)}
                  className={`py-1 px-2.5 text-xs font-semibold rounded-md border transition-colors ${
                    selectedSize === sz
                      ? 'bg-stone-950 text-white border-stone-950'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="pt-4 border-t border-stone-100">
            <label className="block text-xs font-semibold text-stone-800 mb-2.5">Color</label>
            <div className="flex flex-col gap-1.5 text-xs text-stone-700">
              <button
                onClick={() => setSelectedColor('all')}
                className={`text-left py-1 px-2 rounded-md transition-colors ${
                  selectedColor === 'all' ? 'font-bold text-stone-950 bg-stone-100' : 'hover:text-stone-950'
                }`}
              >
                All Colors
              </button>
              {availableColors.map((col) => (
                <button
                  key={col}
                  onClick={() => setSelectedColor(selectedColor === col ? 'all' : col)}
                  className={`text-left py-1 px-2 rounded-md transition-colors flex items-center justify-between ${
                    selectedColor === col ? 'font-bold text-stone-950 bg-stone-100' : 'hover:text-stone-950'
                  }`}
                >
                  <span>{col}</span>
                  {selectedColor === col && <span className="w-1.5 h-1.5 rounded-full bg-stone-950" />}
                </button>
              ))}
            </div>
          </div>

          {/* In Stock Only */}
          <div className="pt-4 border-t border-stone-100">
            <label className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 accent-stone-950"
              />
              <span className="font-medium">In-Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center bg-stone-50 rounded-xl border border-stone-200/80">
              <h3 className="text-base font-bold text-stone-950 font-display mb-1">
                No matching garments found
              </h3>
              <p className="text-xs text-stone-500 mb-4 max-w-sm mx-auto">
                No pieces match your selected size or price filter. Try loosening the filter criteria.
              </p>
              <button
                onClick={resetFilters}
                className="py-2 px-4 bg-stone-950 text-white text-xs font-bold rounded-lg hover:bg-stone-800 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onNavigate={onSelectProduct}
                  onQuickView={onQuickView}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Slide-out */}
      {mobileFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-4/5 max-w-sm bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <h3 className="text-sm font-bold text-stone-950 font-display">Filters</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-stone-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-2">Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
                  <button
                    onClick={() => setCategoryFilter('all')}
                    className={`py-1.5 px-2 font-semibold capitalize rounded-md border cursor-pointer ${
                      categoryFilter === 'all' ? 'bg-stone-950 text-white border-stone-950' : 'border-stone-200 text-stone-700'
                    }`}
                  >
                    All Pieces
                  </button>
                  {categories.filter((c) => c.is_active).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryFilter(cat.slug)}
                      className={`py-1.5 px-2 font-semibold capitalize rounded-md border cursor-pointer ${
                        categoryFilter === cat.slug || categoryFilter === cat.id
                          ? 'bg-stone-950 text-white border-stone-950'
                          : 'border-stone-200 text-stone-700'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-2">
                  Max Price: {settings.currency_symbol} {maxPrice.toLocaleString()}
                </label>
                <input
                  type="range"
                  min={3000}
                  max={7000}
                  step={200}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-stone-950"
                />
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-2">Size</label>
                <div className="flex flex-wrap gap-1.5">
                  {['all', ...availableSizes].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`py-1 px-3 text-xs font-semibold rounded-md border ${
                        selectedSize === sz ? 'bg-stone-950 text-white border-stone-950' : 'border-stone-200'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-stone-200 flex gap-2">
              <button
                onClick={resetFilters}
                className="flex-1 py-2.5 px-3 bg-stone-100 text-stone-900 text-xs font-semibold rounded-lg"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 px-3 bg-stone-950 text-white text-xs font-bold rounded-lg"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
