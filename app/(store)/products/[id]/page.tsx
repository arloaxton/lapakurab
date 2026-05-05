/**
 * Server Component — fetch product di server, render HTML lengkap.
 * Interactive parts (cart, qty, tabs, countdown) di-handle ProductDetailClient.
 */

import { notFound } from "next/navigation";
import { getProductById } from "@/lib/data/products-repo";
import ProductDetailClient from "./ProductDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

// ISR: cache product detail HTML 60 detik. Saat update via admin, halaman
// stale tapi akan revalidate next request. Trade-off vs full dynamic.
export const revalidate = 60;

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();
  return <ProductDetailClient product={product} />;
}
