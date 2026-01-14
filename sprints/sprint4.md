# Sprint 4: Shopping Cart & Orders

## Mục tiêu Sprint
Hoàn thành luồng thương mại điện tử cơ bản với tính năng giỏ hàng và quản lý đơn hàng.
User Stories: US-07, US-08, US-09

## Tasks

### 1. Thiết kế Database Schema (Priority: High)
**Mô tả:** Tạo schema cho giỏ hàng và đơn hàng trên Supabase

**Công việc:**
- [x] Thiết kế bảng `cart_items` (id, user_id, product_id, quantity, timestamps)
- [x] Thiết kế bảng `orders` (id, user_id, status, total_amount, shipping_address, timestamps)
- [x] Thiết kế bảng `order_items` (id, order_id, product_id, product_name, quantity, unit_price)
- [x] Thiết lập Foreign Keys và Unique constraints
- [x] Viết migration scripts SQL với RLS policies

**Acceptance Criteria:**
- Schema được tạo thành công trên Supabase
- RLS policies hoạt động đúng (User chỉ xem được giỏ/đơn của mình)
- Unique constraint `(user_id, product_id)` trên `cart_items`

---

### 2. Backend API - Cart Service (Priority: High)
**Mô tả:** Xây dựng API CRUD cho giỏ hàng

**Công việc:**
- [x] API Get Cart (GET /api/cart) - Protected
- [x] API Add to Cart (POST /api/cart) - Protected
- [x] API Update Quantity (PUT /api/cart/:productId) - Protected
- [x] API Remove Item (DELETE /api/cart/:productId) - Protected
- [x] API Clear Cart (DELETE /api/cart) - Protected
- [x] Validate sản phẩm tồn tại trước khi thêm
- [x] Tính tổng tiền giỏ hàng

**Acceptance Criteria:**
- User có thể thêm/sửa/xóa sản phẩm trong giỏ
- API trả về danh sách sản phẩm với thông tin chi tiết + tổng tiền
- Nếu thêm sản phẩm đã có, tự động cộng dồn số lượng

---

### 3. Backend API - Order Service (Priority: High)
**Mô tả:** Xây dựng API tạo và quản lý đơn hàng

**Công việc:**
- [x] API Checkout (POST /api/orders) - Protected, tạo đơn từ giỏ hàng
- [x] API Get My Orders (GET /api/orders) - Protected
- [x] API Get Order Detail (GET /api/orders/:id) - Protected
- [x] API Get All Orders (GET /api/orders/admin/list) - Admin only
- [x] API Update Status (PUT /api/orders/admin/:id) - Admin only
- [x] Logic: Checkout xong tự động clear giỏ hàng
- [x] Lưu snapshot giá tại thời điểm đặt hàng

**Acceptance Criteria:**
- User có thể checkout giỏ hàng → tạo đơn
- User xem được lịch sử đơn hàng của mình
- Admin xem được tất cả đơn và đổi trạng thái

---

### 4. Frontend - Nút "Thêm vào giỏ" (Priority: High) - US-07
**Mô tả:** Thêm nút mua hàng trực tiếp từ trang thử đồ

**Công việc:**
- [x] Thêm nút "Thêm vào giỏ" trên FittingRoomPage (sau phần giá)
- [x] Tích hợp với Cart API
- [x] Hiển thị Loading state khi đang thêm
- [x] Hiển thị Toast notification thành công/thất bại
- [x] Thêm nút "Xem giỏ hàng" điều hướng đến CartPage

**Acceptance Criteria:**
- User bấm "Thêm vào giỏ" thấy toast "Đã thêm vào giỏ hàng!"
- Nút có gradient đẹp và animation hover
- Nếu lỗi, hiển thị thông báo lỗi rõ ràng

---

### 5. Frontend - Trang Giỏ hàng (Priority: High) - US-08
**Mô tả:** Xây dựng giao diện xem và quản lý giỏ hàng

**Công việc:**
- [x] Tạo trang `/cart` (Protected Route)
- [x] Hiển thị danh sách sản phẩm (ảnh, tên, giá, số lượng, subtotal)
- [x] Nút +/- điều chỉnh số lượng
- [x] Nút xóa từng item
- [x] Nút xóa toàn bộ giỏ
- [x] Hiển thị tổng tiền real-time
- [x] Modal checkout với form nhập địa chỉ/SĐT
- [x] Màn hình Order Success sau khi đặt hàng

**Acceptance Criteria:**
- Giỏ hàng hiển thị đúng sản phẩm + tổng tiền
- Thay đổi số lượng → tổng tiền cập nhật ngay
- Checkout thành công → giỏ trống + hiện thông báo

---

### 6. Frontend - Admin Orders Page (Priority: Medium) - US-09
**Mô tả:** Giao diện quản lý đơn hàng cho Admin

**Công việc:**
- [x] Tạo trang `/admin/orders`
- [x] Thêm menu "Đơn hàng" vào AdminLayout sidebar
- [x] Hiển thị dashboard thống kê đơn theo trạng thái
- [x] Bảng danh sách đơn (Mã, Khách, Tổng tiền, Trạng thái, Ngày tạo)
- [x] Filter đơn theo trạng thái
- [x] Dropdown đổi trạng thái inline
- [x] Modal xem chi tiết đơn hàng

**Acceptance Criteria:**
- Admin thấy được tất cả đơn hàng trong hệ thống
- Admin có thể lọc theo trạng thái (pending, confirmed, shipped...)
- Admin có thể đổi trạng thái đơn ngay tại bảng

---

### 7. Testing & Integration (Priority: Medium)
**Mô tả:** Kiểm tra tích hợp toàn bộ luồng

**Công việc:**
- [x] Verify backend code syntax
- [ ] Chạy migrations trên Supabase
- [ ] Test luồng: Thử đồ → Thêm giỏ → Checkout → Admin xem đơn
- [ ] Kiểm tra responsive trên mobile

**Acceptance Criteria:**
- Toàn bộ luồng hoạt động end-to-end
- Không có lỗi console trên browser

## Definition of Done
- Code được merge vào branch chính
- Database migration đã chạy trên Supabase
- User có thể thêm sản phẩm vào giỏ từ phòng thử đồ
- User có thể checkout và xem lịch sử đơn
- Admin có thể xem và quản lý tất cả đơn hàng
- Responsive trên mobile và desktop

## Notes
- **Giỏ hàng lưu server-side:** Để user có thể truy cập từ nhiều thiết bị
- **Snapshot giá:** Lưu giá tại thời điểm đặt để tránh thay đổi sau này
- **Status flow:** pending → confirmed → processing → shipped → delivered (hoặc cancelled)
