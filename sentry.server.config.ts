/**
 * Sentry server-side init.
 *
 * Stub yang aman walaupun `@sentry/nextjs` belum installed.
 * Kalau mau pakai Sentry:
 *   1. `npm i @sentry/nextjs`
 *   2. Set SENTRY_DSN + NEXT_PUBLIC_SENTRY_DSN di env
 *   3. File ini akan otomatis init Sentry saat boot
 *
 * Pakai dynamic require + try/catch supaya bundle tetap build kalau
 * package tidak terinstall.
 */

import { env, isProduction } from "./backend/env";

async function initSentry() {
  if (!env.SENTRY_DSN) return;
  try {
    // Dynamic import — magic comment bilang ke bundler "jangan resolve",
    // jadi build pass walaupun @sentry/nextjs belum installed
    const Sentry = await import(
      /* webpackIgnore: true */ /* turbopackIgnore: true */
      "@sentry/nextjs" as string
    ).catch(() => null);
    if (!Sentry) {
      console.warn(
        "[sentry] SENTRY_DSN set tapi @sentry/nextjs belum installed. " +
          "Run: npm i @sentry/nextjs"
      );
      return;
    }
    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: isProduction() ? "production" : "development",
      tracesSampleRate: isProduction() ? 0.1 : 1.0,
      ignoreErrors: [
        "ResizeObserver loop limit exceeded",
        "Non-Error promise rejection captured",
        "OriginMismatchError",
      ],
    });
  } catch (e) {
    console.warn("[sentry] init failed:", e);
  }
}

initSentry();
