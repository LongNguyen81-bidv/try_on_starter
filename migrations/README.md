# Database Migrations

Thư mục này chứa các migration scripts cho database Supabase.

## Cấu trúc

### Sprint 1
- `001_create_profiles_table.sql`: Tạo bảng profiles với indexes và triggers
- `002_create_avatars_storage.sql`: Hướng dẫn tạo storage bucket và policies cho avatars
- `003_seed_profiles_data.sql`: Dữ liệu mẫu cho bảng profiles
- `004_add_role_to_profiles.sql`: Thêm cột role vào bảng profiles (Sprint 2 - Task 1)
- `005_set_admin_user.sql`: Set một user cụ thể làm Admin (Sprint 2 - Task 1)

### Sprint 2
- `006_create_categories_table.sql`: Tạo bảng categories cho quản lý danh mục sản phẩm
- `007_create_products_table.sql`: Tạo bảng products với foreign key đến categories
- `008_create_products_storage.sql`: Hướng dẫn tạo storage bucket và policies cho products
- `009_setup_products_rls.sql`: Thiết lập Row Level Security policies cho categories và products

## Cách chạy migrations

### Trên Supabase Dashboard

1. Vào Supabase Dashboard > SQL Editor
2. Mở từng file migration theo thứ tự
3. Copy và paste nội dung vào SQL Editor
4. Click "Run" để thực thi

### Thứ tự chạy

#### Sprint 1
1. Chạy `001_create_profiles_table.sql` trước
2. Tạo storage bucket theo hướng dẫn trong `002_create_avatars_storage.sql`
3. Chạy `003_seed_profiles_data.sql` để thêm dữ liệu mẫu (tùy chọn, chỉ cho development)
4. Chạy `004_add_role_to_profiles.sql` để thêm cột role
5. Chạy `005_set_admin_user.sql` để set admin user (cần thay email phù hợp)

#### Sprint 2
1. Chạy `006_create_categories_table.sql` để tạo bảng categories
2. Chạy `007_create_products_table.sql` để tạo bảng products
3. Tạo storage bucket theo hướng dẫn trong `008_create_products_storage.sql`
4. Chạy `009_setup_products_rls.sql` để thiết lập RLS policies (lưu ý: với JWT tự quản lý, RLS sẽ không hoạt động trực tiếp, cần kiểm tra role ở Backend)

## Utility Scripts

### Generate Password Hash

Trước khi chạy seed data, cần generate password hash thực tế:

```bash
node migrations/generate_password_hash.js [password]
```

Mặc định password là "Password123!". Copy hash được generate và thay thế các giá trị `password_hash` trong file `003_seed_profiles_data.sql`.

### Set Admin User

Để set một user thành admin, có 2 cách:

#### Cách 1: Sử dụng script trong thư mục backend (Khuyến nghị)

Chạy script từ thư mục `backend`:

```bash
cd backend
node set_admin_user.mjs [email]
```

Ví dụ:
```bash
cd backend
node set_admin_user.mjs user@example.com
```

#### Cách 2: Sử dụng script trong thư mục migrations

Chạy script từ thư mục gốc của dự án:

```bash
node migrations/set_admin_user.mjs [email]
```

Ví dụ:
```bash
node migrations/set_admin_user.mjs user@example.com
```

**Lưu ý:** 
- Script sẽ tự động tìm file `.env` trong thư mục `backend`
- User cần đăng xuất và đăng nhập lại để JWT token được cập nhật với role mới
- Nếu gặp lỗi "Cannot find module", đảm bảo đã chạy `npm install` trong thư mục `backend`

## Lưu ý

- Migration `002` và `008` cần thực hiện thủ công trên Supabase Dashboard vì storage operations không thể thực hiện qua SQL
- Password hash trong `003_seed_profiles_data.sql` là ví dụ, cần thay thế bằng hash thực tế (sử dụng script `generate_password_hash.js`)
- Chỉ chạy seed data trong môi trường development, không chạy trên production
- RLS policies trong `009_setup_products_rls.sql` sẽ không hoạt động trực tiếp với JWT tự quản lý. Backend phải kiểm tra role ở middleware (`verifyAdmin`). RLS chỉ là lớp bảo vệ thêm nếu sau này migrate sang Supabase Auth
- Storage bucket `products` nên được set Public = ON để frontend có thể đọc ảnh công khai, nhưng chỉ Admin mới upload được (qua Backend với service role key)

