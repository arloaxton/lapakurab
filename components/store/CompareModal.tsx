"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "./StoreProvider";
import { ProductTile } from "./ProductTile";
import type { Product } from "@/lib/types";

const ALL_KEYS = [
  "Kategori",
  "Harga",
  "Harga normal",
  "Diskon",
  "Rating",
  "Pilihan durasi",
  "Stok tersedia",
  "Kualitas",
] as const;

export function CompareModal() {
  const router = useRouter();
  const {
    compareOpen,
    setCompareOpen,
    compareList,
    fmt,
    addToCart,
    toggleCompare,
  } = useStore();

  useEffect(() => {
    if (!compareOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCompareOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [compareOpen, setCompareOpen]);

  if (!compareOpen || compareList.length === 0) return null;

  const featuresFor = (p: Product): Record<string, string> => ({
    Kategori: p.cat === "vpn" ? "VPN" : "Streaming",
    Harga: fmt(p.priceIDR),
    "Harga normal": fmt(p.oldIDR),
    Diskon: Math.round(((p.oldIDR - p.priceIDR) / p.oldIDR) * 100) + "%",
    Rating: `★ ${p.rating} (${
      p.reviews > 999 ? (p.reviews / 1000).toFixed(1) + "k" : p.reviews
    })`,
    "Pilihan durasi": p.durations.join(", "),
    "Stok tersedia": p.stock + " akun",
    Kualitas: p.tagline,
  });

  const cheapestPrice = Math.min(...compareList.map((p) => p.priceIDR));
  const highestRating = Math.max(...compareList.map((p) => p.rating));
  const mostStock = Math.max(...compareList.map((p) => p.stock));
  const biggestDisc = Math.max(
    ...compareList.map((p) =>
      Math.round(((p.oldIDR - p.priceIDR) / p.oldIDR) * 100)
    )
  );

  const isBest = (key: string, p: Product): boolean => {
    if (key === "Harga") return p.priceIDR === cheapestPrice;
    if (key === "Rating") return p.rating === highestRating;
    if (key === "Stok tersedia") return p.stock === mostStock;
    if (key === "Diskon")
      return (
        Math.round(((p.oldIDR - p.priceIDR) / p.oldIDR) * 100) === biggestDisc
      );
    return false;
  };

  return (
    <div
      onClick={() => setCompareOpen(false)}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        animation: "fadeIn 0.2s",
      }}
    >
      <style>{`@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }`}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg)",
          borderRadius: 24,
          width: "100%",
          maxWidth: 980,
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          border: "1.5px solid var(--border)",
        }}
      >
        <div
          style={{
            padding: "20px 26px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--surface)",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "var(--ink)",
              }}
            >
              Bandingkan {compareList.length} produk
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 2 }}>
              Yang ter-
              <span style={{ color: "var(--primary)", fontWeight: 700 }}>
                highlight pink
              </span>{" "}
              = pilihan terbaik di kategorinya.
            </div>
          </div>
          <button
            onClick={() => setCompareOpen(false)}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "1px solid var(--border)",
              background: "var(--surface)",
              cursor: "pointer",
              fontSize: 16,
              color: "var(--ink-soft)",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ overflow: "auto", flex: 1 }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    width: 140,
                    padding: "14px 18px",
                    textAlign: "left",
                    position: "sticky",
                    left: 0,
                    background: "var(--bg)",
                    zIndex: 1,
                    borderBottom: "1px solid var(--border)",
                  }}
                ></th>
                {compareList.map((p) => (
                  <th
                    key={p.id}
                    style={{
                      padding: "14px 18px",
                      textAlign: "left",
                      borderBottom: "1px solid var(--border)",
                      background: "var(--bg)",
                      minWidth: 200,
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ position: "relative", width: "100%" }}>
                        <ProductTile
                          hue={p.hue}
                          emoji={p.emoji}
                          name={p.name}
                          cat={p.cat}
                          size="100%"
                          rounded={12}
                        />
                        <button
                          onClick={() => toggleCompare(p.id)}
                          aria-label="Hapus dari perbandingan"
                          style={{
                            position: "absolute",
                            top: 6,
                            right: 6,
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.95)",
                            color: "var(--ink)",
                            border: 0,
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          ×
                        </button>
                      </div>
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 14,
                            letterSpacing: "-0.01em",
                            color: "var(--ink)",
                          }}
                        >
                          {p.name}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>
                          {p.tagline}
                        </div>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_KEYS.map((key, i) => (
                <tr
                  key={key}
                  style={{
                    background: i % 2 === 0 ? "var(--surface)" : "var(--bg)",
                  }}
                >
                  <td
                    style={{
                      padding: "12px 18px",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--ink-soft)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      position: "sticky",
                      left: 0,
                      background: "inherit",
                      zIndex: 1,
                      verticalAlign: "top",
                    }}
                  >
                    {key}
                  </td>
                  {compareList.map((p) => {
                    const val = featuresFor(p)[key];
                    const best = isBest(key, p);
                    return (
                      <td
                        key={p.id}
                        style={{
                          padding: "12px 18px",
                          verticalAlign: "top",
                          background: best
                            ? "rgba(255,107,157,0.10)"
                            : "transparent",
                          position: "relative",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: best ? 700 : 500,
                            color: "var(--ink)",
                          }}
                        >
                          {val}
                        </span>
                        {best && (
                          <span
                            style={{
                              display: "inline-block",
                              marginLeft: 6,
                              padding: "1px 6px",
                              borderRadius: 5,
                              background: "var(--primary)",
                              color: "white",
                              fontSize: 9,
                              fontWeight: 700,
                              letterSpacing: "0.04em",
                              textTransform: "uppercase",
                            }}
                          >
                            Terbaik
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr>
                <td
                  style={{
                    padding: "14px 18px",
                    position: "sticky",
                    left: 0,
                    background: "var(--bg)",
                    borderTop: "1px solid var(--border)",
                  }}
                ></td>
                {compareList.map((p) => (
                  <td
                    key={p.id}
                    style={{
                      padding: "14px 18px",
                      borderTop: "1px solid var(--border)",
                      background: "var(--bg)",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <button
                        onClick={() => {
                          addToCart(p, p.durations[0]);
                          setCompareOpen(false);
                        }}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 8,
                          border: 0,
                          cursor: "pointer",
                          background: "var(--primary)",
                          color: "white",
                          fontWeight: 700,
                          fontSize: 12,
                          fontFamily: "inherit",
                        }}
                      >
                        + Keranjang
                      </button>
                      <button
                        onClick={() => {
                          router.push(`/products/${p.id}`);
                          setCompareOpen(false);
                        }}
                        style={{
                          padding: "8px 14px",
                          borderRadius: 8,
                          cursor: "pointer",
                          background: "var(--surface)",
                          color: "var(--ink)",
                          border: "1px solid var(--border)",
                          fontWeight: 600,
                          fontSize: 12,
                          fontFamily: "inherit",
                        }}
                      >
                        Detail
                      </button>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
