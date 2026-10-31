"""White Box Test Suite for Module 1: Customer Ordering and Tracking.
Covers:
- Statement Coverage
- Branch Coverage (True / False conditions)
- Condition Coverage (compound checks)
- Path Coverage (happy paths, boundary conditions, error paths)
"""

import pytest
from cafe_logic.cafe_system import CafeSystem
from cafe_logic.models import MenuItem, ORDER_STEPS


class TestCustomerCartManagement:
    """White box tests for cart management logic."""

    def test_add_item_to_cart_success(self, seeded_system: CafeSystem):
        """Test Case 1: Adding a food item to the cart successfully."""
        cart_item = seeded_system.add_to_cart('item-1', quantity=1)
        assert cart_item is not None
        assert cart_item.item.id == 'item-1'
        assert cart_item.quantity == 1
        assert seeded_system.get_cart_item_count() == 1
        assert 'item-1' in seeded_system.cart

    def test_add_same_item_multiple_times(self, seeded_system: CafeSystem):
        """Branch coverage: adding existing item increments quantity."""
        seeded_system.add_to_cart('item-1', quantity=2)
        cart_item = seeded_system.add_to_cart('item-1', quantity=3)
        assert cart_item.quantity == 5
        assert seeded_system.get_cart_item_count() == 5

    def test_add_multiple_different_items(self, seeded_system: CafeSystem):
        """Path coverage: cart with distinct items."""
        seeded_system.add_to_cart('item-1', quantity=2)
        seeded_system.add_to_cart('item-2', quantity=1)
        assert len(seeded_system.cart) == 2
        assert seeded_system.get_cart_item_count() == 3

    def test_add_item_invalid_id_raises_key_error(self, seeded_system: CafeSystem):
        """Negative test: Non-existent menu item raises KeyError."""
        with pytest.raises(KeyError) as exc_info:
            seeded_system.add_to_cart('non-existent-item-999', quantity=1)
        assert "not found" in str(exc_info.value)

    def test_add_unavailable_item_raises_value_error(self, seeded_system: CafeSystem):
        """Negative test: Adding an item marked as unavailable / sold out."""
        seeded_system.set_item_availability('item-1', is_available=False)
        with pytest.raises(ValueError) as exc_info:
            seeded_system.add_to_cart('item-1', quantity=1)
        assert "unavailable" in str(exc_info.value)

    @pytest.mark.parametrize("invalid_qty", [0, -1, -10])
    def test_add_invalid_quantity_boundary_values(self, seeded_system: CafeSystem, invalid_qty: int):
        """Boundary & Condition testing: quantity <= 0 must raise ValueError."""
        with pytest.raises(ValueError) as exc_info:
            seeded_system.add_to_cart('item-1', quantity=invalid_qty)
        assert "positive integer" in str(exc_info.value)

    def test_increase_cart_item_quantity(self, seeded_system: CafeSystem):
        """Test Case 2a: Increasing item quantity."""
        seeded_system.add_to_cart('item-1', quantity=2)
        updated = seeded_system.update_cart_quantity('item-1', delta=2)
        assert updated is not None
        assert updated.quantity == 4

    def test_decrease_cart_item_quantity(self, seeded_system: CafeSystem):
        """Test Case 2b: Decreasing item quantity (new quantity > 0)."""
        seeded_system.add_to_cart('item-1', quantity=3)
        updated = seeded_system.update_cart_quantity('item-1', delta=-1)
        assert updated is not None
        assert updated.quantity == 2

    def test_decrease_quantity_to_zero_removes_item(self, seeded_system: CafeSystem):
        """Branch coverage: delta drops quantity to 0 removes the item."""
        seeded_system.add_to_cart('item-1', quantity=1)
        updated = seeded_system.update_cart_quantity('item-1', delta=-1)
        assert updated is None
        assert 'item-1' not in seeded_system.cart
        assert seeded_system.get_cart_item_count() == 0

    def test_decrease_quantity_below_zero_removes_item(self, seeded_system: CafeSystem):
        """Boundary coverage: delta drops quantity < 0 removes the item."""
        seeded_system.add_to_cart('item-1', quantity=2)
        updated = seeded_system.update_cart_quantity('item-1', delta=-5)
        assert updated is None
        assert 'item-1' not in seeded_system.cart

    def test_update_quantity_item_not_in_cart_raises_key_error(self, seeded_system: CafeSystem):
        """Negative test: updating quantity for item not in cart."""
        with pytest.raises(KeyError) as exc_info:
            seeded_system.update_cart_quantity('item-1', delta=1)
        assert "not in the shopping cart" in str(exc_info.value)

    def test_remove_item_from_cart_success(self, seeded_system: CafeSystem):
        """Test Case 3: Removing an item from the cart."""
        seeded_system.add_to_cart('item-1', quantity=1)
        seeded_system.add_to_cart('item-2', quantity=2)
        removed = seeded_system.remove_from_cart('item-1')
        assert removed is True
        assert 'item-1' not in seeded_system.cart
        assert len(seeded_system.cart) == 1

    def test_remove_non_existent_item_returns_false(self, seeded_system: CafeSystem):
        """Branch coverage: removing an item that isn't in cart returns False."""
        removed = seeded_system.remove_from_cart('item-99')
        assert removed is False

    def test_clear_cart(self, seeded_system: CafeSystem):
        """Test clearing all items from cart."""
        seeded_system.add_to_cart('item-1', 2)
        seeded_system.add_to_cart('item-2', 1)
        seeded_system.clear_cart()
        assert len(seeded_system.cart) == 0
        assert seeded_system.calculate_subtotal() == 0.0


