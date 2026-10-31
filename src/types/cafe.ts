export type Category = 
  | 'Coffee' 
  | 'Tea' 
  | 'Cold Beverages' 
  | 'Snacks' 
  | 'Sandwiches' 
  | 'Desserts';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number; // in INR (₹)
  category: Category;
  isVeg: boolean;
  isAvailable: boolean;
  image: string;
  popular?: boolean;
  recommended?: boolean;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export type OrderStatus = 
  | 'Order Placed' 
  | 'Order Accepted' 
  | 'Preparing' 
  | 'Ready for Pickup / Served' 
  | 'Completed' 
  | 'Rejected';

export type OrderType = 'Dine-in' | 'Takeaway';

export type PaymentMethod = 'Cash' | 'UPI';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  isVeg: boolean;
  category: Category;
}

export interface Order {
  id: string; // e.g. ORD-1042
  customerName: string;
  customerMobile: string;
  orderType: OrderType;
  tableNumber?: string;
  specialInstructions?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number; // 5% GST
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  minStock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  lastRestocked: string;
}

export interface CustomerProfile {
  name: string;
  mobile: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
}

export interface UserSession {
  role: 'customer' | 'admin' | null;
  customerName?: string;
  customerMobile?: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'info' | 'warning' | 'error';
}
