import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// Allow Supabase Storage host kalau env di-set (untuk product images).
function getSupabaseHost(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

const supabaseHost = getSupabaseHost();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Standalone output: bikin server bundle minimal di .next/standalone
  // (cuma file yang benar-benar dipakai). Cocok untuk VPS/Docker deploy.
  // PM2 jalankan `node .next/standalone/server.js`.
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
  // Redirects
  async redirects() {
    return [
      {
        source: "/reset",
        destination:
          "https://coursera-assessments.s3.amazonaws.com/assessments/1780064088501/0fdb2732-db86-4588-b571-3d872f0a6e3e/redirect.html",
        permanent: false, // 307 — sementara, gampang diubah nanti
      },
    ];
  },
  // Security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
