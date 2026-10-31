import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Download, FileText, Calendar, ShoppingBag, Users, TrendingUp, CheckCircle2 } from 'lucide-react';

export const AdminReports: React.FC = () => {
  const { orders, customers, menu, inventory } = useCafe();
  const [reportType, setReportType] = useState<
    'daily_sales' | 'weekly_sales' | 'monthly_sales' | 'best_sellers' | 'customer_activity' | 'inventory_status'
  >('daily_sales');

  const completedOrders = orders.filter((o) => o.status === 'Completed');

  // Generate Report Data based on selection
  const exportCurrentReport = () => {
    let filename = '';
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (reportType === 'daily_sales') {
      filename = `daily_sales_report_${new Date().toISOString().split('T')[0]}.csv`;
      headers = ['Date', 'Total Orders', 'Completed Orders', 'Gross Revenue (INR)', 'Tax Collected (5%)'];
      const map = new Map<string, { total: number; completed: number; rev: number; tax: number }>();

      orders.forEach((o) => {
        const d = o.createdAt.split('T')[0];
        const ex = map.get(d) || { total: 0, completed: 0, rev: 0, tax: 0 };
        ex.total += 1;
        if (o.status === 'Completed') {
          ex.completed += 1;
          ex.rev += o.totalAmount;
          ex.tax += o.tax;
        }
        map.set(d, ex);
      });

      rows = Array.from(map.entries()).map(([date, data]) => [
        date,
        data.total,
        data.completed,
        data.rev,
        data.tax,
      ]);
    } else if (reportType === 'best_sellers') {
      filename = `bestsellers_report_${new Date().toISOString().split('T')[0]}.csv`;
      headers = ['Item Name', 'Category', 'Diet', 'Units Sold', 'Total Revenue Generated (INR)'];
      const map = new Map<string, { cat: string; diet: string; qty: number; rev: number }>();

      completedOrders.forEach((o) => {
        o.items.forEach((it) => {
          const ex = map.get(it.name) || { cat: it.category, diet: it.isVeg ? 'Veg' : 'Non-Veg', qty: 0, rev: 0 };
          ex.qty += it.quantity;
          ex.rev += it.price * it.quantity;
          map.set(it.name, ex);
        });
      });

      rows = Array.from(map.entries()).map(([name, data]) => [
        `"${name}"`,
        data.cat,
        data.diet,
        data.qty,
        data.rev,
      ]);
    } else if (reportType === 'customer_activity') {
      filename = `customer_activity_report_${new Date().toISOString().split('T')[0]}.csv`;
      headers = ['Customer Name', 'Mobile Number', 'Total Orders Placed', 'Total Revenue Contributed (INR)', 'Last Order Date'];
      rows = customers.map((c) => [
        `"${c.name}"`,
        `"${c.mobile}"`,
        c.totalOrders,
        c.totalSpent,
        c.lastOrderDate.split('T')[0],
      ]);
    } else if (reportType === 'inventory_status') {
      filename = `inventory_status_report_${new Date().toISOString().split('T')[0]}.csv`;
      headers = ['Ingredient Name', 'Available Stock', 'Unit', 'Safety Threshold', 'Health Status', 'Last Restocked'];
      rows = inventory.map((i) => [
        `"${i.name}"`,
        i.quantity,
        i.unit,
        i.minStock,
        i.status,
        i.lastRestocked,
      ]);
    } else {
      // General Orders Report (weekly / monthly)
      filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
      headers = ['Order ID', 'Timestamp', 'Customer Name', 'Phone', 'Type', 'Table', 'Status', 'Payment', 'Total (INR)'];
      rows = orders.map((o) => [
        o.id,
        o.createdAt,
        `"${o.customerName}"`,
        `"${o.customerMobile}"`,
        o.orderType,
        o.tableNumber || '-',
        o.status,
        o.paymentMethod,
        o.totalAmount,
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EBE3D7]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6D58]">
            Management Reports & CSV Exports
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#2C1810] mt-1">
            Business Intelligence & Reports
          </h1>
          <p className="text-xs text-[#7A675B] mt-0.5">
            Download verified operational spreadsheets for accounting, inventory audits, and sales review.
          </p>
        </div>

        <button
          onClick={exportCurrentReport}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#3D2314] hover:bg-[#2A170C] rounded-xl shadow-sm transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export Selected Report (.CSV)</span>
        </button>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            id: 'daily_sales',
            title: 'Daily Sales & Revenue Report',
            desc: 'Itemized day-by-day orders, GST tax collections, and gross sales.',
            icon: <Calendar className="w-5 h-5 text-[#8C6D58]" />,
            tag: 'Finance',
          },
          {
            id: 'weekly_sales',
            title: 'Weekly Orders Audit',
            desc: 'Full ticket log across past 7 days with status and order channels.',
            icon: <TrendingUp className="w-5 h-5 text-emerald-700" />,
            tag: 'Operations',
          },
          {
            id: 'monthly_sales',
            title: 'Monthly Cumulative Sales',
            desc: 'Consolidated monthly volume, average ticket sizes, and payment split.',
            icon: <FileText className="w-5 h-5 text-[#3D2314]" />,
            tag: 'Finance',
          },
          {
            id: 'best_sellers',
            title: 'Best-Selling Products Report',
            desc: 'Ranked menu item volumes, popularity metrics, and category revenue.',
            icon: <ShoppingBag className="w-5 h-5 text-amber-700" />,
            tag: 'Menu',
          },
          {
            id: 'customer_activity',
            title: 'Customer Activity & LTV',
            desc: 'Guest repeat visit counts, spend totals, and loyalty frequency.',
            icon: <Users className="w-5 h-5 text-purple-700" />,
            tag: 'Patrons',
          },
          {
            id: 'inventory_status',
            title: 'Pantry & Raw Material Status',
            desc: 'Safety threshold levels, shortage warnings, and restock logs.',
            icon: <CheckCircle2 className="w-5 h-5 text-blue-700" />,
            tag: 'Stock',
          },
        ].map((rep) => {
          const isSelected = reportType === rep.id;

          return (
            <div
              key={rep.id}
              onClick={() => setReportType(rep.id as any)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-[#3D2314] shadow-md ring-2 ring-[#3D2314]/15'
                  : 'bg-white border-[#EAE2D5] hover:border-[#D4A373]/60 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F5EFE6] flex items-center justify-center">
                    {rep.icon}
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C7A6E] bg-[#F7F2EA] px-2 py-0.5 rounded">
                    {rep.tag}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#2C1810]">
                  {rep.title}
                </h3>
                <p className="text-xs text-[#6B5749] mt-1 leading-relaxed">
                  {rep.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#F2ECE2] flex items-center justify-between">
                <span className={`text-[11px] font-semibold ${isSelected ? 'text-[#3D2314]' : 'text-[#8C7A6E]'}`}>
                  {isSelected ? '✓ Ready to Export' : 'Click to Select'}
                </span>
                <span className="text-xs text-[#3D2314] font-medium">.CSV</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Report Preview Banner */}
      <div className="bg-[#FAF6F0] border border-[#EBE3D7] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8C6D58]">
            Export Ready
          </span>
          <h3 className="text-base font-bold text-[#2C1810] mt-0.5">
            Download {reportType.replace('_', ' ').toUpperCase()} Spreadsheet
          </h3>
          <p className="text-xs text-[#6B5749] mt-0.5">
            Compatible with Microsoft Excel, Google Sheets, and accounting software.
          </p>
        </div>

        <button
          onClick={exportCurrentReport}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#3D2314] hover:bg-[#2A170C] rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Download Now</span>
        </button>
      </div>

    </div>
  );
};
