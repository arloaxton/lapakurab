import Link from "next/link";
import type { Metadata } from "next";
import { Footer } from "@/components/store/Footer";

export const metadata: Metadata = {
  title: "Bantuan",
  description: "Hubungi customer service lapakurab via WhatsApp atau email.",
  alternates: { canonical: "/help" },
};

const CHANNELS = [
  {
    icon: "💬",
    title: "WhatsApp",
    desc: "Respons rata-rata < 5 menit",
    value: "+62 812-3456-7890",
    href: "https://wa.me/6281234567890",
    color: "#25D366",
  },
  {
    icon: "✉",
    title: "Email",
    desc: "Respons dalam 4 jam",
    value: "cs@lapakurab.id",
    href: "mailto:cs@lapakurab.id",
    color: "#5B8DEF",
  },
];

export default function HelpPage() {
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
        Hubungi kami
      </h1>
      <p style={{ color: "var(--ink-soft)", fontSize: 14, margin: "0 0 28px" }}>
        Tim CS kami siap bantu 24/7. Pilih channel paling pas buat kamu.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 14,
          marginBottom: 28,
        }}
      >
        {CHANNELS.map((c) => (
          <a
            key={c.title}
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: 20,
              borderRadius: 16,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              textDecoration: "none",
              color: "inherit",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                width: 44,
                height: 44,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                background: c.color,
                color: "white",
                fontSize: 20,
                marginBottom: 4,
              }}
            >
              {c.icon}
            </div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "var(--ink)" }}>
              {c.title}
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{c.desc}</div>
            <div
              style={{
                fontFamily: "var(--font-mono), ui-monospace, monospace",
                fontSize: 13,
                color: "var(--primary)",
                fontWeight: 600,
                marginTop: 4,
              }}
            >
              {c.value}
            </div>
          </a>
        ))}
      </div>

      <div
        style={{
          padding: 18,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          fontSize: 13,
          color: "var(--ink-soft)",
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: "var(--ink)" }}>Sebelum chat CS:</strong> coba cek{" "}
        <Link href="/faq" style={{ color: "var(--primary)", fontWeight: 600 }}>
          FAQ
        </Link>{" "}
        — kebanyakan pertanyaan udah ke-cover di sana.
      </div>

      <Footer />
    </div>
  );
}
