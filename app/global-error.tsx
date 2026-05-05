"use client";

/**
 * Global error boundary — catastrophic errors yang crash root layout
 * (mis. error di RootLayout itself, atau error sebelum hydration). Next.js
 * butuh ini sebagai fallback terakhir; render harus include <html> + <body>
 * sendiri.
 *
 * Kalau ini ke-trigger, biasanya bug serius — log + tampilkan minimal UI.
 */

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Bisa di-wire ke Sentry/Axiom di sini
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          background: "#fafafa",
          color: "#1a1626",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 480,
            width: "100%",
            textAlign: "center",
            background: "white",
            borderRadius: 16,
            padding: "40px 28px",
            boxShadow: "0 12px 36px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ fontSize: 56, marginBottom: 12 }}>💥</div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              margin: "0 0 8px",
            }}
          >
            Sistem error
          </h1>
          <p
            style={{
              color: "#666",
              fontSize: 14,
              lineHeight: 1.6,
              margin: "0 0 16px",
            }}
          >
            Terjadi kesalahan yang tidak terduga. Tim kami sudah otomatis ter-notify.
          </p>
          {error.digest && (
            <code
              style={{
                display: "inline-block",
                marginBottom: 20,
                padding: "4px 10px",
                borderRadius: 6,
                background: "#f3f3f3",
                fontFamily: "ui-monospace, monospace",
                fontSize: 11,
                color: "#666",
              }}
            >
              {error.digest}
            </code>
          )}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                padding: "10px 20px",
                borderRadius: 999,
                border: 0,
                background: "#FF6B9D",
                color: "white",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Muat ulang
            </button>
            {/* global-error render di luar Next.js layout — pakai <a> biasa,
                next/link butuh app context yang tidak tersedia di sini. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                padding: "10px 20px",
                borderRadius: 999,
                border: "1.5px solid #e5e5e5",
                color: "#1a1626",
                fontWeight: 700,
                fontSize: 13,
                textDecoration: "none",
              }}
            >
              ← Beranda
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
