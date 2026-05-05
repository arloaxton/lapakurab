/**
 * Server Component — fetch katalog penuh di server, hand off ke client
 * untuk filter/sort UI yang interaktif (no roundtrip per filter change).
 */

import { listProducts } from "@/lib/data/products-repo";
import CatalogClient from "./CatalogClient";

// ISR: cache 60 detik. Filter di-handle client-side dari initial dataset.
export const revalidate = 60;

export default async function CatalogPage() {
  const products = await listProducts({ activeOnly: true });
  return <CatalogClient initialProducts={products} />;
}
