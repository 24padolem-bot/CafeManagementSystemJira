import React, { useState, useMemo } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Category, MenuItem } from '../../types/cafe';
import { VegBadge } from '../common/VegBadge';
import { 
  Search, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Check, 
  SlidersHorizontal,
  X
} from 'lucide-react';

interface CustomerMenuProps {
  initialCategory?: Category | null;
  onOpenCart: () => void;
}

const CATEGORIES: ('All' | Category)[] = [
  'All',
  'Coffee',
  'Tea',
  'Cold Beverages',
  'Snacks',
  'Sandwiches',
  'Desserts',
];

export const CustomerMenu: React.FC<CustomerMenuProps> = ({
  initialCategory,
  onOpenCart,
}) => {
  const { menu, addToCart, updateCartQuantity, cart, cartItemCount, cartTotal } = useCafe();

  const [selectedCategory, setSelectedCategory] = useState<'All' | Category>(
    initialCategory || 'All'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc'>('recommended');

  const filteredItems = useMemo(() => {
    return menu.filter((item) => {
      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      // Diet filter
      if (dietFilter === 'veg' && !item.isVeg) return false;
      if (dietFilter === 'non-veg' && item.isVeg) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesCat = item.category.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      // Recommended: popular first
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      return 0;
    });
  }, [menu, selectedCategory, dietFilter, searchQuery, sortBy]);

  const getItemCartQty = (id: string) => {
    return cart.find((ci) => ci.item.id === id)?.quantity || 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#EBE3D7] pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6D58]">
            Artisan Cafe Menu
          </span>
          <h1 className="text-2xl sm:text-4xl font-display font-bold text-[#2C1810] mt-1">
            Handcrafted Food & Beverages
          </h1>
          <p className="text-xs sm:text-sm text-[#7A675B] mt-1">
            Choose from freshly pulled espresso, gourmet bakes, and savory comfort.
          </p>
        </div>

        {/* Quick Cart Summary Badge on desktop */}
        {cartItemCount > 0 && (
          <button
            onClick={onOpenCart}
            className="hidden sm:inline-flex items-center gap-3 px-4 py-2 bg-[#3D2314] text-white hover:bg-[#2A170C] rounded-xl shadow-sm transition-all"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#D4A373]" />
              <span className="text-xs font-semibold">{cartItemCount} items</span>
            </div>
            <span className="text-xs text-[#E8D8C8]">|</span>
            <span className="text-xs font-bold font-mono">₹{cartTotal}</span>
            <span className="text-xs bg-[#D4A373] text-[#2C1810] px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px]">
              Checkout
            </span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#EAE2D5] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Row 1: Search and Secondary Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7A6E]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by food name, description, or ingredients..."
              className="w-full pl-10 pr-10 py-2.5 text-xs bg-[#FBF9F5] border border-[#DDD0C2] rounded-xl text-[#2C1810] placeholder-[#A6978C] focus:outline-none focus:ring-2 focus:ring-[#8C6D58]/40 focus:border-[#8C6D58]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7A6E] hover:text-[#2C1810]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Diet Filter Buttons */}
          <div className="flex items-center gap-1 p-1 bg-[#F5EFE6] rounded-xl shrink-0">
            <button
              onClick={() => setDietFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                dietFilter === 'all'
                  ? 'bg-white text-[#2C1810] shadow-xs font-semibold'
                  : 'text-[#6C5B50] hover:text-[#2C1810]'
              }`}
            >
              All Diet
            </button>
            <button
              onClick={() => setDietFilter('veg')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                dietFilter === 'veg'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-[#6C5B50] hover:text-[#2C1810]'
              }`}
            >
              <VegBadge isVeg={true} size="sm" />
              Veg Only
            </button>
            <button
              onClick={() => setDietFilter('non-veg')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                dietFilter === 'non-veg'
                  ? 'bg-white text-amber-950 shadow-xs font-semibold'
                  : 'text-[#6C5B50] hover:text-[#2C1810]'
              }`}
            >
              <VegBadge isVeg={false} size="sm" />
              Non-Veg
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full sm:w-auto px-3 py-2.5 text-xs bg-[#FBF9F5] border border-[#DDD0C2] rounded-xl text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#8C6D58]/40 font-medium"
            >
              <option value="recommended">Featured / Popular</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Row 2: Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#3D2314] text-white shadow-xs'
                  : 'bg-[#F7F2EA] text-[#6B5749] hover:bg-[#EFE6D8] hover:text-[#2C1810]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border border-[#EAE2D5] rounded-2xl p-12 text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-[#F5EFE6] text-[#8C6D58] flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#2C1810]">No items found</h3>
          <p className="text-xs text-[#7A675B] mt-1">
            Try adjusting your search query, diet filter, or category selector.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setDietFilter('all');
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold text-[#3D2314] bg-[#F0E8DC] hover:bg-[#E5DACD] rounded-lg transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const qty = getItemCartQty(item.id);

            return (
              <div
                key={item.id}
                className={`bg-white border rounded-2xl overflow-hidden transition-all duration-200 flex flex-col ${
                  item.isAvailable
                    ? 'border-[#EAE2D5] hover:border-[#D4A373]/60 hover:shadow-md'
                    : 'border-stone-200 opacity-60'
                }`}
              >
                {/* Food Image */}
                <div className="relative aspect-[4/3] bg-[#F2ECE2] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/src/assets/images/cafe_hero_ambience_1793381416203.jpg';
                    }}
                  />
                  {/* Diet Mark */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2 py-1 rounded-md shadow-xs">
                    <VegBadge isVeg={item.isVeg} showText={true} size="sm" />
                  </div>

                  {/* Unavailable / Sold Out Banner */}
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-white bg-red-600/90 px-3 py-1 rounded-md">
                        Sold Out
                      </span>
                    </div>
                  )}

                  {item.isAvailable && item.popular && (
                    <div className="absolute top-3 right-3 bg-[#3D2314]/90 text-[#FBF9F5] text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-xs">
                      Popular
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8C7A6E]">
                        {item.category}
                      </span>
                      <span className="text-base font-bold text-[#2C1810] font-mono tabular-nums">
                        ₹{item.price}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#2C1810] leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-xs text-[#6B5749] mt-1.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Add to Cart or Stepper */}
                  <div className="mt-5 pt-4 border-t border-[#F5EFE6] flex items-center justify-between">
                    <span className="text-[11px] text-[#7A675B]">
                      {item.isAvailable ? 'Freshly prepared' : 'Unavailable'}
                    </span>

                    {!item.isAvailable ? (
                      <button
                        disabled
                        className="px-3 py-1.5 text-xs font-semibold bg-stone-100 text-stone-400 rounded-lg cursor-not-allowed"
                      >
                        Unavailable
                      </button>
                    ) : qty > 0 ? (
                      <div className="flex items-center bg-[#F4EFE6] border border-[#DDD0C2] rounded-lg overflow-hidden shadow-xs">
                        <button
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="p-1.5 text-[#3D2314] hover:bg-[#EAE2D5] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold font-mono text-[#2C1810] tabular-nums">
                          {qty}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="p-1.5 text-[#3D2314] hover:bg-[#EAE2D5] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item, 1)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#3D2314] hover:bg-[#2A170C] rounded-lg shadow-xs transition-all active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Cart Bar for Mobile */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden">
          <button
            onClick={onOpenCart}
            className="w-full flex items-center justify-between px-4 py-3.5 bg-[#3D2314] text-white rounded-xl shadow-xl active:scale-98 transition-transform"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#D4A373] text-[#2C1810] text-xs font-bold flex items-center justify-center">
                {cartItemCount}
              </div>
              <span className="text-xs font-semibold">View Order Cart</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold font-mono">₹{cartTotal}</span>
              <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded font-semibold uppercase">
                Pay →
              </span>
            </div>
          </button>
        </div>
      )}

    </div>
  );
};
