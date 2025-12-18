# Sprint 3: Virtual Fitting Room (AI Integration)

## Mục tiêu Sprint
Xây dựng tính năng "Phòng thử đồ ảo" (Virtual Try-On), tích hợp AI để ghép ảnh người dùng với sản phẩm từ kho hàng.
User Stories: US-05, US-06

## Tasks

### 1. Nghiên cứu & Thiết lập AI Service (Priority: High)
**Mô tả:** Lựa chọn và tích hợp dịch vụ AI xử lý hình ảnh (Virtual Try-On Model).

**Công việc:**
- [ ] Nghiên cứu và chọn model AI phù hợp (Gợi ý: IDM-VTON hoặc OOTDiffusion qua nền tảng Replicate hoặc Fal.ai)
- [ ] Đăng ký tài khoản, lấy API Key và cấu hình biến môi trường (`AI_API_KEY`, `AI_SERVICE_URL`)
- [ ] Xây dựng module `AIService` trên Backend (NodeJS) để giao tiếp với AI Provider
- [ ] Viết hàm gửi request: Input (Ảnh người, Ảnh áo, Category) -> Output (URL ảnh đã mặc)
- [ ] Xử lý các lỗi từ AI Service (Timeout, Queue quá tải, Bad Request)

**Acceptance Criteria:**
- Backend kết nối thành công với AI Service
- Gửi test 2 ảnh (người + áo) và nhận về được kết quả là URL ảnh mới
- Module xử lý được lỗi khi dịch vụ AI không phản hồi

---

### 2. Thiết kế Database lưu kết quả (Priority: High)
**Mô tả:** Lưu trữ lịch sử thử đồ để tối ưu chi phí và tốc độ (Cache kết quả).

**Công việc:**
- [ ] Thiết kế bảng `try_on_results`:
    - `id` (UUID, PK)
    - `user_id` (FK profiles)
    - `product_id` (FK products)
    - `generated_image_url` (Text)
    - `created_at` (Timestamp)
- [ ] Tạo Unique Constraint cho cặp `(user_id, product_id)` (Mỗi người chỉ lưu 1 ảnh kết quả cho 1 món đồ trong MVP)
- [ ] Viết migration script SQL cho Supabase

**Acceptance Criteria:**
- Schema được tạo thành công trên Supabase
- Truy vấn lấy ảnh kết quả theo User và Product diễn ra nhanh (<100ms)

---

### 3. Backend API: Logic Thử đồ (Priority: High)
**Mô tả:** Xây dựng API điều phối luồng thử đồ (Check điều kiện -> Check Cache -> Gọi AI).

**Công việc:**
- [ ] API `POST /api/try-on`: Nhận `product_id` từ Client
- [ ] Middleware validation:
    - Kiểm tra User đã login chưa?
    - Kiểm tra User đã có ảnh toàn thân (`body_image_url`) trong Profile chưa? (Nếu chưa -> Trả lỗi yêu cầu cập nhật)
- [ ] Logic xử lý chính:
    - Bước 1: Query bảng `try_on_results`. Nếu có ảnh -> Trả về URL ngay (Hit Cache).
    - Bước 2: Nếu chưa có -> Gọi `AIService` (Task 1).
    - Bước 3: Lưu URL kết quả từ AI vào `try_on_results`.
    - Bước 4: Trả URL về cho Client.
- [ ] Xử lý Timeout (vì AI có thể mất 10-20s để xử lý)

**Acceptance Criteria:**
- API trả về ảnh ngay lập tức nếu user đã từng thử món đồ đó
- API tự động gọi AI generate ảnh mới nếu chưa thử lần nào
- API chặn và báo lỗi rõ ràng nếu user chưa upload ảnh toàn thân

---

### 4. Frontend - Giao diện Phòng thử đồ (Priority: High)
**Mô tả:** Xây dựng UI chính cho tính năng thử đồ (US-05).

