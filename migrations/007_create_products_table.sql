-- Migration: Create products table
-- Description: Tạo bảng products cho quản lý sản phẩm (Sprint 2 - Task 2)
-- Created: 2025-12-16

-- Tạo bảng products
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL,
    name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    description TEXT,
    image_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- Tạo indexes
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Tạo trigger để tự động cập nhật updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Thêm comment cho bảng và các cột quan trọng
COMMENT ON TABLE products IS 'Bảng lưu trữ thông tin sản phẩm';
COMMENT ON COLUMN products.category_id IS 'ID danh mục, tham chiếu đến bảng categories';
COMMENT ON COLUMN products.name IS 'Tên sản phẩm, không được rỗng';
COMMENT ON COLUMN products.price IS 'Giá sản phẩm (VNĐ), phải >= 0';
COMMENT ON COLUMN products.image_url IS 'URL đến ảnh sản phẩm flat-lay trong Supabase Storage bucket products';
COMMENT ON COLUMN products.description IS 'Mô tả sản phẩm (tùy chọn)';

