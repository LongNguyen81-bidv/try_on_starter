-- Migration: Seed profiles data
-- Description: Thêm dữ liệu mẫu cho bảng profiles (Sprint 1)
-- Created: 2025-12-16
-- Note: Password hash được tạo từ bcrypt với cost 10
--       Mật khẩu mặc định cho tất cả user mẫu: "Password123!"

-- Xóa dữ liệu cũ nếu có (chỉ dùng cho development)
-- DELETE FROM profiles WHERE email IN ('user1@example.com', 'user2@example.com', 'admin@example.com');

-- Insert dữ liệu mẫu
-- User 1: User đã đăng ký, chưa cập nhật profile
INSERT INTO profiles (email, password_hash, full_name, height, weight, avatar_url)
VALUES (
    'user1@example.com',
    '$2a$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', -- Password123!
    NULL,
    NULL,
    NULL,
    NULL
) ON CONFLICT (email) DO NOTHING;

-- User 2: User đã đăng ký và đã cập nhật đầy đủ profile
INSERT INTO profiles (email, password_hash, full_name, height, weight, avatar_url)
VALUES (
    'user2@example.com',
    '$2a$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', -- Password123!
    'Nguyễn Văn A',
    170.50,
    65.00,
    'https://your-project.supabase.co/storage/v1/object/public/avatars/user2/avatar.jpg'
) ON CONFLICT (email) DO NOTHING;

-- User 3: User đã đăng ký, chỉ cập nhật một phần thông tin
INSERT INTO profiles (email, password_hash, full_name, height, weight, avatar_url)
VALUES (
    'user3@example.com',
    '$2a$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', -- Password123!
    'Trần Thị B',
    165.00,
    NULL,
    NULL
) ON CONFLICT (email) DO NOTHING;

-- ============================================
-- LƯU Ý
-- ============================================
-- Password hash trên là ví dụ, cần thay thế bằng hash thực tế
-- 
-- Để tạo password hash thực tế, chạy script:
--   node migrations/generate_password_hash.js [password]
--   (Mặc định password: "Password123!")
--
-- Hoặc sử dụng bcrypt trực tiếp:
--   node -e "import('bcryptjs').then(b => b.default.hash('Password123!', 10).then(console.log));"
--
-- Sau khi có hash thực tế, thay thế các giá trị password_hash trong script này

