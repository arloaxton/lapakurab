#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════════════════
#  Setup systemd timer untuk cron jobs (replace Vercel Cron).
#  Run sekali setelah deploy pertama:
#    sudo bash deploy/setup-cron.sh
# ════════════════════════════════════════════════════════════════════════

set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "❌ Harus jalan sebagai root (sudo)."
  exit 1
fi

APP_DIR="${APP_DIR:-/srv/lapakurab}"

# ─── 1. Create cron.env (extract CRON_SECRET dari .env.production) ──────
echo "[1/3] Creating cron.env..."
if [[ -f "$APP_DIR/.env.production" ]]; then
  ENV_SOURCE="$APP_DIR/.env.production"
elif [[ -f "$APP_DIR/.env.local" ]]; then
  ENV_SOURCE="$APP_DIR/.env.local"
else
  echo "❌ .env.production atau .env.local tidak ada di $APP_DIR"
  exit 1
fi

CRON_SECRET=$(grep '^CRON_SECRET=' "$ENV_SOURCE" | cut -d= -f2- | tr -d '"' | tr -d "'")
if [[ -z "$CRON_SECRET" ]]; then
  echo "❌ CRON_SECRET tidak ditemukan di $ENV_SOURCE"
  exit 1
fi

mkdir -p "$APP_DIR/deploy"
cat > "$APP_DIR/deploy/cron.env" <<EOF
CRON_SECRET=$CRON_SECRET
EOF
chown deploy:deploy "$APP_DIR/deploy/cron.env"
chmod 600 "$APP_DIR/deploy/cron.env"
echo "  cron.env ready (chmod 600)"

# ─── 2. Install systemd units ───────────────────────────────────────────
echo "[2/3] Install systemd units..."
cp "$APP_DIR/deploy/lapakurab-cron-cleanup.service" /etc/systemd/system/
cp "$APP_DIR/deploy/lapakurab-cron-cleanup.timer" /etc/systemd/system/
systemctl daemon-reload

# ─── 3. Enable + start timer ────────────────────────────────────────────
echo "[3/3] Enable timer..."
systemctl enable lapakurab-cron-cleanup.timer
systemctl start lapakurab-cron-cleanup.timer

echo ""
echo "✅ Cron setup selesai. Cek:"
echo "  systemctl list-timers | grep lapakurab"
echo "  journalctl -u lapakurab-cron-cleanup -n 20"
