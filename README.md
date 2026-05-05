# lapakurab

Marketplace akun digital — streaming, VPN, dan premium services lainnya.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind v4 · Supabase (Postgres + Auth)

---

## Dev (mode mock — tanpa backend)

```bash
npm install
npm run dev
```

Buka <http://localhost:3000>. Tanpa env Supabase, app pakai mock data dari `lib/mock/*` dan auth localStorage. Cocok untuk preview UI cepat.

## Setup backend (Supabase)

Pakai backend asli (DB + Auth) sebagai berikut:

### 1. Bikin Supabase project

1. Buka <https://supabase.com> → **New Project** (free tier OK)
2. Tunggu provisioning (~2 menit)
3. Buka **Settings → API**, copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret → `SUPABASE_SERVICE_ROLE_KEY` (server-only — JANGAN di-commit)

### 2. `.env.local`

```bash
cp .env.example .env.local
# isi 3 var di atas
```

### 3. Run schema SQL

1. Di dashboard Supabase → **SQL Editor** → **New query**
2. Paste isi `backend/db/schema.sql` → **Run**
3. Schema bikin tabel `profiles`, `products`, RLS policies, + seed 8 produk awal

### 4. Promote diri jadi admin

```bash
npm run dev
```

1. Daftar 1 user via <http://localhost:3000/register>
2. Confirm email (Supabase kirim email confirm — cek inbox)
3. Di dashboard Supabase → **SQL Editor**:

```sql
update public.profiles set role = 'admin' where email = 'kamu@email.com';
```

4. Login ke <http://localhost:3000/admin/login> dengan kredensial yang sama → masuk admin panel.

## Scripts

| Command            | Fungsi                          |
| ------------------ | ------------------------------- |
| `npm run dev`      | Dev server                      |
| `npm run build`    | Production build                |
| `npm run start`    | Run production build            |
| `npm run lint`     | ESLint                          |
| `npm run typecheck`| TypeScript type-check (no emit) |

## Routes (rencana)

### Storefront `(store)/`

| Path                | Halaman                |
| ------------------- | ---------------------- |
| `/`                 | Home                   |
| `/catalog`          | Katalog produk         |
| `/search`           | Search results         |
| `/products/[id]`    | Detail produk          |
| `/cart`             | Keranjang              |
| `/checkout`         | Checkout               |
| `/checkout/success` | Konfirmasi pembayaran  |
| `/login`            | Login                  |
| `/register`         | Daftar                 |
| `/dashboard`        | Dashboard pelanggan    |

### Admin `/admin/*`

| Path                  | Halaman              |
| --------------------- | -------------------- |
| `/admin/login`        | Login admin          |
| `/admin`              | Dashboard admin      |
| `/admin/products`     | Kelola produk        |
| `/admin/products/[id]`| Detail produk admin  |
| `/admin/orders`       | Pesanan              |
| `/admin/stock`        | Stok kredensial      |
| `/admin/users`        | Pelanggan            |
| `/admin/users/[id]`   | Detail pelanggan     |
| `/admin/vouchers`     | Voucher              |
| `/admin/gateways`     | Payment gateway      |
| `/admin/audit`        | Audit log            |
| `/admin/settings`     | Pengaturan toko      |

## Folder

```
app/                Next.js App Router routes
├─ (store)/         Route group storefront (layout sendiri)
└─ admin/           Route admin
components/
├─ shared/          Toast, Skeleton, Field, CommandPalette, dll
├─ store/           Komponen storefront
└─ admin/           Komponen admin
hooks/              Custom hooks (useToast, useCopy, useFormValidation, dll)
lib/
├─ types.ts         Type definitions
├─ format.ts        IDR/USD formatter
├─ theme.ts         THEME tokens
└─ mock/            Mock data (products, orders, users, dll)
_legacy/            Prototype lama (HTML + .jsx via Babel-standalone). Arsip referensi.
```

## Status porting

Project di-port dari prototype `HTML + Babel-standalone + .jsx` ke Next.js. Lihat `git log` untuk progress per tahap. **Semua tahap selesai.**

- [x] **Tahap 1** — Scaffold Next.js + arsip legacy
- [x] **Tahap 2** — Foundation (types, mock data, hooks, shared components)
- [x] **Tahap 3** — Storefront layout + Home
- [x] **Tahap 4** — Storefront pages (catalog, product, cart, checkout, auth, dashboard)
- [x] **Tahap 5** — Admin shell + login + dashboard
- [x] **Tahap 6** — Admin pages (products, orders, stock, users, vouchers, gateways, audit, settings)
- [x] **Tahap 7** — Polish (OnboardingChecklist, Cmd+K CommandPalette, ESLint clean)

### Demo credentials

- **Storefront** — register form atau Google button (mock, tanpa OTP cek `000000` ditolak).
- **Admin** — `admin@lapakurab.id` / password: `admin123` atau `demo`. Tekan **Cmd/Ctrl+K** untuk command palette.

## Catatan styling

Kode lama heavily pakai **inline-style + CSS variables** (lihat `_legacy/`). Saat porting, inline-style dipertahankan apa adanya supaya **zero design drift**. Tailwind v4 ada di project tapi:

