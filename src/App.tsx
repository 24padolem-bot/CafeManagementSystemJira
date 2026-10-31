import React, { useState } from 'react';
import { CafeProvider, useCafe } from './context/CafeContext';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { CustomerHome } from './components/customer/CustomerHome';
import { CustomerMenu } from './components/customer/CustomerMenu';
import { CustomerCartDrawer } from './components/customer/CustomerCartDrawer';
import { CustomerOrders } from './components/customer/CustomerOrders';
import { CustomerContact } from './components/customer/CustomerContact';
import { AdminLayout } from './components/admin/AdminLayout';
import { Category } from './types/cafe';
import { Coffee, ShieldCheck, ArrowRightLeft, Heart } from 'lucide-react';

function CafeAppContent() {
  const { activeModule, setActiveModule, session, loginAdmin } = useCafe();
  
  // Customer View State
  const [customerView, setCustomerView] = useState<'home' | 'menu' | 'orders' | 'contact'>('home');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategoryForMenu, setSelectedCategoryForMenu] = useState<Category | null>(null);
  const [highlightOrderId, setHighlightOrderId] = useState<string | null>(null);

  const handleNavigateToMenu = (category?: Category) => {
    if (category) {
      setSelectedCategoryForMenu(category);
    }
    setCustomerView('menu');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToOrders = (orderId?: string) => {
    if (orderId) {
      setHighlightOrderId(orderId);
    }
    setCustomerView('orders');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#2C1810] flex flex-col font-sans">
      
      {/* Dynamic Module Rendering */}
      {activeModule === 'admin' ? (
        <AdminLayout />
      ) : (
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <Header
              currentView={customerView}
              onNavigate={(v) => {
                setCustomerView(v);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenCart={() => setIsCartOpen(true)}
            />

            <main>
              {customerView === 'home' && (
                <CustomerHome
                  onNavigateToMenu={handleNavigateToMenu}
                  onNavigateToOrders={() => handleNavigateToOrders()}
                />
              )}

              {customerView === 'menu' && (
                <CustomerMenu
                  initialCategory={selectedCategoryForMenu}
                  onOpenCart={() => setIsCartOpen(true)}
                />
              )}

              {customerView === 'orders' && (
                <CustomerOrders
                  highlightOrderId={highlightOrderId}
                  onNavigateToMenu={() => handleNavigateToMenu()}
                />
              )}

              {customerView === 'contact' && <CustomerContact />}
            </main>
          </div>

          {/* Customer Footer */}
          <footer className="mt-20 bg-[#24130A] text-[#E8D8C8] border-t border-[#3D2314]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#D4A373] text-[#24130A] flex items-center justify-center font-bold">
                      <Coffee className="w-4 h-4" />
                    </div>
                    <span className="font-display font-bold text-lg text-white">Brew & Bean</span>
                  </div>
                  <p className="text-xs text-[#A68F80] leading-relaxed">
                    Artisanal roastery and bistro. Small-batch ethically sourced coffee, freshly pulled espresso, and daily crafted artisan baking.
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D4A373] mb-3">Quick Navigation</h4>
                  <ul className="space-y-2 text-xs text-[#C9B9AE]">
                    <li>
                      <button onClick={() => setCustomerView('home')} className="hover:text-white transition-colors">
                        Home & Story
                      </button>
                    </li>
                    <li>
                      <button onClick={() => setCustomerView('menu')} className="hover:text-white transition-colors">
                        Menu & Daily Specials
                      </button>
                    </li>
                    <li>
                      <button onClick={() => setCustomerView('orders')} className="hover:text-white transition-colors">
                        Track Live Orders
                      </button>
                    </li>
                    <li>
                      <button onClick={() => setCustomerView('contact')} className="hover:text-white transition-colors">
                        Location & Contact
                      </button>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D4A373] mb-3">Service Hours</h4>
                  <div className="space-y-1.5 text-xs text-[#C9B9AE]">
                    <p>Monday - Friday: 7:30 AM – 10:30 PM</p>
                    <p>Saturday - Sunday: 8:00 AM – 11:30 PM</p>
                    <p className="text-[11px] text-[#A68F80] pt-1">Kitchen closes 30 mins before closing</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D4A373] mb-3">Staff & Management</h4>
                  <p className="text-xs text-[#A68F80] mb-3 leading-relaxed">
                    Access real-time orders, manage the live menu, and monitor sales analytics.
                  </p>
                  <button
                    onClick={() => {
                      loginAdmin('admin', 'admin123');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#24130A] bg-[#D4A373] hover:bg-[#C28F5F] rounded-lg shadow-xs transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Open Admin Console</span>
                  </button>
                </div>
              </div>

              <div className="pt-8 border-t border-[#3D2314] flex flex-col sm:flex-row items-center justify-between text-xs text-[#8C7A6E] gap-2">
                <p>© {new Date().getFullYear()} Brew & Bean Roasters. All rights reserved.</p>
                <p className="flex items-center gap-1">
                  Crafted for exceptional cafe management
                </p>
              </div>
            </div>
          </footer>

          {/* Cart & Checkout Drawer */}
          <CustomerCartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            onViewOrder={(orderId) => {
              setIsCartOpen(false);
              handleNavigateToOrders(orderId);
            }}
          />
        </div>
      )}

      {/* Floating Module Switcher (Quick Toggle between Customer and Admin) */}
      <div className="fixed bottom-5 left-5 z-40 hidden sm:block">
        <button
          onClick={() => {
            if (activeModule === 'customer') {
              loginAdmin('admin', 'admin123');
            } else {
              setActiveModule('customer');
            }
          }}
          className="flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl bg-[#2C1810] text-[#E8D8C8] hover:bg-black border border-[#D4A373]/40 shadow-xl transition-all transform hover:scale-105 active:scale-95"
          title={`Switch between Customer Storefront and Admin Console`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-[#D4A373]" />
          <span>{activeModule === 'customer' ? 'Switch to Admin Console' : 'Switch to Customer View'}</span>
        </button>
      </div>

      {/* Global Toast System */}
      <ToastContainer />

    </div>
  );
}

export default function App() {
  return (
    <CafeProvider>
      <CafeAppContent />
    </CafeProvider>
  );
}
