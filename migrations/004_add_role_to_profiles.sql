-- Migration: Add role column to profiles table
-- Description: Thêm cột role để phân quyền Admin và User (Sprint 2 - Task 1)
-- Created: 2025-12-16

-- Thêm cột role vào bảng profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Tạo index cho role để tối ưu query
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Thêm comment cho cột role
COMMENT ON COLUMN profiles.role IS 'Vai trò người dùng: user (mặc định) hoặc admin';

