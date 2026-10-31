import React from 'react';
import { useCafe } from '../../context/CafeContext';
import { Category, MenuItem } from '../../types/cafe';
import { VegBadge } from '../common/VegBadge';
import { 
  Coffee, 
  Search, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  UtensilsCrossed, 
  Plus, 
  Check,
  ChevronRight
} from 'lucide-react';

interface CustomerHomeProps {
  onNavigateToMenu: (category?: Category) => void;
  onNavigateToOrders: () => void;
}

const CATEGORIES: { name: Category; countName: string; icon: string; desc: string }[] = [
  { name: 'Coffee', countName: 'Espresso & Brews', icon: '☕', desc: 'Single origin Arabica roasts' },
  { name: 'Tea', countName: 'Artisan Chai & Leaves', icon: '🫖', desc: 'Slow brewed whole spices' },
  { name: 'Cold Beverages', countName: 'Iced & Shaken', icon: '🧊', desc: 'Chilled brews & frappes' },
  { name: 'Snacks', countName: 'Bites & Fries', icon: '🍟', desc: 'Crispy savory comfort' },
  { name: 'Sandwiches', countName: 'Artisan Melts', icon: '🥪', desc: 'Toasted sourdough & panini' },
  { name: 'Desserts', countName: 'Bakes & Treats', icon: '🍰', desc: 'Belgian chocolate & bakes' },
];

