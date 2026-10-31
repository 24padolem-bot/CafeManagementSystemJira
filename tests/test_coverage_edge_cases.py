"""Edge case coverage tests for data models and error resilience."""

import pytest
from datetime import datetime
from cafe_logic.cafe_system import CafeSystem
from cafe_logic.models import MenuItem, CartItem, Order, OrderItem, InventoryItem


class TestModelEdgeCases:
    """Tests covering data model serialization and edge branches."""

    def test_model_to_dict_methods(self):
        """Test to_dict serialization for all dataclasses."""
        menu_item = MenuItem(
            id='item-1',
            name='Test Coffee',
            description='Test description',
            price=100.0,
            category='Coffee',
            is_veg=True,
            is_available=True,
            image='/path.jpg',
            popular=True,
            recommended=False
        )
        d = menu_item.to_dict()
        assert d['id'] == 'item-1'
        assert d['name'] == 'Test Coffee'
        assert d['price'] == 100.0
        assert d['isVeg'] is True
        assert d['isAvailable'] is True

        order_item = OrderItem('item-1', 'Test Coffee', 100.0, 2, True, 'Coffee')
        oid = order_item.to_dict()
        assert oid['id'] == 'item-1'
        assert oid['quantity'] == 2

        inv_item = InventoryItem('inv-1', 'Beans', 5.0, 'kg', 2.0, 'In Stock', '2026-10-30')
        invid = inv_item.to_dict()
        assert invid['id'] == 'inv-1'
        assert invid['unit'] == 'kg'

        order = Order(
            id='ORD-9999',
            customer_name='Tester',
            customer_mobile='9876543210',
            order_type='Takeaway',
            items=[order_item],
            subtotal=200.0,
            tax=10.0,
            total_amount=210.0,
            payment_method='Cash',
            status='Order Placed'
        )
        od = order.to_dict()
        assert od['id'] == 'ORD-9999'
        assert len(od['items']) == 1

    def test_weekly_sales_invalid_iso_date_handling(self, seeded_system: CafeSystem):
        """Condition coverage: handling corrupted or unparseable ISO date gracefully."""
        bad_order = Order(
            id='ORD-CORRUPT',
            customer_name='Alien',
            customer_mobile='9999999999',
            order_type='Takeaway',
            items=[OrderItem('item-1', 'Cappuccino', 120.0, 1, True, 'Coffee')],
            subtotal=120.0,
            tax=6.0,
            total_amount=126.0,
            payment_method='Cash',
            status='Completed',
            created_at='NOT-A-VALID-ISO-DATE',
            updated_at='NOT-A-VALID-ISO-DATE'
        )
        seeded_system.orders[bad_order.id] = bad_order
        # Must not crash, should simply ignore the bad date
        sales = seeded_system.calculate_weekly_sales()
        assert isinstance(sales, float)

    def test_customer_summary_empty_key_branch(self, seeded_system: CafeSystem):
        """Branch coverage: Order with empty name and mobile."""
        ghost_order = Order(
            id='ORD-GHOST',
            customer_name='',
            customer_mobile='',
            order_type='Takeaway',
            items=[],
            subtotal=0.0,
            tax=0.0,
            total_amount=0.0,
            payment_method='Cash',
            status='Completed'
        )
        seeded_system.orders[ghost_order.id] = ghost_order
        summary = seeded_system.get_customers_summary()
        assert isinstance(summary, list)

    def test_payment_breakdown_zero_revenue_branch(self, clean_system: CafeSystem):
        """Branch coverage: Payment method breakdown when no completed orders exist."""
        breakdown = clean_system.get_payment_method_breakdown()
        assert breakdown['total_revenue'] == 0.0
        assert breakdown['UPI']['percentage'] == 0.0
        assert breakdown['Cash']['percentage'] == 0.0