class TestBillingAndCalculations:
    """White box tests for subtotal, GST, and final bill calculation."""

    def test_calculate_subtotal_empty_cart(self, seeded_system: CafeSystem):
        """Test Case 4a: Subtotal for empty cart is 0.0."""
        assert seeded_system.calculate_subtotal() == 0.0

    def test_calculate_subtotal_multiple_items(self, seeded_system: CafeSystem):
        """Test Case 4b: Subtotal calculation: Cappuccino (120*2) + Cold Coffee (140*1) = 380."""
        seeded_system.add_to_cart('item-1', quantity=2)  # 120 * 2 = 240
        seeded_system.add_to_cart('item-2', quantity=1)  # 140 * 1 = 140
        assert seeded_system.calculate_subtotal() == 380.0

    def test_calculate_gst_standard_rate(self, seeded_system: CafeSystem):
        """Test Case 5: Calculating 5% GST on subtotal."""
        # 380 * 0.05 = 19.0
        gst = seeded_system.calculate_gst(subtotal=380.0)
        assert gst == 19.0

    def test_calculate_gst_with_rounding(self, seeded_system: CafeSystem):
        """Condition coverage: GST rounding to 2 decimal places."""
        # 355 * 0.05 = 17.75
        gst = seeded_system.calculate_gst(subtotal=355.0)
        assert gst == 17.75

    def test_calculate_gst_negative_subtotal_raises_error(self, seeded_system: CafeSystem):
        """Negative test: Negative subtotal raises ValueError."""
        with pytest.raises(ValueError):
            seeded_system.calculate_gst(subtotal=-50.0)

    def test_calculate_final_bill(self, seeded_system: CafeSystem):
        """Test Case 6: Calculating final bill (Subtotal + GST)."""
        subtotal = 380.0
        tax = 19.0
        total = seeded_system.calculate_final_bill(subtotal=subtotal, tax=tax)
        assert total == 399.0

    def test_calculate_final_bill_default_args(self, seeded_system: CafeSystem):
        """Branch coverage: final bill without passing explicit subtotal or tax."""
        seeded_system.add_to_cart('item-1', quantity=1)  # 120
        # Subtotal: 120, GST: 6.0, Total: 126.0
        assert seeded_system.calculate_final_bill() == 126.0


