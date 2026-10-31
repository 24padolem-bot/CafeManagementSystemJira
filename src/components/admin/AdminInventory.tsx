import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { InventoryItem } from '../../types/cafe';
import { 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Trash2, 
  Search, 
  RotateCcw, 
  X,
  Package,
  Layers
} from 'lucide-react';

export const AdminInventory: React.FC = () => {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, restockInventoryItem } = useCafe();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Low Stock' | 'In Stock'>('All');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Quick Restock Modal
  const [restockTarget, setRestockTarget] = useState<InventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState<number>(5);

  // Form states
  const [formName, setFormName] = useState('');
  const [formQuantity, setFormQuantity] = useState<number>(10);
  const [formUnit, setFormUnit] = useState('kg');
  const [formMinStock, setFormMinStock] = useState<number>(3);

  const lowStockCount = inventory.filter((i) => i.status === 'Low Stock' || i.status === 'Out of Stock').length;

  const openAddModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormQuantity(10);
    setFormUnit('kg');
    setFormMinStock(3);
    setIsModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormQuantity(item.quantity);
    setFormUnit(item.unit);
    setFormMinStock(item.minStock);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formQuantity < 0 || formMinStock < 0) return;

    if (editingItem) {
      updateInventoryItem({
        ...editingItem,
        name: formName.trim(),
        quantity: Number(formQuantity),
        unit: formUnit.trim(),
        minStock: Number(formMinStock),
      });
    } else {
      addInventoryItem({
        name: formName.trim(),
        quantity: Number(formQuantity),
        unit: formUnit.trim(),
        minStock: Number(formMinStock),
      });
    }
    setIsModalOpen(false);
  };

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockTarget || restockQty <= 0) return;
    restockInventoryItem(restockTarget.id, restockQty);
    setRestockTarget(null);
  };

  const filteredInventory = inventory.filter((item) => {
    if (filterStatus === 'Low Stock' && item.status !== 'Low Stock' && item.status !== 'Out of Stock') return false;
    if (filterStatus === 'In Stock' && item.status !== 'In Stock') return false;
    if (search.trim()) {
      return item.name.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EBE3D7]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6D58]">
            Stock & Pantry Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#2C1810] mt-1">
            Raw Material & Ingredient Inventory
          </h1>
          <p className="text-xs text-[#7A675B] mt-0.5">
            Monitor real-time pantry reserves, configure minimum thresholds, and receive shortage warnings.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#3D2314] hover:bg-[#2A170C] rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Ingredient</span>
        </button>
      </div>

      {/* Low Stock Warning Banner if any items low */}
      {lowStockCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-amber-950">
                Pantry Shortage Alert: {lowStockCount} items below safety threshold!
              </h2>
              <p className="text-xs text-amber-800 mt-0.5">
                Restock soon to prevent order delays and item unavailability on the customer menu.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFilterStatus('Low Stock')}
            className="px-3.5 py-1.5 text-xs font-bold text-amber-900 bg-amber-200 hover:bg-amber-300 rounded-lg whitespace-nowrap transition-colors"
          >
            Review Shortages
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#EAE2D5] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7A6E]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ingredients (e.g. Arabica beans, milk, buns)..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#FBF9F5] border border-[#DDD0C2] rounded-xl text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#8C6D58]/40"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus('All')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterStatus === 'All' ? 'bg-[#3D2314] text-white' : 'bg-[#F7F2EA] text-[#6B5749]'
            }`}
          >
            All Items ({inventory.length})
          </button>
          <button
            onClick={() => setFilterStatus('Low Stock')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterStatus === 'Low Stock' ? 'bg-amber-800 text-white' : 'bg-[#F7F2EA] text-[#6B5749]'
            }`}
          >
            Low Stock ({lowStockCount})
          </button>
          <button
            onClick={() => setFilterStatus('In Stock')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterStatus === 'In Stock' ? 'bg-[#3D2314] text-white' : 'bg-[#F7F2EA] text-[#6B5749]'
            }`}
          >
            Healthy Stock
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-[#EAE2D5] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF6F0] text-[#7A675B] font-semibold border-b border-[#EBE3D7] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Ingredient Name</th>
                <th className="py-3.5 px-4 text-center">Available Quantity</th>
                <th className="py-3.5 px-4 text-center">Unit</th>
                <th className="py-3.5 px-4 text-center">Min. Threshold</th>
                <th className="py-3.5 px-4">Stock Health Status</th>
                <th className="py-3.5 px-4">Last Restocked</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3D7]">
              {filteredInventory.map((item) => {
                const isShort = item.status === 'Low Stock' || item.status === 'Out of Stock';

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-[#FBF9F5] transition-colors ${
                      isShort ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-[#2C1810]">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-sm text-[#2C1810]">
                      {item.quantity}
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#6B5749]">
                      {item.unit}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-[#8C7A6E]">
                      {item.minStock} {item.unit}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.status === 'In Stock' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>In Stock</span>
                        </span>
                      )}
                      {item.status === 'Low Stock' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          <AlertTriangle className="w-3 h-3 text-amber-700" />
                          <span>Low Stock Alert</span>
                        </span>
                      )}
                      {item.status === 'Out of Stock' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
                          <XCircle className="w-3 h-3 text-rose-700" />
                          <span>Depleted</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#7A675B]">
                      {item.lastRestocked}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setRestockTarget(item);
                            setRestockQty(5);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-[#3D2314] bg-[#F0E8DC] hover:bg-[#E5DACD] rounded-lg transition-colors"
                          title="Quick restock quantity"
                        >
                          + Restock
                        </button>
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-[#6B5749] hover:text-[#2C1810] hover:bg-[#F2ECE2] rounded"
                          title="Edit ingredient"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete ${item.name} from inventory?`)) {
                              deleteInventoryItem(item.id);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded"
                          title="Delete ingredient"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Ingredient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#EAE2D5] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBE3D7] bg-[#F7F2EA]">
              <h2 className="text-base font-bold text-[#2C1810]">
                {editingItem ? 'Edit Ingredient' : 'Add New Ingredient'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#7A675B] hover:text-[#2C1810]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#4A3B32] mb-1">
                  Ingredient Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Vanilla Bean Extract"
                  className="w-full px-3 py-2 bg-[#FBF9F5] border border-[#DDD0C2] rounded-lg text-[#2C1810] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#4A3B32] mb-1">
                    Available Quantity *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min={0}
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FBF9F5] border border-[#DDD0C2] rounded-lg text-[#2C1810] font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#4A3B32] mb-1">
                    Unit of Measure *
                  </label>
                  <input
                    type="text"
                    required
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="kg, Liters, Packs, Slices"
                    className="w-full px-3 py-2 bg-[#FBF9F5] border border-[#DDD0C2] rounded-lg text-[#2C1810] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#4A3B32] mb-1">
                  Minimum Stock Threshold (triggers low-stock alert) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  min={0}
                  value={formMinStock}
                  onChange={(e) => setFormMinStock(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#FBF9F5] border border-[#DDD0C2] rounded-lg text-[#2C1810] font-mono focus:outline-none"
                />
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
                  {editingItem ? 'Save Updates' : 'Add to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Restock Modal */}
      {restockTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-[#EAE2D5] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBE3D7] bg-[#F7F2EA]">
              <h2 className="text-base font-bold text-[#2C1810]">
                Restock {restockTarget.name}
              </h2>
              <button
                onClick={() => setRestockTarget(null)}
                className="p-1 text-[#7A675B] hover:text-[#2C1810]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="p-6 space-y-4 text-xs">
              <p className="text-xs text-[#6B5749]">
                Current stock: <strong>{restockTarget.quantity} {restockTarget.unit}</strong> (Min: {restockTarget.minStock} {restockTarget.unit})
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-[#4A3B32] mb-1">
                  Quantity to Add ({restockTarget.unit})
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  min={0.1}
                  value={restockQty}
                  onChange={(e) => setRestockQty(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#FBF9F5] border border-[#DDD0C2] rounded-lg text-[#2C1810] font-mono font-bold text-sm focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockTarget(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#6B5749]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm"
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
