# Authentication & Profile Flows - Sprint 1

## Tổng quan
Tài liệu này mô tả các luồng xử lý cho authentication và profile management trong Sprint 1, hỗ trợ US-01 và US-02.

---

## 1. Flow Đăng ký (Register)

### 1.1. Luồng chính (Happy Path)

```
User → Frontend Form
  ↓
Nhập: email, password, confirmPassword
  ↓
Client Validation (format email, password strength, match confirm)
  ↓
POST /api/auth/register
  Body: { email, password }
  ↓
Backend:
  1. Validate input (email format, password rules)
  2. Check email unique (query profiles table)
  3. Hash password (bcrypt)
  4. Insert vào profiles table
  5. Generate JWT token (optional - có thể không trả token ngay)
  ↓
Response: 201 Created
  { success: true, message: "Đăng ký thành công", data: { user: {...}, token?: "..." } }
  ↓
Frontend:
  - Hiển thị thông báo thành công
  - Redirect đến /login (hoặc auto-login nếu có token)
```

### 1.2. Luồng lỗi

**Email đã tồn tại:**
```
POST /api/auth/register
  ↓
Backend check email → Đã tồn tại
  ↓
Response: 409 Conflict
  { success: false, message: "Email đã được sử dụng" }
  ↓
Frontend hiển thị lỗi tại form
```

**Email không hợp lệ:**
```
Client/Server validation → Format sai
  ↓
Response: 400 Bad Request
  { success: false, message: "Email không hợp lệ" }
```

**Password không đạt yêu cầu:**
```
Client/Server validation → Password < 8 ký tự hoặc không đủ mạnh
  ↓
Response: 400 Bad Request
  { success: false, message: "Mật khẩu phải có ít nhất 8 ký tự" }
```

**Lỗi server:**
```
Backend error (database, network, etc.)
  ↓
Response: 500 Internal Server Error
  { success: false, message: "Đã xảy ra lỗi, vui lòng thử lại sau" }
```

### 1.3. API Endpoint

**POST /api/auth/register**

Request:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

Response (Success):
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": null,
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

---

## 2. Flow Đăng nhập (Login + JWT)

### 2.1. Luồng chính (Happy Path)

```
User → Frontend Login Form
  ↓
Nhập: email, password
  ↓
Client Validation (format email, password không rỗng)
  ↓
POST /api/auth/login
  Body: { email, password }
  ↓
Backend:
  1. Validate input
  2. Query profiles table theo email (lowercase)
  3. Compare password với password_hash (bcrypt.compare)
  4. Nếu đúng → Generate JWT token
     - Payload: { userId, email }
     - Expires: 7 days (hoặc theo config)
  5. Trả token về client
  ↓
Response: 200 OK
  { success: true, data: { user: {...}, token: "jwt_token_here" } }
  ↓
Frontend:
  - Lưu token vào localStorage (hoặc httpOnly cookie)
  - Lưu user info vào context/state
  - Redirect đến /profile hoặc /dashboard
```

### 2.2. Luồng lỗi

**Email không tồn tại hoặc password sai:**
```
POST /api/auth/login
  ↓
Backend:
  - Email không tìm thấy HOẶC
  - Password không khớp
  ↓
Response: 401 Unauthorized
  { success: false, message: "Email hoặc mật khẩu không đúng" }
  ↓
Frontend hiển thị lỗi tại form
```

**Validation lỗi:**
```
Client/Server validation → Email format sai hoặc password rỗng
  ↓
Response: 400 Bad Request
  { success: false, message: "Vui lòng nhập đầy đủ thông tin" }
```

### 2.3. API Endpoint

**POST /api/auth/login**

Request:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

Response (Success):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "avatar_url": "https://...",
      "height": 175,
      "weight": 70
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 3. Flow Lấy/Cập nhật Profile và Upload Avatar

### 3.1. Flow Lấy Profile (GET)

```
User (đã login) → Frontend Profile Page
  ↓
GET /api/user/profile
  Headers: { Authorization: "Bearer <token>" }
  ↓
Backend:
  1. JWT Middleware verify token
  2. Extract userId từ token
  3. Query profiles table theo userId
  4. Trả về profile data
  ↓
Response: 200 OK
  { success: true, data: { profile: {...} } }
  ↓
Frontend:
  - Hiển thị form với dữ liệu hiện tại
  - Hiển thị avatar nếu có
```

### 3.2. Flow Cập nhật Profile (PUT)

```
User → Frontend Profile Form
  ↓
Nhập: full_name, height, weight
  (Email không được sửa)
  ↓
Client Validation (height: 100-250, weight: 30-250)
  ↓
PUT /api/user/profile
  Headers: { Authorization: "Bearer <token>" }
  Body: { full_name, height, weight }
  ↓
Backend:
  1. JWT Middleware verify token → Extract userId
  2. Validate input (height, weight ranges)
  3. Update profiles table
  4. Update updated_at timestamp
  5. Trả về profile mới
  ↓
Response: 200 OK
  { success: true, message: "Cập nhật thành công", data: { profile: {...} } }
  ↓
Frontend:
  - Hiển thị thông báo thành công
  - Cập nhật UI với dữ liệu mới
```

