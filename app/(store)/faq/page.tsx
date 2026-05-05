import Link from "next/link";
import type { Metadata } from "next";
import { Footer } from "@/components/store/Footer";

export const metadata: Metadata = {
  title: "FAQ — Pertanyaan umum",
  description:
    "Pertanyaan umum seputar lapakurab — pengiriman, garansi, refund, dan pembayaran.",
  alternates: { canonical: "/faq" },
};

const FAQ = [
  {
    q: "Berapa lama pengiriman setelah pembayaran?",
    a: "Otomatis dalam 5 menit setelah pembayaran terverifikasi. Akun dikirim ke email & WhatsApp yang kamu masukkan saat checkout.",
  },
  {
    q: "Akun saya tidak bisa login. Apa yang harus saya lakukan?",
    a: "Coba reset password via dashboard akun, atau langsung chat CS lewat WhatsApp untuk garansi instan. Kami biasanya respons < 10 menit.",
  },
  {
    q: "Apakah saya bisa refund?",
    a: "Bisa, selama akun belum dipakai ATAU ada kendala teknis dari sisi kami dalam 24 jam pertama. Refund diproses 1×24 jam ke metode pembayaran asal.",
  },
  {
    q: "Sampai kapan garansi berlaku?",
    a: "Selama masa aktif paket yang kamu beli. Akun bermasalah? Kami ganti gratis dengan akun baru.",
  },
  {
    q: "Apakah satu akun bisa dipakai banyak orang?",
    a: "Tergantung paket. Cek detail di halaman produk masing-masing — tertulis berapa profil/device yang didukung.",
  },
  {
    q: "Bagaimana cara apply voucher?",
    a: "Di halaman Keranjang, masukkan kode di kolom 'Kode voucher' lalu klik 'Pakai'. Diskon otomatis tampil di ringkasan.",
  },
  {
    q: "Bayar pakai apa aja?",
    a: "QRIS (semua e-wallet & m-banking), GoPay, OVO, DANA, ShopeePay. Pembayaran terverifikasi otomatis.",
  },
];

export default function FAQPage() {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px" }}>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 36,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          margin: "0 0 12px",
          color: "var(--ink)",
        }}
        className="lk-h1-mid"
      >
        Pertanyaan umum
      </h1>
      <p style={{ color: "var(--ink-soft)", fontSize: 14, margin: "0 0 32px" }}>
        Belum nemu jawabannya?{" "}
        <Link href="/help" style={{ color: "var(--primary)", fontWeight: 600 }}>
          Hubungi CS kami →
        </Link>
      </p>

      <div
        style={{
          background: "var(--surface)",
          borderRadius: 16,
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        {FAQ.map((f, i) => (
          <details
            key={i}
            style={{
              borderBottom: i < FAQ.length - 1 ? "1px solid var(--border)" : 0,
            }}
          >
            <summary
              style={{
                padding: "16px 20px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
                color: "var(--ink)",
                listStyle: "none",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span>{f.q}</span>
              <span
                style={{ fontSize: 18, color: "var(--ink-soft)", flexShrink: 0 }}
                aria-hidden
              >
                ＋
              </span>
            </summary>
            <div
              style={{
                padding: "0 20px 16px",
                fontSize: 13,
                color: "var(--ink-soft)",
                lineHeight: 1.7,
              }}
            >
              {f.a}
            </div>
          </details>
        ))}
      </div>

      <Footer />
    </div>
  );
}
