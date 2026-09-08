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

## Scanner API hợp lệ

`POST /api/scans` nhận snapshot từ một nguồn được Blox Fruits cho phép. Request cần hai header:

```text
Authorization: Bearer <SCANNER_API_KEY>
X-Scanner-Id: <scanner-id>
```

Trên Windows không cần cài Node cho scanner. Chạy `scripts/scanner.ps1` bằng PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\scanner.ps1
```

File này mở dashboard với snapshot mẫu trong URL fragment (phần sau `#`, không được gửi tới Vercel), sau đó dashboard lưu account trong localStorage của trình duyệt. Hãy thay `$snapshot` bằng output từ một provider được game cho phép; file không đọc bộ nhớ Roblox và không inject vào client.

API kiểm tra Roblox user ID, timestamp, khoảng số, item key và giới hạn 30 request/phút/scanner. Account mới được tự động thêm vào dashboard. `/api/events` gửi sự kiện SSE để giao diện tải lại sau một scan.

Các adapter an toàn nằm trong `lib/providers.ts`:

- `RobloxPresenceProvider`: kiểm tra online/offline bằng Roblox Presence API.
- `MockBloxFruitsProvider`: dữ liệu phát triển.
- `AuthorizedGameProvider`: điểm nối dành cho nguồn dữ liệu được chủ game cho phép.

Không có executor, DLL injection, memory reading, cookie Roblox hay anti-cheat bypass trong project.

## PostgreSQL / Prisma

Schema đầy đủ nằm tại `prisma/schema.prisma`; migration đầu tiên nằm trong `prisma/migrations`. Sao chép `.env.example` thành `.env`, đặt `DATABASE_URL`, rồi chạy:

```bash
npm run db:generate
npm run db:migrate
```

Production cần đặt `SCANNER_API_KEY` trong Vercel Environment Variables trước khi nhận scan.
