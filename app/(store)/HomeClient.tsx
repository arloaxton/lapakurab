"use client";

import Link from "next/link";
import { ProductTile } from "@/components/store/ProductTile";
import { ProductCard } from "@/components/store/ProductCard";
import { Footer } from "@/components/store/Footer";
import { useStore } from "@/components/store/StoreProvider";
import type { Product } from "@/lib/types";

interface Props {
  products: Product[];
}

export default function HomeClient({ products }: Props) {
  const { fmt } = useStore();
  const featured = products.slice(0, 4);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>
      {/* Hero */}
      <section
        className="lk-hero-card"
        style={{
          position: "relative",
          borderRadius: 32,
          overflow: "hidden",
          background: "linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)",
          border: "1px solid var(--border)",
          marginBottom: 32,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: "radial-gradient(circle, var(--primary), transparent)",
            opacity: 0.3,
            filter: "blur(20px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -40,
            left: -40,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "radial-gradient(circle, var(--mint), transparent)",
            opacity: 0.4,
            filter: "blur(20px)",
          }}
        />
        <div
          className="lk-hero-grid"
          style={{ position: "relative" }}
        >
          <div>
            <div
              className="lk-hero-pill"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(8px)",
                fontWeight: 600,
                fontSize: 12,
                marginBottom: 20,
                color: "var(--ink)",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#22C55E",
                  boxShadow: "0 0 0 3px rgba(34,197,94,0.25)",
                }}
              />
              Pengiriman instan · 24/7
            </div>
            <h1
              className="lk-h1-hero"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                margin: "0 0 20px",
                color: "var(--ink)",
              }}
            >
              Premium accounts,
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, var(--primary), var(--lilac))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                fair price. real fast.
              </span>
            </h1>
            <p
              className="lk-hero-tagline"
              style={{
                fontSize: 17,
                color: "var(--ink-soft)",
                lineHeight: 1.5,
                margin: "0 0 28px",
                maxWidth: 480,
              }}
            >
              Streaming favoritmu &amp; VPN aman, bergaransi penuh. Kirim instan
              via QRIS atau e-wallet.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link
                href="/catalog"
                className="lk-hero-cta"
                style={{
                  padding: "16px 28px",
                  borderRadius: 999,
                  border: 0,
                  cursor: "pointer",
                  background: "var(--ink)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 15,
                  fontFamily: "inherit",
                  boxShadow: "0 8px 24px rgba(26,22,38,0.25)",
                  textDecoration: "none",
                }}
              >
                Mulai belanja →
              </Link>
              <Link
                href="/catalog"
                className="lk-hero-cta"
                style={{
                  padding: "16px 28px",
                  borderRadius: 999,
                  border: "1.5px solid var(--ink)",
                  cursor: "pointer",
                  background: "rgba(255,255,255,0.6)",
                  color: "var(--ink)",
                  fontWeight: 700,
                  fontSize: 15,
                  fontFamily: "inherit",
                  textDecoration: "none",
                }}
              >
                Lihat promo
              </Link>
            </div>
          </div>
          <div className="lk-hero-featured" style={{ position: "relative", height: 320 }}>
            {featured.map((p, i) => {
              const positions: Array<{
                top?: number;
                left?: number;
                right?: number;
                bottom?: number;
                rot: number;
                z: number;
              }> = [
                { top: 0, left: 30, rot: -8, z: 3 },
                { top: 60, right: 0, rot: 6, z: 2 },
                { bottom: 0, left: 0, rot: 4, z: 2 },
                { bottom: 30, right: 60, rot: -4, z: 1 },
              ];
              const pos = positions[i];
              return (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  style={{
                    position: "absolute",
                    top: pos.top,
                    left: pos.left,
                    right: pos.right,
                    bottom: pos.bottom,
                    transform: `rotate(${pos.rot}deg)`,
                    zIndex: pos.z,
                    cursor: "pointer",
                    transition: "transform 0.3s",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = `rotate(0deg) scale(1.05)`)}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = `rotate(${pos.rot}deg)`)}
                >
                  <div
                    style={{
                      background: "white",
                      borderRadius: 20,
                      padding: 12,
                      width: 140,
                      boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
                    }}
                  >
                    <ProductTile hue={p.hue} emoji={p.emoji} size={116} rounded={14} />
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        marginTop: 8,
                        color: "var(--ink)",
                      }}
                    >
                      {p.name.split(" ")[0]}
                    </div>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 13,
                        color: "var(--primary)",
                        marginTop: 2,
                      }}
                    >
                      {fmt(p.priceIDR)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <h2
        className="lk-h2-section"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          letterSpacing: "-0.02em",
          margin: "0 0 16px",
          color: "var(--ink)",
        }}
      >
        Kategori populer
      </h2>
      <div
        className="lk-grid-3"
        style={{ marginBottom: 48 }}
      >
        {[
          { id: "streaming", label: "Streaming", desc: "Netflix, Spotify, Disney+ & lainnya", emoji: "▶", hue: 340 },
          { id: "vpn", label: "VPN", desc: "Privasi & akses tanpa batas", emoji: "◈", hue: 220 },
          { id: "all", label: "Semua produk", desc: "Lihat seluruh katalog kami", emoji: "✦", hue: 140 },
        ].map((c) => (
          <Link
            key={c.id}
            href={c.id === "all" ? "/catalog" : `/catalog?cat=${c.id}`}
            style={{
              padding: 24,
              borderRadius: 24,
              background: "var(--surface)",
              border: "1.5px solid var(--border)",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 16,
              textDecoration: "none",
              color: "inherit",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <ProductTile hue={c.hue} emoji={c.emoji} size={72} rounded={18} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4, color: "var(--ink)" }}>
                {c.label}
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>{c.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Featured grid */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h2
          className="lk-h2-section"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            margin: 0,
            color: "var(--ink)",
          }}
        >
          Best sellers
        </h2>
        <Link
          href="/catalog"
          style={{
            background: "none",
            border: 0,
            color: "var(--primary)",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          Lihat semua →
        </Link>
      </div>
      <div className="lk-products-grid">
        {products.slice(0, 4).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {/* Trust strip */}
      <div
        className="lk-grid-4 lk-trust-strip"
        style={{
          marginTop: 48,
          padding: 32,
          borderRadius: 24,
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        {[
          { num: "100%", label: "Akun original" },
          { num: "Instan", label: "Pengiriman" },
          { num: "Garansi", label: "Selama langganan" },
          { num: "24/7", label: "Customer support" },
        ].map((s) => (
          <div key={s.label}>
            <div
              className="lk-stat-num"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "var(--ink)",
              }}
            >
              {s.num}
            </div>
            <div style={{ fontSize: 13, color: "var(--ink)", opacity: 0.7, marginTop: 4 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
}
