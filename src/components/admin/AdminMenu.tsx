import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Category, MenuItem } from '../../types/cafe';
import { VegBadge } from '../common/VegBadge';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Check, 
  X, 
  Image as ImageIcon,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  SlidersHorizontal
} from 'lucide-react';

const CATEGORIES: Category[] = [
  'Coffee',
  'Tea',
  'Cold Beverages',
  'Snacks',
  'Sandwiches',
  'Desserts',
];

const PRESET_IMAGES = [
  { label: 'Hot Latte Art', url: '/src/assets/images/cappuccino_latte_art_1793381412162.jpg' },
  { label: 'Cold Brew / Frappe', url: '/src/assets/images/iced_cold_coffee_1793381423310.jpg' },
  { label: 'Burger & Fries', url: '/src/assets/images/gourmet_cafe_burger_1793381415002.jpg' },
  { label: 'Fudge Brownie', url: '/src/assets/images/fudge_brownie_dessert_1793381413537.jpg' },
  { label: 'Cafe Ambience', url: '/src/assets/images/cafe_hero_ambience_1793381416203.jpg' },
];

export const AdminMenu: React.FC = () => {
  const { menu, addMenuItem, updateMenuItem, deleteMenuItem, toggleItemAvailability } = useCafe();

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<'All' | Category>('All');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<Category>('Coffee');
  const [formPrice, setFormPrice] = useState<number>(100);
  const [formDesc, setFormDesc] = useState('');
  const [formIsVeg, setFormIsVeg] = useState(true);
  const [formIsAvailable, setFormIsAvailable] = useState(true);
  const [formImage, setFormImage] = useState(PRESET_IMAGES[0].url);

  const openAddModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory('Coffee');
    setFormPrice(120);
    setFormDesc('');
    setFormIsVeg(true);
    setFormIsAvailable(true);
    setFormImage(PRESET_IMAGES[0].url);
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormPrice(item.price);
    setFormDesc(item.description);
    setFormIsVeg(item.isVeg);
    setFormIsAvailable(item.isAvailable);
    setFormImage(item.image);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formPrice <= 0) return;

    if (editingItem) {
      updateMenuItem({
        ...editingItem,
        name: formName.trim(),
        category: formCategory,
        price: Number(formPrice),
        description: formDesc.trim(),
        isVeg: formIsVeg,
        isAvailable: formIsAvailable,
        image: formImage,
      });
    } else {
      addMenuItem({
        name: formName.trim(),
        category: formCategory,
        price: Number(formPrice),
        description: formDesc.trim(),
        isVeg: formIsVeg,
        isAvailable: formIsAvailable,
        image: formImage,
      });
    }
    setIsModalOpen(false);
  };

  const filteredMenu = menu.filter((item) => {
    if (filterCat !== 'All' && item.category !== filterCat) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EBE3D7]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6D58]">
            Menu Engineering & Catalog
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#2C1810] mt-1">
            Menu Management
          </h1>
          <p className="text-xs text-[#7A675B] mt-0.5">
            Add items, update pricing, switch availability, and manage dietary tags. Updates apply to customer app immediately.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#3D2314] hover:bg-[#2A170C] rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Food Item</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#EAE2D5] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7A6E]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items by name or ingredients..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#FBF9F5] border border-[#DDD0C2] rounded-xl text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#8C6D58]/40"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setFilterCat('All')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              filterCat === 'All' ? 'bg-[#3D2314] text-white' : 'bg-[#F7F2EA] text-[#6B5749]'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                filterCat === cat ? 'bg-[#3D2314] text-white' : 'bg-[#F7F2EA] text-[#6B5749]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMenu.map((item) => (
          <div
            key={item.id}
            className={`bg-white border rounded-2xl p-4 shadow-xs flex flex-col justify-between transition-all ${
              item.isAvailable ? 'border-[#EAE2D5]' : 'border-stone-300 bg-stone-50/70 opacity-75'
            }`}
          >
            <div className="flex gap-3">
              <div className="w-20 h-20 rounded-xl bg-[#F5EFE6] overflow-hidden shrink-0 border border-[#EAE2D5]">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/src/assets/images/cafe_hero_ambience_1793381416203.jpg';
                  }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C7A6E]">
                    {item.category}
                  </span>
                  <VegBadge isVeg={item.isVeg} size="sm" showText={true} />
                </div>

                <h3 className="text-sm font-bold text-[#2C1810] truncate">
                  {item.name}
                </h3>
                <p className="text-[11px] text-[#6B5749] line-clamp-2 mt-0.5 leading-relaxed">
                  {item.description}
                </p>
                <div className="mt-1 font-mono font-bold text-sm text-[#3D2314]">
                  ₹{item.price}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-4 pt-3 border-t border-[#F2ECE2] flex items-center justify-between text-xs">
              {/* Availability Switch */}
              <button
                onClick={() => toggleItemAvailability(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  item.isAvailable
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-stone-200 text-stone-600 border border-stone-300'
                }`}
                title="Toggle customer availability"
              >
                <span className={`w-2 h-2 rounded-full ${item.isAvailable ? 'bg-emerald-600' : 'bg-stone-400'}`} />
                <span>{item.isAvailable ? 'Available' : 'Unavailable'}</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(item)}
                  className="p-1.5 text-[#6B5749] hover:text-[#2C1810] hover:bg-[#F2ECE2] rounded transition-colors"
                  title="Edit item"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to remove "${item.name}" from the menu?`)) {
                      deleteMenuItem(item.id);
                    }
                  }}
                  className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  title="Delete item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-[#EAE2D5] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBE3D7] bg-[#F7F2EA]">
              <h2 className="text-base font-bold text-[#2C1810]">
                {editingItem ? 'Edit Food Item' : 'Add New Food Item'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#7A675B] hover:text-[#2C1810]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#4A3B32] mb-1">Food Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Hazelnut Mocha"
                    className="w-full px-3 py-2 bg-[#FBF9F5] border border-[#DDD0C2] rounded-lg text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#8C6D58]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#4A3B32] mb-1">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as Category)}
                    className="w-full px-3 py-2 bg-[#FBF9F5] border border-[#DDD0C2] rounded-lg text-[#2C1810] focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#4A3B32] mb-1">Price in INR (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FBF9F5] border border-[#DDD0C2] rounded-lg text-[#2C1810] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#4A3B32] mb-1">Diet Mark *</label>
                  <div className="flex gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setFormIsVeg(true)}
                      className={`flex-1 py-1.5 rounded-lg border flex items-center justify-center gap-1.5 ${
                        formIsVeg ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold' : 'border-[#DDD0C2]'
                      }`}
                    >
                      <VegBadge isVeg={true} size="sm" />
                      Veg
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormIsVeg(false)}
                      className={`flex-1 py-1.5 rounded-lg border flex items-center justify-center gap-1.5 ${
                        !formIsVeg ? 'bg-amber-50 border-amber-800 text-amber-950 font-bold' : 'border-[#DDD0C2]'
                      }`}
                    >
                      <VegBadge isVeg={false} size="sm" />
                      Non-Veg
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#4A3B32] mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Appetizing description of ingredients, flavor notes..."
                  className="w-full px-3 py-2 bg-[#FBF9F5] border border-[#DDD0C2] rounded-lg text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#8C6D58]"
                />
              </div>

              {/* Image Selection */}
              <div>
                <label className="block text-[11px] font-semibold text-[#4A3B32] mb-1.5">Select Food Image</label>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {PRESET_IMAGES.map((img) => (
                    <button
                      key={img.label}
                      type="button"
                      onClick={() => setFormImage(img.url)}
                      className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
                        formImage === img.url ? 'border-[#3D2314] ring-2 ring-[#3D2314]/20' : 'border-[#EAE2D5] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="Or enter custom image URL"
                  className="w-full px-3 py-1.5 text-[11px] bg-[#FBF9F5] border border-[#DDD0C2] rounded-lg text-[#2C1810]"
                />
              </div>

              {/* Initial Availability */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="avail-check"
                  checked={formIsAvailable}
                  onChange={(e) => setFormIsAvailable(e.target.checked)}
                  className="w-4 h-4 rounded text-[#3D2314]"
                />
                <label htmlFor="avail-check" className="text-xs text-[#2C1810] font-medium">
                  Item is in-stock and immediately orderable by customers
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#EBE3D7]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#6B5749] hover:bg-[#F2ECE2] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#3D2314] hover:bg-[#2A170C] rounded-lg shadow-sm"
                >
                  {editingItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
