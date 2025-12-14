# Sprint 1: Project Setup & Authentication
## Mục tiêu Sprint
Thiết lập project và xây dựng các tính năng authentication cơ bản
User Stories: US-01, US-02
## Tasks
### 1. Thiết lập Project (Priority: High)
**Mô tả:** Khởi tạo và cấu hình project
**Công việc:**
- [ ] Khởi tạo project backend với NodeJS/ExpressJS
- [ ] Cấu hình ESLint, Prettier cho backend
- [ ] Khởi tạo project frontend với ReactJS/Vite
- [ ] Cấu hình ESLint, Prettier cho frontend
- [ ] Cấu hình JWT cho authentication
- [ ] Setup environment variables (.env.example)
- [ ] Tạo cấu trúc thư mục cho cả frontend và backend
- [ ] Setup CORS cho API
- [ ] Tạo file README với hướng dẫn setup & run project

**Acceptance Criteria:**
- Project chạy được trên local
- Environment variables được cấu hình đúng
- File README được tạo và chứa hướng dẫn setup & run project

---

### 2. Tạo Landing Page (Priority: Medium)
**Mô tả:** Xây dựng trang landing page cho ứng dụng

**Công việc:**
- [ ] Thiết kế layout landing page
- [ ] Tạo header với logo và navigation
- [ ] Tạo hero section
- [ ] Tạo features section
- [ ] Tạo footer
- [ ] Responsive design cho mobile và tablet
- [ ] Thêm routing cho landing page

**Acceptance Criteria:**
- Landing page hiển thị đầy đủ các sections
- Responsive trên các thiết bị
- Navigation hoạt động
- UI/UX thân thiện, đẹp mắt và fashionista

---

### 3. Thiết kế Database (Priority: High)
**Mô tả:** Thiết kế schema cho sprint 1 (auth/profile)

**Công việc:**
- [ ] Xác định bảng cho các tính năng trong sprint 1 và các cột cần thiết
- [ ] Thiết lập indexes và constraints
- [ ] Viết script/migration SQL trên Supabase
- [ ] Thiết kế storage cho các tính năng trong sprint 1 trên Supabase
- [ ] Thiết kế script/migration cho storage

**Acceptance Criteria:**
- Schema `profiles` được tạo trên Supabase, có unique email
- Có sẵn dữ liệu mẫu cho bảng `profiles` ứng với user stories trong sprint 1
- Storage được tạo trên Supabase cho avatar
- Lưu được schema vào thư mục /design, scripts vào thư mục /migrations

---

### 4. Thiết kế Flow (Priority: High)
**Mô tả:** Xác định luồng auth/profile cho sprint 1

**Công việc:**
- [ ] Phác thảo flow đăng ký (register)
- [ ] Phác thảo flow đăng nhập (login + JWT)
- [ ] Phác thảo flow lấy/cập nhật profile và upload avatar (Storage)
- [ ] Phác thảo flow logout và bảo vệ routes
- [ ] Lưu lại sơ đồ/ngắn gọn trong thư mục thiết kế

**Acceptance Criteria:**
- Có tài liệu flow rõ ràng cho register, login, profile (get/update), upload avatar, logout
- Flow được review và chốt trước khi dev tính năng

---

### 5. Tạo tính năng Đăng ký (Priority: High)
**Mô tả:** Xây dựng chức năng đăng ký tài khoản mới dựa trên flow đã chốt

**Công việc:**
- [ ] Tạo API endpoint đăng ký (POST /api/auth/register)
- [ ] Validate dữ liệu đầu vào (email, password, etc.)
- [ ] Hash password trước khi lưu
- [ ] Tạo UI form đăng ký
- [ ] Kết nối frontend với API đăng ký
- [ ] Xử lý error và success messages
- [ ] Email validation và unique check

**Acceptance Criteria:**
- User có thể đăng ký tài khoản mới
- Password được hash an toàn
- Validation hoạt động đúng
- Error handling đầy đủ
- Không cho phép email trùng lặp

---

### 6. Tạo tính năng Đăng nhập (Priority: High)
**Mô tả:** Xây dựng chức năng đăng nhập

**Công việc:**
- [ ] Tạo API endpoint đăng nhập (POST /api/auth/login)
- [ ] Verify email và password
- [ ] Generate JWT token khi đăng nhập thành công
- [ ] Tạo UI form đăng nhập
- [ ] Kết nối frontend với API đăng nhập
- [ ] Lưu JWT token (localStorage/cookie)
- [ ] Implement logout functionality
- [ ] Protected routes setup
- [ ] Xử lý error messages

**Acceptance Criteria:**
- User có thể đăng nhập với email/password
- JWT token được tạo và lưu trữ
- Redirect sau khi đăng nhập thành công
- Logout hoạt động đúng
- Protected routes chỉ truy cập khi đã login

---

### 7. Tạo tính năng Cập nhật Hồ sơ (Priority: Medium)
**Mô tả:** Cho phép user cập nhật thông tin cá nhân

**Công việc:**
- [ ] Tạo API endpoint lấy thông tin user (GET /api/user/profile)
- [ ] Tạo API endpoint cập nhật profile (PUT /api/user/profile)
- [ ] Implement JWT verification middleware
- [ ] Tạo UI profile page
- [ ] Form cập nhật thông tin (name, email, phone, etc.)
- [ ] Upload avatar (sử dụng Supabase Storage)
- [ ] Validate dữ liệu cập nhật
- [ ] Xử lý upload file
- [ ] Update UI sau khi save thành công

**Acceptance Criteria:**
- User có thể xem thông tin profile
- User có thể cập nhật thông tin
- Avatar upload hoạt động với Supabase Storage
- Validation đầy đủ
- Chỉ user đã login mới truy cập được
- UI phản hồi khi save thành công/thất bại

## Definition of Done
- Code được review
- Unit tests passed (nếu có)
- Functionality tested trên môi trường local
- Documentation cập nhật
- Code được merge vào branch chính

## Notes
- Ưu tiên hoàn thành Task 1 trước để các task khác có thể triển khai
- Task 3 và 4 cần hoàn thành trước Task 5
- Tập trung vào security cho authentication features