### 3.3. Flow Upload Avatar (Storage)

```
User → Frontend Profile Form
  ↓
Chọn file ảnh (jpg/jpeg/png, ≤ 5MB)
  ↓
Client Validation:
  - File type: image/jpeg, image/jpg, image/png
  - File size: ≤ 5MB
  - Optional: Check dimensions/ratio (3:4 hoặc 9:16)
  ↓
PUT /api/user/profile/avatar
  Headers: { Authorization: "Bearer <token>" }
  Body: FormData { file: <File> }
  ↓
Backend:
  1. JWT Middleware verify token → Extract userId
  2. Validate file (type, size)
  3. Upload file lên Supabase Storage:
     - Bucket: "avatars"
     - Path: "{userId}/avatar.{ext}"
     - Nếu có avatar cũ → xóa avatar cũ trước
  4. Lấy public URL từ Supabase Storage
  5. Update profiles.avatar_url với URL mới
  6. Trả về profile với avatar_url mới
  ↓
Response: 200 OK
  { success: true, message: "Upload avatar thành công", data: { profile: {...} } }
  ↓
Frontend:
  - Hiển thị ảnh mới
  - Thông báo thành công
```

### 3.4. Flow Cập nhật Profile + Avatar cùng lúc

```
User → Frontend Profile Form
  ↓
Nhập: full_name, height, weight
Chọn: file ảnh (nếu có)
  ↓
Client Validation (cả profile data và file)
  ↓
PUT /api/user/profile
  Headers: { Authorization: "Bearer <token>" }
  Body: FormData {
    full_name, height, weight,
    avatar: <File> (optional)
  }
  ↓
Backend:
  1. JWT Middleware verify token
  2. Validate profile data
  3. Nếu có file avatar:
     - Validate file
     - Upload lên Supabase Storage
     - Xóa avatar cũ nếu có
     - Lấy URL mới
  4. Update profiles table (cả profile data và avatar_url nếu có)
  5. Trả về profile mới
  ↓
Response: 200 OK
  { success: true, message: "Cập nhật thành công", data: { profile: {...} } }
```

### 3.5. Luồng lỗi

**Chưa đăng nhập hoặc token không hợp lệ:**
```
GET/PUT /api/user/profile
  ↓
JWT Middleware → Token không có hoặc invalid
  ↓
Response: 401 Unauthorized
  { success: false, message: "Vui lòng đăng nhập" }
  ↓
Frontend redirect đến /login
```

**Token hết hạn:**
```
JWT Middleware → Token expired
  ↓
Response: 401 Unauthorized
  { success: false, message: "Phiên đăng nhập đã hết hạn" }
  ↓
Frontend:
  - Xóa token khỏi localStorage
  - Redirect đến /login
```

**Validation lỗi:**
```
Height/Weight ngoài khoảng cho phép
  ↓
Response: 400 Bad Request
  { success: false, message: "Chiều cao phải trong khoảng 100-250 cm" }
```

**File upload lỗi:**
```
File type không hợp lệ hoặc size > 5MB
  ↓
Response: 400 Bad Request
  { success: false, message: "File không hợp lệ. Chỉ chấp nhận JPG/PNG, tối đa 5MB" }
```

**Lỗi Storage:**
```
Upload lên Supabase Storage thất bại
  ↓
Response: 500 Internal Server Error
  { success: false, message: "Không thể upload ảnh, vui lòng thử lại sau" }
```

### 3.6. API Endpoints

**GET /api/user/profile**

Headers:
```
Authorization: Bearer <token>
```

Response (Success):
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "height": 175,
      "weight": 70,
      "avatar_url": "https://...",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

**PUT /api/user/profile**

Headers:
```
Authorization: Bearer <token>
Content-Type: application/json (hoặc multipart/form-data nếu có file)
```

Request (JSON only):
```json
{
  "full_name": "John Doe",
  "height": 175,
  "weight": 70
}
```

Request (với avatar):
```
FormData:
  - full_name: "John Doe"
  - height: 175
  - weight: 70
  - avatar: <File>
```

Response (Success):
```json
{
  "success": true,
  "message": "Cập nhật thành công",
  "data": {
    "profile": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "height": 175,
      "weight": 70,
      "avatar_url": "https://...",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

---

## 4. Flow Logout và Bảo vệ Routes

### 4.1. Flow Logout

```
User → Click "Logout" button
  ↓
Frontend:
  1. Xóa token khỏi localStorage (hoặc cookie)
  2. Xóa user info khỏi context/state
  3. Redirect đến /login hoặc / (landing page)
  ↓
(Optional) POST /api/auth/logout
  Headers: { Authorization: "Bearer <token>" }
  ↓
Backend:
  - Có thể blacklist token (nếu có token blacklist mechanism)
  - Hoặc chỉ cần client xóa token là đủ
  ↓
Response: 200 OK
  { success: true, message: "Đăng xuất thành công" }
