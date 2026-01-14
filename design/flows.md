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

---

# Virtual Try-On Flows - Sprint 3

## Tổng quan
Tài liệu này mô tả các luồng xử lý cho tính năng thử đồ ảo (Virtual Try-On) trong Sprint 3, hỗ trợ US-05 và US-06.

---

## 1. Flow Thử đồ (Try-On)

### 1.1. Luồng chính (Happy Path)

```
User → Frontend Fitting Room Page
  ↓
Check: User đã có ảnh toàn thân (avatar_url) chưa?
  ↓
[Chưa có] → Hiển thị popup → Redirect về /profile
  ↓
[Có avatar] → Load danh sách sản phẩm
  ↓
User chọn sản phẩm hoặc tự động chọn sản phẩm đầu tiên
  ↓
POST /api/v1/try-on
  Headers: { Authorization: "Bearer <token>" }
  Body: { product_id: "uuid" }
  ↓
Backend:
  1. JWT Middleware verify token → Extract userId
  2. Validate product_id (format UUID)
  3. Check profile có avatar_url không?
  4. Check product tồn tại và có image_url?
  5. Query bảng try_on_results (Cache lookup)
     ↓
  [Cache HIT] → Return URL ngay lập tức
     ↓
  [Cache MISS] → Gọi AI Service:
     a. Convert ảnh user + ảnh sản phẩm sang base64
     b. Gửi request đến Gemini AI
     c. Nhận ảnh kết quả (base64)
     d. Upload lên Supabase Storage
     e. Lưu URL vào try_on_results
     f. Return URL mới
  ↓
Response: 200 OK
  {
    success: true,
    data: {
      generated_image_url: "https://...",
      cached: true/false,
      product: { id, name, price, category }
    }
  }
  ↓
Frontend:
  - Hiển thị ảnh kết quả lên màn hình
  - Lưu vào imageCache (client-side)
```

### 1.2. Luồng lỗi

**User chưa có ảnh toàn thân:**
```
POST /api/v1/try-on
  ↓
Backend check profile.avatar_url → null
  ↓
Response: 400 Bad Request
  { success: false, message: "Bạn cần cập nhật ảnh toàn thân để sử dụng tính năng thử đồ" }
  ↓
Frontend hiển thị popup → Redirect /profile
```

**Sản phẩm không tồn tại:**
```
POST /api/v1/try-on
  ↓
Backend query product → Not found
  ↓
Response: 404 Not Found
  { success: false, message: "Không tìm thấy sản phẩm" }
```

**AI Service lỗi/timeout:**
```
Backend gọi Gemini AI → Timeout sau 60s
  ↓
Response: 500 Internal Server Error
  { success: false, message: "AI xử lý quá lâu. Vui lòng thử lại sau." }
  ↓
Frontend:
  - Hiển thị thông báo lỗi thân thiện
  - Giữ nguyên ảnh gốc của user
```

**AI quota exceeded:**
```
Backend gọi Gemini AI → Quota/Rate limit error
  ↓
Response: 500 Internal Server Error
  { success: false, message: "Hệ thống AI đang bận. Vui lòng thử lại sau." }
```

### 1.3. API Endpoint

**POST /api/v1/try-on**

Headers:
```
Authorization: Bearer <token>
Content-Type: application/json
```

Request:
```json
{
  "product_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

Response (Success - Cache Hit):
```json
{
  "success": true,
  "message": "Lấy ảnh từ cache thành công",
  "data": {
    "generated_image_url": "https://xxx.supabase.co/storage/v1/object/public/tryon-results/user-id/product-id.png",
    "cached": true,
    "product": {
      "id": "uuid",
      "name": "Áo thun trắng",
      "price": 250000,
      "category": { "id": "uuid", "name": "Áo thun" }
    }
  }
}
```

Response (Success - New Generation):
```json
{
  "success": true,
  "message": "Tạo ảnh thử đồ thành công",
  "data": {
    "generated_image_url": "https://...",
    "cached": false,
    "product": { ... }
  }
}
```

---

## 2. Flow Chuyển đổi sản phẩm (Navigation)

### 2.1. Luồng chính

```
User đang xem sản phẩm A
  ↓
User bấm Next/Prev hoặc Swipe
  ↓
Frontend:
  1. Update currentIndex
  2. Update UI text (tên, giá sản phẩm B) ngay lập tức
  3. Check imageCache[productB.id]
     ↓
  [Cache HIT] → Hiển thị ảnh ngay từ cache
     ↓
  [Cache MISS] → 
     a. Hiện Loading overlay ("AI đang ngắm bạn...")
     b. Gọi API POST /api/v1/try-on với product_id mới
     c. Nhận URL → Lưu vào imageCache
     d. Hiển thị ảnh mới → Tắt loading
```

### 2.2. Swipe Detection

```javascript
// Touch events flow
onTouchStart → Lưu touchStart.clientX
  ↓
