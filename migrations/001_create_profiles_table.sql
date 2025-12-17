-- Migration: Create profiles table
-- Description: Tạo bảng profiles cho authentication và profile management (Sprint 1)
-- Created: 2025-12-16

-- Tạo bảng profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    height NUMERIC(5,2) CHECK (height >= 100 AND height <= 250),
    weight NUMERIC(5,2) CHECK (weight >= 30 AND weight <= 250),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tạo indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Tạo function để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tạo trigger để tự động cập nhật updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Thêm comment cho bảng và các cột quan trọng
COMMENT ON TABLE profiles IS 'Bảng lưu trữ thông tin người dùng, thay thế bảng users mặc định của Supabase';
COMMENT ON COLUMN profiles.email IS 'Email đăng nhập, phải unique và lowercase';
COMMENT ON COLUMN profiles.password_hash IS 'Mật khẩu đã được hash bằng bcrypt';
COMMENT ON COLUMN profiles.height IS 'Chiều cao tính bằng cm (100-250)';
COMMENT ON COLUMN profiles.weight IS 'Cân nặng tính bằng kg (30-250)';
COMMENT ON COLUMN profiles.avatar_url IS 'URL đến ảnh avatar trong Supabase Storage bucket avatars';

