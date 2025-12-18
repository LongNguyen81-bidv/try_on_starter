# Database Schema Design

## Tổng quan
Schema này được thiết kế cho toàn bộ project, bao gồm:
- Sprint 1: Authentication và profile management (US-01, US-02)
- Sprint 2: Quản lý kho hàng (US-03, US-04)

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

## Bảng: categories (Sprint 2)

Bảng `categories` lưu trữ danh mục sản phẩm (Áo thun, Váy, Quần Jeans, ...).

### Cấu trúc bảng

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|--------------|-----------|-------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Định danh duy nhất của category |
| name | TEXT | NOT NULL, UNIQUE | Tên danh mục, phải unique |
| slug | TEXT | NOT NULL, UNIQUE | Slug dùng cho URL (lowercase, không dấu, nối bằng gạch ngang) |
| description | TEXT | NULL | Mô tả danh mục (tùy chọn) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Thời gian tạo |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Thời gian cập nhật cuối |

### Indexes

- `idx_categories_name`: Index trên cột `name` để tăng tốc độ tìm kiếm
- `idx_categories_slug`: Index trên cột `slug` để tối ưu truy vấn theo URL
- `idx_categories_created_at`: Index trên cột `created_at` để tối ưu truy vấn theo thời gian

### Constraints

- `categories_name_key`: Unique constraint trên `name`
- `categories_slug_key`: Unique constraint trên `slug`

### Triggers

- `update_categories_updated_at`: Trigger tự động cập nhật `updated_at` khi có thay đổi dữ liệu

## Bảng: products (Sprint 2)

Bảng `products` lưu trữ thông tin sản phẩm.

### Cấu trúc bảng

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|--------------|-----------|-------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Định danh duy nhất của product |
| category_id | UUID | NOT NULL, FOREIGN KEY | ID danh mục, tham chiếu đến categories.id |
| name | TEXT | NOT NULL | Tên sản phẩm |
| price | NUMERIC(10,2) | NOT NULL, CHECK (price >= 0) | Giá sản phẩm (VNĐ) |
| description | TEXT | NULL | Mô tả sản phẩm (tùy chọn) |
| image_url | TEXT | NOT NULL | URL đến ảnh sản phẩm flat-lay trong Supabase Storage |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Thời gian tạo |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Thời gian cập nhật cuối |

### Indexes

- `idx_products_category_id`: Index trên cột `category_id` để tối ưu join và filter
- `idx_products_name`: Index trên cột `name` để tăng tốc độ tìm kiếm
- `idx_products_price`: Index trên cột `price` để tối ưu truy vấn theo giá
- `idx_products_created_at`: Index trên cột `created_at` để tối ưu truy vấn theo thời gian

### Constraints

- `fk_products_category`: Foreign key constraint, `category_id` references `categories.id` ON DELETE RESTRICT
- `products_price_check`: Check constraint đảm bảo price >= 0

### Triggers

- `update_products_updated_at`: Trigger tự động cập nhật `updated_at` khi có thay đổi dữ liệu

## Storage: products (Sprint 2)

Bucket lưu trữ ảnh sản phẩm dạng flat-lay (trải phẳng).

### Cấu hình

- **Bucket name**: `products`
- **Public**: `true` (public access for read)
- **File size limit**: 5MB
- **Allowed MIME types**: image/jpeg, image/jpg, image/png

### Cấu trúc thư mục

```
products/
  └── {product_id}/
      └── image.{ext}
```

Mỗi sản phẩm có một thư mục riêng với product_id làm tên thư mục, chứa file ảnh sản phẩm.

### Policies (Row Level Security)

- **Read policy**: Public có thể đọc tất cả ảnh sản phẩm
- **Upload policy**: Chỉ Admin mới upload được (qua backend với service role key)
- **Delete policy**: Chỉ Admin mới xóa được (qua backend với service role key)

## Quan hệ dữ liệu

- `profiles.id` → `avatars/{user_id}/`: Một profile có một avatar (1:1)
- `categories.id` → `products.category_id`: Một category có nhiều products (1:N)
- `products.id` → `products/{product_id}/`: Một product có một ảnh (1:1)

## Row Level Security (RLS)

### Categories
- **SELECT**: Public (mọi người có thể xem)
- **INSERT/UPDATE/DELETE**: Chỉ Admin (kiểm tra qua Backend middleware)

### Products
- **SELECT**: Public (mọi người có thể xem)
- **INSERT/UPDATE/DELETE**: Chỉ Admin (kiểm tra qua Backend middleware)

**Lưu ý**: Vì project dùng JWT tự quản lý (không dùng Supabase Auth), RLS policies sẽ không hoạt động trực tiếp. Backend phải kiểm tra role ở middleware (`verifyAdmin`). RLS policies chỉ là lớp bảo vệ thêm nếu sau này migrate sang Supabase Auth.

## Ghi chú

- Không sử dụng bảng `auth.users` mặc định của Supabase
- Email được lưu ở dạng lowercase để đảm bảo tính nhất quán
- Password luôn được hash bằng bcrypt trước khi lưu
- Avatar URL và Product Image URL được lưu dạng full URL từ Supabase Storage
- Timestamps sử dụng TIMESTAMPTZ để hỗ trợ timezone
- Foreign key `products.category_id` có ON DELETE RESTRICT để ngăn xóa category đang có sản phẩm

