# lapakurab

Marketplace akun digital — streaming, VPN, dan premium services lainnya.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind v4

---

## Dev

```bash
npm install
npm run dev
```

Buka <http://localhost:3000>.

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

Project sedang di-port dari prototype `HTML + Babel-standalone + .jsx` ke Next.js. Lihat `git log` untuk progress per tahap.

- [x] **Tahap 1** — Scaffold Next.js + arsip legacy
- [ ] **Tahap 2** — Foundation (types, mock data, hooks, shared components)
- [ ] **Tahap 3** — Storefront layout + Home
- [ ] **Tahap 4** — Storefront pages (catalog, product, cart, checkout, auth, dashboard)
- [ ] **Tahap 5** — Admin shell + login + dashboard
- [ ] **Tahap 6** — Admin pages (products, orders, stock, users, vouchers, gateways, audit, settings)
- [ ] **Tahap 7** — Polish

## Catatan styling

Kode lama heavily pakai **inline-style + CSS variables** (lihat `_legacy/`). Saat porting, inline-style dipertahankan apa adanya supaya **zero design drift**. Tailwind v4 ada di project tapi:

- Preflight (CSS reset) **dimatikan** lewat `app/globals.css` (hanya import `theme.css` + `utilities.css`, skip preflight) — supaya inline-style tidak ke-overwrite Tailwind reset.
- Tailwind utility tersedia kalau perlu untuk komponen baru.

## Mock data

Semua data masih hardcoded di `lib/mock/*` untuk fase porting. Struktur sudah disiapkan supaya nanti gampang di-swap ke fetch dari API / Route Handlers tanpa ubah komponen.
