"""Pytest configuration and shared fixtures for Cafe Management System tests."""

import pytest
from datetime import datetime, timedelta
from cafe_logic.cafe_system import CafeSystem
from cafe_logic.models import MenuItem, Order, OrderItem, InventoryItem

@pytest.fixture
def clean_system():
    """Returns a completely fresh CafeSystem without seeded data."""
    return CafeSystem(seed_data=False)

@pytest.fixture
def seeded_system():
    """Returns a CafeSystem pre-populated with standard initial cafe menu and inventory."""
    return CafeSystem(seed_data=True)

@pytest.fixture
def populated_orders_system(seeded_system):
    """Returns a CafeSystem with a variety of completed, pending, and rejected orders for analytics tests."""
    now = datetime.now()
    
    # 1. Order today - Completed (UPI)
    order1 = Order(
        id='ORD-1001',
        customer_name='Aarav Sharma',
        customer_mobile='9876543210',
        order_type='Dine-in',
        table_number='Table 3',
        items=[
            OrderItem('item-1', 'Cappuccino', 120.0, 2, True, 'Coffee'),
            OrderItem('item-8', 'Chocolate Fudge Brownie', 110.0, 1, True, 'Desserts')
        ],
        subtotal=350.0,
        tax=17.5,
        total_amount=367.5,
        payment_method='UPI',
        status='Completed',
        created_at=now.isoformat(),
        updated_at=now.isoformat()
    )

    # 2. Order today - Preparing / Pending (Cash)
    order2 = Order(
        id='ORD-1002',
        customer_name='Priya Patel',
        customer_mobile='9822334455',
        order_type='Takeaway',
        items=[
            OrderItem('item-2', 'Cold Coffee', 140.0, 1, True, 'Cold Beverages'),
            OrderItem('item-6', 'Gourmet Cheese Burger', 150.0, 1, False, 'Snacks')
        ],
        subtotal=290.0,
        tax=14.5,
        total_amount=304.5,
        payment_method='Cash',
        status='Preparing',
        created_at=(now - timedelta(minutes=15)).isoformat(),
        updated_at=(now - timedelta(minutes=10)).isoformat()
    )

    # 3. Order 2 days ago - Completed (Cash)
    order3 = Order(
        id='ORD-1003',
        customer_name='Rohan Mehra',
        customer_mobile='9988776655',
        order_type='Dine-in',
        table_number='Table 1',
        items=[
            OrderItem('item-1', 'Cappuccino', 120.0, 1, True, 'Coffee'),
            OrderItem('item-5', 'Veg Club Sandwich', 100.0, 2, True, 'Sandwiches')
        ],
        subtotal=320.0,
        tax=16.0,
        total_amount=336.0,
        payment_method='Cash',
        status='Completed',
        created_at=(now - timedelta(days=2)).isoformat(),
        updated_at=(now - timedelta(days=2)).isoformat()
    )

    # 4. Order 5 days ago - Rejected
    order4 = Order(
        id='ORD-1004',
        customer_name='Neha Verma',
        customer_mobile='9123456780',
        order_type='Takeaway',
        items=[
            OrderItem('item-7', 'Peri-Peri French Fries', 90.0, 3, True, 'Snacks')
        ],
        subtotal=270.0,
        tax=13.5,
        total_amount=283.5,
        payment_method='Cash',
        status='Rejected',
        created_at=(now - timedelta(days=5)).isoformat(),
        updated_at=(now - timedelta(days=5)).isoformat()
    )

    # 5. Order 45 days ago - Completed (Different month)
    order5 = Order(
        id='ORD-1005',
        customer_name='Aarav Sharma',
        customer_mobile='9876543210',
        order_type='Dine-in',
        table_number='Table 4',
        items=[
            OrderItem('item-1', 'Cappuccino', 120.0, 1, True, 'Coffee')
        ],
        subtotal=120.0,
        tax=6.0,
        total_amount=126.0,
        payment_method='UPI',
        status='Completed',
        created_at=(now - timedelta(days=45)).isoformat(),
        updated_at=(now - timedelta(days=45)).isoformat()
    )

    for o in [order1, order2, order3, order4, order5]:
        seeded_system.orders[o.id] = o

    return seeded_system
