-- Migration: Set admin user
-- Description: Thiết lập một user cụ thể làm Admin (Sprint 2 - Task 1)
-- Created: 2025-12-16
-- Usage: Thay đổi email dưới đây thành email của user muốn set làm admin

-- Cập nhật role thành 'admin' cho user có email cụ thể
-- LƯU Ý: Thay đổi email dưới đây thành email của user bạn muốn set làm admin
UPDATE profiles
SET role = 'admin'
WHERE email = 'longnh2bidv@gmail.com'; -- Thay đổi email này

-- Kiểm tra kết quả (optional, có thể comment lại sau khi chạy)
-- SELECT id, email, role FROM profiles WHERE role = 'admin';

