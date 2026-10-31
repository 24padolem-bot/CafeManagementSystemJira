import React, { useState, useMemo } from 'react';
import { useCafe } from '../../context/CafeContext';
import { 
  TrendingUp, 
  Download, 
  Calendar, 
  CreditCard, 
  Banknote, 
  QrCode, 
  PieChart, 
  BarChart3,
  Filter,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';

export const AdminSales: React.FC = () => {
  const { orders } = useCafe();

  const [dateRange, setDateRange] = useState<'all' | 'today' | '7days' | '30days'>('all');

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter((o) => {
      if (dateRange === 'all') return true;
      const orderDate = new Date(o.createdAt);

      if (dateRange === 'today') {
        return orderDate.toDateString() === now.toDateString();
      }
      if (dateRange === '7days') {
        const diff = (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);
        return diff <= 7;
      }
      if (dateRange === '30days') {
        const diff = (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);
        return diff <= 30;
      }
      return true;
    });
  }, [orders, dateRange]);

  // STRICT RULE: Only count completed orders as finalized revenue!
  const completedOrders = useMemo(() => {
    return filteredOrders.filter((o) => o.status === 'Completed');
  }, [filteredOrders]);

  const pendingOrders = useMemo(() => {
    return filteredOrders.filter((o) => 
      o.status === 'Order Placed' || o.status === 'Order Accepted' || o.status === 'Preparing' || o.status === 'Ready for Pickup / Served'
    );
  }, [filteredOrders]);

  const rejectedOrders = useMemo(() => {
    return filteredOrders.filter((o) => o.status === 'Rejected');
  }, [filteredOrders]);

  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalCompletedCount = completedOrders.length;
  const aov = totalCompletedCount > 0 ? Math.round(totalRevenue / totalCompletedCount) : 0;

  // Category Revenue Breakdown
  const categoryRevenue = useMemo(() => {
    const map = new Map<string, number>();
    completedOrders.forEach((o) => {
      o.items.forEach((it) => {
        const cat = it.category || 'Other';
        map.set(cat, (map.get(cat) || 0) + it.price * it.quantity);
      });
    });
    return Array.from(map.entries()).map(([cat, rev]) => ({
      category: cat,
      revenue: rev,
      percentage: totalRevenue > 0 ? Math.round((rev / totalRevenue) * 100) : 0,
    })).sort((a, b) => b.revenue - a.revenue);
  }, [completedOrders, totalRevenue]);

  // Payment Breakdown
  const paymentBreakdown = useMemo(() => {
    const upiOrders = completedOrders.filter((o) => o.paymentMethod === 'UPI');
    const cashOrders = completedOrders.filter((o) => o.paymentMethod === 'Cash');

    const upiRev = upiOrders.reduce((s, o) => s + o.totalAmount, 0);
    const cashRev = cashOrders.reduce((s, o) => s + o.totalAmount, 0);

    return {
      upi: { count: upiOrders.length, revenue: upiRev, pct: totalRevenue > 0 ? Math.round((upiRev / totalRevenue) * 100) : 0 },
      cash: { count: cashOrders.length, revenue: cashRev, pct: totalRevenue > 0 ? Math.round((cashRev / totalRevenue) * 100) : 0 },
    };
  }, [completedOrders, totalRevenue]);

  // Best Selling Products
  const bestSellers = useMemo(() => {
    const map = new Map<string, { name: string; quantity: number; revenue: number }>();
    completedOrders.forEach((o) => {
      o.items.forEach((it) => {
        const ex = map.get(it.name);
        if (ex) {
          ex.quantity += it.quantity;
          ex.revenue += it.price * it.quantity;
        } else {
          map.set(it.name, { name: it.name, quantity: it.quantity, revenue: it.price * it.quantity });
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [completedOrders]);

  // Date-wise breakdown
  const dateWise = useMemo(() => {
    const map = new Map<string, { date: string; orders: number; revenue: number }>();
    completedOrders.forEach((o) => {
      const d = o.createdAt.split('T')[0];
      const ex = map.get(d);
      if (ex) {
        ex.orders += 1;
        ex.revenue += o.totalAmount;
      } else {
        map.set(d, { date: d, orders: 1, revenue: o.totalAmount });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [completedOrders]);

  // CSV Export Download
  const downloadCSV = () => {
    const headers = ['Order ID', 'Date & Time', 'Customer Name', 'Mobile', 'Order Type', 'Table', 'Payment Method', 'Status', 'Items', 'Subtotal', 'Tax (5%)', 'Total (INR)'];
    const rows = filteredOrders.map((o) => [
      o.id,
      `"${o.createdAt}"`,
      `"${o.customerName}"`,
      `"${o.customerMobile}"`,
      o.orderType,
      o.tableNumber || '-',
      o.paymentMethod,
      o.status,
      `"${o.items.map((i) => `${i.quantity}x ${i.name}`).join('; ')}"`,
      o.subtotal,
      o.tax,
      o.totalAmount,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `brewbean_sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EBE3D7]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6D58]">
            Financial & Sales Analytics
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#2C1810] mt-1">
            Sales Performance Management
          </h1>
          <p className="text-xs text-[#7A675B] mt-0.5">
            Real-time financial audits. Note: Only completed orders are counted toward finalized revenue.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Date Filter */}
          <div className="flex items-center bg-white border border-[#DDD0C2] rounded-xl p-1 shadow-xs text-xs font-medium">
            <button
              onClick={() => setDateRange('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                dateRange === 'all' ? 'bg-[#3D2314] text-white' : 'text-[#6B5749] hover:text-[#2C1810]'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setDateRange('today')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                dateRange === 'today' ? 'bg-[#3D2314] text-white' : 'text-[#6B5749] hover:text-[#2C1810]'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateRange('7days')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                dateRange === '7days' ? 'bg-[#3D2314] text-white' : 'text-[#6B5749] hover:text-[#2C1810]'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setDateRange('30days')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                dateRange === '30days' ? 'bg-[#3D2314] text-white' : 'text-[#6B5749] hover:text-[#2C1810]'
              }`}
            >
              This Month
            </button>
          </div>

          {/* CSV Download Button */}
          <button
            onClick={downloadCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-[#2C1810] text-[#E8D8C8] hover:bg-[#1A0F0A] rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download CSV</span>
          </button>
        </div>
      </div>

      {/* 1. Key Metric KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-[#EAE2D5] rounded-2xl shadow-xs space-y-2">
          <span className="text-xs font-medium text-[#8C7A6E]">Finalized Revenue</span>
          <div className="text-2xl font-bold font-mono text-[#2C1810]">
            ₹{totalRevenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium">
            From {totalCompletedCount} fulfilled orders
          </p>
        </div>

        <div className="p-5 bg-white border border-[#EAE2D5] rounded-2xl shadow-xs space-y-2">
          <span className="text-xs font-medium text-[#8C7A6E]">Average Order Value (AOV)</span>
          <div className="text-2xl font-bold font-mono text-[#2C1810]">
            ₹{aov}
          </div>
          <p className="text-[11px] text-[#7A675B]">
            Per completed ticket
          </p>
        </div>

        <div className="p-5 bg-white border border-[#EAE2D5] rounded-2xl shadow-xs space-y-2">
          <span className="text-xs font-medium text-[#8C7A6E]">Pending Pipeline</span>
          <div className="text-2xl font-bold font-mono text-amber-900">
            {pendingOrders.length}
          </div>
          <p className="text-[11px] text-amber-700">
            ₹{pendingOrders.reduce((s, o) => s + o.totalAmount, 0).toLocaleString()} awaiting prep
          </p>
        </div>

        <div className="p-5 bg-white border border-[#EAE2D5] rounded-2xl shadow-xs space-y-2">
          <span className="text-xs font-medium text-[#8C7A6E]">Cancelled / Rejected</span>
          <div className="text-2xl font-bold font-mono text-stone-500">
            {rejectedOrders.length}
          </div>
          <p className="text-[11px] text-stone-500">
            Zero revenue impact
          </p>
        </div>
      </div>

      {/* 2. Category Breakdown & Payment Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Category Revenue (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#EAE2D5] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE2]">
            <div>
              <h2 className="text-sm font-bold text-[#2C1810]">Revenue by Food Category</h2>
              <p className="text-xs text-[#7A675B]">Which menu departments generate the most sales</p>
            </div>
            <BarChart3 className="w-4 h-4 text-[#8C6D58]" />
          </div>

          <div className="space-y-3 pt-2">
            {categoryRevenue.map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#3D2314]">{cat.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#2C1810]">₹{cat.revenue.toLocaleString()}</span>
                    <span className="text-[10px] text-[#8C7A6E] font-medium">({cat.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-[#F2ECE2] rounded-full overflow-hidden">
                  <div className="h-full bg-[#3D2314] rounded-full" style={{ width: `${cat.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#EAE2D5] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE2]">
            <div>
              <h2 className="text-sm font-bold text-[#2C1810]">Payment Method Breakdown</h2>
              <p className="text-xs text-[#7A675B]">Digital UPI vs Counter Cash</p>
            </div>
            <PieChart className="w-4 h-4 text-[#8C6D58]" />
          </div>

          <div className="space-y-4 pt-2">
            {/* UPI Card */}
            <div className="p-4 bg-[#F2F8F4] border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                  <QrCode className="w-4 h-4 text-emerald-700" />
                  <span>Instant UPI</span>
                </div>
                <span className="text-xs font-bold font-mono text-emerald-900">
                  {paymentBreakdown.upi.pct}%
                </span>
              </div>
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-emerald-800">{paymentBreakdown.upi.count} transactions</span>
                <span className="font-mono font-bold text-sm text-emerald-950">
                  ₹{paymentBreakdown.upi.revenue.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Cash Card */}
            <div className="p-4 bg-[#FFFBF2] border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                  <Banknote className="w-4 h-4 text-amber-700" />
                  <span>Counter Cash</span>
                </div>
                <span className="text-xs font-bold font-mono text-amber-900">
                  {paymentBreakdown.cash.pct}%
                </span>
              </div>
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-amber-800">{paymentBreakdown.cash.count} transactions</span>
                <span className="font-mono font-bold text-sm text-amber-950">
                  ₹{paymentBreakdown.cash.revenue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Best Selling Products Table & Date-Wise Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Best Sellers (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#EAE2D5] rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#2C1810]">Best-Selling Food & Beverages</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF6F0] text-[#7A675B] font-semibold border-b border-[#EBE3D7] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Item Name</th>
                  <th className="py-2.5 px-3 text-center">Units Sold</th>
                  <th className="py-2.5 px-3 text-right">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE3D7]">
                {bestSellers.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#FBF9F5]">
                    <td className="py-2.5 px-3 font-semibold text-[#2C1810]">{item.name}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#3D2314]">
                      ₹{item.revenue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Date-wise Sales Report (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#EAE2D5] rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#2C1810]">Date-Wise Sales Audit</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF6F0] text-[#7A675B] font-semibold border-b border-[#EBE3D7] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-center">Orders</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE3D7]">
                {dateWise.map((dw) => (
                  <tr key={dw.date} className="hover:bg-[#FBF9F5]">
                    <td className="py-2.5 px-3 font-medium text-[#2C1810]">{dw.date}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{dw.orders}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#3D2314]">
                      ₹{dw.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
