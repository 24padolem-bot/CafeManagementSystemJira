import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Order, OrderStatus } from '../../types/cafe';
import { OrderDetailModal } from './OrderDetailModal';
import { VegBadge } from '../common/VegBadge';
import { 
  TrendingUp, 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  Users, 
  ArrowUpRight, 
  Eye, 
  ChefHat, 
  Check, 
  AlertCircle,
  Coffee,
  Calendar
} from 'lucide-react';

export const AdminDashboard: React.FC<{ onNavigateToOrders: () => void }> = ({ onNavigateToOrders }) => {
  const { orders, customers, menu, updateOrderStatus } = useCafe();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Today calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter((o) => o.createdAt.startsWith(todayStr));
  const todayCompleted = todayOrders.filter((o) => o.status === 'Completed');
  const totalSalesToday = todayCompleted.reduce((acc, o) => acc + o.totalAmount, 0);

  const pendingOrders = orders.filter((o) => 
    o.status === 'Order Placed' || o.status === 'Order Accepted' || o.status === 'Preparing'
  );
  const completedOrders = orders.filter((o) => o.status === 'Completed');

  // Popular items calculation
  const popularItemCounts = React.useMemo(() => {
    const map = new Map<string, { name: string; category: string; count: number; revenue: number; isVeg: boolean }>();
    orders.forEach((o) => {
      // count all valid non-rejected orders
      if (o.status !== 'Rejected') {
        o.items.forEach((it) => {
          const ex = map.get(it.name);
          if (ex) {
            ex.count += it.quantity;
            ex.revenue += it.price * it.quantity;
          } else {
            map.set(it.name, {
              name: it.name,
              category: it.category,
              count: it.quantity,
              revenue: it.price * it.quantity,
              isVeg: it.isVeg,
            });
          }
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [orders]);

  // Weekly Sales Chart Data (last 7 days)
  const weeklyData = React.useMemo(() => {
    const days: { day: string; date: string; sales: number; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString([], { weekday: 'short' });

      const dayOrders = orders.filter((o) => o.createdAt.startsWith(dateStr) && o.status === 'Completed');
      const sales = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      days.push({ day: dayLabel, date: dateStr, sales, count: dayOrders.length });
    }
    return days;
  }, [orders]);

  const maxWeeklySales = Math.max(...weeklyData.map((d) => d.sales), 500);

  const recentOrders = orders.slice(0, 6);

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
    <div className="space-y-8">
      
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6D58]">
            Operations Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#2C1810]">
            Cafe Administration & Analytics
          </h1>
          <p className="text-xs text-[#7A675B] mt-0.5">
            Real-time kitchen queues, sales performance, and guest orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#7A675B] flex items-center gap-1.5 bg-white border border-[#EAE2D5] px-3 py-1.5 rounded-lg shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-[#8C6D58]" />
            {new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* 1. Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Today's Orders */}
        <div className="p-5 bg-white border border-[#EAE2D5] rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#8C7A6E]">
            <span className="text-xs font-medium">Orders Today</span>
            <div className="w-8 h-8 rounded-lg bg-[#F5EFE6] text-[#3D2314] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#2C1810]">
            {todayOrders.length}
          </div>
          <p className="text-[11px] text-[#7A675B]">
            {todayCompleted.length} fulfilled
          </p>
        </div>

        {/* Total Sales Today */}
        <div className="p-5 bg-white border border-[#EAE2D5] rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#8C7A6E]">
            <span className="text-xs font-medium">Today's Sales</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#2C1810]">
            ₹{totalSalesToday.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium">
            Completed revenue
          </p>
        </div>

        {/* Pending Orders */}
        <div className="p-5 bg-white border border-[#EAE2D5] rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#8C7A6E]">
            <span className="text-xs font-medium">Pending Kitchen</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-900">
            {pendingOrders.length}
          </div>
          <p className="text-[11px] text-amber-800 font-medium">
            Requires attention
          </p>
        </div>

        {/* Completed Orders */}
        <div className="p-5 bg-white border border-[#EAE2D5] rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#8C7A6E]">
            <span className="text-xs font-medium">All Completed</span>
            <div className="w-8 h-8 rounded-lg bg-[#F5EFE6] text-[#3D2314] flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#2C1810]">
            {completedOrders.length}
          </div>
          <p className="text-[11px] text-[#7A675B]">
            Lifetime fulfilled
          </p>
        </div>

        {/* Total Customers */}
        <div className="p-5 bg-white border border-[#EAE2D5] rounded-2xl shadow-xs space-y-2 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-[#8C7A6E]">
            <span className="text-xs font-medium">Total Guests</span>
            <div className="w-8 h-8 rounded-lg bg-[#F5EFE6] text-[#3D2314] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#2C1810]">
            {customers.length}
          </div>
          <p className="text-[11px] text-[#7A675B]">
            Registered patrons
          </p>
        </div>
      </div>

      {/* 2. Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Weekly Sales Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#EAE2D5] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE2]">
            <div>
              <h2 className="text-sm font-bold text-[#2C1810]">Weekly Revenue Trend (₹)</h2>
              <p className="text-xs text-[#7A675B]">Completed sales over the last 7 operating days</p>
            </div>
            <span className="text-xs font-bold font-mono text-[#3D2314]">
              7-Day Total: ₹{weeklyData.reduce((s, d) => s + d.sales, 0).toLocaleString()}
            </span>
          </div>

          {/* SVG Bar Chart */}
          <div className="pt-4">
            <div className="h-52 flex items-end justify-between gap-3 px-2">
              {weeklyData.map((item) => {
                const heightPercent = maxWeeklySales > 0 ? Math.max((item.sales / maxWeeklySales) * 100, 8) : 8;
                const isToday = item.date === todayStr;

                return (
                  <div key={item.date} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="text-[10px] font-mono text-[#7A675B] opacity-0 group-hover:opacity-100 transition-opacity">
                      ₹{item.sales}
                    </div>
                    <div className="w-full max-w-[48px] bg-[#F2ECE2] rounded-t-lg overflow-hidden flex flex-col justify-end h-40">
                      <div
                        className={`w-full rounded-t-md transition-all duration-300 ${
                          isToday ? 'bg-[#3D2314]' : 'bg-[#D4A373] group-hover:bg-[#C28F5F]'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-semibold ${isToday ? 'text-[#3D2314] font-bold' : 'text-[#6B5749]'}`}>
                        {item.day}
                      </p>
                      <span className="text-[10px] text-[#A6978C]">{item.count} ord</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Status Breakdown & Popular (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-[#EAE2D5] rounded-2xl p-6 shadow-xs space-y-5">
          <div>
            <h2 className="text-sm font-bold text-[#2C1810]">Order Status Pipeline</h2>
            <p className="text-xs text-[#7A675B]">Active breakdown of orders</p>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Order Placed', count: orders.filter((o) => o.status === 'Order Placed').length, color: 'bg-blue-600' },
              { label: 'Preparing', count: orders.filter((o) => o.status === 'Preparing' || o.status === 'Order Accepted').length, color: 'bg-orange-500' },
              { label: 'Ready / Served', count: orders.filter((o) => o.status === 'Ready for Pickup / Served').length, color: 'bg-purple-600' },
              { label: 'Completed', count: completedOrders.length, color: 'bg-emerald-600' },
            ].map((st) => {
              const pct = orders.length > 0 ? Math.round((st.count / orders.length) * 100) : 0;
              return (
                <div key={st.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#5C4D43] font-medium">{st.label}</span>
                    <span className="font-mono font-bold text-[#2C1810]">{st.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-[#F2ECE2] rounded-full overflow-hidden">
                    <div className={`h-full ${st.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#F2ECE2]">
            <h3 className="text-xs font-bold text-[#2C1810] mb-2 uppercase tracking-wider text-[#8C6D58]">
              Top Sellers
            </h3>
            <div className="space-y-2">
              {popularItemCounts.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <VegBadge isVeg={item.isVeg} size="sm" />
                    <span className="font-semibold text-[#2C1810] truncate">{item.name}</span>
                  </div>
                  <span className="font-mono text-[#5C4D43] shrink-0 font-medium">
                    {item.count} sold
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* 3. Recent Incoming Orders Table */}
      <div className="bg-white border border-[#EAE2D5] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#EBE3D7] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#2C1810]">Recent Incoming Orders</h2>
            <p className="text-xs text-[#7A675B]">Click any order to view details or update kitchen status</p>
          </div>
          <button
            onClick={onNavigateToOrders}
            className="text-xs font-semibold text-[#8C6D58] hover:text-[#2C1810] flex items-center gap-1 transition-colors"
          >
            <span>View All Orders</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF6F0] text-[#7A675B] font-semibold border-b border-[#EBE3D7] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Items Summary</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3D7]">
              {recentOrders.map((order) => {
                return (
                  <tr
                    key={order.id}
                    className="hover:bg-[#FBF9F5] transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#2C1810]">
                      #{order.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#2C1810]">{order.customerName}</div>
                      <div className="text-[11px] text-[#8C7A6E]">{order.customerMobile}</div>
                    </td>
                    <td className="py-3 px-4 text-[#5C4D43]">
                      {order.orderType} {order.tableNumber ? `(${order.tableNumber})` : ''}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-[#5C4D43]">
                      {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#2C1810]">
                      ₹{order.totalAmount}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      {order.status === 'Order Placed' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'Order Accepted')}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-[#3D2314] text-white rounded hover:bg-[#2A170C] transition-colors"
                        >
                          Accept
                        </button>
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
                          Ready
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
                      {order.status === 'Completed' && (
                        <span className="text-[11px] text-emerald-700 font-semibold inline-flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Done
                        </span>
                      )}
                      {order.status === 'Rejected' && (
                        <span className="text-[11px] text-rose-600 font-semibold">
                          Cancelled
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
