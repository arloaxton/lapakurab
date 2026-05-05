"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "calc(100vh - 70px)",
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
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 24,
          padding: "40px 28px",
        }}
      >
        <div style={{ fontSize: 56, marginBottom: 12 }}>⚠️</div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 22,
            fontWeight: 700,
            margin: "0 0 8px",
            color: "var(--ink)",
          }}
        >
          Ada yang salah di sini
        </h1>
        <p style={{ color: "var(--ink-soft)", fontSize: 13, margin: "0 0 16px", lineHeight: 1.6 }}>
          Halaman gagal di-render. Coba muat ulang.
        </p>
        {error.digest && (
          <code
            style={{
              display: "inline-block",
              marginBottom: 20,
              padding: "4px 10px",
              borderRadius: 6,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              fontFamily: "var(--font-mono), ui-monospace, monospace",
              fontSize: 11,
              color: "var(--ink-soft)",
            }}
          >
            {error.digest}
          </code>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={reset}
            style={{
              padding: "10px 20px",
              borderRadius: 999,
              border: 0,
              background: "var(--primary)",
              color: "white",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Coba lagi
          </button>
          <Link
            href="/"
            style={{
              padding: "10px 20px",
              borderRadius: 999,
              border: "1.5px solid var(--border)",
              color: "var(--ink)",
              fontWeight: 700,
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            ← Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