**Công việc:**
- [ ] Tạo trang `/fitting-room` (Protected Route)
- [ ] Layout chia 2 phần (Desktop) hoặc Stack (Mobile):
    - Phần hiển thị: Ảnh User (hoặc ảnh kết quả Try-on)
    - Phần điều khiển: Danh sách sản phẩm, Tabs danh mục
- [ ] Tích hợp API lấy danh sách sản phẩm (từ Sprint 2)
- [ ] Logic khởi tạo: Khi vào trang, tự động chọn sản phẩm đầu tiên của danh mục mặc định và hiển thị ảnh user (gốc)

**Acceptance Criteria:**
- Giao diện đúng thiết kế, responsive tốt trên mobile
- Hiển thị được ảnh gốc của User khi mới vào phòng thử đồ
- Load được danh sách sản phẩm từ API

---

### 5. Frontend - Chức năng "Đổi đồ" (Priority: High)
**Mô tả:** Xử lý sự kiện người dùng chuyển qua sản phẩm khác (US-06).

**Công việc:**
- [ ] Tạo UI Navigation: Mũi tên Trái/Phải hoặc thao tác Swipe (Vuốt) trên mobile
- [ ] State Management: Quản lý `currentProduct` và `loadingState`
- [ ] Logic chuyển đổi:
    - Khi User bấm Next -> Hiện Loading Overlay (Spinner/Skeleton) lên khu vực ảnh
    - Gọi API `POST /api/try-on` với ID sản phẩm mới
    - Khi có kết quả -> Thay thế ảnh cũ bằng ảnh mới -> Tắt Loading
- [ ] Xử lý Cache phía Client (dùng React Query/SWR) để không reload lại ảnh khi vuốt qua lại

**Acceptance Criteria:**
- Người dùng bấm Next/Prev thấy sản phẩm thay đổi
- Hiển thị hiệu ứng Loading rõ ràng trong lúc chờ AI (quan trọng vì AI chậm)
- Ảnh sau khi generate hiển thị đúng kích thước, không bị vỡ layout

---

### 6. Xử lý Edge Cases & UX (Priority: Medium)
**Mô tả:** Xử lý các tình huống ngoại lệ để nâng cao trải nghiệm người dùng.

**Công việc:**
- [ ] UI Empty State: Nếu user chưa có ảnh toàn thân -> Hiển thị Popup/Modal yêu cầu sang trang Profile cập nhật ngay
- [ ] UI Error State: Nếu AI service lỗi/timeout -> Hiển thị thông báo thân thiện "Hệ thống đang bận" và giữ nguyên ảnh gốc
- [ ] UI Feedback: Thêm các câu thông báo vui vẻ khi chờ đợi (VD: "AI đang ngắm bạn...", "Đang mặc thử áo...")

**Acceptance Criteria:**
- User không bị kẹt ở màn hình trắng khi lỗi xảy ra
- User biết rõ lý do tại sao không thử đồ được (do chưa có ảnh profile)

## Definition of Done
- Code được merge vào branch chính
- User (đã có ảnh profile) truy cập được phòng thử đồ
- User thấy chính mình mặc sản phẩm đầu tiên
- User chuyển sang sản phẩm khác, hệ thống tự động generate ảnh mới và hiển thị thành công
- Dữ liệu ảnh kết quả được lưu vào bảng `try_on_results` (kiểm tra DB thấy record mới)
- Unit tests cho `AIService` và API Endpoint passed

## Notes
- **Chi phí & Performance:** Việc gọi AI tốn chi phí và thời gian (trung bình 5-15s/ảnh). Cần đảm bảo logic "Check Cache DB" hoạt động chính xác tuyệt đối để không đốt tiền oan.
- **Dữ liệu test:** Cần đảm bảo trong DB (từ Sprint 2) đã có sẵn các sản phẩm có ảnh **Flat-lay (trải nền trơn)** chất lượng tốt. Nếu ảnh sản phẩm rối rắm, AI sẽ hoạt động sai.