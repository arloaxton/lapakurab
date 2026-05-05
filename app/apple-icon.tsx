import { ImageResponse } from "next/og";

// Auto-detected sebagai <link rel="apple-touch-icon"> 180×180.
export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
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
          fontSize: 120,
          fontWeight: 800,
          letterSpacing: "-0.05em",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        L
      </div>
    ),
    { ...size }
  );
}