onTouchMove → Cập nhật touchEnd.clientX
  ↓
onTouchEnd → 
  distance = touchStart - touchEnd
  ↓
[distance > 50px] → handleNext()
[distance < -50px] → handlePrev()
[|distance| < 50px] → Không làm gì
```

### 2.3. Client-side Caching

```javascript
const [imageCache, setImageCache] = useState({});
// Structure: { [productId]: "generated_image_url", ... }

// Khi load ảnh mới:
setImageCache(prev => ({
  ...prev,
  [productId]: imageUrl
}));

// Khi user quay lại sản phẩm đã xem:
if (imageCache[productId]) {
  setTryOnImageUrl(imageCache[productId]); // Instant display
  return;
}
```

---

## 3. Database Cache Flow

### 3.1. Cache Lookup

```sql
-- Query pattern for cache lookup
SELECT generated_image_url 
FROM try_on_results 
WHERE user_id = $1 AND product_id = $2
LIMIT 1;
```

### 3.2. Cache Insert/Update (Upsert)

```sql
-- Upsert pattern (insert or update on conflict)
INSERT INTO try_on_results (user_id, product_id, generated_image_url, created_at)
VALUES ($1, $2, $3, NOW())
ON CONFLICT (user_id, product_id) 
DO UPDATE SET 
  generated_image_url = EXCLUDED.generated_image_url,
  created_at = NOW();
```

### 3.3. Cache Invalidation

```
-- Khi user thay đổi avatar (avatar_url):
-- Cần xóa tất cả try_on_results của user đó
DELETE FROM try_on_results WHERE user_id = $1;
```

---

## 4. AI Service Flow (Gemini)

### 4.1. Request Flow

```
Input:
  - userImageUrl: URL ảnh toàn thân của user
  - productImageUrl: URL ảnh sản phẩm (flat-lay)
  - categoryName: Tên danh mục (VD: "Áo thun")
  ↓
Convert images to base64
  ↓
Construct prompt for Gemini
  ↓
Send request to Gemini 2.0 Flash (multimodal)
  - Model: gemini-2.0-flash-exp
  - responseModalities: ['Text', 'Image']
  ↓
Parse response → Extract generated image (base64)
  ↓
Upload to Supabase Storage
  ↓
Return public URL
```

### 4.2. Prompt Template

```
You are a virtual try-on AI assistant. Your task is to generate a realistic image of a person wearing a specific clothing item.

INSTRUCTIONS:
1. Look at the first image - this is a photo of a person (the model).
2. Look at the second image - this is the clothing item ({categoryName}) to be worn.
3. Generate a NEW image showing the SAME person from the first image, but now wearing the clothing item from the second image.
4. Keep the person's face, body shape, skin tone, and pose EXACTLY the same.
5. The clothing should fit naturally on the person's body.
6. Maintain realistic lighting and shadows.
7. The background can be a simple, clean backdrop.

Please generate the try-on result image now.
```

### 4.3. Error Handling

| Error Type | HTTP Status | Message |
|------------|-------------|---------|
| GEMINI_API_KEY missing | 500 | Lỗi cấu hình AI service |
| Safety block | 400 | Ảnh không phù hợp với yêu cầu của AI |
| Quota exceeded | 500 | Hệ thống AI đang bận. Vui lòng thử lại sau. |
| Timeout (60s) | 500 | AI xử lý quá lâu. Vui lòng thử lại sau. |
| Generation failed | 500 | AI không thể tạo ảnh thử đồ. Vui lòng thử lại. |

---

## 5. Storage Flow

### 5.1. Upload Generated Image

```
File path: tryon-results/{userId}/{productId}.{ext}
  ↓
Supabase Storage upload with upsert=true
  ↓
Get public URL
  ↓
Add cache buster: ?t={timestamp}
  ↓
Return URL
```

### 5.2. Cleanup (Optional)

```
Khi xóa sản phẩm → CASCADE delete try_on_results records
Khi xóa user → CASCADE delete records + storage files
```

---

## 6. Security Considerations

### 6.1. Authentication
- Tất cả try-on endpoints yêu cầu JWT token
- Token phải valid và chưa expired

### 6.2. Rate Limiting (Recommended)
- Limit: 10 requests/user/phút
- Để tránh lạm dụng AI và tiết kiệm chi phí

### 6.3. Input Validation
- product_id phải là UUID hợp lệ
- User phải có avatar_url
- Product phải có image_url

### 6.4. Storage Security
- Try-on results bucket: Public read
- Write access: Backend service role only

---

## 7. Performance Optimization

### 7.1. Cache Strategy
- **Level 1**: Client-side cache (React state) - Instant
- **Level 2**: Database cache (try_on_results) - ~50ms
- **Level 3**: AI generation - 5-20 seconds

### 7.2. Recommendations
- Prefetch next/prev product images trong background
- Lazy load product list với pagination
- Compress images trước khi upload

