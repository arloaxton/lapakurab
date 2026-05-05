/**
 * Sentry browser-side init. Loaded otomatis oleh Next.js.
 * Pakai NEXT_PUBLIC_SENTRY_DSN supaya available di client bundle.
 *
 * Stub-safe: kalau @sentry/nextjs belum installed, ini no-op.
 */

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

async function initSentry() {
  if (!dsn) return;
  try {
    const Sentry = await import(
      /* webpackIgnore: true */ /* turbopackIgnore: true */
      "@sentry/nextjs" as string
    ).catch(() => null);
    if (!Sentry) return;
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      replaysOnErrorSampleRate: 0.5,
      replaysSessionSampleRate: 0.0,
        integrations: [Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true })],
    });
  } catch {
    // Silent — sudah di-warn di server config
  }
}

initSentry();
