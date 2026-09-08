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

Production nên dùng Supabase để account scan lên không bị mất khi Vercel đổi server.

1. Tạo project Supabase mới.
2. Vào **SQL Editor** và chạy:

```sql
create table if not exists public.blox_accounts (
  id text primary key,
  username text not null unique,
  data jsonb not null,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.blox_accounts enable row level security;
```

3. Vào **Project Settings -> API** trong Supabase, lấy:
   - Project URL
   - `service_role` key
4. Trong Vercel -> Project `track` -> Settings -> Environment Variables, thêm:

```text
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SCANNER_API_KEY=your-secret-scanner-key
```

5. Redeploy Production.

`SUPABASE_SERVICE_ROLE_KEY` là secret server, không đưa vào browser, GitHub, script Roblox hoặc chat công khai.

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

API cũng nhận trực tiếp JSON dạng `XeroItemScanResult` có các field `Username`, `UserId`, `Stats` và `Checks`. Tracker sẽ dùng `UserId` hoặc `username` để cập nhật account cũ, nên một username không bị lặp thành nhiều dòng.

Nếu scanner của bạn đã ghi file vào thư mục `XeroScans`, có thể chạy watcher PowerShell để tự gửi file JSON mới lên tracker:

```powershell
$env:SCANNER_API_KEY="your-secret-key"
powershell -ExecutionPolicy Bypass -File .\scripts\watch-xero-scans.ps1 -TrackerUrl "https://track-snowy.vercel.app"
```

Watcher chỉ đọc các file `*-item-scan.json` đã được tạo sẵn rồi gửi lên `/api/scans`; nó không inject vào Roblox, không đọc bộ nhớ game và không cần Node.

Các adapter an toàn nằm trong `lib/providers.ts`:

- `RobloxPresenceProvider`: kiểm tra online/offline bằng Roblox Presence API.
- `MockBloxFruitsProvider`: dữ liệu phát triển.
- `AuthorizedGameProvider`: điểm nối dành cho nguồn dữ liệu được chủ game cho phép.

Không có executor, DLL injection, memory reading, cookie Roblox hay anti-cheat bypass trong project.

### Roblox Luau (chỉ dành cho game bạn sở hữu)

`scripts/scanner.server.lua` là ServerScript Luau không cần Node/executor. Đặt nó trong `ServerScriptService`, bật **Allow HTTP Requests**, đặt `SCANNER_API_KEY`, rồi nối hàm `collectSnapshot()` với cấu trúc dữ liệu của game bạn. Roblox không cho chèn ServerScript này vào experience của người khác.

## PostgreSQL / Prisma

Schema đầy đủ nằm tại `prisma/schema.prisma`; migration đầu tiên nằm trong `prisma/migrations`. Sao chép `.env.example` thành `.env`, đặt `DATABASE_URL`, rồi chạy:

```bash
npm run db:generate
npm run db:migrate
```

Production cần đặt `SCANNER_API_KEY` trong Vercel Environment Variables trước khi nhận scan.
