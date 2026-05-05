import { ImageResponse } from "next/og";

// Auto-detected sebagai <link rel="icon"> 32×32 (favicon).
export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #FF6B9D 0%, #C5A3FF 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: "-0.05em",
          fontFamily: "system-ui, sans-serif",
          borderRadius: 6,
        }}
      >
        L
      </div>
    ),
    { ...size }
  );
}
