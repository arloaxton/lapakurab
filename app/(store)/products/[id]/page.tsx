/**
 * Server Component — fetch product di server, render HTML lengkap.
 * Interactive parts (cart, qty, tabs, countdown) di-handle ProductDetailClient.
 */

import { notFound } from "next/navigation";
import { getProductById } from "@/lib/data/products-repo";
import { listStock } from "@/lib/data/stock-repo";
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

  // Count stock available per tipe akun (untuk tampil di toggle Private/Sharing).
  let stockPrivate = 0;
  let stockSharing = 0;
  try {
    const all = await listStock({ productId: id, status: "available" });
    stockPrivate = all.filter((s) => s.accountType === "private").length;
    stockSharing = all.filter((s) => s.accountType === "sharing").length;
  } catch {
    // fallback: pakai product.stock total kalau query gagal
    stockPrivate = product.stock;
    stockSharing = 0;
  }

  return (
    <ProductDetailClient
      product={product}
      stockPrivate={stockPrivate}
      stockSharing={stockSharing}
    />
  );
}
