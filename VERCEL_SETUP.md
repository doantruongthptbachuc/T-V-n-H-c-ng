# THPT Ba Chúc – bản Next.js/Vercel

Bộ này giữ nguyên frontend React hiện tại và bọc vào Next.js App Router để chạy trên Vercel.
Firestore vẫn là nơi lưu dữ liệu bền vững; không dùng `server-data.json` trên Vercel.

## 1. Chép các file

Các file trong gói này là:
- `package.json` (thay package.json cũ)
- `next-env.d.ts`
- `next.config.ts`
- `postcss.config.mjs`
- `app/layout.tsx`
- `app/page.tsx`
- `app/api/...` (các API tương thích)

Các thư mục `src/`, `public/`, `assets/`, `firebase-applet-config.json` và các file dữ liệu hiện tại giữ nguyên.

## 2. Biến môi trường trên Vercel

Thêm:
- `GEMINI_API_KEY` = API key Gemini của trường (nếu muốn dùng AI phân loại câu hỏi).

Firebase config hiện tại của dự án đã nằm trong `firebase-applet-config.json`; không đưa secret Admin SDK vào frontend.

## 3. Cài và chạy

```bash
npm install
npm run build
npm run start
```

## 4. Vercel

Import repository → chọn Framework Preset `Next.js` → Build Command `npm run build` → Deploy.

## 5. Vì sao không còn 405?

Các URL cũ:
- `/api/data`
- `/api/data/:collection`
- `/api/sync/broadcast`
- `/api/sync/status`
- `/api/events`
- `/api/analyze-question`

đã có Route Handler của Next.js.

Dữ liệu thật vẫn được ghi/đọc từ Firestore bởi code hiện tại. API tương thích không ghi file trên server vì filesystem của Vercel serverless không phải nơi lưu dữ liệu lâu dài.

## 6. Vì sao hết lỗi localStorage quota?

Phiên bản cũ tạo `tvhd_system_backup_auto` chứa gần như toàn bộ dữ liệu. Bản Next.js có guard tự dọn khóa cũ và chặn ghi bản backup lớn vào localStorage. IndexedDB/Firestore vẫn là nơi dữ liệu chính.

## 7. Lưu ý

`server-data.json` và `server.ts` có thể giữ lại làm bản sao/rollback, nhưng không còn được dùng làm database chính trên Vercel.
Vercel Preview Deployment - 2026