- Preflight (CSS reset) **dimatikan** lewat `app/globals.css` (hanya import `theme.css` + `utilities.css`, skip preflight) — supaya inline-style tidak ke-overwrite Tailwind reset.
- Tailwind utility tersedia kalau perlu untuk komponen baru.

## Mock data

Semua data masih hardcoded di `lib/mock/*` untuk fase porting. Struktur sudah disiapkan supaya nanti gampang di-swap ke fetch dari API / Route Handlers tanpa ubah komponen.

---

## Operations / production runbook

### Pre-deploy checklist

Sebelum push ke Vercel production:

- [ ] Set semua env wajib di Vercel dashboard (lihat `.env.example`)
- [ ] `NEXT_PUBLIC_SITE_URL` = domain production (mis. `https://lapakurab.id`)
- [ ] `CRON_SECRET` = random hex 32+ char (`openssl rand -hex 32`)
- [ ] `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` set (rate limiter — tanpa ini, fail-open!)
- [ ] `TOKOPAY_IP_WHITELIST=178.128.104.179` (IP webhook resmi Tokopay)
- [ ] `SENTRY_DSN` + `NEXT_PUBLIC_SENTRY_DSN` set (kalau pakai Sentry)
- [ ] Run `npm run typecheck && npm run lint && npm run build` lokal — semua pass
- [ ] Schema SQL sudah di-run di Supabase production project
- [ ] 1 user sudah promote jadi admin via SQL

### Health monitoring

Endpoint `/api/health` return JSON dengan status komponen:

```bash
curl https://your-domain.com/api/health
# {
#   "status": "ok",
#   "checks": {
#     "server": "ok",
#     "supabase": "ok",
#     "tokopay": "configured",
#     "rateLimit": "configured",
#     "sentry": "configured",
#     "tokopayIpWhitelist": "enforced"
#   }
# }
```

Daftar di [UptimeRobot](https://uptimerobot.com) atau [Better Uptime](https://betteruptime.com) (free tier OK):
- Monitor `https://your-domain.com/api/health` tiap 5 menit
- Alert kalau status code != 200 atau response time > 5s

### Error tracking (Sentry)

Optional tapi RECOMMENDED untuk production. Setup:

```bash
npm i @sentry/nextjs
```

Daftar project di [sentry.io](https://sentry.io) (free tier 5k events/bulan), copy DSN, set:

```
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

Sentry init via `sentry.{server,edge,client}.config.ts` — semua stub-safe (tanpa package, no-op).

### Rate limiting

Pakai Upstash Redis (REST). Daftar di [upstash.com](https://upstash.com) (free 10k req/hari), buat Redis db, copy REST URL + token.

**TANPA Upstash configured**, rate limit FAIL-OPEN — semua request lolos. `assertProductionReady()` akan warning tapi tidak block startup. Pasang Upstash sebelum traffic naik.

Routes yang protected (per IP):
- `/api/auth/login` — 10 / 5 menit
- `/api/auth/register` — 5 / jam
- `/api/checkout` — 5 / menit
- `/api/vouchers/redeem` — 10 / 5 menit
- `/api/upload/product-image` — 20 / menit
- `/api/payments/tokopay/callback` — 30 / menit

### Backup strategy

Supabase free tier punya **daily backup retain 7 hari** (Settings → Database → Backups). Untuk production:

- **Manual export weekly:** `pg_dump` via Supabase CLI atau dashboard → simpan di S3/Drive
- **Storage backup:** product-images bucket — sync ke S3 periodically (gak ada yang auto di Supabase free)
- **Restore drill:** test restore ke project staging tiap kuartal

Upgrade ke Pro ($25/bulan) kalau butuh PITR (Point-In-Time Recovery) + 30 hari retention.

### Secret rotation

Jadwal rotasi:

| Secret | Rotasi |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | 6 bulan, atau immediate kalau leaked |
| `CRON_SECRET` | 1 tahun |
| `TOKOPAY_SECRET` | sesuai policy Tokopay |
| `RESEND_API_KEY` | 6 bulan |
| `UPSTASH_REDIS_REST_TOKEN` | 1 tahun |

Rotasi via Supabase/Tokopay/Resend dashboard → update Vercel env → redeploy.

### Tokopay webhook

Webhook URL: `https://your-domain.com/api/payments/tokopay/callback`

Defense layers:
1. **IP whitelist** — `TOKOPAY_IP_WHITELIST` env (default `178.128.104.179`)
2. **Rate limit** — 30 callback / menit per IP
3. **MD5 signature verify** — anti tamper
4. **Webhook dedup** — `webhook_log` table unique(source, signature) anti replay
5. **Idempotent settlement** — `settlePaymentRef()` aman di-retry

### Smoke test setelah deploy

1. `curl /api/health` → 200 OK
2. Buka homepage → produk muncul
3. Register akun test → terima email confirm
4. Login → masuk dashboard
5. Add to cart → checkout → redirect ke Tokopay
6. (Manual) bayar di Tokopay → webhook fire → order delivered
7. Cek dashboard → kredensial muncul
8. Cek `/api/health` lagi → semua green

### CI

`.github/workflows/ci.yml` jalankan `lint + typecheck + build` di setiap PR + push ke main. Block merge kalau gagal.
