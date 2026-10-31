import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { CustomerProfile, Order } from '../../types/cafe';
import { Search, User, Phone, ShoppingBag, Eye, Calendar, X } from 'lucide-react';

export const AdminCustomers: React.FC = () => {
  const { customers, orders } = useCafe();
  const [search, setSearch] = useState('');
  const [activeCustomer, setActiveCustomer] = useState<CustomerProfile | null>(null);

  const filtered = customers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.mobile.includes(q);
  });

  const customerOrderHistory = activeCustomer
    ? orders.filter((o) => o.customerMobile === activeCustomer.mobile || o.customerName === activeCustomer.name)
    : [];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EBE3D7]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6D58]">
            Patron Profiles & Loyalty
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#2C1810] mt-1">
            Customer Management
          </h1>
          <p className="text-xs text-[#7A675B] mt-0.5">
            View customer spending patterns, dining frequency, and individual order receipts.
          </p>
        </div>

        <div className="text-xs font-semibold text-[#8C6D58] bg-[#F4EFE6] px-3 py-1.5 rounded-lg border border-[#DDD0C2]">
          {customers.length} Patrons Registered
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-[#EAE2D5] rounded-2xl p-4 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7A6E]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patron by name or mobile number..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#FBF9F5] border border-[#DDD0C2] rounded-xl text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#8C6D58]/40"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-[#EAE2D5] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF6F0] text-[#7A675B] font-semibold border-b border-[#EBE3D7] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Patron Name</th>
                <th className="py-3.5 px-4">Mobile Number</th>
                <th className="py-3.5 px-4 text-center">Total Orders</th>
                <th className="py-3.5 px-4 text-right">Total Spent (₹)</th>
                <th className="py-3.5 px-4">Last Order Date</th>
                <th className="py-3.5 px-4 text-right">Order History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3D7]">
              {filtered.map((cust) => (
                <tr key={cust.mobile || cust.name} className="hover:bg-[#FBF9F5] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#2C1810] flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#3D2314] text-[#E8D8C8] flex items-center justify-center text-[11px] font-bold">
                        {cust.name.charAt(0)}
                      </div>
                      <span>{cust.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#5C4D43]">
                    {cust.mobile || 'Walk-in'}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-semibold text-[#2C1810]">
                    {cust.totalOrders}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[#3D2314]">
                    ₹{cust.totalSpent.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-[#7A675B]">
                    {new Date(cust.lastOrderDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setActiveCustomer(cust)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-[#3D2314] bg-[#F0E8DC] hover:bg-[#E5DACD] rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Orders</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Order History Modal */}
      {activeCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-2xl border border-[#EAE2D5] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBE3D7] bg-[#F7F2EA]">
              <div>
                <h2 className="text-base font-bold text-[#2C1810]">
                  {activeCustomer.name} · Order History
                </h2>
                <p className="text-xs text-[#7A675B]">
                  Mobile: {activeCustomer.mobile} · Total Spent: ₹{activeCustomer.totalSpent}
                </p>
              </div>
              <button
                onClick={() => setActiveCustomer(null)}
                className="p-1 text-[#7A675B] hover:text-[#2C1810]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {customerOrderHistory.map((order) => (
                <div key={order.id} className="p-4 bg-[#FBF9F5] border border-[#EAE2D5] rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="font-mono text-[#2C1810]">#{order.id}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAE2D5] text-[#2C1810]">
                      {order.status}
                    </span>
                  </div>

                  <div className="text-[#5C4D43]">
                    {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-[#EBE3D7] text-[#7A675B]">
                    <span>{new Date(order.createdAt).toLocaleString()} · {order.orderType}</span>
                    <span className="font-mono font-bold text-sm text-[#3D2314]">₹{order.totalAmount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
