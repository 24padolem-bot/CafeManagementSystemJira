import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { X, Coffee, ShieldCheck, User, Phone, Lock } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: 'customer' | 'admin';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  defaultRole = 'customer',
}) => {
  const { loginCustomer, loginAdmin, session } = useCafe();
  const [roleTab, setRoleTab] = useState<'customer' | 'admin'>(defaultRole);

  // Customer Form
  const [custName, setCustName] = useState(session.customerName || 'Aarav Sharma');
  const [custMobile, setCustMobile] = useState(session.customerMobile || '9876543210');

  // Admin Form
  const [adminUser, setAdminUser] = useState('admin');
  const [adminPass, setAdminPass] = useState('admin123');
  const [adminError, setAdminError] = useState('');

  if (!isOpen) return null;

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custMobile.trim()) return;
    loginCustomer(custName, custMobile);
    onClose();
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    const success = loginAdmin(adminUser, adminPass);
    if (success) {
      onClose();
    } else {
      setAdminError('Invalid admin credentials. Use admin / admin123');
    }
  };

  const fillDemoCustomer = () => {
    setCustName('Priya Patel');
    setCustMobile('9822334455');
  };

  const fillDemoAdmin = () => {
    setAdminUser('admin');
    setAdminPass('admin123');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[#FBF9F5] rounded-xl border border-[#E5DACD] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBE3D7] bg-[#F7F2EA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3D2314] text-[#E8D8C8] flex items-center justify-center">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#2C1810]">Access Cafe Portal</h3>
              <p className="text-xs text-[#7A675B]">Choose your access level</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#7A675B] hover:text-[#2C1810] hover:bg-[#EBE3D7] transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-6 pb-0">
          <div className="grid grid-cols-2 p-1 bg-[#ECE4D8] rounded-lg">
            <button
              type="button"
              onClick={() => { setRoleTab('customer'); setAdminError(''); }}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
                roleTab === 'customer'
                  ? 'bg-white text-[#2C1810] shadow-xs'
                  : 'text-[#6C5B50] hover:text-[#2C1810]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Customer Login
            </button>
            <button
              type="button"
              onClick={() => { setRoleTab('admin'); setAdminError(''); }}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
                roleTab === 'admin'
                  ? 'bg-white text-[#2C1810] shadow-xs'
                  : 'text-[#6C5B50] hover:text-[#2C1810]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Cafe Admin
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          {roleTab === 'customer' ? (
            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#4A3B32] mb-1.5">
                  Your Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7A6E]" />
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#D9CABE] rounded-lg text-[#2C1810] placeholder-[#A6978C] focus:outline-none focus:ring-2 focus:ring-[#8C6D58]/40 focus:border-[#8C6D58]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A3B32] mb-1.5">
                  Mobile Number (for order updates)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7A6E]" />
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={custMobile}
                    onChange={(e) => setCustMobile(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#D9CABE] rounded-lg text-[#2C1810] placeholder-[#A6978C] focus:outline-none focus:ring-2 focus:ring-[#8C6D58]/40 focus:border-[#8C6D58]"
                  />
                </div>
                <p className="text-[11px] text-[#7A675B] mt-1">Used to sync your cart and live order tracking</p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={fillDemoCustomer}
                  className="text-xs text-[#8C6D58] hover:text-[#5B3F2E] underline underline-offset-2"
                >
                  Fill Demo Data
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#3D2314] hover:bg-[#2A170C] rounded-lg shadow-sm transition-colors"
                >
                  Continue to Cafe
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#4A3B32] mb-1.5">
                  Administrator Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7A6E]" />
                  <input
                    type="text"
                    required
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                    placeholder="admin"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#D9CABE] rounded-lg text-[#2C1810] placeholder-[#A6978C] focus:outline-none focus:ring-2 focus:ring-[#8C6D58]/40 focus:border-[#8C6D58]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A3B32] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7A6E]" />
                  <input
                    type="password"
                    required
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#D9CABE] rounded-lg text-[#2C1810] placeholder-[#A6978C] focus:outline-none focus:ring-2 focus:ring-[#8C6D58]/40 focus:border-[#8C6D58]"
                  />
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px] text-[#7A675B]">
                  <span>Demo: admin / admin123</span>
                  <button
                    type="button"
                    onClick={fillDemoAdmin}
                    className="text-[#8C6D58] hover:text-[#5B3F2E] underline"
                  >
                    Auto-Fill
                  </button>
                </div>
              </div>

              {adminError && (
                <div className="p-2.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {adminError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-semibold text-white bg-[#3D2314] hover:bg-[#2A170C] rounded-lg shadow-sm transition-colors"
                >
                  Enter Admin Console
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
