-- Migration: Setup Row Level Security for products and categories
-- Description: Thiết lập RLS policies cho bảng categories và products (Sprint 2 - Task 2)
-- Created: 2025-12-16
-- Note: Project này dùng JWT tự quản lý, không dùng Supabase Auth
--       RLS policies sẽ dựa trên role trong JWT token (qua custom claims)

-- ============================================
-- RLS POLICIES CHO CATEGORIES
-- ============================================

-- Bật RLS cho bảng categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policy: Public có thể xem tất cả categories
CREATE POLICY "Public can view categories"
ON categories
FOR SELECT
TO public
USING (true);

-- Policy: Chỉ Admin mới insert được categories
-- Lưu ý: Với JWT tự quản lý, cần kiểm tra role ở Backend middleware
-- Policy này chỉ là lớp bảo vệ thêm, Backend vẫn phải verify role
CREATE POLICY "Admin can insert categories"
ON categories
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id::text = (auth.uid())::text
        AND role = 'admin'
    )
);

-- Policy: Chỉ Admin mới update được categories
CREATE POLICY "Admin can update categories"
ON categories
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id::text = (auth.uid())::text
        AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id::text = (auth.uid())::text
        AND role = 'admin'
    )
);

-- Policy: Chỉ Admin mới delete được categories
CREATE POLICY "Admin can delete categories"
ON categories
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id::text = (auth.uid())::text
        AND role = 'admin'
    )
);

-- ============================================
-- RLS POLICIES CHO PRODUCTS
-- ============================================

-- Bật RLS cho bảng products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Public có thể xem tất cả products
CREATE POLICY "Public can view products"
ON products
FOR SELECT
TO public
USING (true);

-- Policy: Chỉ Admin mới insert được products
CREATE POLICY "Admin can insert products"
ON products
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id::text = (auth.uid())::text
        AND role = 'admin'
    )
);

-- Policy: Chỉ Admin mới update được products
CREATE POLICY "Admin can update products"
ON products
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id::text = (auth.uid())::text
        AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id::text = (auth.uid())::text
        AND role = 'admin'
    )
);

-- Policy: Chỉ Admin mới delete được products
CREATE POLICY "Admin can delete products"
ON products
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id::text = (auth.uid())::text
        AND role = 'admin'
    )
);

-- ============================================
-- LƯU Ý QUAN TRỌNG
-- ============================================
-- Vì project dùng JWT tự quản lý (không dùng Supabase Auth):
-- 1. Các policies trên sẽ KHÔNG hoạt động với JWT tự quản lý
-- 2. Backend PHẢI kiểm tra role ở middleware (verifyAdmin)
-- 3. RLS policies này chỉ là lớp bảo vệ thêm nếu sau này migrate sang Supabase Auth
-- 4. Để test RLS, có thể tạm thời tắt RLS: ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
-- 5. Hoặc sử dụng service role key để bypass RLS khi cần

