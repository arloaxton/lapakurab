# Deploy ke VPS (Racknerd Ubuntu 22.04)

Stack: **Caddy** (reverse proxy + auto-SSL) → **PM2** (process manager) → **Next.js** (standalone) → **Supabase/Upstash** (eksternal).

```
Internet → Cloudflare → Caddy:443 → Next.js:3000 (PM2 cluster)
                              ↓
                        systemd timer → /api/cron/cleanup-pending
```

---

## Prerequisites

- VPS Racknerd Ubuntu 22.04, akses root via SSH
- Domain (mis. `lapakurab.id`) — bisa dari Niagahoster, Namecheap, Cloudflare Registrar
- Akun Cloudflare (free) — untuk DNS + DDoS + CDN
- Repo GitHub: `https://github.com/arloaxton/lapakurab`
- Local SSH key sudah generate (`~/.ssh/id_ed25519` atau `id_rsa`)

---

## STEP 0 — Beli/setup domain + Cloudflare

### 0.1 Beli domain
Tempat bagus + murah:
- **Cloudflare Registrar** ($10-12/tahun .id, no markup) — RECOMMENDED
- **Namecheap** ($12-15/tahun)
- **Niagahoster** (lokal IDR ~150-200rb/tahun .id)

### 0.2 Setup Cloudflare DNS
1. Sign up di https://cloudflare.com
2. **Add Site** → masukkan domain → pilih plan **Free**
3. Cloudflare scan DNS, lalu kasih 2 nameserver (mis. `bob.ns.cloudflare.com`, `ann.ns.cloudflare.com`)
4. Update nameserver di registrar domain → tunggu propagasi 5-30 menit
5. Setelah Cloudflare confirm "Active", tambah DNS record:
   - **Type:** A
   - **Name:** `@` (root) atau `lapakurab.id`
   - **IPv4:** IP VPS Racknerd kamu
   - **Proxy status:** ⚠️ **DNS only (grey cloud)** — sementara
   - **TTL:** Auto
6. Tambah lagi untuk www:
   - **Type:** A
   - **Name:** `www`
   - **IPv4:** IP VPS
   - **Proxy:** DNS only (grey cloud)

> ⚠️ **PENTING:** grey cloud dulu sampai Caddy berhasil issue Let's Encrypt cert. Setelah cert OK, baru switch ke orange cloud.

---

## STEP 1 — Bootstrap VPS (one-time)

SSH ke VPS sebagai root:

```bash
ssh root@<IP-VPS>
```

### 1.1 Run bootstrap script

```bash
# Clone repo dulu (atau pakai curl one-liner)
git clone https://github.com/arloaxton/lapakurab.git /tmp/lapakurab
cd /tmp/lapakurab
bash deploy/setup-server.sh
```

Script akan install: Node 20, PM2, Caddy, UFW, bikin user `deploy`, harden SSH.

### 1.2 Setup SSH key untuk user `deploy`

```bash
sudo mkdir -p /home/deploy/.ssh
sudo cp ~/.ssh/authorized_keys /home/deploy/.ssh/
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys
```

### 1.3 Test login dari laptop SEBELUM logout root

Di laptop kamu (terminal baru, JANGAN tutup yang root):

```bash
ssh deploy@<IP-VPS>
```

Kalau berhasil masuk, baru:

```bash
sudo systemctl restart sshd
```

Logout root:
```bash
exit
```

---

## STEP 2 — Clone & setup app

Login sebagai `deploy`:

```bash
ssh deploy@<IP-VPS>
sudo chown -R deploy:deploy /srv/lapakurab
cd /srv/lapakurab
git clone https://github.com/arloaxton/lapakurab.git .
```

### 2.1 Bikin `.env.production`

```bash
cp .env.example .env.production
nano .env.production
```

