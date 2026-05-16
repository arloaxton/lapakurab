/**
 * Server Component — fetch product di server, render HTML lengkap.
 * Interactive parts (cart, qty, tabs, countdown) di-handle ProductDetailClient.
 */

import { notFound } from "next/navigation";
import { getProductById } from "@/lib/data/products-repo";
import { isSupabaseConfigured } from "@/backend/env";
import ProductDetailClient from "./ProductDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

// Dynamic — stock count harus real-time, ISR bikin stale. Trade-off
// kecil: page render tiap request, tapi product detail bukan high-traffic
// path yang butuh aggressive caching.
export const dynamic = "force-dynamic";

/**
 * Count stock available per accountType pakai ADMIN CLIENT (bypass RLS).
 * RLS stock_items normalnya cuma allow admin atau owner — guest/customer
 * yang akses product page gak bisa lihat available pool. Stock count itu
 * info publik (sama dengan "X tersedia"), jadi safe bypass RLS untuk count.
 */
async function getStockCounts(productId: string): Promise<{ priv: number; share: number }> {
  if (!isSupabaseConfigured()) return { priv: 0, share: 0 };
  try {
    const { getAdminClient } = await import("@/backend/db/server-client");
    const sb = getAdminClient();
    const { data, error } = await sb
      .from("stock_items")
      .select("account_type")
      .eq("product_id", productId)
      .eq("status", "available");
    if (error || !data) return { priv: 0, share: 0 };
    let priv = 0;
    let share = 0;
    for (const row of data as { account_type: string }[]) {
      if (row.account_type === "sharing") share++;
      else priv++;
    }
    return { priv, share };
  } catch {
    return { priv: 0, share: 0 };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const { priv: stockPrivate, share: stockSharing } = await getStockCounts(id);

  return (
    <ProductDetailClient
      product={product}
      stockPrivate={stockPrivate}
      stockSharing={stockSharing}
    />
  );
}
