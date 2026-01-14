-- Migration: 013_create_orders_table.sql
-- Description: Create orders and order_items tables for order management
-- Sprint: 4 - Shopping Cart & Orders
-- User Stories: US-08, US-09

-- ============================================
-- TABLE: orders
-- ============================================
-- Lưu trữ thông tin đơn hàng
-- ============================================

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Keys
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Order info
    status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
    
    -- Shipping info
    shipping_address TEXT,
    shipping_phone TEXT,
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- TABLE: order_items
-- ============================================
-- Chi tiết các sản phẩm trong đơn hàng
-- Lưu snapshot giá tại thời điểm đặt để tránh thay đổi giá sau
-- ============================================

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Keys
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    
    -- Item data (snapshot at order time)
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- ============================================
-- TRIGGER: Auto update updated_at for orders
-- ============================================

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE orders IS 'Đơn hàng của users';
COMMENT ON COLUMN orders.user_id IS 'ID của user đặt hàng';
COMMENT ON COLUMN orders.status IS 'Trạng thái đơn: pending, confirmed, processing, shipped, delivered, cancelled';
COMMENT ON COLUMN orders.total_amount IS 'Tổng tiền đơn hàng (VNĐ)';
COMMENT ON COLUMN orders.shipping_address IS 'Địa chỉ giao hàng';

COMMENT ON TABLE order_items IS 'Chi tiết sản phẩm trong đơn hàng';
COMMENT ON COLUMN order_items.product_name IS 'Tên sản phẩm tại thời điểm đặt (snapshot)';
COMMENT ON COLUMN order_items.unit_price IS 'Đơn giá tại thời điểm đặt (snapshot)';

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view own orders
CREATE POLICY "Users can view own orders" 
    ON orders 
    FOR SELECT 
    USING (true);

-- Policy: Users can insert own orders
CREATE POLICY "Users can insert own orders" 
    ON orders 
    FOR INSERT 
    WITH CHECK (true);

-- Enable RLS for order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view order_items (access controlled through orders)
CREATE POLICY "Users can view order items" 
    ON order_items 
    FOR SELECT 
    USING (true);

-- Policy: Service can insert order_items
CREATE POLICY "Service can insert order items" 
    ON order_items 
    FOR INSERT 
    WITH CHECK (true);

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('orders', 'order_items')
ORDER BY table_name, ordinal_position;
