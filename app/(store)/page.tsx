/**
 * Server Component — fetch top products + categories di server, render HTML.
 * Hero ticker + featured stack + best sellers grid: hand off ke HomeClient
 * (client component) untuk interactivity (fmt, hover, ticker rotate).
 */

import { listProducts } from "@/lib/data/products-repo";
import { listCategories } from "@/lib/data/categories-repo";
import HomeClient from "./HomeClient";

// ISR: cache 60 detik. Saat admin tambah produk/kategori, halaman update
// next request setelah TTL.
export const revalidate = 60;

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    listProducts({ limit: 12, activeOnly: true }),
    listCategories({ activeOnly: true }),
  ]);
  return <HomeClient products={products} categories={categories} />;
}
