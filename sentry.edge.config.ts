/**
 * Sentry edge runtime init. Lihat sentry.server.config.ts untuk
 * dokumentasi lengkap.
 */

import { env, isProduction } from "./backend/env";

async function initSentry() {
  if (!env.SENTRY_DSN) return;
  try {
    const Sentry = await import(
      /* webpackIgnore: true */ /* turbopackIgnore: true */
      "@sentry/nextjs" as string
    ).catch(() => null);
    if (!Sentry) return; // already warned di server config
    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: isProduction() ? "production" : "development",
      tracesSampleRate: isProduction() ? 0.1 : 1.0,
    });
  } catch (e) {
    console.warn("[sentry-edge] init failed:", e);
  }
}

initSentry();
