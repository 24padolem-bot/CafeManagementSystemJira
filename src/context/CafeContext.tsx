import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  MenuItem, 
  Order, 
  InventoryItem, 
  CartItem, 
  UserSession, 
  OrderStatus, 
  ToastMessage,
  CustomerProfile
} from '../types/cafe';
import { INITIAL_MENU_ITEMS, INITIAL_ORDERS, INITIAL_INVENTORY } from '../data/initialData';

interface CafeContextType {
  menu: MenuItem[];
  orders: Order[];
  inventory: InventoryItem[];
  cart: CartItem[];
  session: UserSession;
  activeModule: 'customer' | 'admin';
  toasts: ToastMessage[];
  // Navigation
  setActiveModule: (module: 'customer' | 'admin') => void;
  // Auth
  loginCustomer: (name: string, mobile: string) => void;
  loginAdmin: (user: string, pass: string) => boolean;
  logout: () => void;
  // Cart
  addToCart: (item: MenuItem, quantity?: number) => void;
  updateCartQuantity: (itemId: string, delta: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartTax: number;
  cartTotal: number;
  cartItemCount: number;
  // Orders
  placeOrder: (orderInfo: {
    customerName: string;
    customerMobile: string;
    orderType: 'Dine-in' | 'Takeaway';
    tableNumber?: string;
    specialInstructions?: string;
    paymentMethod: 'Cash' | 'UPI';
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  customerOrders: Order[];
  // Menu
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  toggleItemAvailability: (id: string) => void;
  // Inventory
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'status' | 'lastRestocked'>) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  deleteInventoryItem: (id: string) => void;
  restockInventoryItem: (id: string, addedQty: number) => void;
  // Customers List
  customers: CustomerProfile[];
  // Notifications
  showToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
}

const CafeContext = createContext<CafeContextType | undefined>(undefined);

const STORAGE_KEYS = {
  MENU: 'brewbean_menu_v1',
  ORDERS: 'brewbean_orders_v1',
  INVENTORY: 'brewbean_inventory_v1',
  CART: 'brewbean_cart_v1',
  SESSION: 'brewbean_session_v1',
  MODULE: 'brewbean_active_module_v1',
};

export const CafeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Menu State
  const [menu, setMenu] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MENU);
      return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
    } catch {
      return INITIAL_MENU_ITEMS;
    }
  });

  // 2. Orders State
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // 3. Inventory State
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INVENTORY);
      return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
    } catch {
      return INITIAL_INVENTORY;
    }
  });

  // 4. Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 5. Session State
  const [session, setSession] = useState<UserSession>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return { role: 'customer', customerName: 'Aarav Sharma', customerMobile: '9876543210' };
  });

  // 6. Active Module
  const [activeModule, setActiveModuleState] = useState<'customer' | 'admin'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MODULE);
      if (saved === 'admin' || saved === 'customer') return saved;
    } catch {
      // fallback
    }
    return 'customer';
  });

  // 7. Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((title: string, message?: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menu));
  }, [menu]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  }, [session]);

  const setActiveModule = (module: 'customer' | 'admin') => {
    setActiveModuleState(module);
    localStorage.setItem(STORAGE_KEYS.MODULE, module);
  };

  // Listen to window storage events for multi-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.ORDERS && e.newValue) {
        setOrders(JSON.parse(e.newValue));
      } else if (e.key === STORAGE_KEYS.MENU && e.newValue) {
        setMenu(JSON.parse(e.newValue));
      } else if (e.key === STORAGE_KEYS.INVENTORY && e.newValue) {
        setInventory(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Cart Calculations
  const cartSubtotal = cart.reduce((acc, curr) => acc + (curr.item.price * curr.quantity), 0);
  const cartTax = Math.round(cartSubtotal * 0.05 * 100) / 100; // 5% GST
  const cartTotal = Math.round((cartSubtotal + cartTax) * 100) / 100;
  const cartItemCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  const addToCart = (item: MenuItem, quantity: number = 1) => {
    if (!item.isAvailable) {
      showToast('Item Unavailable', `${item.name} is currently out of stock.`, 'warning');
      return;
    }
    setCart(prev => {
      const existing = prev.find(i => i.item.id === item.id);
      if (existing) {
        return prev.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { item, quantity }];
    });
    showToast('Added to Cart', `${item.name} (${quantity}) added to order.`, 'success');
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    setCart(prev => {
      return prev.map(cartItem => {
        if (cartItem.item.id === itemId) {
          const newQty = cartItem.quantity + delta;
          return newQty > 0 ? { ...cartItem, quantity: newQty } : null;
        }
        return cartItem;
      }).filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.item.id !== itemId));
    showToast('Item Removed', 'Product removed from your cart.', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  // Order Placement
  const placeOrder = (orderInfo: {
    customerName: string;
    customerMobile: string;
    orderType: 'Dine-in' | 'Takeaway';
    tableNumber?: string;
    specialInstructions?: string;
    paymentMethod: 'Cash' | 'UPI';
  }): Order => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newOrderId = `ORD-${randomNum}`;
    const now = new Date().toISOString();

    const orderItems = cart.map(ci => ({
      id: ci.item.id,
      name: ci.item.name,
      price: ci.item.price,
      quantity: ci.quantity,
      isVeg: ci.item.isVeg,
      category: ci.item.category,
    }));

    const newOrder: Order = {
      id: newOrderId,
      customerName: orderInfo.customerName,
      customerMobile: orderInfo.customerMobile,
      orderType: orderInfo.orderType,
      tableNumber: orderInfo.tableNumber,
      specialInstructions: orderInfo.specialInstructions,
      items: orderItems,
      subtotal: cartSubtotal,
      tax: cartTax,
      totalAmount: cartTotal,
      paymentMethod: orderInfo.paymentMethod,
      status: 'Order Placed',
      createdAt: now,
      updatedAt: now,
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    showToast('Order Placed!', `Your order #${newOrderId} has been sent to the kitchen.`, 'success');
    return newOrder;
  };

  // Admin update order status
  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => {
      return prev.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            status,
            updatedAt: new Date().toISOString()
          };
        }
        return order;
      });
    });
    showToast('Status Updated', `Order #${orderId} marked as "${status}".`, 'info');
  };

  // Customer orders (filtered by current customer mobile if logged in)
  const customerOrders = orders.filter(order => {
    if (!session.customerMobile) return true;
    return order.customerMobile === session.customerMobile;
  });

  // Menu Management
  const addMenuItem = (itemData: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...itemData,
      id: `item-${Date.now()}`
    };
    setMenu(prev => [newItem, ...prev]);
    showToast('Menu Item Added', `${newItem.name} is now on the cafe menu.`, 'success');
  };

  const updateMenuItem = (item: MenuItem) => {
    setMenu(prev => prev.map(i => i.id === item.id ? item : i));
    showToast('Menu Updated', `${item.name} details saved.`, 'info');
  };

  const deleteMenuItem = (id: string) => {
    const target = menu.find(i => i.id === id);
    setMenu(prev => prev.filter(i => i.id !== id));
    showToast('Item Removed', `${target?.name || 'Item'} deleted from menu.`, 'info');
  };

  const toggleItemAvailability = (id: string) => {
    setMenu(prev => prev.map(item => {
      if (item.id === id) {
        const nextAvail = !item.isAvailable;
        showToast('Availability Changed', `${item.name} is now ${nextAvail ? 'Available' : 'Unavailable'}.`, 'info');
        return { ...item, isAvailable: nextAvail };
      }
      return item;
    }));
  };

  // Inventory Management
  const calculateStockStatus = (qty: number, min: number): 'In Stock' | 'Low Stock' | 'Out of Stock' => {
    if (qty <= 0) return 'Out of Stock';
    if (qty <= min) return 'Low Stock';
    return 'In Stock';
  };

  const addInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'status' | 'lastRestocked'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: `inv-${Date.now()}`,
      status: calculateStockStatus(itemData.quantity, itemData.minStock),
      lastRestocked: new Date().toISOString().split('T')[0],
    };
    setInventory(prev => [...prev, newItem]);
    showToast('Inventory Added', `${newItem.name} tracked in stock.`, 'success');
  };

  const updateInventoryItem = (item: InventoryItem) => {
    const status = calculateStockStatus(item.quantity, item.minStock);
    const updated = { ...item, status };
    setInventory(prev => prev.map(i => i.id === item.id ? updated : i));
    showToast('Stock Updated', `${item.name} stock revised.`, 'info');
  };

  const restockInventoryItem = (id: string, addedQty: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + addedQty);
        const status = calculateStockStatus(newQty, item.minStock);
        return {
          ...item,
          quantity: newQty,
          status,
          lastRestocked: new Date().toISOString().split('T')[0],
        };
      }
      return item;
    }));
    showToast('Restocked', 'Inventory restocked successfully.', 'success');
  };

  const deleteInventoryItem = (id: string) => {
    setInventory(prev => prev.filter(i => i.id !== id));
    showToast('Item Deleted', 'Ingredient removed from inventory.', 'info');
  };

  // Customers Aggregation
  const customers: CustomerProfile[] = React.useMemo(() => {
    const map = new Map<string, CustomerProfile>();
    orders.forEach(order => {
      const key = order.customerMobile || order.customerName;
      if (!key) return;
      const existing = map.get(key);
      const isCompleted = order.status === 'Completed';
      const orderAmount = isCompleted ? order.totalAmount : 0;

      if (existing) {
        existing.totalOrders += 1;
        existing.totalSpent += orderAmount;
        if (new Date(order.createdAt) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = order.createdAt;
          existing.name = order.customerName;
        }
      } else {
        map.set(key, {
          name: order.customerName,
          mobile: order.customerMobile,
          totalOrders: 1,
          totalSpent: orderAmount,
          lastOrderDate: order.createdAt,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  // Auth
  const loginCustomer = (name: string, mobile: string) => {
    const cleanMobile = mobile.trim();
    const cleanName = name.trim();
    setSession({
      role: 'customer',
      customerName: cleanName,
      customerMobile: cleanMobile,
    });
    setActiveModule('customer');
    showToast('Welcome!', `Logged in as ${cleanName}`, 'success');
  };

  const loginAdmin = (user: string, pass: string): boolean => {
    if (user.trim() === 'admin' && pass.trim() === 'admin123') {
      setSession({
        role: 'admin',
      });
      setActiveModule('admin');
      showToast('Admin Access Granted', 'Logged in as Cafe Administrator', 'success');
      return true;
    }
    showToast('Authentication Failed', 'Invalid credentials. Use admin / admin123', 'error');
    return false;
  };

  const logout = () => {
    setSession({ role: null });
    setActiveModule('customer');
    showToast('Logged Out', 'You have been signed out.', 'info');
  };

  return (
    <CafeContext.Provider
      value={{
        menu,
        orders,
        inventory,
        cart,
        session,
        activeModule,
        toasts,
        setActiveModule,
        loginCustomer,
        loginAdmin,
        logout,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartSubtotal,
        cartTax,
        cartTotal,
        cartItemCount,
        placeOrder,
        updateOrderStatus,
        customerOrders,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleItemAvailability,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        restockInventoryItem,
        customers,
        showToast,
        removeToast,
      }}
    >
      {children}
    </CafeContext.Provider>
  );
};

export const useCafe = () => {
  const context = useContext(CafeContext);
  if (!context) {
    throw new Error('useCafe must be used within a CafeProvider');
  }
  return context;
};
