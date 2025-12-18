-- Migration: Create categories table
-- Description: Tạo bảng categories cho quản lý danh mục sản phẩm (Sprint 2 - Task 2)
-- Created: 2025-12-16

-- Tạo bảng categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tạo indexes
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_created_at ON categories(created_at);

-- Tạo trigger để tự động cập nhật updated_at
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Thêm comment cho bảng và các cột quan trọng
COMMENT ON TABLE categories IS 'Bảng lưu trữ danh mục sản phẩm (Áo thun, Váy, Quần Jeans, ...)';
COMMENT ON COLUMN categories.name IS 'Tên danh mục, phải unique và không được rỗng';
COMMENT ON COLUMN categories.slug IS 'Slug dùng cho URL, tự động tạo từ name (lowercase, không dấu, nối bằng gạch ngang)';
COMMENT ON COLUMN categories.description IS 'Mô tả danh mục (tùy chọn)';

