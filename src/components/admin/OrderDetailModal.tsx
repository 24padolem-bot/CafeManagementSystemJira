import React from 'react';
import { Order, OrderStatus } from '../../types/cafe';
import { VegBadge } from '../common/VegBadge';
import { X, Clock, User, Phone, CheckCircle, ChevronRight, AlertOctagon } from 'lucide-react';

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
  onUpdateStatus,
}) => {
  if (!order) return null;

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return iso;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white rounded-2xl border border-[#EAE2D5] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBE3D7] bg-[#F7F2EA]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6D58]">
                Kitchen Order Ticket
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-[#3D2314] text-white">
                #{order.id}
              </span>
            </div>
            <p className="text-xs text-[#7A675B] mt-0.5">
              Placed {formatTime(order.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#7A675B] hover:text-[#2C1810] hover:bg-[#EBE3D7] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          
          {/* Customer & Dining Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-[#FBF9F5] rounded-xl border border-[#EAE2D5]">
            <div>
              <span className="text-[11px] text-[#7A675B] uppercase tracking-wider">Customer Details</span>
              <p className="text-sm font-bold text-[#2C1810] mt-0.5">{order.customerName}</p>
              <p className="text-[#6B5749] mt-0.5">{order.customerMobile}</p>
            </div>
            <div>
              <span className="text-[11px] text-[#7A675B] uppercase tracking-wider">Dining & Payment</span>
              <p className="text-sm font-bold text-[#2C1810] mt-0.5">
                {order.orderType} {order.tableNumber ? `· ${order.tableNumber}` : ''}
              </p>
              <p className="text-[#6B5749] mt-0.5">Paid via {order.paymentMethod}</p>
            </div>
          </div>

          {/* Current Status Pill & Quick Action Bar */}
          <div>
            <span className="text-[11px] font-semibold text-[#8C6D58] uppercase tracking-wider">
              Change Order Status
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {(['Order Accepted', 'Preparing', 'Ready for Pickup / Served', 'Completed', 'Rejected'] as OrderStatus[]).map((status) => {
                const isCurrent = order.status === status;
                const isReject = status === 'Rejected';

                return (
                  <button
                    key={status}
                    onClick={() => onUpdateStatus(order.id, status)}
                    className={`py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all text-left ${
                      isCurrent
                        ? isReject
                          ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                          : 'bg-[#3D2314] text-white border-[#3D2314] shadow-xs'
                        : isReject
                        ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                        : 'border-[#DDD0C2] text-[#4A3B32] hover:bg-[#F5EFE6]'
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-[#8C6D58] uppercase tracking-wider">
              Ordered Items ({order.items.reduce((a, b) => a + b.quantity, 0)})
            </span>
            <div className="divide-y divide-[#EBE3D7] bg-white border border-[#EAE2D5] rounded-xl p-3">
              {order.items.map((it, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <VegBadge isVeg={it.isVeg} size="sm" />
                    <span className="font-bold text-[#2C1810]">
                      {it.quantity}x {it.name}
                    </span>
                    <span className="text-[#8C7A6E]">({it.category})</span>
                  </div>
                  <span className="font-mono text-[#3D2314] font-semibold">
                    ₹{it.price * it.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Special Instructions */}
          {order.specialInstructions && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-950">
              <span className="font-bold">Special Kitchen Note: </span>
              <span>{order.specialInstructions}</span>
            </div>
          )}

          {/* Financial Breakdown */}
          <div className="p-4 bg-[#F7F2EA] rounded-xl border border-[#EBE3D7] space-y-1.5">
            <div className="flex justify-between text-[#6B5749]">
              <span>Items Subtotal</span>
              <span className="font-mono">₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-[#6B5749]">
              <span>GST Tax (5%)</span>
              <span className="font-mono">₹{order.tax}</span>
            </div>
            <div className="pt-2 border-t border-[#DDD0C2] flex justify-between font-bold text-sm text-[#2C1810]">
              <span>Total Bill</span>
              <span className="font-mono text-base text-[#3D2314]">₹{order.totalAmount}</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#EBE3D7] bg-[#F7F2EA] flex items-center justify-between">
          <span className="text-[11px] text-[#7A675B]">
            Status updates sync immediately to customer app.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#3D2314] bg-white border border-[#DDD0C2] hover:bg-[#F2ECE2] rounded-lg transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
