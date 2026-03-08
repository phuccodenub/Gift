# GiftCraft

GiftCraft la nen tang tao qua tang ky thuat so theo template (bo hoa, thiep, phong bi, flower-tree), cho phep chia se bang link hoac tai file HTML offline.

## Stack

- Next.js App Router (React 19, TypeScript)
- Tailwind CSS v4 + Framer Motion
- Prisma 5
- Production target: Neon Postgres + Supabase Storage + Vercel

## Features hien co

- Gift Builder `/create`: chon template, tuy chinh, upload anh, preview, chia se.
- Gift Viewer `/gift/[slugOrId]`: SSR metadata, panel chia se, QR, beacon view tracking.
- API:
  - `POST /api/gifts` tao gift (Zod validation, slug canonical, template whitelist)
  - `GET /api/gifts` danh sach gift gan day
  - `GET/PATCH/DELETE /api/gifts/[id]` read/update/delete (khong auto tang view)
  - `POST /api/gifts/[id]/view` ghi nhan view theo `viewerId` unique
  - `POST /api/upload` upload anh + tao `Asset` record authoritative
  - `POST /api/internal/assets/cleanup` cleanup orphan assets (cron + `CRON_SECRET`)
  - `GET /api/export/[id]` export HTML offline (sanitize + asset whitelist)

## Environment

Copy `.env.example` -> `.env`:

```bash
cp .env.example .env
```

Bien moi truong chinh:

- `APP_URL`, `NEXT_PUBLIC_APP_URL`
- `DATABASE_URL`
- `STORAGE_MODE` (`supabase` | `local-dev`)
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `CRON_SECRET` (bao ve endpoint cleanup internal)

## Local development

```bash
npm install
npm run db:push
npm run dev
```

Mo [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` - chay local
- `npm run lint` - lint
- `npm run typecheck` - TypeScript check
- `npm run test` - lint + typecheck
- `npm run build` - production build
- `npm run db:migrate` - prisma migrate dev
- `npm run db:push` - sync schema nhanh cho local dev
- `npm run db:studio` - Prisma Studio

## Luu y production

- Khong su dung fallback localhost cho link share: can set `APP_URL`, `NEXT_PUBLIC_APP_URL`.
- Nen dung `STORAGE_MODE=supabase` tren Vercel.
- Export HTML chi cho phep asset thuoc whitelist storage va data da sanitize.
- Link chia se moi phat ra theo slug canonical; metadata crawler/API read khong tang view.
