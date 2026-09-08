# FruitVault — Blox Fruits personal tracker

Dashboard cá nhân để quản lý tiến độ và vật phẩm của nhiều tài khoản Blox Fruits. Dự án dùng Next.js App Router, TypeScript, responsive và sẵn sàng triển khai trên Vercel.

## Chạy trên máy

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`.

## Triển khai Vercel

1. Đưa thư mục này lên một repository GitHub riêng tư.
2. Trong Vercel, chọn **Add New → Project** rồi import repository.
3. Vercel tự nhận diện Next.js; giữ nguyên Build Command `npm run build` và nhấn **Deploy**.
4. Có thể thêm custom domain trong **Project Settings → Domains**.

## Kết nối dữ liệu thật

- Kiểu dữ liệu nằm trong `lib/types.ts`.
- Dữ liệu mẫu nằm trong `lib/mock-data.ts`.
- API mẫu là `GET /api/accounts` tại `app/api/accounts/route.ts`.
- Lớp giao tiếp dữ liệu nằm trong `lib/account-source.ts`.

Hãy thay phần thân API route bằng truy vấn đến database của bạn (Supabase, Postgres, Airtable...) và trả về `{ data: BloxAccount[] }`. Giao diện không cần thay đổi.

> Không đưa mật khẩu Roblox, cookie `.ROBLOSECURITY`, session token hoặc thông tin đăng nhập vào mã nguồn, biến môi trường hay API này. Chỉ nhập dữ liệu bạn sở hữu và được phép sử dụng.
