import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { ShoppingBag, Coffee, Shield, User, ArrowRightLeft } from 'lucide-react';
import { LoginModal } from '../auth/LoginModal';

interface HeaderProps {
  currentView: 'home' | 'menu' | 'orders' | 'contact';
  onNavigate: (view: 'home' | 'menu' | 'orders' | 'contact') => void;
  onOpenCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, onOpenCart }) => {
  const { cartItemCount, session, activeModule, setActiveModule, logout } = useCafe();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalDefaultRole, setLoginModalDefaultRole] = useState<'customer' | 'admin'>('customer');

  const openCustomerLogin = () => {
    setLoginModalDefaultRole('customer');
    setShowLoginModal(true);
  };

  const openAdminLogin = () => {
    setLoginModalDefaultRole('admin');
    setShowLoginModal(true);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-[#EBE3D7] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-8 h-16">
            
            {/* Zone 1: Brand Wordmark */}
            <div className="flex items-center gap-3 shrink-0">
              <button 
                onClick={() => onNavigate('home')} 
                className="flex items-center gap-2.5 text-left group focus:outline-none"
              >
                <div className="w-9 h-9 rounded-lg bg-[#3D2314] text-[#E8D8C8] flex items-center justify-center shadow-xs group-hover:bg-[#2C1810] transition-colors">
                  <Coffee className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-display text-xl font-bold tracking-tight text-[#2C1810] whitespace-nowrap">
                    Brew & Bean
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-[#8C7A6E] font-medium -mt-1 hidden sm:block">
                    Specialty Roastery & Cafe
                  </span>
                </div>
              </button>
            </div>

            {/* Zone 2: Navigation Links */}
            <nav className="hidden md:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-[#6B5749]">
              <button
                onClick={() => onNavigate('home')}
                className={`py-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  currentView === 'home'
                    ? 'border-[#3D2314] text-[#2C1810]'
                    : 'border-transparent hover:text-[#2C1810]'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => onNavigate('menu')}
                className={`py-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  currentView === 'menu'
                    ? 'border-[#3D2314] text-[#2C1810]'
                    : 'border-transparent hover:text-[#2C1810]'
                }`}
              >
                Menu
              </button>
              <button
                onClick={() => onNavigate('orders')}
                className={`py-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  currentView === 'orders'
                    ? 'border-[#3D2314] text-[#2C1810]'
                    : 'border-transparent hover:text-[#2C1810]'
                }`}
              >
                My Orders
              </button>
              <button
                onClick={() => onNavigate('contact')}
                className={`py-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  currentView === 'contact'
                    ? 'border-[#3D2314] text-[#2C1810]'
                    : 'border-transparent hover:text-[#2C1810]'
                }`}
              >
                Contact
              </button>
            </nav>

            {/* Zone 3: Actions & Module Switcher */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Quick Switch to Admin or Admin status */}
              <button
                onClick={() => {
                  if (session.role === 'admin') {
                    setActiveModule('admin');
                  } else {
                    openAdminLogin();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#4A3B32] bg-[#F0E8DC] hover:bg-[#E5DACD] border border-[#DDD0C2] rounded-lg transition-colors whitespace-nowrap"
                title="Switch to Cafe Admin Management Dashboard"
              >
                <Shield className="w-3.5 h-3.5 text-[#8C6D58]" />
                <span className="hidden sm:inline">Admin Console</span>
              </button>

              {/* Customer Profile / Login */}
              {session.customerName ? (
                <button
                  onClick={openCustomerLogin}
                  className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#4A3B32] hover:bg-[#F2ECE2] rounded-lg transition-colors"
                  title="Current Customer Account"
                >
                  <User className="w-3.5 h-3.5 text-[#8C6D58]" />
                  <span className="max-w-[100px] truncate">{session.customerName}</span>
                </button>
              ) : (
                <button
                  onClick={openCustomerLogin}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-[#6B5749] hover:text-[#2C1810]"
                >
                  <User className="w-3.5 h-3.5" />
                  Sign In
                </button>
              )}

              {/* Cart Button */}
              <button
                onClick={onOpenCart}
                className="relative inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#3D2314] hover:bg-[#2A170C] rounded-lg shadow-sm transition-all transform active:scale-95"
                aria-label="View shopping cart"
              >
                <ShoppingBag className="w-4 h-4 text-[#E8D8C8]" />
                <span className="hidden sm:inline">Cart</span>
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold rounded-full bg-[#D4A373] text-[#2C1810]">
                  {cartItemCount}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Strip */}
        <div className="md:hidden flex items-center justify-around border-t border-[#EBE3D7] bg-[#FAF6F0] py-2 text-xs font-medium text-[#6B5749]">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3 py-1 rounded ${currentView === 'home' ? 'text-[#2C1810] font-bold bg-[#ECE3D6]' : ''}`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('menu')}
            className={`px-3 py-1 rounded ${currentView === 'menu' ? 'text-[#2C1810] font-bold bg-[#ECE3D6]' : ''}`}
          >
            Menu
          </button>
          <button
            onClick={() => onNavigate('orders')}
            className={`px-3 py-1 rounded ${currentView === 'orders' ? 'text-[#2C1810] font-bold bg-[#ECE3D6]' : ''}`}
          >
            My Orders
          </button>
          <button
            onClick={() => onNavigate('contact')}
            className={`px-3 py-1 rounded ${currentView === 'contact' ? 'text-[#2C1810] font-bold bg-[#ECE3D6]' : ''}`}
          >
            Contact
          </button>
        </div>
      </header>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        defaultRole={loginModalDefaultRole}
      />
    </>
  );
};
