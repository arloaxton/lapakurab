import Link from "next/link";
import type { Metadata } from "next";
import { Footer } from "@/components/store/Footer";

export const metadata: Metadata = {
  title: "Tentang kami",
  description:
    "lapakurab — marketplace akun digital terpercaya. Streaming, VPN, premium services dengan garansi penuh.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px" }}>
      <h1
        className="lk-h1-mid"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 36,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          margin: "0 0 12px",
          color: "var(--ink)",
        }}
      >
        Tentang lapakurab
      </h1>
      <p style={{ color: "var(--ink-soft)", fontSize: 16, lineHeight: 1.7, margin: "0 0 28px" }}>
        lapakurab adalah marketplace akun digital premium untuk streaming, VPN, dan
        layanan langganan favorit. Kami fokus di tiga hal: harga fair, pengiriman
        instan, dan garansi penuh selama masa aktif.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 28,
        }}
      >
        {[
          { num: "4.812", label: "Pelanggan aktif" },
          { num: "15.290+", label: "Order sukses" },
          { num: "4.9★", label: "Rating rata-rata" },
          { num: "24/7", label: "Customer support" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              padding: 20,
              borderRadius: 16,
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "var(--ink)",
              }}
            >
              {s.num}
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 4 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <h2
        className="lk-h2-section"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          margin: "0 0 12px",
          color: "var(--ink)",
        }}
      >
        Kenapa lapakurab?
      </h2>
      <ul
        style={{
          color: "var(--ink-soft)",
          fontSize: 14,
          lineHeight: 1.8,
          paddingLeft: 20,
          margin: "0 0 28px",
        }}
      >
        <li>
          <strong style={{ color: "var(--ink)" }}>Pengiriman instan</strong> — kredensial dikirim otomatis
          dalam 5 menit setelah pembayaran.
        </li>
        <li>
          <strong style={{ color: "var(--ink)" }}>Garansi penuh</strong> — akun bermasalah? Kami ganti
          gratis selama masa aktif paket.
        </li>
        <li>
          <strong style={{ color: "var(--ink)" }}>Akun private</strong> — bukan sharing, bukan family.
        </li>
        <li>
          <strong style={{ color: "var(--ink)" }}>Pembayaran fleksibel</strong> — QRIS, GoPay, OVO, DANA, ShopeePay.
        </li>
      </ul>

      <div
        style={{
          padding: 20,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          textAlign: "center",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: "var(--ink)" }}>
          Punya pertanyaan?
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/faq"
            style={{
              padding: "10px 20px",
              borderRadius: 999,
              border: "1.5px solid var(--border)",
              color: "var(--ink)",
              fontWeight: 600,
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            FAQ
          </Link>
          <Link
            href="/help"
            style={{
              padding: "10px 20px",
              borderRadius: 999,
              border: 0,
              background: "var(--ink)",
              color: "white",
              fontWeight: 700,
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            Hubungi CS
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
