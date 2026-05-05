import { memo } from "react";
import Image from "next/image";

interface ProductTileProps {
  hue: number;
  emoji?: string;
  size?: number | "100%";
  rounded?: number;
  name?: string;
  cat?: string;
  imageUrl?: string;
}

/**
 * Brand-style mockup product visual — gradient + glow + initial mark.
 * Direct port from _legacy/store-app.jsx ProductTile.
 */
export const ProductTile = memo(ProductTileImpl);

function ProductTileImpl({
  hue,
  emoji,
  size = 120,
  rounded = 24,
  name,
  cat,
  imageUrl,
}: ProductTileProps) {
  const bgDeep = `oklch(0.32 0.14 ${hue})`;
  const bgMid = `oklch(0.45 0.18 ${hue})`;
  const accent = `oklch(0.78 0.18 ${(hue + 40) % 360})`;
  const accent2 = `oklch(0.85 0.14 ${(hue + 90) % 360})`;
  const isVPN = cat === "vpn";
  const isSmall = typeof size === "number" && size < 60;
  const initial = (name || emoji || "?").trim()[0].toUpperCase();

  if (imageUrl) {
    const sizesAttr =
      size === "100%"
        ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
        : `${size}px`;
    return (
      <div
        style={{
          position: "relative",
          width: size === "100%" ? "100%" : size,
          aspectRatio: size === "100%" ? "16 / 10" : undefined,
          height: size === "100%" ? undefined : size,
          borderRadius: rounded,
          overflow: "hidden",
          background: `linear-gradient(140deg, ${bgDeep} 0%, ${bgMid} 100%)`,
        }}
      >
        <Image
          src={imageUrl}
          alt={name || `${cat ?? "produk"} ${initial}`}
          fill
          sizes={sizesAttr}
          style={{ objectFit: "cover" }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: size === "100%" ? "100%" : size,
        aspectRatio: size === "100%" ? "16 / 10" : undefined,
        height: size === "100%" ? undefined : size,
        borderRadius: rounded,
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(140deg, ${bgDeep} 0%, ${bgMid} 100%)`,
        boxShadow:
          "inset 0 -1px 2px rgba(255,255,255,0.06), inset 0 1px 2px rgba(255,255,255,0.18)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-30%",
          right: "-20%",
          width: "80%",
          height: "80%",
          borderRadius: "50%",
          background: accent,
          opacity: 0.35,
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-30%",
          left: "-20%",
          width: "70%",
          height: "70%",
          borderRadius: "50%",
          background: accent2,
          opacity: 0.22,
          filter: "blur(36px)",
        }}
      />

      {isVPN ? (
        <svg
          viewBox="0 0 100 100"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "60%",
            height: "60%",
            transform: "translate(-50%,-50%)",
            opacity: isSmall ? 0.5 : 0.22,
          }}
        >
          <circle cx="50" cy="50" r="38" fill="none" stroke="white" strokeWidth="1" />
          <ellipse cx="50" cy="50" rx="38" ry="16" fill="none" stroke="white" strokeWidth="1" />
          <ellipse cx="50" cy="50" rx="16" ry="38" fill="none" stroke="white" strokeWidth="1" />
          <line x1="12" y1="50" x2="88" y2="50" stroke="white" strokeWidth="1" />
        </svg>
      ) : (
        !isSmall && (
          <div
            style={{
              position: "absolute",
              top: "14%",
              left: "10%",
              right: "10%",
              display: "flex",
              gap: 4,
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  flex: i === 0 ? 2 : 1,
                  height: 3,
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.25)",
                }}
              />
            ))}
          </div>
        )
      )}

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: typeof size === "number" ? size * 0.5 : "4rem",
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.05em",
            color: "white",
            textShadow: "0 2px 24px rgba(0,0,0,0.4)",
          }}
        >
          {initial}
        </div>
      </div>

      {!isSmall && (
        <div
          style={{
            position: "absolute",
            left: "8%",
            right: "8%",
            bottom: "8%",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 5,
              background: "rgba(255,255,255,0.95)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              color: bgDeep,
              fontWeight: 800,
            }}
          >
            {isVPN ? "◆" : "▶"}
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
            <div
              style={{
                height: 4,
                background: "rgba(255,255,255,0.85)",
                borderRadius: 2,
                width: "70%",
              }}
            />
            <div
              style={{
                height: 3,
                background: "rgba(255,255,255,0.4)",
                borderRadius: 2,
                width: "45%",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
