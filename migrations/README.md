# Database Migrations

Thư mục này chứa các migration scripts cho database Supabase.

## Cấu trúc

- `001_create_profiles_table.sql`: Tạo bảng profiles với indexes và triggers
- `002_create_avatars_storage.sql`: Hướng dẫn tạo storage bucket và policies cho avatars
- `003_seed_profiles_data.sql`: Dữ liệu mẫu cho bảng profiles

## Cách chạy migrations

### Trên Supabase Dashboard

1. Vào Supabase Dashboard > SQL Editor
2. Mở từng file migration theo thứ tự
3. Copy và paste nội dung vào SQL Editor
4. Click "Run" để thực thi

### Thứ tự chạy

1. Chạy `001_create_profiles_table.sql` trước
2. Tạo storage bucket theo hướng dẫn trong `002_create_avatars_storage.sql`
3. Chạy `003_seed_profiles_data.sql` để thêm dữ liệu mẫu (tùy chọn, chỉ cho development)

## Generate Password Hash

Trước khi chạy seed data, cần generate password hash thực tế:

```bash
node migrations/generate_password_hash.js [password]
```

Mặc định password là "Password123!". Copy hash được generate và thay thế các giá trị `password_hash` trong file `003_seed_profiles_data.sql`.

## Lưu ý

- Migration `002` cần thực hiện thủ công trên Supabase Dashboard vì storage operations không thể thực hiện qua SQL
- Password hash trong `003_seed_profiles_data.sql` là ví dụ, cần thay thế bằng hash thực tế (sử dụng script `generate_password_hash.js`)
- Chỉ chạy seed data trong môi trường development, không chạy trên production

