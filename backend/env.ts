/**
 * Validated env vars untuk backend Supabase.
 *
 * Convention:
 *   - `NEXT_PUBLIC_*` aman di-expose ke browser bundle.
 *   - `SUPABASE_SERVICE_ROLE_KEY` HARUS server-only — bypass RLS, dipakai
 *     hanya di Route Handlers + service functions yang butuh write data
 *     atas nama admin (mis. seed, migrasi, atau endpoint admin yang sudah
 *     di-gate via session).
 *
 * Helper `isSupabaseConfigured()` dipakai oleh `lib/data/*` repos untuk
 * deteksi apakah backend siap; kalau tidak, repo fallback ke mock.
 *
 * Production-readiness: panggil `assertProductionReady()` saat startup
 * (di `instrumentation.ts`) — fail-fast kalau env wajib hilang di prod.
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "";

// Tokopay (Phase 4) — server-only
const TOKOPAY_MERCHANT_ID = process.env.TOKOPAY_MERCHANT_ID?.trim() || "";
const TOKOPAY_SECRET = process.env.TOKOPAY_SECRET?.trim() || "";
const TOKOPAY_BASE_URL =
  process.env.TOKOPAY_BASE_URL?.trim() || "https://api.tokopay.id/v1";
// Webhook IP whitelist (comma-separated). Kosong = skip (dev only).
const TOKOPAY_IP_WHITELIST_RAW =
  process.env.TOKOPAY_IP_WHITELIST?.trim() || "";
const TOKOPAY_IP_WHITELIST = TOKOPAY_IP_WHITELIST_RAW
  ? TOKOPAY_IP_WHITELIST_RAW.split(",").map((s) => s.trim()).filter(Boolean)
  : [];

// Email — dual mode: SMTP (Postfix VPS) atau Resend HTTP API
// SMTP prioritas pertama kalau SMTP_HOST di-set; fallback ke Resend kalau
// RESEND_API_KEY di-set; kalau dua-duanya kosong, sendEmail no-op.
const RESEND_API_KEY = process.env.RESEND_API_KEY?.trim() || "";
const EMAIL_FROM = process.env.EMAIL_FROM?.trim() || "";
const SMTP_HOST = process.env.SMTP_HOST?.trim() || "";
const SMTP_PORT = parseInt(process.env.SMTP_PORT?.trim() || "25", 10);
const SMTP_USER = process.env.SMTP_USER?.trim() || "";
const SMTP_PASS = process.env.SMTP_PASS?.trim() || "";
const SMTP_SECURE = process.env.SMTP_SECURE?.trim() === "true";

// Cron auth (for /api/cron/*) + Rate limiter (Upstash Redis REST)
const CRON_SECRET = process.env.CRON_SECRET?.trim() || "";
const UPSTASH_REDIS_REST_URL =
  process.env.UPSTASH_REDIS_REST_URL?.trim() || "";
const UPSTASH_REDIS_REST_TOKEN =
  process.env.UPSTASH_REDIS_REST_TOKEN?.trim() || "";

// Sentry error tracking — optional
const SENTRY_DSN = process.env.SENTRY_DSN?.trim() || "";
const NEXT_PUBLIC_SENTRY_DSN =
  process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() || "";

const NODE_ENV = process.env.NODE_ENV?.trim() || "development";

export const env = {
  SUPABASE_URL: URL,
  SUPABASE_ANON_KEY: ANON_KEY,
  SUPABASE_SERVICE_ROLE: SERVICE_ROLE,
  SITE_URL,
  TOKOPAY_MERCHANT_ID,
  TOKOPAY_SECRET,
  TOKOPAY_BASE_URL,
  TOKOPAY_IP_WHITELIST,
  RESEND_API_KEY,
  EMAIL_FROM,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_SECURE,
  CRON_SECRET,
  UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN,
  SENTRY_DSN,
  NEXT_PUBLIC_SENTRY_DSN,
  NODE_ENV,
};

export function isProduction(): boolean {
  return NODE_ENV === "production";
}

export function isTokopayConfigured(): boolean {
  return Boolean(TOKOPAY_MERCHANT_ID && TOKOPAY_SECRET);
}

export function isTokopayIpWhitelistEnforced(): boolean {
  return TOKOPAY_IP_WHITELIST.length > 0;
}

export function isSmtpConfigured(): boolean {
  return Boolean(SMTP_HOST && EMAIL_FROM);
}

export function isEmailConfigured(): boolean {
  return isSmtpConfigured() || Boolean(RESEND_API_KEY && EMAIL_FROM);
}

export function isRateLimiterConfigured(): boolean {
  return Boolean(UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN);
}

export function isSentryConfigured(): boolean {
  return Boolean(SENTRY_DSN);
}

/** True jika URL + anon key sudah di-set (cukup untuk client read). */
export function isSupabaseConfigured(): boolean {
  return Boolean(URL && ANON_KEY);
}

/** True jika service role juga di-set (untuk server-side admin ops). */
export function hasServiceRole(): boolean {
  return Boolean(SERVICE_ROLE);
}

/**
 * Throw kalau dipanggil tanpa env lengkap. Pakai di Route Handlers /
 * server services yang memang butuh DB.
 */
export function assertSupabaseConfigured(): void {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase belum di-konfigurasi. Set NEXT_PUBLIC_SUPABASE_URL & " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY di .env.local. Lihat .env.example."
    );
  }
}

export function assertServiceRole(): void {
  if (!hasServiceRole()) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY tidak di-set. Operasi admin tidak bisa dijalankan."
    );
  }
}

/**
 * Fail-fast di startup production kalau env wajib tidak lengkap.
 * Dipanggil dari `instrumentation.ts` saat Next.js boot.
 *
 * Hanya error fatal di production. Di dev, cukup warning.
 */
export function assertProductionReady(): void {
  const missing: string[] = [];
  const warn: string[] = [];

  // Wajib di production
  if (!URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!ANON_KEY) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!SERVICE_ROLE) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!CRON_SECRET) missing.push("CRON_SECRET");
  if (!SITE_URL) missing.push("NEXT_PUBLIC_SITE_URL");

  // Wajib kalau Tokopay configured
  if (isTokopayConfigured()) {
    if (TOKOPAY_IP_WHITELIST.length === 0) {
      missing.push("TOKOPAY_IP_WHITELIST (Tokopay aktif tapi whitelist kosong)");
    }
  }

  // Highly recommended (warning saja)
  if (!isRateLimiterConfigured()) {
    warn.push("UPSTASH_REDIS_REST_URL/TOKEN — rate limit akan FAIL-OPEN");
  }
  if (!isSentryConfigured()) {
    warn.push("SENTRY_DSN — error tracking tidak aktif");
  }
  if (!isEmailConfigured()) {
    warn.push("RESEND_API_KEY/EMAIL_FROM — email delivery di-skip");
  }

  if (isProduction()) {
    if (missing.length > 0) {
      throw new Error(
        `[env] Production startup gagal — env wajib hilang:\n  - ${missing.join(
          "\n  - "
        )}\nLihat .env.example untuk daftar lengkap.`
      );
    }
    if (warn.length > 0) {
      console.warn(
        `[env] Production warning — env optional tapi RECOMMENDED hilang:\n  - ${warn.join(
          "\n  - "
        )}`
      );
    }
  } else {
    if (missing.length > 0 || warn.length > 0) {
      const all = [...missing, ...warn];
      console.info(
        `[env] Dev mode — env yang akan jadi blocker di production:\n  - ${all.join(
          "\n  - "
        )}`
      );
    }
  }
}
