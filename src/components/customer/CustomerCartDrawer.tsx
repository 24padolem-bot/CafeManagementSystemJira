import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { VegBadge } from '../common/VegBadge';
import { Order, OrderType, PaymentMethod } from '../../types/cafe';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  CheckCircle2, 
  QrCode, 
  Banknote, 
  Sparkles,
  UtensilsCrossed,
  Clock
} from 'lucide-react';

interface CustomerCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onViewOrder: (orderId: string) => void;
}

export const CustomerCartDrawer: React.FC<CustomerCartDrawerProps> = ({
  isOpen,
  onClose,
  onViewOrder,
}) => {
  const { 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart, 
    cartSubtotal, 
    cartTax, 
    cartTotal, 
    cartItemCount,
    session,
    placeOrder 
  } = useCafe();

  // Form states
  const [customerName, setCustomerName] = useState(session.customerName || 'Aarav Sharma');
  const [customerMobile, setCustomerMobile] = useState(session.customerMobile || '9876543210');
  const [orderType, setOrderType] = useState<OrderType>('Dine-in');
  const [tableNumber, setTableNumber] = useState('Table 3');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [upiId, setUpiId] = useState('aarav@okhdfcbank');

  // Confirmation state
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!customerName.trim() || !customerMobile.trim()) return;
    if (orderType === 'Dine-in' && !tableNumber.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newOrder = placeOrder({
        customerName: customerName.trim(),
        customerMobile: customerMobile.trim(),
        orderType,
        tableNumber: orderType === 'Dine-in' ? tableNumber.trim() : undefined,
        specialInstructions: specialInstructions.trim() || undefined,
        paymentMethod,
      });

      setConfirmedOrder(newOrder);
      setIsSubmitting(false);
    }, 450);
  };

  const handleResetAndTrack = () => {
    if (confirmedOrder) {
      const id = confirmedOrder.id;
      setConfirmedOrder(null);
      onClose();
      onViewOrder(id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-lg bg-[#FBF9F5] h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBE3D7] bg-[#F7F2EA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3D2314] text-[#E8D8C8] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2C1810]">Your Cafe Order</h2>
              <p className="text-xs text-[#7A675B]">
                {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'} in cart
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setConfirmedOrder(null);
              onClose();
            }}
            className="p-1.5 rounded-lg text-[#7A675B] hover:text-[#2C1810] hover:bg-[#EBE3D7] transition-colors"
            aria-label="Close cart drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* If Order Confirmed Screen */}
          {confirmedOrder ? (
            <div className="text-center py-6 space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                  Payment Verified · Order Received
                </span>
                <h3 className="text-2xl font-display font-bold text-[#2C1810] mt-1">
                  Order #{confirmedOrder.id}
                </h3>
                <p className="text-xs text-[#6B5749] mt-2 max-w-sm mx-auto">
                  Thank you, {confirmedOrder.customerName}! Your order has been placed in the kitchen queue.
                </p>
              </div>

              {/* Order Details Card */}
              <div className="p-4 bg-white border border-[#EAE2D5] rounded-xl text-left space-y-3 text-xs">
                <div className="flex justify-between pb-2 border-b border-[#F2ECE2]">
                  <span className="text-[#7A675B]">Order Type</span>
                  <span className="font-semibold text-[#2C1810]">
                    {confirmedOrder.orderType} {confirmedOrder.tableNumber ? `(${confirmedOrder.tableNumber})` : ''}
                  </span>
                </div>
                <div className="flex justify-between pb-2 border-b border-[#F2ECE2]">
                  <span className="text-[#7A675B]">Payment Method</span>
                  <span className="font-semibold text-[#2C1810]">{confirmedOrder.paymentMethod} (Simulated)</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-[#F2ECE2]">
                  <span className="text-[#7A675B]">Total Amount Paid</span>
                  <span className="font-bold text-[#2C1810] font-mono text-sm">₹{confirmedOrder.totalAmount}</span>
                </div>
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-semibold text-[#7A675B] uppercase tracking-wider">Ordered Items</span>
                  {confirmedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-[#3D2314]">
                      <span>{it.quantity}x {it.name}</span>
                      <span className="font-mono">₹{it.price * it.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <button
                  onClick={handleResetAndTrack}
                  className="w-full py-3 text-xs font-bold uppercase tracking-wider text-white bg-[#3D2314] hover:bg-[#2A170C] rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <span>Track Live Order Status</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setConfirmedOrder(null);
                    onClose();
                  }}
                  className="text-xs text-[#8C6D58] hover:text-[#2C1810] font-medium"
                >
                  Back to Menu
                </button>
              </div>
            </div>
          ) : cart.length === 0 ? (
            /* Empty Cart */
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#F3EDE2] text-[#8C7A6E] flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-[#2C1810]">Your cart is empty</h3>
              <p className="text-xs text-[#7A675B] max-w-xs mx-auto">
                Discover artisan brews, handcrafted snacks, and warm desserts on our menu.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#3D2314] hover:bg-[#2A170C] rounded-xl transition-colors"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            /* Cart Items & Checkout Form */
            <div className="space-y-6">
              
              {/* Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8C6D58]">
                    Selected Items
                  </h3>
                  <button
                    onClick={clearCart}
                    className="text-[11px] text-[#A67C52] hover:text-red-700 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear Cart</span>
                  </button>
                </div>

                <div className="divide-y divide-[#EBE3D7] bg-white border border-[#EAE2D5] rounded-xl p-3">
                  {cart.map(({ item, quantity }) => (
                    <div key={item.id} className="py-3 first:pt-1 last:pb-1 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-[#F5EFE6] overflow-hidden shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/src/assets/images/cafe_hero_ambience_1793381416203.jpg';
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <VegBadge isVeg={item.isVeg} size="sm" />
                          <h4 className="text-xs font-bold text-[#2C1810] truncate">{item.name}</h4>
                        </div>
                        <p className="text-[11px] text-[#8C7A6E] font-mono tabular-nums">
                          ₹{item.price} each
                        </p>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center bg-[#F7F2EA] border border-[#DDD0C2] rounded-lg">
                        <button
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="p-1 text-[#3D2314] hover:bg-[#EAE2D5]"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold font-mono text-[#2C1810] tabular-nums">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="p-1 text-[#3D2314] hover:bg-[#EAE2D5]"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right min-w-[50px]">
                        <span className="text-xs font-bold font-mono text-[#2C1810] tabular-nums">
                          ₹{item.price * quantity}
                        </span>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-stone-400 hover:text-red-600 p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checkout Form */}
              <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8C6D58]">
                  Order & Delivery Information
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#4A3B32] mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#DDD0C2] rounded-lg text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#8C6D58]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#4A3B32] mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      value={customerMobile}
                      onChange={(e) => setCustomerMobile(e.target.value)}
                      placeholder="10 digits"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#DDD0C2] rounded-lg text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#8C6D58]"
                    />
                  </div>
                </div>

                {/* Dine-in vs Takeaway */}
                <div>
                  <label className="block text-[11px] font-medium text-[#4A3B32] mb-1">
                    Order Type *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderType('Dine-in')}
                      className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg border transition-all ${
                        orderType === 'Dine-in'
                          ? 'bg-[#3D2314] text-white border-[#3D2314] shadow-xs'
                          : 'bg-white text-[#6B5749] border-[#DDD0C2] hover:bg-[#F7F2EA]'
                      }`}
                    >
                      <UtensilsCrossed className="w-3.5 h-3.5" />
                      Dine-in
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('Takeaway')}
                      className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg border transition-all ${
                        orderType === 'Takeaway'
                          ? 'bg-[#3D2314] text-white border-[#3D2314] shadow-xs'
                          : 'bg-white text-[#6B5749] border-[#DDD0C2] hover:bg-[#F7F2EA]'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Takeaway / Parcel
                    </button>
                  </div>
                </div>

                {/* Table Number if Dine-in */}
                {orderType === 'Dine-in' && (
                  <div className="bg-[#FAF6F0] p-3 rounded-lg border border-[#EBE3D7] animate-in fade-in duration-150">
                    <label className="block text-[11px] font-medium text-[#4A3B32] mb-1">
                      Table Number *
                    </label>
                    <div className="flex gap-2">
                      {['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5'].map((tbl) => (
                        <button
                          key={tbl}
                          type="button"
                          onClick={() => setTableNumber(tbl)}
                          className={`flex-1 py-1 text-xs rounded border transition-colors ${
                            tableNumber === tbl
                              ? 'bg-[#D4A373] text-[#2C1810] font-bold border-[#C28F5F]'
                              : 'bg-white text-[#6B5749] border-[#DDD0C2]'
                          }`}
                        >
                          {tbl.replace('Table ', 'T')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Special Instructions */}
                <div>
                  <label className="block text-[11px] font-medium text-[#4A3B32] mb-1">
                    Special Cooking / Serving Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="e.g. Less sugar, extra ice, separate ketchup packets..."
                    className="w-full px-3 py-2 text-xs bg-white border border-[#DDD0C2] rounded-lg text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#8C6D58]"
                  />
                </div>

                {/* Payment Simulation Selector */}
                <div>
                  <label className="block text-[11px] font-medium text-[#4A3B32] mb-1">
                    Payment Method (Prototype Simulation) *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('UPI')}
                      className={`p-2.5 text-xs font-semibold rounded-lg border text-left flex items-start gap-2.5 transition-all ${
                        paymentMethod === 'UPI'
                          ? 'bg-[#F2F8F4] border-emerald-600 text-emerald-950'
                          : 'bg-white border-[#DDD0C2] text-[#6B5749]'
                      }`}
                    >
                      <QrCode className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Instant UPI</p>
                        <p className="text-[10px] text-emerald-700">GPay, PhonePe, Paytm</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Cash')}
                      className={`p-2.5 text-xs font-semibold rounded-lg border text-left flex items-start gap-2.5 transition-all ${
                        paymentMethod === 'Cash'
                          ? 'bg-[#FFFBF2] border-amber-600 text-amber-950'
                          : 'bg-white border-[#DDD0C2] text-[#6B5749]'
                      }`}
                    >
                      <Banknote className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Cash on Counter</p>
                        <p className="text-[10px] text-amber-700">Pay cash when served</p>
                      </div>
                    </button>
                  </div>

                  {paymentMethod === 'UPI' && (
                    <div className="mt-2 p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-lg text-emerald-900 text-[11px] flex items-center justify-between">
                      <span>UPI VPA: <strong>brewbean@upi</strong></span>
                      <span className="font-semibold text-emerald-700">Auto-Verified</span>
                    </div>
                  )}
                </div>

              </form>
            </div>
          )}
        </div>

        {/* Footer with Calculation & Place Order CTA */}
        {!confirmedOrder && cart.length > 0 && (
          <div className="p-6 border-t border-[#EBE3D7] bg-[#F7F2EA] space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#6B5749]">
                <span>Items Subtotal</span>
                <span className="font-mono tabular-nums font-semibold">₹{cartSubtotal}</span>
              </div>
              <div className="flex justify-between text-[#6B5749]">
                <span>GST (5% Cafe Tax)</span>
                <span className="font-mono tabular-nums font-semibold">₹{cartTax}</span>
              </div>
              <div className="pt-2 border-t border-[#E5DACD] flex justify-between items-baseline text-sm font-bold text-[#2C1810]">
                <span>Grand Total</span>
                <span className="text-lg font-mono tabular-nums font-bold text-[#3D2314]">
                  ₹{cartTotal}
                </span>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full py-3.5 text-xs font-bold uppercase tracking-wider text-white bg-[#3D2314] hover:bg-[#2A170C] disabled:bg-stone-400 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 transform active:scale-98"
            >
              {isSubmitting ? (
                <span>Confirming Order...</span>
              ) : (
                <>
                  <span>Place Order • ₹{cartTotal}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-[#7A675B]">
              Immediate kitchen ticket generated. Changes appear instantly in Admin Console.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
