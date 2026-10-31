"""White Box Test Suite for Module 2: Cafe Administration and Sales Management.
Covers:
- Statement Coverage
- Branch Coverage (Valid & Invalid credentials, filters, stock status branches)
- Condition Coverage (compound status logic, revenue checks)
- Path Coverage (Admin workflows, CRUD, inventory thresholds, reports)
"""

import pytest
from datetime import datetime, timedelta
from cafe_logic.cafe_system import CafeSystem
from cafe_logic.models import MenuItem, InventoryItem, Order, OrderItem


class TestAdminAuthentication:
    """White box tests for administrator login and session management."""

    def test_admin_login_valid_credentials(self, clean_system: CafeSystem):
        """Test Case 1: Admin login with valid demo credentials."""
        assert clean_system.session_role is None
        success = clean_system.admin_login("admin", "admin123")
        assert success is True
        assert clean_system.session_role == 'admin'

    def test_admin_login_with_whitespace(self, clean_system: CafeSystem):
        """Branch coverage: Admin credentials with leading/trailing whitespace."""
        success = clean_system.admin_login("  admin  ", "  admin123  ")
        assert success is True
        assert clean_system.session_role == 'admin'

    @pytest.mark.parametrize("user, pwd", [
        ("admin", "wrongpassword"),
        ("administrator", "admin123"),
        ("root", "toor"),
        ("", "admin123"),
        ("admin", ""),
        ("", "")
    ])
    def test_admin_login_invalid_credentials(self, clean_system: CafeSystem, user, pwd):
        """Test Case 2: Admin login with invalid credentials must be rejected."""
        success = clean_system.admin_login(user, pwd)
        assert success is False
        assert clean_system.session_role is None

    def test_admin_logout(self, clean_system: CafeSystem):
        """Test admin logout clears session role."""
        clean_system.admin_login("admin", "admin123")
        assert clean_system.session_role == 'admin'
        clean_system.admin_logout()
        assert clean_system.session_role is None


