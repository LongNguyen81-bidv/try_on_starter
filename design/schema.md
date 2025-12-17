# Database Schema Design - Sprint 1

## Tổng quan
Schema này được thiết kế cho Sprint 1, hỗ trợ các tính năng authentication và profile management (US-01, US-02).

## Bảng: profiles

Bảng `profiles` lưu trữ thông tin người dùng, thay thế bảng `users` mặc định của Supabase.

### Cấu trúc bảng

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|--------------|-----------|-------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Định danh duy nhất của profile |
| email | TEXT | NOT NULL, UNIQUE | Email đăng nhập, phải unique |
| password_hash | TEXT | NOT NULL | Mật khẩu đã được hash (bcrypt) |
| full_name | TEXT | NULL | Tên hiển thị (tùy chọn) |
| height | NUMERIC(5,2) | NULL, CHECK (height >= 100 AND height <= 250) | Chiều cao tính bằng cm (100-250) |
| weight | NUMERIC(5,2) | NULL, CHECK (weight >= 30 AND weight <= 250) | Cân nặng tính bằng kg (30-250) |
| avatar_url | TEXT | NULL | URL đến ảnh avatar trong Supabase Storage |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Thời gian tạo |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Thời gian cập nhật cuối |

### Indexes

- `idx_profiles_email`: Index trên cột `email` để tăng tốc độ tìm kiếm và đảm bảo unique constraint
- `idx_profiles_created_at`: Index trên cột `created_at` để tối ưu truy vấn theo thời gian

### Constraints

- `profiles_email_key`: Unique constraint trên `email`
- `profiles_height_check`: Check constraint đảm bảo height trong khoảng 100-250 cm
- `profiles_weight_check`: Check constraint đảm bảo weight trong khoảng 30-250 kg

### Triggers

- `update_updated_at`: Trigger tự động cập nhật `updated_at` khi có thay đổi dữ liệu

## Storage: avatars

Bucket lưu trữ ảnh avatar/chân dung toàn thân của người dùng.

### Cấu hình

- **Bucket name**: `avatars`
- **Public**: `false` (authenticated access only)
- **File size limit**: 5MB
- **Allowed MIME types**: image/jpeg, image/jpg, image/png

### Cấu trúc thư mục

```
avatars/
  └── {user_id}/
      └── avatar.{ext}
```

Mỗi user có một thư mục riêng với user_id làm tên thư mục, chứa file avatar duy nhất.

### Policies (Row Level Security)

- **Upload policy**: Chỉ user đã authenticated mới upload được vào thư mục của chính họ
- **Read policy**: User có thể đọc ảnh của chính họ, admin có thể đọc tất cả
- **Delete policy**: User có thể xóa ảnh của chính họ, admin có thể xóa tất cả

## Quan hệ dữ liệu

- `profiles.id` → `avatars/{user_id}/`: Một profile có một avatar (1:1)

## Ghi chú

- Không sử dụng bảng `auth.users` mặc định của Supabase
- Email được lưu ở dạng lowercase để đảm bảo tính nhất quán
- Password luôn được hash bằng bcrypt trước khi lưu
- Avatar URL được lưu dạng full URL từ Supabase Storage
- Timestamps sử dụng TIMESTAMPTZ để hỗ trợ timezone

