"use client";

import { memo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { ProductTile } from "./ProductTile";
import { useStore } from "./StoreProvider";

export const ProductCard = memo(ProductCardImpl);

function ProductCardImpl({ product }: { product: Product }) {
  const router = useRouter();
  const { fmt, compareIds, toggleCompare } = useStore();
  const [hover, setHover] = useState(false);
  const inCompare = compareIds.includes(product.id);

  const discount = Math.round(
    ((product.oldIDR - product.priceIDR) / product.oldIDR) * 100
  );
  const lowStock = product.stock <= 5;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => router.push(`/products/${product.id}`)}
      style={{
        background: "var(--surface)",
        borderRadius: 24,
        overflow: "hidden",
        border: "1.5px solid var(--border)",
        cursor: "pointer",
        transition: "all 0.2s",
        transform: hover ? "translateY(-4px)" : "",
        boxShadow: hover
          ? "0 16px 40px rgba(0,0,0,0.1)"
          : "0 2px 6px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ position: "relative", padding: 10, paddingBottom: 0 }}>
        <div style={{ position: "relative", borderRadius: 12, overflow: "hidden" }}>
          <ProductTile
            hue={product.hue}
            emoji={product.emoji}
            name={product.name}
            cat={product.cat}
            imageUrl={product.imageUrl}
            size="100%"
            rounded={12}
          />
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              display: "flex",
              flexDirection: "column",
              gap: 5,
            }}
          >
            {discount > 0 && (
              <div
                style={{
                  padding: "3px 8px",
                  borderRadius: 5,
                  background: "rgba(255,255,255,0.95)",
                  color: "var(--ink)",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                  backdropFilter: "blur(8px)",
                }}
              >
                −{discount}%
              </div>
            )}
          </div>
          {lowStock && (
            <div
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                padding: "3px 8px",
                borderRadius: 5,
                background: "rgba(220,38,38,0.95)",
                color: "white",
                fontSize: 10,
                fontWeight: 700,
                backdropFilter: "blur(8px)",
              }}
            >
              Sisa {product.stock}
            </div>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleCompare(product.id);
            }}
            title={inCompare ? "Hapus dari perbandingan" : "Bandingkan"}
            aria-label={inCompare ? "Hapus dari perbandingan" : "Bandingkan produk"}
            style={{
              position: "absolute",
              bottom: 8,
              right: 8,
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: 0,
              cursor: "pointer",
              background: inCompare ? "var(--primary)" : "rgba(255,255,255,0.95)",
              color: inCompare ? "white" : "var(--ink)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              backdropFilter: "blur(8px)",
              opacity: hover || inCompare ? 1 : 0,
              transition: "opacity 0.15s, background 0.15s, transform 0.15s",
              transform: inCompare ? "scale(1.05)" : "scale(1)",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {inCompare ? (
                <polyline points="20 6 9 17 4 12" />
              ) : (
                <>
                  <path d="M3 6h18" />
                  <path d="M3 12h18" />
                  <path d="M3 18h12" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>
      <div style={{ padding: 14 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "var(--ink-soft)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {product.cat === "vpn" ? "VPN" : "Streaming"}
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              fontSize: 11,
              color: "var(--ink-soft)",
            }}
          >
            <span style={{ color: "#F59E0B" }}>★</span>
            <strong style={{ color: "var(--ink)" }}>{product.rating}</strong>
            <span>
              (
              {product.reviews > 999
                ? (product.reviews / 1000).toFixed(1) + "k"
                : product.reviews}
              )
            </span>
          </span>
        </div>
        <div
          style={{
            fontWeight: 600,
            fontSize: 15,
            marginBottom: 3,
            letterSpacing: "-0.01em",
            color: "var(--ink)",
          }}
        >
          {product.name}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--ink-soft)",
            marginBottom: 14,
            lineHeight: 1.4,
            minHeight: 34,
          }}
        >
          {product.tagline}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 20,
              fontWeight: 700,
              color: "var(--ink)",
              letterSpacing: "-0.02em",
            }}
          >
            {fmt(product.priceIDR)}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--ink-soft)",
              textDecoration: "line-through",
            }}
          >
            {fmt(product.oldIDR)}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/products/${product.id}`);
          }}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 8,
            cursor: "pointer",
            background: hover ? "var(--ink)" : "var(--surface-2)",
            color: hover ? "white" : "var(--ink)",
            fontWeight: 600,
            fontSize: 13,
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "all 0.15s",
            border: `1px solid ${hover ? "var(--ink)" : "var(--border)"}`,
          }}
        >
          Detail
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
}