class TestMenuManagement:
    """White box tests for menu engineering and catalog CRUD operations."""

    def test_add_new_menu_item_success(self, seeded_system: CafeSystem):
        """Test Case 3: Adding a new menu item."""
        initial_count = len(seeded_system.menu)
        new_item = seeded_system.add_menu_item(
            name="Hazelnut Mocha",
            description="Dark mocha espresso with roasted hazelnut syrup",
            price=160.0,
            category="Coffee",
            is_veg=True,
            is_available=True,
            popular=True
        )
        assert new_item is not None
        assert new_item.name == "Hazelnut Mocha"
        assert new_item.price == 160.0
        assert new_item.category == "Coffee"
        assert len(seeded_system.menu) == initial_count + 1
        assert new_item.id in seeded_system.menu

    @pytest.mark.parametrize("invalid_price", [0, -10.0, -150])
    def test_add_menu_item_invalid_price(self, seeded_system: CafeSystem, invalid_price):
        """Boundary testing: Menu item price <= 0 raises ValueError."""
        with pytest.raises(ValueError) as exc:
            seeded_system.add_menu_item(
                name="Free Water",
                description="Sample",
                price=invalid_price,
                category="Cold Beverages"
            )
        assert "greater than zero" in str(exc.value)

    @pytest.mark.parametrize("empty_name", ["", "   "])
    def test_add_menu_item_empty_name(self, seeded_system: CafeSystem, empty_name):
        """Negative test: Adding item with empty name raises ValueError."""
        with pytest.raises(ValueError) as exc:
            seeded_system.add_menu_item(
                name=empty_name,
                description="Test",
                price=100.0,
                category="Snacks"
            )
        assert "cannot be empty" in str(exc.value)

    def test_add_menu_item_invalid_category(self, seeded_system: CafeSystem):
        """Negative test: Adding item with invalid category raises ValueError."""
        with pytest.raises(ValueError) as exc:
            seeded_system.add_menu_item(
                name="Pizza Slice",
                description="Test",
                price=150.0,
                category="Italian"  # Invalid category
            )
        assert "Invalid category" in str(exc.value)

    def test_update_menu_item_price_success(self, seeded_system: CafeSystem):
        """Test Case 4: Updating menu item price."""
        updated = seeded_system.update_menu_item_price('item-1', 135.0)
        assert updated.price == 135.0
        assert seeded_system.menu['item-1'].price == 135.0

    def test_update_menu_item_price_non_existent(self, seeded_system: CafeSystem):
        """Negative test: Updating price of non-existent item raises KeyError."""
        with pytest.raises(KeyError):
            seeded_system.update_menu_item_price('item-fake-999', 150.0)

    @pytest.mark.parametrize("invalid_price", [0, -50.0])
    def test_update_menu_item_invalid_price(self, seeded_system: CafeSystem, invalid_price):
        """Boundary testing: Updating item price to <= 0 raises ValueError."""
        with pytest.raises(ValueError):
            seeded_system.update_menu_item_price('item-1', invalid_price)

    def test_delete_menu_item_success(self, seeded_system: CafeSystem):
        """Test Case 5: Deleting a menu item."""
        assert 'item-3' in seeded_system.menu
        deleted = seeded_system.delete_menu_item('item-3')
        assert deleted is True
        assert 'item-3' not in seeded_system.menu

    def test_delete_non_existent_menu_item_returns_false(self, seeded_system: CafeSystem):
        """Branch coverage: Deleting non-existent item returns False."""
        deleted = seeded_system.delete_menu_item('item-fake-404')
        assert deleted is False

    def test_marking_item_unavailable_and_available(self, seeded_system: CafeSystem):
        """Test Case 6: Marking an item unavailable and then available."""
        # Make unavailable
        item = seeded_system.set_item_availability('item-1', is_available=False)
        assert item.is_available is False
        assert seeded_system.menu['item-1'].is_available is False

        # Make available again
        item = seeded_system.set_item_availability('item-1', is_available=True)
        assert item.is_available is True

    def test_set_availability_non_existent_item_raises_error(self, seeded_system: CafeSystem):
        """Negative test: Setting availability on non-existent item raises KeyError."""
        with pytest.raises(KeyError):
            seeded_system.set_item_availability('item-fake-404', False)


class TestAdminOrderOperations:
    """White box tests for admin order acceptance and pipeline changes."""

    def test_accept_customer_order(self, populated_orders_system: CafeSystem):
        """Test Case 7: Accepting an incoming customer order."""
        # Create a fresh placed order
        populated_orders_system.add_to_cart('item-1', 1)
        order = populated_orders_system.place_order(
            customer_name="Karan",
            customer_mobile="9800112233",
            order_type="Takeaway",
            payment_method="Cash"
        )
        assert order.status == 'Order Placed'

        # Admin accepts order
        accepted = populated_orders_system.update_order_status(order.id, 'Order Accepted')
        assert accepted.status == 'Order Accepted'
        assert populated_orders_system.orders[order.id].status == 'Order Accepted'

    def test_changing_order_status_pipeline(self, populated_orders_system: CafeSystem):
        """Test Case 8: Advancing order status through kitchen pipeline."""
        order_id = 'ORD-1002'
        
        # Preparing
        order = populated_orders_system.update_order_status(order_id, 'Preparing')
        assert order.status == 'Preparing'

        # Ready for Pickup / Served
        order = populated_orders_system.update_order_status(order_id, 'Ready for Pickup / Served')
        assert order.status == 'Ready for Pickup / Served'

        # Completed
        order = populated_orders_system.update_order_status(order_id, 'Completed')
        assert order.status == 'Completed'

    def test_reject_order(self, populated_orders_system: CafeSystem):
        """Branch coverage: Rejecting/cancelling an order."""
        order = populated_orders_system.update_order_status('ORD-1002', 'Rejected')
        assert order.status == 'Rejected'

    def test_update_status_invalid_order_raises_error(self, populated_orders_system: CafeSystem):
        """Negative test: Updating status on non-existent order raises KeyError."""
        with pytest.raises(KeyError):
            populated_orders_system.update_order_status('ORD-99999', 'Completed')

    def test_update_status_invalid_status_raises_error(self, populated_orders_system: CafeSystem):
        """Negative test: Invalid status value raises ValueError."""
        with pytest.raises(ValueError) as exc:
            populated_orders_system.update_order_status('ORD-1001', 'Delivered_To_Moon')
        assert "Invalid order status" in str(exc.value)


