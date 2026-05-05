import { ImageResponse } from "next/og";

// Auto-detected by Next.js — di-inject sebagai <meta property="og:image">
// di setiap halaman. Override dengan opengraph-image.tsx di route lain.
export const runtime = "edge";
export const alt = "lapakurab — Toko Akun Digital";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#FAF7F2",
          backgroundImage:
            "radial-gradient(circle at 12% 18%, rgba(255,107,157,0.35) 0%, rgba(255,107,157,0) 45%), radial-gradient(circle at 85% 88%, rgba(197,163,255,0.40) 0%, rgba(197,163,255,0) 50%), radial-gradient(circle at 88% 12%, rgba(127,231,199,0.30) 0%, rgba(127,231,199,0) 40%)",
          padding: "80px 90px",
          fontFamily: "system-ui, sans-serif",
          color: "#1A1626",
          position: "relative",
        }}
      >
        {/* Brand mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            marginBottom: 56,
          }}
        >
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: 18,
              background: "linear-gradient(135deg, #FF6B9D 0%, #C5A3FF 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 48,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              boxShadow: "0 14px 40px rgba(255,107,157,0.35)",
            }}
          >
            L
          </div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#1A1626",
            }}
          >
            lapakurab
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 88,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            color: "#1A1626",
            marginBottom: 28,
            maxWidth: 950,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>Premium accounts,</span>
          <span
            style={{
              background: "linear-gradient(135deg, #FF6B9D 0%, #C5A3FF 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            fair price. real fast.
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            color: "#5A5168",
            lineHeight: 1.4,
            maxWidth: 920,
          }}
        >
          Streaming · VPN · premium services. Kirim instan via QRIS &
          e-wallet, garansi penuh.
        </div>

        {/* Bottom strip */}
        <div
          style={{
            position: "absolute",
            bottom: 70,
            left: 90,
            right: 90,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 22,
            color: "#5A5168",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                background: "#22C55E",
                boxShadow: "0 0 0 5px rgba(34,197,94,0.25)",
              }}
            />
            <span style={{ fontWeight: 600, color: "#1A1626" }}>
              4.812 verified customers
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                padding: "4px 14px",
                borderRadius: 999,
                background: "linear-gradient(135deg, #FF6B9D 0%, #C5A3FF 100%)",
                color: "white",
                fontWeight: 800,
                fontSize: 22,
                letterSpacing: "0.02em",
              }}
            >
              4.9 / 5
            </span>
            <span style={{ fontWeight: 600, color: "#1A1626" }}>
              rating customer
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
