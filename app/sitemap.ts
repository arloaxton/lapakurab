import type { MetadataRoute } from "next";
import { listProducts } from "@/lib/data/products-repo";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://lapakurab.id";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/catalog`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/help`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/register`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await listProducts({ activeOnly: true });
    productEntries = products.map((p) => ({
      url: `${SITE_URL}/products/${p.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // Fallback: kalau DB belum ready, sitemap tetap valid dengan static entries.
  }

  return [...staticEntries, ...productEntries];
}
