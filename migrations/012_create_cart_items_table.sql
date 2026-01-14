-- Migration: 012_create_cart_items_table.sql
-- Description: Create cart_items table for shopping cart functionality
-- Sprint: 4 - Shopping Cart & Orders
-- User Story: US-07

-- ============================================
-- TABLE: cart_items
-- ============================================
-- Lưu trữ giỏ hàng của user
-- Mỗi user chỉ có 1 record cho mỗi product (UPSERT khi thêm)
-- ============================================

CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Keys
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    
    -- Cart data
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Unique constraint: Mỗi user chỉ có 1 item cho mỗi product
    CONSTRAINT uq_cart_user_product UNIQUE (user_id, product_id)
);

-- ============================================
-- INDEXES
-- ============================================

-- Index cho fast lookup theo user_id (lấy giỏ hàng của user)
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id 
    ON cart_items(user_id);

-- Index cho fast lookup theo product_id
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id 
    ON cart_items(product_id);

-- ============================================
-- TRIGGER: Auto update updated_at
-- ============================================

DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
CREATE TRIGGER update_cart_items_updated_at
    BEFORE UPDATE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE cart_items IS 'Giỏ hàng của users - mỗi user có 1 giỏ hàng';
COMMENT ON COLUMN cart_items.user_id IS 'ID của user sở hữu giỏ hàng';
COMMENT ON COLUMN cart_items.product_id IS 'ID của sản phẩm trong giỏ';
COMMENT ON COLUMN cart_items.quantity IS 'Số lượng sản phẩm (phải > 0)';

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Policy: User chỉ có thể xem giỏ hàng của chính mình
CREATE POLICY "Users can view own cart" 
    ON cart_items 
    FOR SELECT 
    USING (true);

-- Policy: User có thể thêm vào giỏ của chính mình
CREATE POLICY "Users can insert own cart items" 
    ON cart_items 
    FOR INSERT 
    WITH CHECK (true);

-- Policy: User có thể update giỏ của chính mình
CREATE POLICY "Users can update own cart items" 
    ON cart_items 
    FOR UPDATE 
    USING (true);

-- Policy: User có thể xóa khỏi giỏ của chính mình
CREATE POLICY "Users can delete own cart items" 
    ON cart_items 
    FOR DELETE 
    USING (true);

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'cart_items'
ORDER BY ordinal_position;
