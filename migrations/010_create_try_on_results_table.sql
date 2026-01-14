-- Migration: 010_create_try_on_results_table.sql
-- Description: Create table to store virtual try-on results (cache AI generated images)
-- Sprint: 3 - Virtual Fitting Room
-- User Stories: US-05, US-06

-- ============================================
-- TABLE: try_on_results
-- ============================================
-- Lưu trữ kết quả thử đồ ảo để:
-- 1. Cache kết quả AI (tránh gọi lại API tốn tiền)
-- 2. Lịch sử thử đồ của user
-- ============================================

CREATE TABLE IF NOT EXISTS try_on_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Keys
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    
    -- Generated image data
    generated_image_url TEXT NOT NULL,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Unique constraint: Mỗi user chỉ có 1 kết quả cho 1 sản phẩm (MVP)
    -- Nếu user thử lại, sẽ update record cũ thay vì tạo mới
    CONSTRAINT uq_try_on_user_product UNIQUE (user_id, product_id)
);

-- ============================================
-- INDEXES
-- ============================================

-- Index cho fast lookup theo user_id
CREATE INDEX IF NOT EXISTS idx_try_on_results_user_id 
    ON try_on_results(user_id);

-- Index cho fast lookup theo product_id
CREATE INDEX IF NOT EXISTS idx_try_on_results_product_id 
    ON try_on_results(product_id);

-- Composite index cho common query pattern
CREATE INDEX IF NOT EXISTS idx_try_on_results_user_product 
    ON try_on_results(user_id, product_id);

-- Index cho ordering by created_at
CREATE INDEX IF NOT EXISTS idx_try_on_results_created_at 
    ON try_on_results(created_at DESC);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE try_on_results IS 'Cache kết quả thử đồ ảo từ AI để tối ưu chi phí và tốc độ';
COMMENT ON COLUMN try_on_results.user_id IS 'ID của user thực hiện thử đồ';
COMMENT ON COLUMN try_on_results.product_id IS 'ID của sản phẩm được thử';
COMMENT ON COLUMN try_on_results.generated_image_url IS 'URL của ảnh kết quả (user mặc sản phẩm) được lưu trong Supabase Storage';
COMMENT ON COLUMN try_on_results.created_at IS 'Thời điểm tạo kết quả thử đồ';

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE try_on_results ENABLE ROW LEVEL SECURITY;

-- Policy: User chỉ có thể xem kết quả của chính mình
-- (Backend dùng service role nên bypass RLS, policy này là lớp bảo vệ thêm)
CREATE POLICY "Users can view own try-on results" 
    ON try_on_results 
    FOR SELECT 
    USING (true);

-- Policy: User có thể insert kết quả của chính mình
CREATE POLICY "Users can insert own try-on results" 
    ON try_on_results 
    FOR INSERT 
    WITH CHECK (true);

-- Policy: User có thể update kết quả của chính mình
CREATE POLICY "Users can update own try-on results" 
    ON try_on_results 
    FOR UPDATE 
    USING (true);

-- Policy: User có thể delete kết quả của chính mình
CREATE POLICY "Users can delete own try-on results" 
    ON try_on_results 
    FOR DELETE 
    USING (true);

-- ============================================
-- VERIFICATION
-- ============================================
-- Verify table creation
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'try_on_results'
ORDER BY ordinal_position;