export const CustomerHome: React.FC<CustomerHomeProps> = ({
  onNavigateToMenu,
  onNavigateToOrders,
}) => {
  const { menu, addToCart, cart } = useCafe();
  const [searchTerm, setSearchTerm] = React.useState('');

  const featuredItems = menu.filter(item => item.popular || item.recommended).slice(0, 4);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigateToMenu();
  };

  const getItemCartQty = (id: string) => {
    return cart.find(ci => ci.item.id === id)?.quantity || 0;
  };

  return (
    <div className="space-y-16 pb-20">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-[#2C1810] text-[#FBF9F5] rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4 shadow-xl">
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/cafe_hero_ambience_1793381416203.jpg"
            alt="Brew and Bean Cafe Interior"
            className="w-full h-full object-cover opacity-35 filter brightness-90 contrast-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2C1810] via-[#2C1810]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-3xl px-6 py-16 sm:px-12 sm:py-24 lg:py-28">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#D4A373] mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Artisanal Specialty Roastery & Kitchen</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold text-white tracking-tight leading-[1.15] mb-6 text-balance">
            Handcrafted Coffee, Freshly Baked Delights.
          </h1>

          <p className="text-sm sm:text-base text-[#D7C4B7] max-w-xl mb-8 leading-relaxed">
            Welcome to Brew & Bean. From single-origin pour-overs to gourmet sandwiches and decadent warm brownies, experience cafe dining crafted with honest passion.
          </p>

          {/* Quick Search in Hero */}
          <form onSubmit={handleSearchSubmit} className="max-w-md flex items-center bg-[#FBF9F5] rounded-xl p-1.5 shadow-lg mb-8">
            <div className="pl-3 text-[#7A675B]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search cappuccino, brownie, burger..."
              className="flex-1 px-3 py-2 text-xs sm:text-sm text-[#2C1810] placeholder-[#8C7A6E] bg-transparent focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#3D2314] hover:bg-[#2A170C] rounded-lg transition-colors whitespace-nowrap"
            >
              Search
            </button>
          </form>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => onNavigateToMenu()}
              className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#2C1810] bg-[#D4A373] hover:bg-[#C28F5F] rounded-xl shadow-md transition-all transform active:scale-95"
            >
              <span>Explore Full Menu</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onNavigateToOrders}
              className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:text-[#D4A373] border border-white/20 hover:border-[#D4A373] rounded-xl backdrop-blur-xs transition-colors"
            >
              <span>Track Live Orders</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Quick Value Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white border border-[#EBE3D7] rounded-2xl shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F4EFE6] text-[#3D2314] flex items-center justify-center shrink-0">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#2C1810]">100% Arabica</p>
              <p className="text-[11px] text-[#7A675B]">Ethically roasted beans</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F4EFE6] text-[#3D2314] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#2C1810]">Quick Prep</p>
              <p className="text-[11px] text-[#7A675B]">Ready in 10-15 mins</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F4EFE6] text-[#3D2314] flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#2C1810]">Dine-In & Takeaway</p>
              <p className="text-[11px] text-[#7A675B]">Table or counter pickup</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F4EFE6] text-[#3D2314] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#2C1810]">Clean Kitchen</p>
              <p className="text-[11px] text-[#7A675B]">FSSAI verified standards</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Browse Food Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6D58]">Curated Collections</span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#2C1810] mt-1">
              Explore Our Food & Beverages
            </h2>
          </div>
          <button
            onClick={() => onNavigateToMenu()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C6D58] hover:text-[#2C1810] transition-colors self-start sm:self-auto"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => {
            const itemCount = menu.filter(m => m.category === cat.name).length;
            return (
              <button
                key={cat.name}
                onClick={() => onNavigateToMenu(cat.name)}
                className="group p-5 bg-white border border-[#EAE2D5] hover:border-[#D4A373] rounded-2xl text-left transition-all hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform origin-left">
                    {cat.icon}
                  </div>
                  <h3 className="text-sm font-bold text-[#2C1810] group-hover:text-[#8C6D58] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-[#7A675B] line-clamp-1 mt-0.5">
                    {cat.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#F2ECE2] flex items-center justify-between text-[11px] text-[#8C7A6E]">
                  <span>{itemCount} items</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Popular & Recommended Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D4A373]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Customer Favorites</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#2C1810] mt-1">
              Popular & Chef's Recommendations
            </h2>
          </div>
          <button
            onClick={() => onNavigateToMenu()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C6D58] hover:text-[#2C1810] transition-colors self-start sm:self-auto"
          >
            <span>See entire menu</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredItems.map((item: MenuItem) => {
            const inCartQty = getItemCartQty(item.id);
            return (
              <div
                key={item.id}
                className="group bg-white border border-[#EAE2D5] hover:border-[#D4A373]/60 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
              >
                {/* Product Image Container */}
                <div className="relative aspect-[4/3] bg-[#F2ECE2] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback image handling
                      (e.target as HTMLImageElement).src = '/src/assets/images/cafe_hero_ambience_1793381416203.jpg';
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2 py-1 rounded-md shadow-xs">
                    <VegBadge isVeg={item.isVeg} showText={true} size="sm" />
                  </div>
                  {item.popular && (
                    <div className="absolute top-3 right-3 bg-[#3D2314]/90 text-[#FBF9F5] text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-xs">
                      Popular
                    </div>
                  )}
                </div>

                {/* Product Info */}
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

                    <h3 className="text-base font-bold text-[#2C1810] group-hover:text-[#8C6D58] transition-colors leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-xs text-[#6B5749] mt-1.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#F5EFE6] flex items-center justify-between">
                    <span className="text-[11px] text-[#7A675B]">
                      {item.isAvailable ? 'In stock' : 'Out of stock'}
                    </span>
                    <button
                      onClick={() => addToCart(item, 1)}
                      disabled={!item.isAvailable}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        !item.isAvailable
                          ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                          : inCartQty > 0
                          ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                          : 'bg-[#3D2314] text-white hover:bg-[#2A170C]'
                      }`}
                    >
                      {inCartQty > 0 ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added ({inCartQty})</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Experience Story Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#F3EDE2] border border-[#E5DACD] rounded-3xl p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6D58]">Our Philosophy</span>
            <h2 className="text-2xl sm:text-4xl font-display font-bold text-[#2C1810] leading-tight">
              Honest ingredients, mindful brewing, and unmatched cafe hospitality.
            </h2>
            <p className="text-xs sm:text-sm text-[#5C4D43] leading-relaxed">
              Every shot is calibrated every single morning. We roast small-batch Arabica, use whole organic milk from local dairies, and bake our brownies and brioche daily. Whether you sit at Table 4 or order takeaway on your commute, we treat every order like our first.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-[#4A3B32]">
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-700" /> No artificial food coloring
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-700" /> Freshly ground per pull
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-700" /> Cashless UPI & cash payments
              </span>
            </div>
          </div>
          <div className="w-full lg:w-96 rounded-2xl overflow-hidden shadow-md aspect-[4/3] bg-stone-200">
            <img
              src="/src/assets/images/fudge_brownie_dessert_1793381413537.jpg"
              alt="Artisanal Bakery Dessert"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

    </div>
  );
};