```

### 4.2. Flow Bảo vệ Routes (Frontend)

**Protected Route Component:**
```
User truy cập /profile hoặc route bảo vệ
  ↓
ProtectedRoute Component:
  1. Check token trong localStorage
  2. Nếu không có token → Redirect đến /login
  3. Nếu có token:
     - Verify token (optional: gọi API verify)
     - Nếu valid → Render component
     - Nếu invalid/expired → Xóa token → Redirect đến /login
```

**Route Protection Logic:**
```javascript
// Pseudo code
if (!token) {
  redirect('/login')
} else {
  try {
    verifyToken(token)
    renderProtectedComponent()
  } catch (error) {
    removeToken()
    redirect('/login')
  }
}
```

### 4.3. Flow Bảo vệ API Endpoints (Backend)

**JWT Middleware:**
```
Request đến protected endpoint
  ↓
JWT Middleware:
  1. Extract token từ Authorization header
  2. Nếu không có token → 401 Unauthorized
  3. Verify token với JWT_SECRET
  4. Nếu invalid/expired → 401 Unauthorized
  5. Nếu valid → Extract userId từ payload
  6. Attach userId vào req.user
  7. Next() → Continue to controller
```

**Middleware Flow:**
```
Request → JWT Middleware
  ↓
Check Authorization header
  ↓
[Token không có] → 401 Unauthorized
  ↓
[Token có] → Verify với JWT_SECRET
  ↓
[Invalid/Expired] → 401 Unauthorized
  ↓
[Valid] → Extract userId → req.user = { userId, email }
  ↓
Next() → Controller
```

### 4.4. API Endpoint

**POST /api/auth/logout** (Optional)

Headers:
```
Authorization: Bearer <token>
```

Response (Success):
```json
{
  "success": true,
  "message": "Đăng xuất thành công"
}
```

---

## 5. Tổng hợp Flow Diagram

### 5.1. Authentication Flow

```
┌─────────┐
│ Landing │
│  Page   │
└────┬────┘
     │
     ├──→ [Register] ──→ POST /api/auth/register ──→ [Success] ──→ /login
     │
     └──→ [Login] ──→ POST /api/auth/login ──→ [Success + JWT] ──→ /profile
                                                                    │
                                                                    └──→ [Protected Routes]
```

### 5.2. Profile Management Flow

```
┌──────────────┐
│ Profile Page │
└──────┬───────┘
       │
       ├──→ [Load] ──→ GET /api/user/profile (with JWT) ──→ [Display Form]
       │
       └──→ [Update] ──→ PUT /api/user/profile (with JWT)
                         │
                         ├──→ [Profile Data] ──→ Update DB
                         │
                         └──→ [Avatar File] ──→ Upload Storage ──→ Update avatar_url
```

### 5.3. Route Protection Flow

```
┌─────────────┐
│ User Access │
│  /profile   │
└──────┬──────┘
       │
       ├──→ [No Token] ──→ Redirect /login
       │
       └──→ [Has Token] ──→ Verify JWT
                            │
                            ├──→ [Invalid] ──→ Redirect /login
                            │
                            └──→ [Valid] ──→ Render Protected Component
```

---

## 6. Security Considerations

### 6.1. JWT Token
- Secret key mạnh (JWT_SECRET)
- Expiration time hợp lý (7 days)
- Payload chỉ chứa userId, email (không chứa sensitive data)
- Token được lưu trong localStorage (hoặc httpOnly cookie nếu cần bảo mật hơn)

### 6.2. Password
- Luôn hash bằng bcrypt trước khi lưu
- Không log plaintext password
- Minimum 8 characters, khuyến khích có chữ hoa/thường/số/ký tự đặc biệt

### 6.3. File Upload
- Validate file type (chỉ jpg/jpeg/png)
- Validate file size (≤ 5MB)
- Upload vào Supabase Storage với path theo userId
- Xóa file cũ khi upload file mới

### 6.4. API Protection
- Tất cả protected endpoints phải có JWT middleware
- Verify token trên mọi request
- Return 401 nếu token không hợp lệ

---

## 7. Error Handling Strategy

### 7.1. Client-side
- Hiển thị thông báo lỗi rõ ràng, thân thiện
- Không hiển thị chi tiết lỗi kỹ thuật cho user
- Auto redirect khi token hết hạn

### 7.2. Server-side
- Consistent error response format
- Log đầy đủ lỗi cho debugging (không trả về client)
- HTTP status codes đúng chuẩn:
  - 400: Bad Request (validation errors)
  - 401: Unauthorized (auth errors)
  - 409: Conflict (duplicate email)
  - 500: Internal Server Error (server errors)

---

## 8. Notes

- Email luôn được normalize về lowercase trước khi lưu/so sánh
- Password hash sử dụng bcrypt với salt rounds ≥ 10
- JWT token được verify trên mọi protected endpoint
- Avatar URL được lưu dạng full URL từ Supabase Storage
- Timestamps sử dụng TIMESTAMPTZ để hỗ trợ timezone
- CORS được cấu hình đúng origin (FRONTEND_URL)