class TestOrderPlacementAndTracking:
    """White box tests for order placement, unique ID generation, and live tracking."""

    def test_place_order_dine_in_successfully(self, seeded_system: CafeSystem):
        """Test Case 7a: Placing a Dine-in order successfully."""
        seeded_system.add_to_cart('item-1', quantity=2)
        order = seeded_system.place_order(
            customer_name='Aarav Sharma',
            customer_mobile='9876543210',
            order_type='Dine-in',
            table_number='Table 3',
            payment_method='UPI',
            special_instructions='Extra hot please'
        )
        assert order is not None
        assert order.id.startswith('ORD-')
        assert order.customer_name == 'Aarav Sharma'
        assert order.customer_mobile == '9876543210'
        assert order.order_type == 'Dine-in'
        assert order.table_number == 'Table 3'
        assert order.status == 'Order Placed'
        assert order.subtotal == 240.0
        assert order.tax == 12.0
        assert order.total_amount == 252.0
        assert order.special_instructions == 'Extra hot please'
        assert len(seeded_system.cart) == 0  # Cart must be cleared after order
        assert order.id in seeded_system.orders

    def test_place_order_takeaway_successfully(self, seeded_system: CafeSystem):
        """Test Case 7b: Placing a Takeaway order successfully without table number."""
        seeded_system.add_to_cart('item-6', quantity=1)  # 150
        order = seeded_system.place_order(
            customer_name='Priya Patel',
            customer_mobile='9822334455',
            order_type='Takeaway',
            payment_method='Cash'
        )
        assert order.order_type == 'Takeaway'
        assert order.table_number is None
        assert order.total_amount == 157.5  # 150 + 7.5

    def test_place_order_empty_cart_raises_error(self, seeded_system: CafeSystem):
        """Test Case 8: Placing an order with empty cart raises ValueError."""
        seeded_system.clear_cart()
        with pytest.raises(ValueError) as exc_info:
            seeded_system.place_order(
                customer_name='Aarav Sharma',
                customer_mobile='9876543210',
                order_type='Dine-in',
                table_number='Table 1',
                payment_method='UPI'
            )
        assert "empty shopping cart" in str(exc_info.value)

    def test_generate_unique_order_ids(self, seeded_system: CafeSystem):
        """Test Case 9: Generating unique order IDs."""
        id1 = seeded_system.generate_unique_order_id()
        id2 = seeded_system.generate_unique_order_id()
        assert id1 != id2
        assert id1.startswith('ORD-')
        assert len(id1) == 8

    def test_track_existing_order(self, populated_orders_system: CafeSystem):
        """Test Case 10: Tracking an existing order."""
        order = populated_orders_system.track_order('ORD-1001')
        assert order.id == 'ORD-1001'
        assert order.customer_name == 'Aarav Sharma'
        assert order.status == 'Completed'
        assert order.total_amount == 367.5

    def test_track_invalid_order_id_raises_key_error(self, populated_orders_system: CafeSystem):
        """Test Case 11: Tracking an invalid / non-existent order ID raises KeyError."""
        with pytest.raises(KeyError) as exc_info:
            populated_orders_system.track_order('ORD-INVALID-9999')
        assert "not found" in str(exc_info.value)

    def test_update_order_status_success(self, populated_orders_system: CafeSystem):
        """Test Case 12: Updating order status (admin status change reflected)."""
        updated = populated_orders_system.update_order_status('ORD-1002', 'Order Accepted')
        assert updated.status == 'Order Accepted'
        
        # Advance through pipeline
        updated = populated_orders_system.update_order_status('ORD-1002', 'Preparing')
        assert updated.status == 'Preparing'
        
        updated = populated_orders_system.update_order_status('ORD-1002', 'Ready for Pickup / Served')
        assert updated.status == 'Ready for Pickup / Served'
        
        updated = populated_orders_system.update_order_status('ORD-1002', 'Completed')
        assert updated.status == 'Completed'

    def test_get_order_progress_stages(self, populated_orders_system: CafeSystem):
        """Path coverage: Visual progress status for stages."""
        # ORD-1002 is Preparing (index 2: Order Placed(done), Order Accepted(done), Preparing(current), Ready(upcoming), Completed(upcoming))
        progress = populated_orders_system.get_order_progress('ORD-1002')
        assert progress['Order Placed'] == 'completed'
        assert progress['Order Accepted'] == 'completed'
        assert progress['Preparing'] == 'current'
        assert progress['Ready for Pickup / Served'] == 'upcoming'
        assert progress['Completed'] == 'upcoming'

    def test_get_order_progress_rejected(self, populated_orders_system: CafeSystem):
        """Branch coverage: Progress for rejected order marks all steps rejected."""
        progress = populated_orders_system.get_order_progress('ORD-1004')
        for step in ORDER_STEPS:
            assert progress[step] == 'rejected'

    def test_get_customer_orders_by_mobile(self, populated_orders_system: CafeSystem):
        """Test retrieving all orders for a specific customer mobile."""
        orders = populated_orders_system.get_customer_orders('9876543210')
        assert len(orders) == 2
        assert all(o.customer_mobile == '9876543210' for o in orders)


