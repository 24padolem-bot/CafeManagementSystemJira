import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Order, OrderStatus } from '../../types/cafe';
import { VegBadge } from '../common/VegBadge';
import { 
  Clock, 
  CheckCircle, 
  ChefHat, 
  Coffee, 
  ShoppingBag, 
  Sparkles, 
  ArrowRight, 
  RotateCw, 
  AlertTriangle,
  Receipt,
  UserCheck
} from 'lucide-react';

interface CustomerOrdersProps {
  highlightOrderId?: string | null;
  onNavigateToMenu: () => void;
}

const ORDER_STEPS: OrderStatus[] = [
  'Order Placed',
  'Order Accepted',
  'Preparing',
  'Ready for Pickup / Served',
  'Completed',
];

export const CustomerOrders: React.FC<CustomerOrdersProps> = ({
  highlightOrderId,
  onNavigateToMenu,
}) => {
  const { orders, session } = useCafe();
  const [viewFilter, setViewFilter] = useState<'my' | 'all'>('my');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    highlightOrderId || null
  );

  // Filter orders
  const displayedOrders = orders.filter((order) => {
    if (viewFilter === 'my' && session.customerMobile) {
      return order.customerMobile === session.customerMobile;
    }
    return true; // Show all cafe orders if selected or no session mobile
  });

  const activeOrder = selectedOrderId
    ? orders.find((o) => o.id === selectedOrderId) || displayedOrders[0]
    : displayedOrders[0];

  const getStepStatus = (step: OrderStatus, currentStatus: OrderStatus) => {
    if (currentStatus === 'Rejected') return 'rejected';
    const currentIndex = ORDER_STEPS.indexOf(currentStatus);
    const stepIndex = ORDER_STEPS.indexOf(step);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const formatOrderTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title & Live Sync Notice */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#EBE3D7] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8C6D58]">
            <RotateCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            <span>Live Kitchen Connection Active</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-display font-bold text-[#2C1810] mt-1">
            Order Status & Real-Time Tracking
          </h1>
          <p className="text-xs sm:text-sm text-[#7A675B] mt-1">
            Watch your order progress live as our baristas and chefs prepare your items.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-[#EBE3D7] rounded-xl self-start md:self-auto shadow-xs">
          <button
            onClick={() => setViewFilter('my')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              viewFilter === 'my'
                ? 'bg-[#3D2314] text-white shadow-xs'
                : 'text-[#6C5B50] hover:text-[#2C1810]'
            }`}
          >
            My Orders ({session.customerName || 'You'})
          </button>
          <button
            onClick={() => setViewFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              viewFilter === 'all'
                ? 'bg-[#3D2314] text-white shadow-xs'
                : 'text-[#6C5B50] hover:text-[#2C1810]'
            }`}
          >
            All Cafe Orders ({orders.length})
          </button>
        </div>
      </div>

      {displayedOrders.length === 0 ? (
        <div className="bg-white border border-[#EAE2D5] rounded-2xl p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#F5EFE6] text-[#8C6D58] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#2C1810]">No orders placed yet</h3>
            <p className="text-xs text-[#7A675B] mt-1">
              You haven't placed an order with mobile number {session.customerMobile || 'yet'}.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => setViewFilter('all')}
              className="px-4 py-2 text-xs font-medium text-[#3D2314] bg-[#F0E8DC] hover:bg-[#E5DACD] rounded-lg transition-colors"
            >
              View Cafe Orders
            </button>
            <button
              onClick={onNavigateToMenu}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#3D2314] hover:bg-[#2A170C] rounded-lg transition-colors"
            >
              Order Food Now
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Order Selector List (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8C6D58]">
              {viewFilter === 'my' ? 'Your Recent Orders' : 'All Orders'} ({displayedOrders.length})
            </h3>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {displayedOrders.map((order) => {
                const isSelected = activeOrder?.id === order.id;

                const statusColor = {
                  'Order Placed': 'bg-blue-50 text-blue-800 border-blue-200',
                  'Order Accepted': 'bg-amber-50 text-amber-800 border-amber-200',
                  'Preparing': 'bg-orange-50 text-orange-800 border-orange-200',
                  'Ready for Pickup / Served': 'bg-purple-50 text-purple-800 border-purple-200',
                  'Completed': 'bg-emerald-50 text-emerald-800 border-emerald-200',
                  'Rejected': 'bg-rose-50 text-rose-800 border-rose-200',
                }[order.status];

                return (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-white border-[#3D2314] shadow-md ring-2 ring-[#3D2314]/10'
                        : 'bg-white border-[#EAE2D5] hover:border-[#D4A373]/60 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-[#2C1810]">
                        #{order.id}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColor}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs text-[#5C4D43] mb-2">
                      <span>{order.customerName}</span>
                      <span className="font-bold text-[#2C1810] font-mono tabular-nums">
                        ₹{order.totalAmount}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#8C7A6E] pt-2 border-t border-[#F2ECE2]">
                      <span>{order.orderType} {order.tableNumber ? `(${order.tableNumber})` : ''}</span>
                      <span>{formatOrderTime(order.createdAt)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Live Visual Progress Tracker & Details (8 cols) */}
          {activeOrder && (
            <div className="lg:col-span-8 bg-white border border-[#EAE2D5] rounded-2xl p-6 sm:p-8 shadow-xs space-y-8">
              
              {/* Tracker Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EBE3D7]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6D58]">
                      Tracking Live Order
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-[#2C1810] mt-1">
                    Order #{activeOrder.id}
                  </h2>
                  <p className="text-xs text-[#7A675B] mt-0.5">
                    Placed at {formatOrderTime(activeOrder.createdAt)} · {activeOrder.orderType} {activeOrder.tableNumber ? `· ${activeOrder.tableNumber}` : ''}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-[#7A675B]">Total Bill</span>
                  <p className="text-2xl font-bold font-mono text-[#2C1810]">
                    ₹{activeOrder.totalAmount}
                  </p>
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Paid via {activeOrder.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Visual Progress Stepper */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8C6D58]">
                  Kitchen Progress Status
                </h3>

                {activeOrder.status === 'Rejected' ? (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold">Order Cancelled / Rejected</p>
                      <p className="text-xs mt-0.5 text-rose-700">
                        This order could not be fulfilled by the kitchen. Any mock payment will be auto-refunded to your account.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative pt-2 pb-4">
                    {/* Horizontal Connector Line for Desktop */}
                    <div className="hidden sm:block absolute top-7 left-8 right-8 h-1 bg-[#EBE3D7] -z-0">
                      <div
                        className="h-full bg-[#3D2314] transition-all duration-500"
                        style={{
                          width: `${
                            (ORDER_STEPS.indexOf(activeOrder.status) / (ORDER_STEPS.length - 1)) * 100
                          }%`,
                        }}
                      />
                    </div>

                    {/* Step Nodes */}
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                      {ORDER_STEPS.map((step, idx) => {
                        const stepState = getStepStatus(step, activeOrder.status);

                        const nodeColors = {
                          completed: 'bg-[#3D2314] text-white border-[#3D2314]',
                          current: 'bg-[#D4A373] text-[#2C1810] border-[#3D2314] ring-4 ring-[#D4A373]/30',
                          upcoming: 'bg-white text-stone-400 border-stone-200',
                          rejected: 'bg-stone-200 text-stone-400 border-stone-200',
                        }[stepState];

                        const icons = [
                          <ShoppingBag key="0" className="w-4 h-4" />,
                          <UserCheck key="1" className="w-4 h-4" />,
                          <ChefHat key="2" className="w-4 h-4" />,
                          <Coffee key="3" className="w-4 h-4" />,
                          <CheckCircle key="4" className="w-4 h-4" />,
                        ];

                        return (
                          <div
                            key={step}
                            className="flex sm:flex-col items-center gap-3 sm:gap-2 text-left sm:text-center"
                          >
                            <div
                              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all shadow-xs shrink-0 ${nodeColors}`}
                            >
                              {stepState === 'completed' ? (
                                <CheckCircle className="w-5 h-5" />
                              ) : (
                                icons[idx]
                              )}
                            </div>
                            <div>
                              <p className={`text-xs font-bold leading-tight ${
                                stepState === 'current'
                                  ? 'text-[#3D2314]'
                                  : stepState === 'completed'
                                  ? 'text-[#2C1810]'
                                  : 'text-stone-400'
                              }`}>
                                {step}
                              </p>
                              {stepState === 'current' && (
                                <span className="inline-block text-[10px] text-[#A67C52] font-semibold animate-pulse sm:mt-0.5">
                                  Current Stage
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items Breakdown */}
              <div className="space-y-4 pt-4 border-t border-[#F2ECE2]">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8C6D58]">
                  Order Items ({activeOrder.items.reduce((a, b) => a + b.quantity, 0)})
                </h3>

                <div className="divide-y divide-[#EBE3D7] bg-[#FBF9F5] rounded-xl border border-[#EAE2D5] p-4">
                  {activeOrder.items.map((it, idx) => (
                    <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <VegBadge isVeg={it.isVeg} size="sm" />
                        <span className="font-semibold text-[#2C1810]">
                          {it.quantity}x {it.name}
                        </span>
                      </div>
                      <span className="font-mono text-[#5C4D43] font-medium">
                        ₹{it.price * it.quantity}
                      </span>
                    </div>
                  ))}
                  
                  {/* Bill Details */}
                  <div className="pt-3 mt-3 border-t border-[#EBE3D7] space-y-1 text-xs text-[#6B5749]">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-mono">₹{activeOrder.subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (5%)</span>
                      <span className="font-mono">₹{activeOrder.tax}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm text-[#2C1810] pt-1 border-t border-[#E5DACD]">
                      <span>Grand Total</span>
                      <span className="font-mono text-base text-[#3D2314]">₹{activeOrder.totalAmount}</span>
                    </div>
                  </div>
                </div>

                {activeOrder.specialInstructions && (
                  <div className="p-3 bg-[#FFFDF9] border border-[#EAE2D5] rounded-lg text-xs">
                    <span className="font-semibold text-[#8C6D58]">Special Instructions: </span>
                    <span className="text-[#5C4D43] italic">{activeOrder.specialInstructions}</span>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
