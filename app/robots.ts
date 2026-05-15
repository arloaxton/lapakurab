import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://lapakurab.id";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // NB: jangan list path admin di sini — robots.txt public, malah
        // expose lokasi panel. Pakai meta noindex per-page (sudah di-set
        // di layout/login metadata).
        disallow: [
          "/api/",
          "/cart",
          "/checkout",
          "/dashboard",
          "/forgot-password",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
