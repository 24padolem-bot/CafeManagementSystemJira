import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  UtensilsCrossed, 
  TrendingUp, 
  Users, 
  Boxes, 
  FileSpreadsheet, 
  LogOut, 
  Coffee, 
  ArrowLeft, 
  Menu as MenuIcon, 
  X,
  AlertTriangle,
  RotateCw
} from 'lucide-react';
import { AdminDashboard } from './AdminDashboard';
import { AdminOrders } from './AdminOrders';
import { AdminMenu } from './AdminMenu';
import { AdminSales } from './AdminSales';
import { AdminCustomers } from './AdminCustomers';
import { AdminInventory } from './AdminInventory';
import { AdminReports } from './AdminReports';

export type AdminTab = 
  | 'dashboard' 
  | 'orders' 
  | 'menu' 
  | 'sales' 
  | 'customers' 
  | 'inventory' 
  | 'reports';

export const AdminLayout: React.FC = () => {
  const { setActiveModule, logout, orders, inventory } = useCafe();
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Badges
  const pendingCount = orders.filter(
    (o) => o.status === 'Order Placed' || o.status === 'Order Accepted' || o.status === 'Preparing'
  ).length;

  const lowStockCount = inventory.filter(
    (i) => i.status === 'Low Stock' || i.status === 'Out of Stock'
  ).length;

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { 
      id: 'orders', 
      label: 'Order Management', 
      icon: <ShoppingBag className="w-4 h-4" />, 
      badge: pendingCount > 0 ? pendingCount : undefined,
      badgeColor: 'bg-amber-500 text-stone-950 font-bold'
    },
    { id: 'menu', label: 'Menu Management', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { id: 'sales', label: 'Sales Management', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'customers', label: 'Customer Management', icon: <Users className="w-4 h-4" /> },
    { 
      id: 'inventory', 
      label: 'Inventory Management', 
      icon: <Boxes className="w-4 h-4" />,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-rose-500 text-white font-bold'
    },
    { id: 'reports', label: 'Reports', icon: <FileSpreadsheet className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col md:flex-row text-[#2C1810]">
      
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#24130A] text-white sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#D4A373] text-[#24130A] flex items-center justify-center font-bold">
            <Coffee className="w-4 h-4" />
          </div>
          <span className="font-display font-bold text-sm tracking-tight text-[#E8D8C8]">
            Brew & Bean Admin
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveModule('customer')}
            className="text-xs bg-[#3D2314] text-[#E8D8C8] px-2.5 py-1 rounded border border-white/10"
          >
            Customer View
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1 text-white/80 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside
        className={`${
          isMobileMenuOpen ? 'flex' : 'hidden md:flex'
        } fixed md:sticky top-0 left-0 h-screen w-64 bg-[#24130A] text-[#E8D8C8] flex-col justify-between p-5 z-50 border-r border-[#3D2314] shrink-0 transition-transform`}
      >
        <div className="space-y-6">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-3 px-2 pt-1 pb-3 border-b border-[#3D2314]">
            <div className="w-9 h-9 rounded-xl bg-[#D4A373] text-[#24130A] flex items-center justify-center shadow-sm">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display text-base font-bold text-white tracking-tight">
                Brew & Bean
              </span>
              <p className="text-[10px] uppercase font-semibold tracking-wider text-[#A68F80]">
                Admin Console
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                    isActive
                      ? 'bg-[#D4A373] text-[#24130A] shadow-sm font-bold'
                      : 'text-[#C9B9AE] hover:bg-[#382012] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Actions */}
        <div className="pt-4 border-t border-[#3D2314] space-y-2">
          {/* Switch to Customer App */}
          <button
            onClick={() => setActiveModule('customer')}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-[#D4A373] hover:bg-[#382012] rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Switch to Customer View</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-950/40 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {/* Top Control Bar in Desktop View */}
        <div className="hidden md:flex items-center justify-between pb-6 mb-6 border-b border-[#EBE3D7]">
          <div className="flex items-center gap-2 text-xs text-[#7A675B]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Kitchen Socket Connected · Auto-syncing orders & menu</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveModule('customer')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#3D2314] bg-[#F0E8DC] hover:bg-[#E5DACD] border border-[#DDD0C2] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Visit Customer Storefront</span>
            </button>
          </div>
        </div>

        {/* Dynamic View Tab */}
        {currentTab === 'dashboard' && <AdminDashboard onNavigateToOrders={() => setCurrentTab('orders')} />}
        {currentTab === 'orders' && <AdminOrders />}
        {currentTab === 'menu' && <AdminMenu />}
        {currentTab === 'sales' && <AdminSales />}
        {currentTab === 'customers' && <AdminCustomers />}
        {currentTab === 'inventory' && <AdminInventory />}
        {currentTab === 'reports' && <AdminReports />}
      </main>

    </div>
  );
};
