# Try-on (GenAI4Dev K1)

## Giới thiệu
Dự án “Try-on” là ứng dụng thử đồ (virtual try-on) theo hướng GenA
- Backlog tổng quan: xem `PB.md`
- Sprint 1 backlog: xem `sprints/sprint1.md`
- User stories chi tiết: xem `sprints/US-01.md` và `sprints/US-02.md`

## Tech stack (định hướng)
- Frontend: React + Vite + TailwindCSS
- Backend: Node.js + Express
- Database & Storage: Supabase
- Auth: JWT

## Cấu trúc repo
- `.cursor/`: rules/commands cho Cursor
- `sprints/`: user stories + sprint backlog
- `PB.md`: product backlog
- `README.md`: tài liệu dự án
- `backend/`: Node.js + Express API server
- `frontend/`: React + Vite application

## Yêu cầu hệ thống
- Node.js >= 18.x
- npm >= 9.x
- Tài khoản Supabase (để lấy URL và API keys)

## Hướng dẫn Setup

### 1. Clone repository
```bash
git clone <repository-url>
cd try_on_starter
```

### 2. Setup Backend

#### 2.1. Cài đặt dependencies
```bash
cd backend
npm install
```

#### 2.2. Cấu hình environment variables
Tạo file `.env` từ `env.example`:
```bash
cp env.example .env
```

Cập nhật các giá trị trong `.env`:
- `PORT`: Port cho backend server (mặc định: 3000)
- `NODE_ENV`: Môi trường (development/production)
- `JWT_SECRET`: Secret key cho JWT (nên dùng chuỗi ngẫu nhiên mạnh)
- `JWT_EXPIRES_IN`: Thời gian hết hạn token (ví dụ: 7d)
- `SUPABASE_URL`: URL của Supabase project
- `SUPABASE_ANON_KEY`: Anonymous key từ Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key từ Supabase
- `FRONTEND_URL`: URL của frontend (mặc định: http://localhost:5173)

#### 2.3. Chạy backend
```bash
# Development mode (với nodemon)
npm run dev

# Production mode
npm start
```

Backend sẽ chạy tại `http://localhost:3000`

### 3. Setup Frontend

#### 3.1. Cài đặt dependencies
```bash
cd frontend
npm install
```

#### 3.2. Chạy frontend
```bash
# Development mode
npm run dev
```

Frontend sẽ chạy tại `http://localhost:5173`

### 4. Kiểm tra setup

#### Backend Health Check
```bash
curl http://localhost:3000/api/v1/health
```

Kết quả mong đợi:
```json
{
  "success": true,
  "data": {
    "message": "API is running",
    "version": "v1"
  }
}
```

#### Frontend
Mở trình duyệt và truy cập `http://localhost:5173`, bạn sẽ thấy trang welcome.

## Scripts có sẵn

### Backend
- `npm run dev`: Chạy server ở chế độ development (với nodemon)
- `npm start`: Chạy server ở chế độ production
- `npm run lint`: Kiểm tra lỗi ESLint
- `npm run lint:fix`: Tự động sửa lỗi ESLint
- `npm run format`: Format code với Prettier
- `npm run format:check`: Kiểm tra format code

### Frontend
- `npm run dev`: Chạy development server
- `npm run build`: Build production
- `npm run preview`: Preview production build
- `npm run lint`: Kiểm tra lỗi ESLint
- `npm run lint:fix`: Tự động sửa lỗi ESLint
- `npm run format`: Format code với Prettier
- `npm run format:check`: Kiểm tra format code

## Cấu trúc thư mục

### Backend
```
backend/
├── src/
│   ├── config/          # Cấu hình (database, constants)
│   ├── controllers/     # Controllers xử lý request
│   ├── middleware/      # Middleware (auth, error handling)
│   ├── repositories/    # Data access layer
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   └── index.js         # Entry point
├── env.example          # Template cho .env
└── package.json
```

### Frontend
```
frontend/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom hooks
│   ├── services/       # API services
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Root component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## Hướng dẫn vibe code
- Bám theo các tasks liệt kê trong sprint backlog, hãy ra lệnh cho AI thực hiện từng task một. Nhớ @ các files liên quan tới tasks khi ra lệnh.
- Sử dụng các commands hợp lý trong quá trình vibe code.
- Prompt mẫu hoàn thành task 1: 
```
Hãy triển khai Task 1 trong @sprints/sprint1.md: Thiết lập Project.
```
- Prompt mẫu hoàn thành task 2: 
```
@PB.md, @US-01.md, @US-02.md, @sprints/sprint1.md: Hãy triển khai Task 2 trong @sprints/sprint1.md: Tạo Landing Page.
```