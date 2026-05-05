/**
 * PM2 ecosystem config — manage Next.js production process.
 *
 * Pakai:
 *   pm2 start deploy/ecosystem.config.cjs --env production
 *   pm2 reload lapakurab        # zero-downtime reload
 *   pm2 logs lapakurab          # tail logs
 *   pm2 monit                   # CPU/RAM monitor
 *   pm2 save && pm2 startup     # auto-start on reboot
 */

module.exports = {
  apps: [
    {
      name: "lapakurab",
      // Standalone build (next.config.ts: output: "standalone")
      script: "./.next/standalone/server.js",
      cwd: "/srv/lapakurab",

      // Cluster mode: 1 instance per CPU core (max 2 untuk VPS 2-core).
      // Kalau RAM terbatas (<2GB), pakai "fork" dengan instances: 1.
      exec_mode: "cluster",
      instances: "max", // atau number, mis. 2

      // Auto-restart pada crash. Limit untuk hindari crash loop.
      autorestart: true,
      max_restarts: 10,
      min_uptime: "30s",

      // Restart kalau RAM > 1GB per instance (safety net memory leak)
      max_memory_restart: "1G",

      // Env vars — di-load dari .env.production (PM2 tidak auto-load .env file,
      // jadi kita pakai dotenv di start atau pass via env_production di sini).
      // Recommend: tetap manage env via .env.production + load di Next.js
      // (Next.js auto-load .env.production saat NODE_ENV=production).
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "127.0.0.1", // bind localhost only — Caddy yang public
      },

      // Logs — rotation di-handle PM2 logrotate module:
      //   pm2 install pm2-logrotate
      //   pm2 set pm2-logrotate:max_size 50M
      //   pm2 set pm2-logrotate:retain 7
      out_file: "/var/log/lapakurab/out.log",
      error_file: "/var/log/lapakurab/error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
    },
  ],
};
