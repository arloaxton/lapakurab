#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════════════════
#  lapakurab — VPS one-time bootstrap (Ubuntu 22.04)
# ────────────────────────────────────────────────────────────────────────
#  Run sekali saat VPS fresh. Install Node 20, PM2, Caddy, build deps.
#
#  Pakai:
#    curl -fsSL https://raw.githubusercontent.com/arloaxton/lapakurab/main/deploy/setup-server.sh | sudo bash
#  ATAU clone repo dulu lalu:
#    sudo bash deploy/setup-server.sh
# ════════════════════════════════════════════════════════════════════════

set -euo pipefail

# ─── Guard: must be root ────────────────────────────────────────────────
if [[ $EUID -ne 0 ]]; then
  echo "❌ Script ini harus jalan sebagai root (sudo)."
  exit 1
fi

# ─── Vars (override via env) ────────────────────────────────────────────
APP_USER="${APP_USER:-deploy}"
APP_DIR="${APP_DIR:-/srv/lapakurab}"
NODE_MAJOR="${NODE_MAJOR:-20}"

echo "════════════════════════════════════════════════════════════"
echo "  lapakurab VPS bootstrap"
echo "  User      : $APP_USER"
echo "  App dir   : $APP_DIR"
echo "  Node      : v$NODE_MAJOR.x"
echo "════════════════════════════════════════════════════════════"
echo ""

# ─── 1. System update + base deps ───────────────────────────────────────
echo "[1/8] Updating apt + install base deps..."
apt-get update -qq
apt-get upgrade -yqq
apt-get install -yqq \
  curl ca-certificates gnupg lsb-release \
  build-essential git unzip ufw \
  debian-keyring debian-archive-keyring apt-transport-https

# ─── 2. Node.js 20 (Nodesource) ─────────────────────────────────────────
echo "[2/8] Installing Node.js v$NODE_MAJOR..."
if ! command -v node &> /dev/null || [[ $(node -v | cut -dv -f2 | cut -d. -f1) -lt $NODE_MAJOR ]]; then
  curl -fsSL https://deb.nodesource.com/setup_${NODE_MAJOR}.x | bash -
  apt-get install -yqq nodejs
fi
echo "  Node $(node -v), npm $(npm -v)"

# ─── 3. PM2 (process manager) ───────────────────────────────────────────
echo "[3/8] Installing PM2..."
npm install -g pm2

# ─── 4. Caddy (reverse proxy + auto-SSL) ───────────────────────────────
echo "[4/8] Installing Caddy..."
if ! command -v caddy &> /dev/null; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
    | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
    | tee /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -qq
  apt-get install -yqq caddy
fi
echo "  Caddy $(caddy version | head -1)"

# ─── 5. App user (non-root) ─────────────────────────────────────────────
echo "[5/8] Creating app user '$APP_USER'..."
if ! id "$APP_USER" &>/dev/null; then
  adduser --disabled-password --gecos "" "$APP_USER"
  usermod -aG sudo "$APP_USER"
  echo "  User created. Setup SSH key:"
  echo "    sudo mkdir -p /home/$APP_USER/.ssh"
  echo "    sudo cp ~/.ssh/authorized_keys /home/$APP_USER/.ssh/"
  echo "    sudo chown -R $APP_USER:$APP_USER /home/$APP_USER/.ssh"
  echo "    sudo chmod 700 /home/$APP_USER/.ssh"
  echo "    sudo chmod 600 /home/$APP_USER/.ssh/authorized_keys"
fi

# ─── 6. App directory ──────────────────────────────────────────────────
echo "[6/8] Setting up $APP_DIR..."
mkdir -p "$APP_DIR"
chown -R "$APP_USER:$APP_USER" "$APP_DIR"
mkdir -p /var/log/lapakurab
chown -R "$APP_USER:$APP_USER" /var/log/lapakurab

# ─── 7. UFW firewall ───────────────────────────────────────────────────
echo "[7/8] Configuring UFW firewall..."
ufw --force reset >/dev/null 2>&1 || true
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP (Caddy redirect)'
ufw allow 443/tcp comment 'HTTPS (Caddy)'
ufw --force enable
ufw status verbose

# ─── 8. Disable root SSH login + password auth (security) ───────────────
echo "[8/8] Hardening SSH..."
sed -i 's/^#*PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
echo "  ⚠️  SSH password auth DISABLED. Make sure $APP_USER has SSH key set up!"
echo "  Test login dari laptop SEBELUM logout: ssh $APP_USER@$(curl -s ifconfig.me)"
echo "  Restart sshd manual: sudo systemctl restart sshd"

# ─── Summary ────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════════════"
echo "  ✅ Bootstrap selesai"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "  1. Setup SSH key untuk user '$APP_USER' (lihat output #5)"
echo "  2. Login sebagai $APP_USER:"
echo "       su - $APP_USER"
echo "  3. Clone repo:"
echo "       cd $APP_DIR && git clone https://github.com/arloaxton/lapakurab.git ."
echo "  4. Setup .env.production di $APP_DIR/.env.production"
echo "  5. Run deploy script pertama kali:"
echo "       bash deploy/deploy.sh"
echo "  6. Copy & customize Caddyfile:"
echo "       sudo cp $APP_DIR/deploy/Caddyfile /etc/caddy/Caddyfile"
echo "       (edit domain dulu sebelum reload!)"
echo "       sudo systemctl reload caddy"
echo "  7. Setup cron systemd:"
echo "       bash $APP_DIR/deploy/setup-cron.sh"
echo ""
echo "Lihat $APP_DIR/deploy/README.md untuk runbook lengkap."
