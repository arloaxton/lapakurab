/**
 * Server Component — fetch top products di server, render HTML penuh.
 * Hero ticker + featured stack + best sellers grid: hand off ke HomeClient
 * (client component) untuk interactivity (fmt, hover, ticker rotate).
 */

import { listProducts } from "@/lib/data/products-repo";
import HomeClient from "./HomeClient";

// ISR: cache 60 detik. Saat admin tambah produk, halaman update next request.
export const revalidate = 60;

export default async function HomePage() {
  const products = await listProducts({ limit: 12, activeOnly: true });
  return <HomeClient products={products} />;
}
