"""Data models and type definitions for the Cafe Management System.
Matches the TypeScript definitions in src/types/cafe.ts.
"""

from dataclasses import dataclass, field
from typing import List, Optional, Literal, Dict, Any
from datetime import datetime

Category = Literal[
    'Coffee',
    'Tea',
    'Cold Beverages',
    'Snacks',
    'Sandwiches',
    'Desserts'
]

OrderStatus = Literal[
    'Order Placed',
    'Order Accepted',
    'Preparing',
    'Ready for Pickup / Served',
    'Completed',
    'Rejected'
]

OrderType = Literal['Dine-in', 'Takeaway']
PaymentMethod = Literal['Cash', 'UPI']
StockStatus = Literal['In Stock', 'Low Stock', 'Out of Stock']

ORDER_STEPS: List[OrderStatus] = [
    'Order Placed',
    'Order Accepted',
    'Preparing',
    'Ready for Pickup / Served',
    'Completed'
]

@dataclass
class MenuItem:
    id: str
    name: str
    description: str
    price: float
    category: Category
    is_veg: bool
    is_available: bool = True
    image: str = ""
    popular: bool = False
    recommended: bool = False

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "price": self.price,
            "category": self.category,
            "isVeg": self.is_veg,
            "isAvailable": self.is_available,
            "image": self.image,
            "popular": self.popular,
            "recommended": self.recommended
        }

@dataclass
class CartItem:
    item: MenuItem
    quantity: int

@dataclass
class OrderItem:
    id: str
    name: str
    price: float
    quantity: int
    is_veg: bool
    category: Category

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "price": self.price,
            "quantity": self.quantity,
            "isVeg": self.is_veg,
            "category": self.category
        }

@dataclass
class Order:
    id: str
    customer_name: str
    customer_mobile: str
    order_type: OrderType
    items: List[OrderItem]
    subtotal: float
    tax: float
    total_amount: float
    payment_method: PaymentMethod
    status: OrderStatus = 'Order Placed'
    table_number: Optional[str] = None
    special_instructions: Optional[str] = None
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now().isoformat())

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "customerName": self.customer_name,
            "customerMobile": self.customer_mobile,
            "orderType": self.order_type,
            "tableNumber": self.table_number,
            "specialInstructions": self.special_instructions,
            "items": [it.to_dict() for it in self.items],
            "subtotal": self.subtotal,
            "tax": self.tax,
            "totalAmount": self.total_amount,
            "paymentMethod": self.payment_method,
            "status": self.status,
            "createdAt": self.created_at,
            "updatedAt": self.updated_at
        }

@dataclass
class InventoryItem:
    id: str
    name: str
    quantity: float
    unit: str
    min_stock: float
    status: StockStatus = 'In Stock'
    last_restocked: str = field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d"))

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "quantity": self.quantity,
            "unit": self.unit,
            "minStock": self.min_stock,
            "status": self.status,
            "lastRestocked": self.last_restocked
        }

@dataclass
class CustomerProfile:
    name: str
    mobile: str
    total_orders: int
    total_spent: float
    last_order_date: str