class TestSalesAndAnalytics:
    """White box tests for revenue, daily/weekly/monthly calculations, best sellers, and CSV report."""

    def test_calculate_daily_sales(self, populated_orders_system: CafeSystem):
        """Test Case 9: Calculating daily sales (only completed orders count)."""
        today_str = datetime.now().strftime("%Y-%m-%d")
        daily = populated_orders_system.calculate_daily_sales(today_str)
        # ORD-1001 is Completed today (367.5). ORD-1002 is Preparing (304.5 - not completed!).
        assert daily == 367.5

    def test_calculate_daily_sales_for_empty_date(self, populated_orders_system: CafeSystem):
        """Branch coverage: Daily sales on a date with no orders returns 0.0."""
        daily = populated_orders_system.calculate_daily_sales("2020-01-01")
        assert daily == 0.0

    def test_calculate_weekly_sales(self, populated_orders_system: CafeSystem):
        """Test Case 10a: Calculating weekly sales (past 7 days completed orders)."""
        # ORD-1001 (today: 367.5) + ORD-1003 (2 days ago: 336.0) = 703.5
        # ORD-1004 is rejected (excluded), ORD-1005 is 45 days ago (excluded)
        weekly = populated_orders_system.calculate_weekly_sales()
        assert weekly == 703.5

    def test_calculate_monthly_sales(self, populated_orders_system: CafeSystem):
        """Test Case 10b: Calculating monthly sales."""
        now = datetime.now()
        monthly = populated_orders_system.calculate_monthly_sales(now.year, now.month)
        # Completed in current month: ORD-1001 (367.5) + ORD-1003 (336.0) = 703.5
        assert monthly == 703.5

    def test_calculate_total_revenue(self, populated_orders_system: CafeSystem):
        """Test Case 11: Total revenue counts only Completed orders."""
        # Completed: ORD-1001 (367.5) + ORD-1003 (336.0) + ORD-1005 (126.0) = 829.5
        # Excludes ORD-1002 (Preparing) and ORD-1004 (Rejected)
        total = populated_orders_system.calculate_total_revenue()
        assert total == 829.5

    def test_get_best_selling_products(self, populated_orders_system: CafeSystem):
        """Test Case 12: Identifying best-selling products from completed orders."""
        best_sellers = populated_orders_system.get_best_selling_products(limit=3)
        assert len(best_sellers) > 0
        # Cappuccino is in ORD-1001 (2), ORD-1003 (1), ORD-1005 (1) -> 4 units sold!
        cappuccino = next((item for item in best_sellers if item["name"] == "Cappuccino"), None)
        assert cappuccino is not None
        assert cappuccino["units_sold"] == 4
        assert cappuccino["revenue"] == 480.0

    def test_get_best_selling_products_invalid_limit(self, populated_orders_system: CafeSystem):
        """Boundary test: limit <= 0 raises ValueError."""
        with pytest.raises(ValueError):
            populated_orders_system.get_best_selling_products(limit=0)

    def test_get_payment_method_breakdown(self, populated_orders_system: CafeSystem):
        """Condition coverage: Payment breakdown Cash vs UPI."""
        breakdown = populated_orders_system.get_payment_method_breakdown()
        assert breakdown["total_revenue"] == 829.5
        assert "UPI" in breakdown
        assert "Cash" in breakdown
        assert breakdown["UPI"]["orders_count"] == 2  # ORD-1001 (367.5) and ORD-1005 (126.0) = 493.5
        assert breakdown["Cash"]["orders_count"] == 1  # ORD-1003 (336.0)
        assert breakdown["UPI"]["revenue"] == 493.5
        assert breakdown["Cash"]["revenue"] == 336.0

    def test_get_revenue_by_category(self, populated_orders_system: CafeSystem):
        """Test category revenue aggregation."""
        cat_rev = populated_orders_system.get_revenue_by_category()
        assert 'Coffee' in cat_rev
        assert cat_rev['Coffee'] == 480.0  # 4 * 120
        assert 'Sandwiches' in cat_rev
        assert cat_rev['Sandwiches'] == 200.0  # 2 * 100

    def test_generate_sales_report_csv(self, populated_orders_system: CafeSystem):
        """Test Case 13: Generating a CSV sales report."""
        csv_data = populated_orders_system.generate_sales_report_csv()
        assert isinstance(csv_data, str)
        assert "Order ID,Date & Time,Customer Name" in csv_data
        assert "ORD-1001" in csv_data
        assert "Aarav Sharma" in csv_data
        assert "ORD-1002" in csv_data