class TestNegativeAndBoundaryOrderInputs:
    """Comprehensive boundary and negative validation tests for order inputs."""

    @pytest.mark.parametrize("empty_name", ["", "   ", None])
    def test_place_order_empty_customer_name(self, seeded_system: CafeSystem, empty_name):
        """Negative test: Empty or whitespace-only customer name."""
        seeded_system.add_to_cart('item-1', 1)
        with pytest.raises(ValueError) as exc:
            seeded_system.place_order(
                customer_name=empty_name,
                customer_mobile='9876543210',
                order_type='Takeaway',
                payment_method='Cash'
            )
        assert "Customer name cannot be empty" in str(exc.value)

    @pytest.mark.parametrize("invalid_mobile", [
        "12345",              # Too short
        "1234567890123",      # Too long
        "98765abcde",         # Alpha characters
        "98765-4321",         # Special characters
        "",                   # Empty
        "          "          # Whitespace
    ])
    def test_place_order_invalid_mobile_numbers(self, seeded_system: CafeSystem, invalid_mobile):
        """Condition & Boundary testing: Mobile number must be exactly 10 digits."""
        seeded_system.add_to_cart('item-1', 1)
        with pytest.raises(ValueError) as exc:
            seeded_system.place_order(
                customer_name='Aarav Sharma',
                customer_mobile=invalid_mobile,
                order_type='Takeaway',
                payment_method='Cash'
            )
        assert "Invalid mobile number" in str(exc.value)

    def test_dine_in_missing_table_number(self, seeded_system: CafeSystem):
        """Condition coverage: Dine-in order without table number raises ValueError."""
        seeded_system.add_to_cart('item-1', 1)
        with pytest.raises(ValueError) as exc:
            seeded_system.place_order(
                customer_name='Aarav Sharma',
                customer_mobile='9876543210',
                order_type='Dine-in',
                table_number="",
                payment_method='Cash'
            )
        assert "Table number is required" in str(exc.value)

    def test_invalid_order_type(self, seeded_system: CafeSystem):
        """Negative test: Unsupported order type."""
        seeded_system.add_to_cart('item-1', 1)
        with pytest.raises(ValueError) as exc:
            seeded_system.place_order(
                customer_name='Aarav Sharma',
                customer_mobile='9876543210',
                order_type='Delivery',  # Only Dine-in and Takeaway allowed
                payment_method='Cash'
            )
        assert "Invalid order type" in str(exc.value)

    def test_invalid_payment_method(self, seeded_system: CafeSystem):
        """Negative test: Unsupported payment method."""
        seeded_system.add_to_cart('item-1', 1)
        with pytest.raises(ValueError) as exc:
            seeded_system.place_order(
                customer_name='Aarav Sharma',
                customer_mobile='9876543210',
                order_type='Takeaway',
                payment_method='Bitcoin'  # Only Cash and UPI allowed
            )
        assert "Invalid payment method" in str(exc.value)
