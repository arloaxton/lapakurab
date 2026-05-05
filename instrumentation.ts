/**
 * Next.js instrumentation hook — dipanggil sekali saat server boot
 * (sebelum handle request pertama).
 *
 * Pakai untuk:
 *   1. Validate env wajib (assertProductionReady) — fail-fast
 *   2. Init error tracking (Sentry) — kalau di-konfigurasi
 *
 * Docs: https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
 */

export async function register() {
  // Env validation — wajib jalan paling awal supaya kalau ada masalah,
  // server crash di startup, bukan di request pertama.
  const { assertProductionReady, isSentryConfigured, isProduction } =
    await import("./backend/env");

  try {
    assertProductionReady();
  } catch (e) {
    // Re-throw di production supaya Vercel/Node gagal start
    if (isProduction()) throw e;
    console.warn(e instanceof Error ? e.message : e);
  }

  // Sentry init — hanya kalau DSN di-set. Lazy import supaya bundle
  // tidak include Sentry kalau user tidak pakai.
  if (isSentryConfigured()) {
    if (process.env.NEXT_RUNTIME === "nodejs") {
      try {
        await import("./sentry.server.config");
      } catch (e) {
        console.warn("[instrumentation] Sentry server init skipped:", e);
      }
    }
    if (process.env.NEXT_RUNTIME === "edge") {
      try {
        await import("./sentry.edge.config");
      } catch (e) {
        console.warn("[instrumentation] Sentry edge init skipped:", e);
      }
    }
  }
}
