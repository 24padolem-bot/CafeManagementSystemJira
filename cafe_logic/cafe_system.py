"""Cafe Management System - Core Business Logic Engine.
Implements all functionality for:
- Module 1: Customer Ordering, Cart Management, and Live Order Tracking
- Module 2: Cafe Administration, Order Processing, Menu CRUD, Sales, Inventory, and Reports
"""

import csv
import io
import re
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple, Any

from .models import (
    MenuItem,
    CartItem,
    Order,
    OrderItem,
    InventoryItem,
    CustomerProfile,
    OrderStatus,
    OrderType,
    PaymentMethod,
    Category,
    StockStatus,
    ORDER_STEPS
)


class CafeSystem:
    def __init__(self, seed_data: bool = False):
        self.menu: Dict[str, MenuItem] = {}
        self.cart: Dict[str, CartItem] = {}  # item_id -> CartItem
        self.orders: Dict[str, Order] = {}   # order_id -> Order
        self.inventory: Dict[str, InventoryItem] = {} # item_id -> InventoryItem
        self.session_role: Optional[str] = None
        
        if seed_data:
            self._load_seed_data()

    def _load_seed_data(self):
        """Initial sample items matching the frontend dataset."""
        sample_menu = [
            MenuItem('item-1', 'Cappuccino', 'Double shot espresso with micro-foam milk', 120.0, 'Coffee', True, True, popular=True, recommended=True),
            MenuItem('item-2', 'Cold Coffee', 'Slow-brewed chilled espresso with milk & caramel', 140.0, 'Cold Beverages', True, True, popular=True, recommended=True),
            MenuItem('item-3', 'Classic Espresso', 'Single origin 30ml concentrated crema shot', 90.0, 'Coffee', True, True),
            MenuItem('item-4', 'Masala Chai', 'Assam tea simmered with cardamom and ginger', 50.0, 'Tea', True, True, popular=True),
            MenuItem('item-5', 'Veg Club Sandwich', 'Triple-decker toasted multigrain bread', 100.0, 'Sandwiches', True, True),
            MenuItem('item-6', 'Gourmet Cheese Burger', 'Crisp patty with double yellow cheddar on brioche', 150.0, 'Snacks', False, True, popular=True),
            MenuItem('item-7', 'Peri-Peri French Fries', 'Crispy skin-on fries with peri-peri dust', 90.0, 'Snacks', True, True),
            MenuItem('item-8', 'Chocolate Fudge Brownie', 'Belgian dark chocolate with toasted walnuts', 110.0, 'Desserts', True, True, popular=True, recommended=True),
        ]
        for m in sample_menu:
            self.menu[m.id] = m

        sample_inv = [
            InventoryItem('inv-1', 'Arabica Coffee Beans', 6.5, 'kg', 2.0, 'In Stock', '2026-10-28'),
            InventoryItem('inv-2', 'Fresh Whole Farm Milk', 18.0, 'Liters', 5.0, 'In Stock', '2026-10-30'),
            InventoryItem('inv-3', 'Brioche Burger Buns', 6.0, 'Packs', 10.0, 'Low Stock', '2026-10-25'),
            InventoryItem('inv-4', 'Belgian Dark Chocolate Chips', 1.2, 'kg', 2.5, 'Low Stock', '2026-10-24'),
            InventoryItem('inv-5', 'Assam Tea Leaves', 4.0, 'kg', 1.5, 'In Stock', '2026-10-27'),
        ]
        for inv in sample_inv:
            self.inventory[inv.id] = inv

    # =========================================================================
    # MODULE 1: CUSTOMER ORDERING, CART & TRACKING
    # =========================================================================

    def add_to_cart(self, item_id: str, quantity: int = 1) -> CartItem:
        """Add a food item to customer cart with validation."""
        if quantity <= 0:
            raise ValueError(f"Quantity must be a positive integer, got: {quantity}")

        if item_id not in self.menu:
            raise KeyError(f"Menu item '{item_id}' not found")

        item = self.menu[item_id]
        if not item.is_available:
            raise ValueError(f"Menu item '{item.name}' is currently unavailable/sold out")

        if item_id in self.cart:
            self.cart[item_id].quantity += quantity
        else:
            self.cart[item_id] = CartItem(item=item, quantity=quantity)

        return self.cart[item_id]

    def update_cart_quantity(self, item_id: str, delta: int) -> Optional[CartItem]:
        """Increase or decrease cart item quantity. Removes if new quantity <= 0."""
        if item_id not in self.cart:
            raise KeyError(f"Item '{item_id}' is not in the shopping cart")

        new_qty = self.cart[item_id].quantity + delta
        if new_qty <= 0:
            del self.cart[item_id]
            return None
        else:
            self.cart[item_id].quantity = new_qty
            return self.cart[item_id]

    def remove_from_cart(self, item_id: str) -> bool:
        """Remove a product from the shopping cart."""
        if item_id in self.cart:
            del self.cart[item_id]
            return True
        return False

    def clear_cart(self) -> None:
        """Empty the shopping cart."""
        self.cart.clear()

    def get_cart_item_count(self) -> int:
        """Return total items in the cart."""
        return sum(ci.quantity for ci in self.cart.values())

    def calculate_subtotal(self) -> float:
        """Calculate cart subtotal."""
        subtotal = sum(ci.item.price * ci.quantity for ci in self.cart.values())
        return round(float(subtotal), 2)

    def calculate_gst(self, subtotal: Optional[float] = None, rate: float = 0.05) -> float:
        """Calculate 5% cafe GST."""
        if subtotal is None:
            subtotal = self.calculate_subtotal()
        if subtotal < 0:
            raise ValueError("Subtotal cannot be negative")
        return round(subtotal * rate, 2)

    def calculate_final_bill(self, subtotal: Optional[float] = None, tax: Optional[float] = None) -> float:
        """Calculate total amount (Subtotal + GST)."""
        if subtotal is None:
            subtotal = self.calculate_subtotal()
        if tax is None:
            tax = self.calculate_gst(subtotal)
        return round(subtotal + tax, 2)

    def generate_unique_order_id(self) -> str:
        """Generate a guaranteed unique order ID (ORD-XXXX)."""
        import random
        while True:
            candidate = f"ORD-{random.randint(1000, 9999)}"
            if candidate not in self.orders:
                return candidate

    def validate_mobile_number(self, mobile: str) -> bool:
        """Verify mobile number is exactly 10 digits."""
        if not mobile or not isinstance(mobile, str):
            return False
        clean = mobile.strip()
        return bool(re.match(r"^[0-9]{10}$", clean))

    def place_order(
        self,
        customer_name: str,
        customer_mobile: str,
        order_type: OrderType,
        payment_method: PaymentMethod,
        table_number: Optional[str] = None,
        special_instructions: Optional[str] = None
    ) -> Order:
        """Place an order from current cart with input validation and state persistence."""
        if len(self.cart) == 0:
            raise ValueError("Cannot place an order with an empty shopping cart")

        if not customer_name or not customer_name.strip():
            raise ValueError("Customer name cannot be empty")

        if not self.validate_mobile_number(customer_mobile):
            raise ValueError(f"Invalid mobile number '{customer_mobile}'. Must be exactly 10 digits")

        if order_type not in ('Dine-in', 'Takeaway'):
            raise ValueError(f"Invalid order type '{order_type}'. Must be 'Dine-in' or 'Takeaway'")

        if order_type == 'Dine-in':
            if not table_number or not table_number.strip():
                raise ValueError("Table number is required for Dine-in orders")

        if payment_method not in ('Cash', 'UPI'):
            raise ValueError(f"Invalid payment method '{payment_method}'. Must be 'Cash' or 'UPI'")

        subtotal = self.calculate_subtotal()
        tax = self.calculate_gst(subtotal)
        total_amount = self.calculate_final_bill(subtotal, tax)
        order_id = self.generate_unique_order_id()

        order_items = [
            OrderItem(
                id=ci.item.id,
                name=ci.item.name,
                price=ci.item.price,
                quantity=ci.quantity,
                is_veg=ci.item.is_veg,
                category=ci.item.category
            )
            for ci in self.cart.values()
        ]

        now = datetime.now().isoformat()
        new_order = Order(
            id=order_id,
            customer_name=customer_name.strip(),
            customer_mobile=customer_mobile.strip(),
            order_type=order_type,
            table_number=table_number.strip() if table_number else None,
            special_instructions=special_instructions.strip() if special_instructions else None,
            items=order_items,
            subtotal=subtotal,
            tax=tax,
            total_amount=total_amount,
            payment_method=payment_method,
            status='Order Placed',
            created_at=now,
            updated_at=now
        )

        self.orders[order_id] = new_order
        self.clear_cart()
        return new_order

    def track_order(self, order_id: str) -> Order:
        """Track an order by its unique ID. Raises KeyError if not found."""
        if not order_id or order_id not in self.orders:
            raise KeyError(f"Order ID '{order_id}' not found")
        return self.orders[order_id]

    def get_order_progress(self, order_id: str) -> Dict[str, str]:
        """Return visual progress status mapping for all 5 stages."""
        order = self.track_order(order_id)
        if order.status == 'Rejected':
            return {step: 'rejected' for step in ORDER_STEPS}

        progress = {}
        current_idx = ORDER_STEPS.index(order.status) if order.status in ORDER_STEPS else -1

        for idx, step in enumerate(ORDER_STEPS):
            if idx < current_idx:
                progress[step] = 'completed'
            elif idx == current_idx:
                progress[step] = 'current'
            else:
                progress[step] = 'upcoming'

        return progress

    def get_customer_orders(self, mobile: str) -> List[Order]:
        """Fetch all orders placed under a customer mobile number."""
        clean = mobile.strip()
        return [o for o in self.orders.values() if o.customer_mobile == clean]

    # =========================================================================
    # MODULE 2: CAFE ADMINISTRATION & SALES MANAGEMENT
    # =========================================================================

    def admin_login(self, username: str, password: str) -> bool:
        """Admin authentication using standard credentials (admin / admin123)."""
        if not username or not password:
            return False
        if username.strip() == 'admin' and password.strip() == 'admin123':
            self.session_role = 'admin'
            return True
        return False

    def admin_logout(self) -> None:
        """Sign out admin."""
        self.session_role = None

    def add_menu_item(
        self,
        name: str,
        description: str,
        price: float,
        category: Category,
        is_veg: bool = True,
        is_available: bool = True,
        image: str = "",
        popular: bool = False,
        recommended: bool = False
    ) -> MenuItem:
        """Add new food item to menu with validation."""
        if not name or not name.strip():
            raise ValueError("Item name cannot be empty")

        if price <= 0:
            raise ValueError(f"Price must be greater than zero, got: {price}")

        valid_categories = ('Coffee', 'Tea', 'Cold Beverages', 'Snacks', 'Sandwiches', 'Desserts')
        if category not in valid_categories:
            raise ValueError(f"Invalid category '{category}'. Must be one of {valid_categories}")

        item_id = f"item-{len(self.menu) + 1}-{int(datetime.now().timestamp())}"
        new_item = MenuItem(
            id=item_id,
            name=name.strip(),
            description=description.strip(),
            price=round(float(price), 2),
            category=category,
            is_veg=is_veg,
            is_available=is_available,
            image=image,
            popular=popular,
            recommended=recommended
        )
        self.menu[item_id] = new_item
        return new_item

    def update_menu_item_price(self, item_id: str, new_price: float) -> MenuItem:
        """Update existing product price with validation."""
        if item_id not in self.menu:
            raise KeyError(f"Menu item '{item_id}' not found")
        if new_price <= 0:
            raise ValueError(f"Price must be greater than zero, got: {new_price}")

        self.menu[item_id].price = round(float(new_price), 2)
        return self.menu[item_id]

    def delete_menu_item(self, item_id: str) -> bool:
        """Delete food item from menu."""
        if item_id in self.menu:
            del self.menu[item_id]
            return True
        return False

    def set_item_availability(self, item_id: str, is_available: bool) -> MenuItem:
        """Mark an item as available or unavailable."""
        if item_id not in self.menu:
            raise KeyError(f"Menu item '{item_id}' not found")
        self.menu[item_id].is_available = is_available
        return self.menu[item_id]

    def update_order_status(self, order_id: str, new_status: OrderStatus) -> Order:
        """Update order status in admin kitchen and sync to customer tracking."""
        if order_id not in self.orders:
            raise KeyError(f"Order '{order_id}' not found")

        valid_statuses = ('Order Placed', 'Order Accepted', 'Preparing', 'Ready for Pickup / Served', 'Completed', 'Rejected')
        if new_status not in valid_statuses:
            raise ValueError(f"Invalid order status '{new_status}'")

        order = self.orders[order_id]
        order.status = new_status
        order.updated_at = datetime.now().isoformat()
        return order

    def calculate_total_revenue(self) -> float:
        """Calculate total finalized revenue from Completed orders only."""
        rev = sum(o.total_amount for o in self.orders.values() if o.status == 'Completed')
        return round(float(rev), 2)

    def calculate_daily_sales(self, target_date: Optional[str] = None) -> float:
        """Calculate total sales for a specific date (YYYY-MM-DD), default today."""
        if target_date is None:
            target_date = datetime.now().strftime("%Y-%m-%d")

        daily_rev = sum(
            o.total_amount
            for o in self.orders.values()
            if o.status == 'Completed' and o.created_at.startswith(target_date)
        )
        return round(float(daily_rev), 2)

    def calculate_weekly_sales(self, reference_date: Optional[datetime] = None) -> float:
        """Calculate sales over the past 7 days up to reference date."""
        if reference_date is None:
            reference_date = datetime.now()

        cutoff = reference_date - timedelta(days=7)
        weekly_rev = 0.0

        for o in self.orders.values():
            if o.status == 'Completed':
                try:
                    order_time = datetime.fromisoformat(o.created_at)
                    if cutoff <= order_time <= reference_date + timedelta(seconds=1):
                        weekly_rev += o.total_amount
                except ValueError:
                    pass

        return round(float(weekly_rev), 2)

    def calculate_monthly_sales(self, year: Optional[int] = None, month: Optional[int] = None) -> float:
        """Calculate monthly revenue for a given year and month (defaults to current month)."""
        now = datetime.now()
        y = year if year is not None else now.year
        m = month if month is not None else now.month
        month_prefix = f"{y:04d}-{m:02d}"

        monthly_rev = sum(
            o.total_amount
            for o in self.orders.values()
            if o.status == 'Completed' and o.created_at.startswith(month_prefix)
        )
        return round(float(monthly_rev), 2)

    def get_best_selling_products(self, limit: int = 5) -> List[Dict[str, Any]]:
        """Identify best-selling products by quantity and revenue across completed orders."""
        if limit <= 0:
            raise ValueError(f"Limit must be positive, got: {limit}")

        stats: Dict[str, Dict[str, Any]] = {}
        for o in self.orders.values():
            if o.status == 'Completed':
                for it in o.items:
                    if it.name not in stats:
                        stats[it.name] = {
                            "name": it.name,
                            "category": it.category,
                            "is_veg": it.is_veg,
                            "units_sold": 0,
                            "revenue": 0.0
                        }
                    stats[it.name]["units_sold"] += it.quantity
                    stats[it.name]["revenue"] += it.price * it.quantity

        ranked = sorted(stats.values(), key=lambda x: (x["units_sold"], x["revenue"]), reverse=True)
        return ranked[:limit]

    def get_payment_method_breakdown(self) -> Dict[str, Any]:
        """Calculate payment method breakdown (Cash vs UPI) for completed orders."""
        completed = [o for o in self.orders.values() if o.status == 'Completed']
        total_rev = sum(o.total_amount for o in completed)

        upi_orders = [o for o in completed if o.payment_method == 'UPI']
        cash_orders = [o for o in completed if o.payment_method == 'Cash']

        upi_rev = sum(o.total_amount for o in upi_orders)
        cash_rev = sum(o.total_amount for o in cash_orders)

        upi_pct = round((upi_rev / total_rev * 100), 1) if total_rev > 0 else 0.0
        cash_pct = round((cash_rev / total_rev * 100), 1) if total_rev > 0 else 0.0

        return {
            "total_revenue": round(total_rev, 2),
            "UPI": {
                "orders_count": len(upi_orders),
                "revenue": round(upi_rev, 2),
                "percentage": upi_pct
            },
            "Cash": {
                "orders_count": len(cash_orders),
                "revenue": round(cash_rev, 2),
                "percentage": cash_pct
            }
        }

    def get_revenue_by_category(self) -> Dict[str, float]:
        """Calculate total completed revenue partitioned by food category."""
        cat_rev: Dict[str, float] = {}
        for o in self.orders.values():
            if o.status == 'Completed':
                for it in o.items:
                    cat_rev[it.category] = round(cat_rev.get(it.category, 0.0) + (it.price * it.quantity), 2)
        return cat_rev

    def generate_sales_report_csv(self) -> str:
        """Export comprehensive sales report as CSV formatted text."""
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            'Order ID', 'Date & Time', 'Customer Name', 'Mobile',
            'Order Type', 'Table', 'Payment Method', 'Status',
            'Items', 'Subtotal', 'Tax (5%)', 'Total (INR)'
        ])

        for o in self.orders.values():
            items_summary = "; ".join(f"{it.quantity}x {it.name}" for it in o.items)
            writer.writerow([
                o.id,
                o.created_at,
                o.customer_name,
                o.customer_mobile,
                o.order_type,
                o.table_number or "-",
                o.payment_method,
                o.status,
                items_summary,
                o.subtotal,
                o.tax,
                o.total_amount
            ])

        return output.getvalue()

    def add_inventory_item(self, name: str, quantity: float, unit: str, min_stock: float) -> InventoryItem:
        """Add new ingredient to inventory with automatic stock status calculation."""
        if not name or not name.strip():
            raise ValueError("Ingredient name cannot be empty")
        if quantity < 0:
            raise ValueError(f"Quantity cannot be negative, got: {quantity}")
        if min_stock < 0:
            raise ValueError(f"Minimum stock cannot be negative, got: {min_stock}")
        if not unit or not unit.strip():
            raise ValueError("Unit cannot be empty")

        status = self._compute_stock_status(quantity, min_stock)
        item_id = f"inv-{len(self.inventory) + 1}-{int(datetime.now().timestamp())}"
        new_item = InventoryItem(
            id=item_id,
            name=name.strip(),
            quantity=round(float(quantity), 2),
            unit=unit.strip(),
            min_stock=round(float(min_stock), 2),
            status=status,
            last_restocked=datetime.now().strftime("%Y-%m-%d")
        )
        self.inventory[item_id] = new_item
        return new_item

    def _compute_stock_status(self, quantity: float, min_stock: float) -> StockStatus:
        """Branch logic for stock status calculation."""
        if quantity <= 0:
            return 'Out of Stock'
        elif quantity <= min_stock:
            return 'Low Stock'
        else:
            return 'In Stock'

    def update_inventory_quantity(self, item_id: str, new_quantity: float) -> InventoryItem:
        """Update ingredient quantity and recalculate stock status."""
        if item_id not in self.inventory:
            raise KeyError(f"Inventory item '{item_id}' not found")
        if new_quantity < 0:
            raise ValueError(f"Inventory quantity cannot be negative, got: {new_quantity}")

        item = self.inventory[item_id]
        item.quantity = round(float(new_quantity), 2)
        item.status = self._compute_stock_status(item.quantity, item.min_stock)
        item.last_restocked = datetime.now().strftime("%Y-%m-%d")
        return item

    def restock_inventory(self, item_id: str, added_quantity: float) -> InventoryItem:
        """Restock an inventory ingredient."""
        if item_id not in self.inventory:
            raise KeyError(f"Inventory item '{item_id}' not found")
        if added_quantity <= 0:
            raise ValueError(f"Restock quantity must be positive, got: {added_quantity}")

        return self.update_inventory_quantity(item_id, self.inventory[item_id].quantity + added_quantity)

    def delete_inventory_item(self, item_id: str) -> bool:
        """Delete an ingredient from inventory."""
        if item_id in self.inventory:
            del self.inventory[item_id]
            return True
        return False

    def detect_low_stock_ingredients(self) -> List[InventoryItem]:
        """Detect and return ingredients below minimum stock threshold."""
        return [i for i in self.inventory.values() if i.status in ('Low Stock', 'Out of Stock')]

    def get_customers_summary(self) -> List[CustomerProfile]:
        """Aggregate customer statistics across all orders."""
        profiles: Dict[str, Dict[str, Any]] = {}

        for o in self.orders.values():
            key = o.customer_mobile or o.customer_name
            if not key:
                continue

            order_spent = o.total_amount if o.status == 'Completed' else 0.0

            if key not in profiles:
                profiles[key] = {
                    "name": o.customer_name,
                    "mobile": o.customer_mobile,
                    "total_orders": 1,
                    "total_spent": order_spent,
                    "last_order_date": o.created_at
                }
            else:
                profiles[key]["total_orders"] += 1
                profiles[key]["total_spent"] += order_spent
                if o.created_at > profiles[key]["last_order_date"]:
                    profiles[key]["last_order_date"] = o.created_at
                    profiles[key]["name"] = o.customer_name

        customer_list = [
            CustomerProfile(
                name=p["name"],
                mobile=p["mobile"],
                total_orders=p["total_orders"],
                total_spent=round(p["total_spent"], 2),
                last_order_date=p["last_order_date"]
            )
            for p in profiles.values()
        ]
        return sorted(customer_list, key=lambda c: c.total_spent, reverse=True)

    def search_customer_records(self, query: str) -> List[CustomerProfile]:
        """Search patron records by name or phone."""
        if not query or not query.strip():
            return self.get_customers_summary()

        q = query.strip().lower()
        all_customers = self.get_customers_summary()
        return [
            c for c in all_customers
            if q in c.name.lower() or q in c.mobile
        ]