class TestInventoryManagement:
    """White box tests for ingredient pantry, stock status calculations, and low-stock alerts."""

    def test_add_inventory_item(self, seeded_system: CafeSystem):
        """Test Case 14a: Adding a new ingredient."""
        item = seeded_system.add_inventory_item(
            name="Vanilla Syrup",
            quantity=5.0,
            unit="Bottles",
            min_stock=2.0
        )
        assert item.name == "Vanilla Syrup"
        assert item.quantity == 5.0
        assert item.status == 'In Stock'
        assert item.id in seeded_system.inventory

    @pytest.mark.parametrize("invalid_arg, name, qty, unit, min_stock", [
        ("empty_name", "", 5.0, "kg", 2.0),
        ("negative_qty", "Coffee", -2.0, "kg", 2.0),
        ("negative_min_stock", "Coffee", 5.0, "kg", -1.0),
        ("empty_unit", "Coffee", 5.0, "", 2.0)
    ])
    def test_add_inventory_invalid_inputs(self, seeded_system: CafeSystem, invalid_arg, name, qty, unit, min_stock):
        """Boundary and negative tests for inventory addition."""
        with pytest.raises(ValueError):
            seeded_system.add_inventory_item(name=name, quantity=qty, unit=unit, min_stock=min_stock)

    def test_stock_status_branches(self, clean_system: CafeSystem):
        """Branch coverage: _compute_stock_status for Out of Stock, Low Stock, and In Stock."""
        # 1. Quantity <= 0 -> Out of Stock
        item_out = clean_system.add_inventory_item("Depleted Coffee", 0.0, "kg", 2.0)
        assert item_out.status == 'Out of Stock'

        # 2. 0 < Quantity <= min_stock -> Low Stock
        item_low = clean_system.add_inventory_item("Low Buns", 2.0, "Packs", 5.0)
        assert item_low.status == 'Low Stock'

        # 3. Quantity > min_stock -> In Stock
        item_good = clean_system.add_inventory_item("Plenty Milk", 15.0, "Liters", 5.0)
        assert item_good.status == 'In Stock'

    def test_update_inventory_quantity(self, seeded_system: CafeSystem):
        """Test Case 14b: Updating inventory quantity and auto status re-evaluation."""
        # inv-1 initial: 6.5 kg, min 2.0 (In Stock)
        updated = seeded_system.update_inventory_quantity('inv-1', 1.5)
        assert updated.quantity == 1.5
        assert updated.status == 'Low Stock'  # 1.5 <= 2.0!

        # Drop to 0
        updated = seeded_system.update_inventory_quantity('inv-1', 0.0)
        assert updated.status == 'Out of Stock'

    def test_update_inventory_negative_quantity(self, seeded_system: CafeSystem):
        """Negative test: Updating inventory with negative quantity raises ValueError."""
        with pytest.raises(ValueError):
            seeded_system.update_inventory_quantity('inv-1', -5.0)

    def test_update_non_existent_inventory_item(self, seeded_system: CafeSystem):
        """Negative test: Updating non-existent ingredient raises KeyError."""
        with pytest.raises(KeyError):
            seeded_system.update_inventory_quantity('inv-fake-999', 10.0)

    def test_restock_inventory_success(self, seeded_system: CafeSystem):
        """Test restocking an existing ingredient."""
        # inv-3 is Brioche Buns (quantity 6, min 10 -> Low Stock)
        restocked = seeded_system.restock_inventory('inv-3', added_quantity=10)
        assert restocked.quantity == 16.0
        assert restocked.status == 'In Stock'

    def test_restock_invalid_quantity(self, seeded_system: CafeSystem):
        """Boundary test: Restock with <= 0 raises ValueError."""
        with pytest.raises(ValueError):
            seeded_system.restock_inventory('inv-1', added_quantity=0)

    def test_delete_inventory_item(self, seeded_system: CafeSystem):
        """Test deleting an inventory record."""
        assert 'inv-1' in seeded_system.inventory
        deleted = seeded_system.delete_inventory_item('inv-1')
        assert deleted is True
        assert 'inv-1' not in seeded_system.inventory

        # Deleting again returns False
        assert seeded_system.delete_inventory_item('inv-1') is False

    def test_detect_low_stock_ingredients(self, seeded_system: CafeSystem):
        """Test Case 15: Detecting low-stock ingredients."""
        low_stock = seeded_system.detect_low_stock_ingredients()
        assert len(low_stock) >= 2
        names = [item.name for item in low_stock]
        assert 'Brioche Burger Buns' in names
        assert 'Belgian Dark Chocolate Chips' in names


