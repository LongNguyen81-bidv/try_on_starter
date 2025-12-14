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