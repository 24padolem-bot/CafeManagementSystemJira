import React, { useState, useMemo } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Order, OrderStatus } from '../../types/cafe';
import { OrderDetailModal } from './OrderDetailModal';
import { VegBadge } from '../common/VegBadge';
import { 
  Search, 
  Filter, 
  Eye, 
  Check, 
  X, 
  Clock, 
  ChefHat, 
  Coffee, 
  ArrowRight,
  RotateCw
} from 'lucide-react';

const STATUS_FILTERS: ('All' | OrderStatus)[] = [
  'All',
  'Order Placed',
  'Order Accepted',
  'Preparing',
  'Ready for Pickup / Served',
  'Completed',
  'Rejected',
];

export const AdminOrders: React.FC = () => {
  const { orders, updateOrderStatus } = useCafe();
  const [selectedStatus, setSelectedStatus] = useState<'All' | OrderStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (selectedStatus !== 'All' && order.status !== selectedStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = order.id.toLowerCase().includes(q);
        const matchesName = order.customerName.toLowerCase().includes(q);
        const matchesMobile = order.customerMobile.includes(q);
        if (!matchesId && !matchesName && !matchesMobile) return false;
      }
      return true;
    });
  }, [orders, selectedStatus, searchQuery]);

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return iso;
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    const map: Record<OrderStatus, string> = {
      'Order Placed': 'bg-blue-50 text-blue-800 border-blue-200',
      'Order Accepted': 'bg-amber-50 text-amber-800 border-amber-200',
      'Preparing': 'bg-orange-50 text-orange-800 border-orange-200',
      'Ready for Pickup / Served': 'bg-purple-50 text-purple-800 border-purple-200',
      'Completed': 'bg-emerald-50 text-emerald-800 border-emerald-200',
      'Rejected': 'bg-rose-50 text-rose-800 border-rose-200',
    };
    return map[status];
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EBE3D7]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6D58]">
              Live Kitchen & Counter Tickets
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#2C1810] mt-1">
            Order Management Console
          </h1>
          <p className="text-xs text-[#7A675B] mt-0.5">
            Real-time synchronization: Any status update here immediately updates the customer's tracker screen.
          </p>
        </div>

        <div className="text-xs font-semibold text-[#8C6D58] bg-[#F4EFE6] px-3 py-1.5 rounded-lg border border-[#DDD0C2]">
          Total {orders.length} orders in system
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#EAE2D5] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7A6E]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID (e.g. 7819), Customer Name, or Phone..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#FBF9F5] border border-[#DDD0C2] rounded-xl text-[#2C1810] placeholder-[#A6978C] focus:outline-none focus:ring-2 focus:ring-[#8C6D58]/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C7A6E]"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {STATUS_FILTERS.map((st) => {
            const count = st === 'All' ? orders.length : orders.filter((o) => o.status === st).length;

            return (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedStatus === st
                    ? 'bg-[#3D2314] text-white shadow-xs'
                    : 'bg-[#F7F2EA] text-[#6B5749] hover:bg-[#EFE6D8]'
                }`}
              >
                <span>{st}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedStatus === st ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#EAE2D5] rounded-2xl shadow-xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-[#7A675B] space-y-2">
            <p className="font-semibold text-sm text-[#2C1810]">No orders match your criteria</p>
            <p className="text-xs">Try clearing search filters or changing the status tab.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF6F0] text-[#7A675B] font-semibold border-b border-[#EBE3D7] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Dining Type</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4">Time Placed</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Current Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE3D7]">
                {filteredOrders.map((order) => {
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-[#FBF9F5] transition-colors cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-[#2C1810]">
                        #{order.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#2C1810]">{order.customerName}</div>
                        <div className="text-[11px] text-[#8C7A6E]">{order.customerMobile}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-[#4A3B32]">
                          {order.orderType}
                        </span>
                        {order.tableNumber && (
                          <span className="block text-[11px] text-[#8C7A6E]">
                            {order.tableNumber}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="truncate text-[#4A3B32]">
                          {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                        </div>
                        <span className="text-[10px] text-[#8C7A6E]">
                          {order.items.length} item {order.items.length > 1 ? 'types' : 'type'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#6B5749]">
                        {formatTime(order.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#2C1810]">
                        ₹{order.totalAmount}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-semibold text-[#5C4D43] bg-[#F2ECE2] px-2 py-0.5 rounded">
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Step Buttons */}
                          {order.status === 'Order Placed' && (
                            <>
                              <button
                                onClick={() => updateOrderStatus(order.id, 'Order Accepted')}
                                className="px-2.5 py-1 text-[11px] font-semibold bg-[#3D2314] text-white rounded hover:bg-[#2A170C] transition-colors"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => updateOrderStatus(order.id, 'Rejected')}
                                className="px-2 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded hover:bg-rose-100 transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {order.status === 'Order Accepted' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'Preparing')}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-orange-700 text-white rounded hover:bg-orange-800 transition-colors"
                            >
                              Prepare
                            </button>
                          )}

                          {order.status === 'Preparing' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'Ready for Pickup / Served')}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-purple-700 text-white rounded hover:bg-purple-800 transition-colors"
                            >
                              Mark Ready
                            </button>
                          )}

                          {order.status === 'Ready for Pickup / Served' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'Completed')}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-700 text-white rounded hover:bg-emerald-800 transition-colors"
                            >
                              Complete
                            </button>
                          )}

                          {/* View Modal Trigger */}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 text-[#8C7A6E] hover:text-[#2C1810] hover:bg-[#EAE2D5] rounded transition-colors"
                            title="View Complete Order Ticket"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={(id, st) => {
          updateOrderStatus(id, st);
          if (selectedOrder && selectedOrder.id === id) {
            setSelectedOrder({ ...selectedOrder, status: st });
          }
        }}
      />

    </div>
  );
};