class TestCustomerManagement:
    """White box tests for customer profile aggregation and record search."""

    def test_get_customers_summary(self, populated_orders_system: CafeSystem):
        """Test customer spend and order summary aggregation."""
        customers = populated_orders_system.get_customers_summary()
        assert len(customers) >= 3

        # Aarav Sharma has completed ORD-1001 (367.5) + ORD-1005 (126.0) = 493.5
        aarav = next((c for c in customers if c.name == 'Aarav Sharma'), None)
        assert aarav is not None
        assert aarav.total_orders == 2
        assert aarav.total_spent == 493.5

    def test_search_customer_records_by_name(self, populated_orders_system: CafeSystem):
        """Test Case 16a: Searching customer records by name."""
        results = populated_orders_system.search_customer_records("Aarav")
        assert len(results) == 1
        assert results[0].name == "Aarav Sharma"
        assert results[0].mobile == "9876543210"

    def test_search_customer_records_by_mobile(self, populated_orders_system: CafeSystem):
        """Test Case 16b: Searching customer records by mobile number."""
        results = populated_orders_system.search_customer_records("9822334455")
        assert len(results) == 1
        assert results[0].name == "Priya Patel"

    def test_search_customer_records_empty_query_returns_all(self, populated_orders_system: CafeSystem):
        """Branch coverage: Empty or whitespace query returns all records."""
        results = populated_orders_system.search_customer_records("")
        assert len(results) == len(populated_orders_system.get_customers_summary())

    def test_search_customer_records_no_match(self, populated_orders_system: CafeSystem):
        """Branch coverage: Searching non-existent patron returns empty list."""
        results = populated_orders_system.search_customer_records("Zyxwvu Nonexistent")
        assert len(results) == 0
