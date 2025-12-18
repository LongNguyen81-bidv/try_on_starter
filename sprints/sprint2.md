# Sprint 2: Inventory Management & Admin Dashboard

## Mục tiêu Sprint
Xây dựng hệ thống quản lý kho hàng (Danh mục & Sản phẩm) và thiết lập quyền quản trị viên (Admin) để chuẩn bị dữ liệu cho phòng thử đồ.
User Stories: US-03, US-04

## Tasks

### 1. Nâng cấp Auth & Phân quyền (Priority: High)
**Mô tả:** Bổ sung cơ chế Role-based Access Control (RBAC) để phân biệt Admin và User.

**Công việc:**
- [ ] Cập nhật bảng `profiles`: thêm cột `role` (text/enum: 'user' | 'admin', default: 'user')
- [ ] Tạo script migration để set 1 user cụ thể làm Admin
- [ ] Cập nhật logic Login: đính kèm thông tin `role` vào JWT Token
- [ ] Tạo Middleware `verifyAdmin` trên Backend
- [ ] Tạo Component `AdminRoute` (Guard) trên Frontend để bảo vệ các trang quản trị
- [ ] Cập nhật Sidebar/Header: hiển thị link Admin Dashboard nếu user là admin

**Acceptance Criteria:**
- Token JWT giải mã ra phải có field `role`
- User thường truy cập API admin bị trả về lỗi 403 Forbidden
- User thường truy cập URL `/admin` bị redirect về trang chủ
- Admin truy cập được Dashboard

---

### 2. Thiết kế Database Kho hàng (Priority: High)
**Mô tả:** Thiết kế schema cho Danh mục và Sản phẩm trên Supabase

**Công việc:**
- [ ] Thiết kế bảng `categories` (id, name, slug, description, created_at)
- [ ] Thiết kế bảng `products` (id, category_id, name, price, description, image_url, created_at)
- [ ] Thiết lập Foreign Key: `products.category_id` references `categories.id`
- [ ] Tạo Storage Bucket `products` trên Supabase (Public access cho read, Admin access cho write)
- [ ] Viết migration scripts SQL
- [ ] Thiết lập Row Level Security (RLS) policies: Public được xem, chỉ Admin được sửa/xóa

**Acceptance Criteria:**
- Schema được tạo thành công trên Supabase
- RLS policies hoạt động đúng (User thường không thể insert vào bảng products)
- Storage bucket sẵn sàng cho việc upload ảnh sản phẩm

---

### 3. API Quản lý Danh mục (Priority: Medium)
**Mô tả:** Xây dựng API CRUD cho Category (US-03)

**Công việc:**
- [ ] API Get Categories (GET /api/categories) - Public
- [ ] API Create Category (POST /api/admin/categories) - Admin only
- [ ] API Update Category (PUT /api/admin/categories/:id) - Admin only
- [ ] API Delete Category (DELETE /api/admin/categories/:id) - Admin only
- [ ] Validate dữ liệu đầu vào (tên không được rỗng)

**Acceptance Criteria:**
- Admin có thể thêm/sửa/xóa danh mục (Áo thun, Váy, Quần Jeans)
- API trả về danh sách danh mục chuẩn JSON
- Không cho phép xóa danh mục nếu đang có sản phẩm (ràng buộc FK)

---

### 4. API Quản lý Sản phẩm (Priority: High)
**Mô tả:** Xây dựng API CRUD cho Product và xử lý upload ảnh (US-04)

**Công việc:**
- [ ] API Get Products (GET /api/products) - Public, hỗ trợ filter theo `category_id`
- [ ] API Get Product Detail (GET /api/products/:id) - Public
- [ ] API Create Product (POST /api/admin/products) - Admin only
- [ ] API Update Product (PUT /api/admin/products/:id) - Admin only
- [ ] API Delete Product (DELETE /api/admin/products/:id) - Admin only
- [ ] Tích hợp Supabase Storage để upload ảnh sản phẩm (ảnh flat lay)
- [ ] Xử lý xóa ảnh trong Storage khi xóa sản phẩm trong DB

**Acceptance Criteria:**
- Admin thêm được sản phẩm với đầy đủ thông tin: Tên, Giá, Loại, Ảnh
- Ảnh sản phẩm được upload thành công và trả về URL hiển thị được
- List products hỗ trợ phân trang và lọc theo category

---

### 5. Frontend - Admin Layout & Dashboard (Priority: Low)
**Mô tả:** Xây dựng khung giao diện quản trị

**Công việc:**
- [ ] Tạo Layout riêng cho Admin (Sidebar + Content area)
- [ ] Thiết kế Sidebar với các menu: Dashboard, Quản lý Danh mục, Quản lý Sản phẩm
- [ ] Tạo trang Dashboard Home (thống kê đơn giản hoặc welcome screen)
- [ ] Responsive cho Admin Layout (ưu tiên Desktop)

**Acceptance Criteria:**
- Giao diện Admin tách biệt, clean và chuyên nghiệp
- Navigation hoạt động mượt mà giữa các trang admin
- Active state hiển thị đúng trên menu

---

### 6. Frontend - UI Quản lý Danh mục (Priority: Medium)
**Mô tả:** Giao diện quản lý danh mục cho Admin (US-03)

**Công việc:**
- [ ] Hiển thị danh sách Categories (Table)
- [ ] Modal/Form thêm mới Category
- [ ] Chức năng Edit Category
- [ ] Chức năng Delete Category (kèm confirm dialog)
- [ ] Toast notification khi thao tác thành công/thất bại

**Acceptance Criteria:**
- Admin thêm được danh mục "Áo thun", "Váy", "Quần Jeans"
- Danh sách cập nhật ngay sau khi thêm/sửa/xóa mà không cần F5

---

### 7. Frontend - UI Quản lý Sản phẩm (Priority: High)
**Mô tả:** Giao diện quản lý sản phẩm cho Admin (US-04)

**Công việc:**
- [ ] Hiển thị danh sách Products (Table có thumbnail ảnh, giá, category)
- [ ] Form thêm/sửa sản phẩm:
    - Input text: Tên, Mô tả
    - Input number: Giá
    - Select box: Chọn Category (load từ API)
    - File upload: Chọn ảnh từ máy tính (Preview ảnh trước khi upload)
- [ ] Validate form (bắt buộc có ảnh và giá > 0)
- [ ] Loading state khi đang upload ảnh

**Acceptance Criteria:**
- Admin upload được ảnh sản phẩm trải phẳng (flat lay)
- Hiển thị đúng danh sách sản phẩm đã thêm
- Form dễ sử dụng, validation rõ ràng

## Definition of Done
- Code được review và merge vào branch chính
- Database migration đã chạy trên môi trường dev
- Đã có ít nhất 1 tài khoản Admin hoạt động
- Đã nhập liệu mẫu: Ít nhất 3 danh mục và 10 sản phẩm (có ảnh thật) để phục vụ test Sprint 3
- Unit tests (nếu có) passed
- Không còn lỗi critical/high liên quan đến Auth hoặc CRUD

## Notes
- **Lưu ý về ảnh:** Ở sprint này, Admin cần nhập ảnh sản phẩm dạng "trải phẳng" (flat lay) hoặc ảnh chụp rõ ràng trên nền trơn. Đây là dữ liệu quan trọng để AI thực hiện việc ghép đồ (Virtual Try-on) ở các Sprint sau.
- **Bảo mật:** Kiểm tra kỹ quyền truy cập Storage, đảm bảo user thường không thể ghi đè ảnh sản phẩm.