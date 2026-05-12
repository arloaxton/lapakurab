"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductTile } from "@/components/store/ProductTile";
import { Footer } from "@/components/store/Footer";
import { useStore } from "@/components/store/StoreProvider";
import type { Product } from "@/lib/types";

const DUR_MULTIPLIER: Record<string, number> = {
  "1 Bulan": 1,
  "3 Bulan": 2.7,
  "6 Bulan": 5,
  "1 Tahun": 9,
  "2 Tahun": 16,
};

interface Props {
  product: Product;
}

export default function ProductDetailClient({ product }: Props) {
  const router = useRouter();
  const { addToCart, fmt } = useStore();

  const [duration, setDuration] = useState<string>(
    product.durations[1] || product.durations[0]
  );
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"detail" | "reviews" | "how">("detail");
  const [countdown, setCountdown] = useState({ h: 5, m: 42, s: 18 });
  const [activeThumb, setActiveThumb] = useState(0);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown((c) => {
        let { h, m, s } = c;
        s--;
        if (s < 0) {
          s = 59;
          m--;
          if (m < 0) {
            m = 59;
            h--;
            if (h < 0) h = 23;
          }
        }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const mult = DUR_MULTIPLIER[duration] || 1;
  const finalPrice = Math.round(product.priceIDR * mult) * qty;
  const oldPrice = Math.round(product.oldIDR * mult) * qty;

  const onAdd = () => {
    const r = btnRef.current?.getBoundingClientRect() ?? null;
    for (let i = 0; i < qty; i++) addToCart(product, duration, r);
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>
      {/* Breadcrumb */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 20,
          fontSize: 13,
          color: "var(--ink-soft)",
        }}
      >
        <Link
          href="/"
          style={{ color: "inherit", cursor: "pointer", textDecoration: "none" }}
        >
          Beranda
        </Link>
        <span>›</span>
        <Link
          href="/catalog"
          style={{ color: "inherit", cursor: "pointer", textDecoration: "none" }}
        >
          Katalog
        </Link>
        <span>›</span>
        <span style={{ color: "var(--ink)" }}>{product.name}</span>
      </div>

      <div className="lk-split-2">
        {/* Visual */}
        <div>
          <div
            className="lk-product-sticky"
            style={{
              background: "var(--surface)",
              borderRadius: 32,
              padding: 32,
              border: "1.5px solid var(--border)",
              position: "sticky",
              top: 84,
            }}
          >
            <div style={{ width: "100%", maxWidth: 420, margin: "0 auto" }}>
              <ProductTile
                hue={product.hue + activeThumb * 30}
                emoji={product.emoji}
                imageUrl={product.imageUrl}
                size="100%"
                rounded={24}
              />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              {[0, 1, 2, 3].map((i) => (
                <button
                  key={i}
                  onClick={() => setActiveThumb(i)}
                  aria-label={`Variasi ${i + 1}`}
                  style={{
                    flex: 1,
                    height: 60,
                    borderRadius: 12,
                    padding: 0,
                    background: `oklch(0.${88 - i * 3} 0.1${3 - i} ${product.hue + i * 30})`,
                    border:
                      activeThumb === i
                        ? "2px solid var(--primary)"
                        : "1.5px solid var(--border)",
                    cursor: "pointer",
                    transition: "border 0.15s, transform 0.15s",
                    transform: activeThumb === i ? "scale(1.03)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Info column */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 8,
                background: "rgba(255,107,157,0.12)",
                color: "var(--primary)",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.02em",
              }}
            >
              ● {product.cat || "Premium"}
            </span>
            {product.stock <= 5 && (
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 8,
                  background: "#FEE2E2",
                  color: "#DC2626",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                Sisa {product.stock} stok!
              </span>
            )}
          </div>

          <h1
            className="lk-h1-mid"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              margin: "0 0 8px",
              color: "var(--ink)",
            }}
          >
            {product.name}
          </h1>
          <p style={{ fontSize: 16, color: "var(--ink-soft)", margin: "0 0 16px" }}>
            {product.tagline}
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  style={{
                    color:
                      s <= Math.round(product.rating) ? "#F59E0B" : "#E5E5E5",
                    fontSize: 18,
                  }}
                >
                  ★
                </span>
              ))}
            </div>
            <strong style={{ color: "var(--ink)" }}>{product.rating}</strong>
            <span style={{ color: "var(--ink-soft)", fontSize: 14 }}>
              ({product.reviews.toLocaleString("id-ID")} ulasan)
            </span>
          </div>

          {/* Flash deal countdown */}
          <div
            style={{
              padding: 16,
              borderRadius: 16,
              marginBottom: 24,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#DC2626",
                  letterSpacing: "0.05em",
                  marginBottom: 4,
                }}
              >
                ⚡ FLASH DEAL BERAKHIR
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                Buruan, harga normal kembali setelah ini!
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { n: countdown.h, l: "jam" },
                { n: countdown.m, l: "mnt" },
                { n: countdown.s, l: "dtk" },
              ].map((t, i) => (
                <div
                  key={i}
                  style={{
                    background: "var(--ink)",
                    color: "white",
                    padding: "8px 12px",
                    borderRadius: 10,
                    textAlign: "center",
                    minWidth: 46,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 18,
                      fontWeight: 800,
                      lineHeight: 1,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {String(t.n).padStart(2, "0")}
                  </div>
                  <div style={{ fontSize: 9, opacity: 0.7, marginTop: 2 }}>
                    {t.l}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Duration picker */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
                marginBottom: 10,
                color: "var(--ink)",
              }}
            >
              Pilih durasi
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
              {product.durations.map((d) => {
                const dm = DUR_MULTIPLIER[d] || 1;
                return (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    style={{
                      padding: "14px 16px",
                      borderRadius: 14,
                      cursor: "pointer",
                      border:
                        duration === d
                          ? "2px solid var(--primary)"
                          : "1.5px solid var(--border)",
                      background:
                        duration === d
                          ? "rgba(255,107,157,0.06)"
                          : "var(--surface)",
                      textAlign: "left",
                      fontFamily: "inherit",
                      position: "relative",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>
                      {d}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 2 }}>
                      {fmt(Math.round(product.priceIDR * dm))}
                    </div>
                    {dm >= 5 && (
                      <div
                        style={{
                          position: "absolute",
                          top: -8,
                          right: 8,
                          padding: "2px 8px",
                          borderRadius: 6,
                          background: "var(--mint)",
                          color: "var(--ink)",
                          fontSize: 10,
                          fontWeight: 800,
                        }}
                      >
                        HEMAT
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Qty */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>
              Jumlah
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1.5px solid var(--border)",
                borderRadius: 999,
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                style={{
                  width: 36,
                  height: 36,
                  border: 0,
                  background: "transparent",
                  fontSize: 18,
                  cursor: "pointer",
                  fontWeight: 700,
                  color: "var(--ink)",
                }}
              >
                −
              </button>
              <div
                style={{
                  width: 40,
                  textAlign: "center",
                  fontWeight: 700,
                  color: "var(--ink)",
                }}
              >
                {qty}
              </div>
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                disabled={qty >= product.stock}
                style={{
                  width: 36,
                  height: 36,
                  border: 0,
                  background: "transparent",
                  opacity: qty >= product.stock ? 0.4 : 1,
                  fontSize: 18,
                  cursor: "pointer",
                  fontWeight: 700,
                  color: "var(--ink)",
                }}
              >
                +
              </button>
            </div>
            <div style={{ fontSize: 11, color: product.stock <= 5 ? "var(--danger)" : "var(--ink-soft)" }}>
              {product.stock} tersedia
            </div>
          </div>

          {/* Price + buy */}
          <div
            style={{
              padding: 20,
              borderRadius: 20,
              background: "var(--surface)",
              border: "1.5px solid var(--border)",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 36,
                  fontWeight: 800,
                  color: "var(--primary)",
                  letterSpacing: "-0.02em",
                }}
              >
                {fmt(finalPrice)}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "var(--ink-soft)",
                  textDecoration: "line-through",
                }}
              >
                {fmt(oldPrice)}
              </div>
              <div
                style={{
                  padding: "2px 8px",
                  borderRadius: 6,
                  background: "#FEE2E2",
                  color: "#DC2626",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                HEMAT {fmt(oldPrice - finalPrice)}
              </div>
            </div>
            <div className="lk-cta-row" style={{ display: "flex", gap: 10 }}>
              <button
                ref={btnRef}
                onClick={onAdd}
                style={{
                  flex: 1,
                  padding: "16px",
                  borderRadius: 14,
                  cursor: "pointer",
                  border: "1.5px solid var(--ink)",
                  background: "var(--surface)",
                  color: "var(--ink)",
                  fontWeight: 700,
                  fontSize: 15,
                  fontFamily: "inherit",
                }}
              >
                + Keranjang
              </button>
              <button
                onClick={() => {
                  onAdd();
                  router.push("/cart");
                }}
                style={{
                  flex: 1.4,
                  padding: "16px",
                  borderRadius: 14,
                  cursor: "pointer",
                  border: 0,
                  background: "var(--ink)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 15,
                  fontFamily: "inherit",
                  boxShadow: "0 8px 24px rgba(26,22,38,0.25)",
                }}
              >
                Beli Sekarang →
              </button>
            </div>
          </div>

          {/* Trust row */}
          <div
            className="lk-grid-3"
            style={{
              gap: 10,
              marginBottom: 24,
            }}
          >
            {[
              { emoji: "⚡", t: "Kirim instan", d: "< 5 menit" },
              { emoji: "◆", t: "Garansi penuh", d: "Selama aktif" },
              { emoji: "♥", t: "Support 24/7", d: "WhatsApp" },
            ].map((b) => (
              <div
                key={b.t}
                style={{
                  padding: 12,
                  background: "var(--surface)",
                  borderRadius: 14,
                  border: "1.5px solid var(--border)",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 4 }}>{b.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--ink)" }}>
                  {b.t}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>{b.d}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ borderTop: "1.5px solid var(--border)", paddingTop: 24 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
              {[
                { id: "detail", label: "Deskripsi" },
                { id: "reviews", label: `Ulasan (${product.reviews})` },
                { id: "how", label: "Cara pakai" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id as typeof tab)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 999,
                    border: 0,
                    cursor: "pointer",
                    background: tab === t.id ? "var(--ink)" : "transparent",
                    color: tab === t.id ? "white" : "var(--ink-soft)",
                    fontWeight: 600,
                    fontSize: 13,
                    fontFamily: "inherit",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "detail" && (
              <div style={{ fontSize: 14, lineHeight: 1.7, color: "var(--ink-soft)" }}>
                <p>
                  Akun {product.name} resmi dengan kualitas {product.tagline}.
                </p>
                <ul style={{ paddingLeft: 20, marginTop: 12 }}>
                  <li>Akun private, bukan sharing</li>
                  <li>Garansi full selama masa aktif</li>
                  <li>Pengiriman otomatis via email & dashboard</li>
                  <li>Customer support 24/7 kalau ada masalah</li>
                </ul>
              </div>
            )}

            {tab === "reviews" && (
              <div
                style={{
                  padding: 32,
                  background: "var(--surface)",
                  borderRadius: 16,
                  border: "1.5px solid var(--border)",
                  textAlign: "center",
                  color: "var(--ink-soft)",
                  fontSize: 14,
                }}
              >
                Belum ada ulasan untuk produk ini. Jadilah yang pertama!
              </div>
            )}

            {tab === "how" && (
              <ol
                style={{
                  paddingLeft: 20,
                  fontSize: 14,
                  lineHeight: 1.8,
                  color: "var(--ink-soft)",
                }}
              >
                <li>
                  Klik <strong>Beli Sekarang</strong> &amp; pilih metode pembayaran
                  (QRIS / E-wallet)
                </li>
                <li>Selesaikan pembayaran dalam 15 menit</li>
                <li>Login info dikirim otomatis ke email &amp; dashboard kamu</li>
                <li>Login &amp; nikmati! Ada masalah? Chat CS kami 24/7.</li>
              </ol>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
