"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

interface PaymentStatus {
  paymentRef: string;
  status: "pending" | "paid" | "delivered" | "refunded" | "failed";
  orders: Array<{
    id: string;
    productName: string;
    duration: string;
    total: number;
    status: string;
  }>;
}

function CheckoutSuccessInner() {
  const sp = useSearchParams();
  const email = sp.get("email") || "kamu@email.com";
  const ref = sp.get("ref");
  const [statusData, setStatusData] = useState<PaymentStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollCount = useRef(0);

  // Poll status kalau ada ?ref=PAYMENT_REF (Pakasir flow).
  useEffect(() => {
    if (!ref) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      pollCount.current += 1;
      // Sync dengan Pakasir setiap 3rd poll (~9s) untuk fallback kalau
      // webhook delayed.
      const syncQuery = pollCount.current % 3 === 0 ? "?sync=1" : "";
      try {
        const res = await fetch(`/api/payments/${ref}/status${syncQuery}`);
        const data = (await res.json()) as PaymentStatus | { error?: string };
        if (!res.ok || !("status" in data)) {
          setError(("error" in data && data.error) || "Gagal cek status");
          return;
        }
        if (cancelled) return;
        setStatusData(data);
        // Stop polling kalau sudah final state
        if (data.status === "pending") {
          timer = setTimeout(poll, 3500);
        }
      } catch {
        if (!cancelled) timer = setTimeout(poll, 5000);
      }
    };
    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [ref]);

  // ─── State labels ───────────────────────────────────────────────────────
  const isPending = ref ? statusData?.status === "pending" || (!statusData && !error) : false;
  const isFailed = statusData?.status === "failed" || statusData?.status === "refunded";

  // ─── Render ─────────────────────────────────────────────────────────────
  if (isPending) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "48px 24px", textAlign: "center" }}>
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            margin: "0 auto 24px",
            background: "var(--surface-2)",
            border: "3px solid var(--border)",
            borderTopColor: "var(--primary)",
            animation: "spin 1s linear infinite",
          }}
        />
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 28,
            fontWeight: 800,
            margin: "0 0 8px",
            color: "var(--ink)",
          }}
        >
          Menunggu pembayaran
        </h1>
        <p style={{ color: "var(--ink-soft)", fontSize: 14, lineHeight: 1.6, margin: "0 0 16px" }}>
          Selesaikan pembayaran di gateway. Halaman ini akan otomatis update saat
          pembayaran terverifikasi.
        </p>
        {ref && (
          <div
            style={{
              fontSize: 11,
              color: "var(--ink-soft)",
              fontFamily: "var(--font-mono), ui-monospace, monospace",
              marginTop: 8,
            }}
          >
            Ref: <code>{ref}</code>
          </div>
        )}
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  if (isFailed) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "48px 24px", textAlign: "center" }}>
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            margin: "0 auto 24px",
            background: "rgba(220,38,38,0.12)",
            color: "#DC2626",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
          }}
        >
          ✕
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 28,
            fontWeight: 800,
            margin: "0 0 8px",
            color: "var(--ink)",
          }}
        >
          Pembayaran gagal
        </h1>
        <p style={{ color: "var(--ink-soft)", fontSize: 14, margin: "0 0 24px" }}>
          {statusData?.status === "refunded"
            ? "Pesanan ini sudah di-refund."
            : "Pembayaran tidak berhasil. Silakan coba lagi."}
        </p>
        <Link
          href="/cart"
          style={{
            padding: "14px 24px",
            borderRadius: 999,
            background: "var(--ink)",
            color: "white",
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          Kembali ke keranjang
        </Link>
      </div>
    );
  }

  // Default: success
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px" }}>
      <div style={{ textAlign: "center", padding: "48px 0" }}>
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            margin: "0 auto 24px",
            background: "var(--primary)",
            color: "var(--primary-ink)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 56,
            animation: "tk-pop 0.5s cubic-bezier(.3,1.5,.5,1)",
            boxShadow: "0 0 60px rgba(0,255,148,0.4)",
          }}
        >
          ✓
        </div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 36,
            fontWeight: 800,
            margin: "0 0 8px",
            color: "var(--ink)",
          }}
        >
          Yeay, pesananmu sukses! 🎉
        </h2>
        <p
          style={{
            color: "var(--ink-soft)",
            fontSize: 15,
            maxWidth: 480,
            margin: "0 auto 24px",
          }}
        >
          {statusData?.status === "delivered"
            ? "Kredensial sudah dikirim ke akun kamu. Cek di Dashboard."
            : `Akun akan dikirim otomatis ke email ${email} dalam 1-5 menit. Cek juga Dashboard kamu ya!`}
        </p>
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/dashboard?tab=active"
            style={{
              padding: "14px 24px",
              borderRadius: 999,
              border: 0,
              background: "var(--ink)",
              color: "white",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "inherit",
              textDecoration: "none",
            }}
          >
            Lihat pesanan saya
          </Link>
          <Link
            href="/"
            style={{
              padding: "14px 24px",
              borderRadius: 999,
              border: "1.5px solid var(--border)",
              background: "transparent",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "inherit",
              color: "var(--ink)",
              textDecoration: "none",
            }}
          >
            Belanja lagi
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutSuccessInner />
    </Suspense>
  );
}
