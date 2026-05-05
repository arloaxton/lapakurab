#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════════════════
#  lapakurab — Manual deploy script
# ────────────────────────────────────────────────────────────────────────
#  Run di VPS sebagai user 'deploy' (BUKAN root):
#    cd /srv/lapakurab && bash deploy/deploy.sh
#
#  Workflow:
#    1. Pull latest dari git
#    2. Install deps (npm ci)
#    3. Build Next.js (output:standalone)
#    4. Copy static + public ke standalone dir
#    5. PM2 reload (zero-downtime)
#    6. Health check
# ════════════════════════════════════════════════════════════════════════

set -euo pipefail

APP_DIR="${APP_DIR:-/srv/lapakurab}"
HEALTH_URL="${HEALTH_URL:-http://localhost:3000/api/health}"
BRANCH="${BRANCH:-main}"

# ─── Color output ───────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
ok()    { echo -e "${GREEN}[✓]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
err()   { echo -e "${RED}[✗]${NC} $1"; }
step()  { echo -e "\n${YELLOW}━━━ $1 ━━━${NC}"; }

# ─── Guard: must be in app dir ──────────────────────────────────────────
cd "$APP_DIR" || { err "Cannot cd to $APP_DIR"; exit 1; }

if [[ ! -f .env.production ]] && [[ ! -f .env.local ]]; then
  err ".env.production atau .env.local TIDAK ada di $APP_DIR"
  err "Buat dulu sebelum deploy. Lihat .env.example."
  exit 1
fi

START_TIME=$(date +%s)

# ─── Step 1: Git pull ───────────────────────────────────────────────────
step "1/6 Git pull origin/$BRANCH"
git fetch origin "$BRANCH"
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse "origin/$BRANCH")
if [[ "$LOCAL" == "$REMOTE" ]]; then
  warn "Sudah up-to-date. Lanjut build (skip-able dengan: SKIP_BUILD=1 deploy.sh)"
fi
git reset --hard "origin/$BRANCH"
ok "Now at: $(git log -1 --oneline)"

# ─── Step 2: Install deps ───────────────────────────────────────────────
if [[ "${SKIP_INSTALL:-0}" != "1" ]]; then
  step "2/6 npm ci"
  npm ci --omit=dev --no-audit --no-fund || npm ci --no-audit --no-fund
  ok "Deps installed"
else
  warn "Skip install (SKIP_INSTALL=1)"
fi

# ─── Step 3: Build ──────────────────────────────────────────────────────
if [[ "${SKIP_BUILD:-0}" != "1" ]]; then
  step "3/6 Next.js build"
  NODE_ENV=production npm run build
  ok "Build done"
else
  warn "Skip build (SKIP_BUILD=1)"
fi

# ─── Step 4: Copy static + public ke standalone ─────────────────────────
step "4/6 Copy static + public ke standalone"
# Standalone output gak include static + public assets, harus di-copy manual
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/ 2>/dev/null || warn "No public/ dir"
ok "Standalone bundle ready"

# ─── Step 5: PM2 reload ─────────────────────────────────────────────────
step "5/6 PM2 reload (zero-downtime)"
if pm2 list | grep -q "lapakurab"; then
  pm2 reload lapakurab --update-env
else
  warn "Process belum jalan, start fresh..."
  pm2 start deploy/ecosystem.config.cjs
fi
pm2 save
ok "PM2 reload done"

# ─── Step 6: Health check ───────────────────────────────────────────────
step "6/6 Health check"
sleep 3
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" || echo "000")
if [[ "$HTTP_CODE" == "200" ]]; then
  ok "Health check passed (200 OK)"
  HEALTH_BODY=$(curl -s "$HEALTH_URL" | head -c 500)
  echo "  $HEALTH_BODY"
else
  err "Health check failed (HTTP $HTTP_CODE)"
  err "Cek logs: pm2 logs lapakurab --lines 50"
  exit 1
fi

# ─── Summary ────────────────────────────────────────────────────────────
ELAPSED=$(($(date +%s) - START_TIME))
echo ""
echo "════════════════════════════════════════════════════════════"
ok "Deploy selesai dalam ${ELAPSED}s"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Quick checks:"
echo "  pm2 status                # cek process"
echo "  pm2 logs lapakurab        # tail logs"
echo "  curl http://localhost:3000/api/health"
echo ""