Isi semua env wajib (copy nilai dari `.env.local` lokal kamu, atau dari Supabase/Upstash dashboard):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=https://lapakurab.id   # ← domain production
TOKOPAY_MERCHANT_ID=...
TOKOPAY_SECRET=...
TOKOPAY_BASE_URL=https://api.tokopay.id/v1
TOKOPAY_IP_WHITELIST=178.128.104.179
RESEND_API_KEY=re_...                       # optional
EMAIL_FROM="lapakurab <noreply@lapakurab.id>"
CRON_SECRET=<random hex 64 char>
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=...
SENTRY_DSN=https://...                      # optional
NEXT_PUBLIC_SENTRY_DSN=https://...
NODE_ENV=production
```

Set permission:

```bash
chmod 600 .env.production
```

### 2.2 Run schema SQL di Supabase production

Sebelum first deploy, pastikan tabel sudah ada di Supabase:

1. Buka Supabase Dashboard project production
2. SQL Editor → New query
3. Paste isi `backend/db/schema.sql` → Run

### 2.3 First deploy

```bash
bash deploy/deploy.sh
```

Script akan: install deps, build, copy assets, start PM2, health check.

Verifikasi:
```bash
pm2 status
curl http://localhost:3000/api/health
```

Health check return `{"status":"ok",...}` ← berarti Next.js jalan.

### 2.4 PM2 auto-start on reboot

```bash
pm2 startup systemd     # akan kasih command yang harus di-run dengan sudo
# Run command yang di-print
pm2 save
```

---

## STEP 3 — Setup Caddy reverse proxy

```bash
sudo cp /srv/lapakurab/deploy/Caddyfile /etc/caddy/Caddyfile
sudo nano /etc/caddy/Caddyfile
```

Edit baris ini sesuai domain kamu:
```
lapakurab.id, www.lapakurab.id {
```

Validate config + reload:
```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Cek log Caddy:
```bash
sudo journalctl -u caddy -n 30 -f
```

Tunggu sampai muncul `obtained certificate for lapakurab.id` (~30 detik). Kalau gagal:
- Pastikan DNS sudah point ke IP VPS (test: `dig lapakurab.id @8.8.8.8`)
- Pastikan port 80 + 443 open di UFW
- Pastikan Cloudflare masih **DNS only (grey cloud)** — belum proxied

Test:
```bash
curl https://lapakurab.id/api/health
```

Kalau jalan, lanjut step 4.

---

## STEP 4 — Aktifkan Cloudflare proxy (orange cloud)

Setelah Caddy berhasil issue cert:

1. Cloudflare Dashboard → DNS → toggle proxy untuk `@` dan `www` ke **Proxied (orange cloud)**
2. **SSL/TLS** → set encryption mode ke **Full (strict)** (Cloudflare ↔ origin pakai cert valid)
3. **SSL/TLS → Edge Certificates** → enable **Always Use HTTPS** + **Automatic HTTPS Rewrites** + **Min TLS 1.2**
4. **Speed → Optimization** → enable **Auto Minify** (HTML/CSS/JS) + **Brotli**
5. **Caching → Configuration** → Browser Cache TTL: Respect Existing Headers
6. **Security → WAF** → enable basic rules (Free plan dapat OWASP managed ruleset)

Test lagi:
```bash
curl -I https://lapakurab.id
# Pastikan ada header: server: cloudflare, cf-cache-status: ...
```

---

## STEP 5 — Setup cron jobs

```bash
sudo bash /srv/lapakurab/deploy/setup-cron.sh
```

Verifikasi:
```bash
systemctl list-timers | grep lapakurab
journalctl -u lapakurab-cron-cleanup -n 20
```

Manual trigger test:
```bash
sudo systemctl start lapakurab-cron-cleanup
journalctl -u lapakurab-cron-cleanup -n 5
```

---

## STEP 6 — Smoke test production

1. **Homepage:** `https://lapakurab.id` → product grid muncul
2. **Health:** `https://lapakurab.id/api/health` → status ok
3. **Register:** bikin akun test → terima email confirm
4. **Login:** masuk dashboard
5. **Add to cart → checkout** → redirect ke Tokopay
6. (Manual) bayar di Tokopay → webhook fire → cek dashboard delivered
7. **Promote admin:** Supabase SQL Editor:
   ```sql
   update profiles set role='admin' where email='your-admin@email.com';
   ```
8. Login `/admin/login` → akses admin panel

---

## OPS — Daily commands

### Deploy update baru
```bash
ssh deploy@<IP-VPS>
cd /srv/lapakurab
bash deploy/deploy.sh
```

### Cek status
```bash
pm2 status                       # PM2 processes
pm2 logs lapakurab --lines 100   # tail logs
pm2 monit                        # real-time CPU/RAM
sudo systemctl status caddy      # Caddy status
sudo journalctl -u caddy -n 50   # Caddy logs
sudo ufw status                  # firewall
df -h                            # disk usage
free -h                          # RAM usage
```

### Restart komponen
```bash
pm2 reload lapakurab             # zero-downtime reload Next.js
pm2 restart lapakurab            # full restart (1-2s downtime)
sudo systemctl reload caddy      # reload Caddy
sudo systemctl restart caddy     # full restart Caddy (~1s downtime)
```

### Rollback ke commit sebelumnya
```bash
cd /srv/lapakurab
git log --oneline -10            # pilih commit hash
git reset --hard <commit-hash>
bash deploy/deploy.sh
```

---

## Monitoring (recommended)

### Uptime monitor
- **UptimeRobot** (free): monitor `https://lapakurab.id/api/health` tiap 5 menit
- Alert via email/Slack/Telegram kalau status != 200

### Server metrics
- **Netdata** (gratis, real-time):
  ```bash
  sudo bash <(curl -SsL https://my-netdata.io/kickstart.sh) --dont-wait
  ```
  Akses di `https://<IP>:19999` (lock dengan Caddy basic auth)

### Sentry (error tracking)
- `npm i @sentry/nextjs` di local
- Set `SENTRY_DSN` + `NEXT_PUBLIC_SENTRY_DSN` di `.env.production`
- Re-deploy: `bash deploy/deploy.sh`

---

## Troubleshooting

### "Cannot find module '@/...'"
Build skip standalone copy. Pastikan `output: "standalone"` di `next.config.ts`, lalu rebuild.

### Cert Let's Encrypt gagal issue
- Cek DNS: `dig lapakurab.id @8.8.8.8` → IP harus match VPS
- Cek port 80 open: `sudo ufw status`
- Cek Cloudflare grey cloud (bukan orange) saat first issue
- Caddy log: `sudo journalctl -u caddy -n 100`

### PM2 process keep crashing
```bash
pm2 logs lapakurab --err --lines 50
```
Biasanya: env var missing → cek `.env.production` lengkap.

### "ENOSPC: no space left on device"
```bash
df -h
# Cleanup: docker, npm cache, journalctl old logs
sudo journalctl --vacuum-time=7d
npm cache clean --force
```

### Tokopay webhook tidak masuk
- Cek IP whitelist: `TOKOPAY_IP_WHITELIST` di `.env.production`
- Cek log: `pm2 logs lapakurab | grep tokopay`
- Cek Cloudflare WAF tidak block (bisa add Page Rule allow `/api/payments/tokopay/*`)

### Database "too many connections"
Supabase free tier: 60 max connections. Cek di dashboard. Kalau full, restart Supabase project atau upgrade tier.

---

## Backup strategy

### Database (Supabase)
- Free tier: daily backup retain 7 hari (Settings → Database → Backups)
- Upgrade Pro: PITR (Point-In-Time Recovery) + 30 hari

### Storage (Supabase product-images)
Manual sync ke S3 weekly (gak ada auto di free tier):
```bash
# Di laptop, pakai supabase-cli atau rclone
```

### App code
Sudah di GitHub. Untuk disaster recovery:
1. Provisi VPS baru
2. Run `setup-server.sh`
3. Clone repo
4. Restore `.env.production` dari password manager
5. Run `deploy.sh`

Total downtime: ~30 menit kalau panic.

---

## Cost estimate (monthly)

| Item | Cost |
|---|---|
| Racknerd VPS 2GB RAM | $2-5 |
| Domain `.id` | $1 (avg, $12/yr) |
| Cloudflare | $0 (free) |
| Supabase | $0 (free tier 500MB DB) |
| Upstash | $0 (free 10k req/hari) |
| Sentry | $0 (free 5k events/bulan) |
| Resend | $0 (free 3k email/bulan) |
| **TOTAL** | **~$3-6/bulan** |

Upgrade ke paid tier kalau:
- Supabase: > 500MB DB atau > 1GB storage → $25/bulan
- Upstash: > 10k req/hari → $0.20/100k req
- Sentry: > 5k errors/bulan → $26/bulan

---

## Security checklist

- [x] SSH password auth disabled (key-only)
- [x] Root SSH login disabled
- [x] UFW firewall (only 22/80/443 open)
- [x] HTTPS enforced (Caddy auto-redirect HTTP → HTTPS)
- [x] HSTS preload header
- [x] Cloudflare WAF enabled
- [x] Rate limiting (Upstash) on critical endpoints
- [x] Tokopay IP whitelist enforced
- [x] Webhook signature verify (MD5 timing-safe)
- [x] Webhook idempotency (anti-replay)
- [x] Service role key server-only
- [x] RLS enabled on all tables
- [ ] Fail2ban (optional, untuk SSH brute-force defense — UFW + key auth sudah cukup)
- [ ] Auto OS security updates (`sudo apt install unattended-upgrades`)

---

Semua pertanyaan/issue, ke `pm2 logs lapakurab` dulu — 90% error muncul di sana.
