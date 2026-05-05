/**
 * Products client-side helpers — fetch via API untuk client components.
 *
 * Pola:
 * - Mock mode: kembalikan data dari `lib/mock/products` (sync, no fetch).
 * - Supabase mode: fetch ke `/api/products`, `/api/products/[id]`, `/api/search`.
 *
 * Dipakai oleh komponen client (`"use client"`). Server components lebih baik
 * import langsung dari `lib/data/products-repo`.
 */

import type { Product } from "@/lib/types";
import { PRODUCTS as MOCK_PRODUCTS, getProduct as getMockProduct } from "@/lib/mock/products";
import { isSupabaseConfigured } from "@/backend/env";

export interface ListProductsClientOpts {
  cat?: "all" | "streaming" | "vpn";
  activeOnly?: boolean;
  limit?: number;
  offset?: number;
}

export async function fetchProducts(opts: ListProductsClientOpts = {}): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    let list = MOCK_PRODUCTS.slice();
    if (opts.activeOnly !== false) list = list.filter((p) => p.active !== false);
    if (opts.cat && opts.cat !== "all") list = list.filter((p) => p.cat === opts.cat);
    if (opts.offset) list = list.slice(opts.offset);
    if (opts.limit) list = list.slice(0, opts.limit);
    return list;
  }
  const params = new URLSearchParams();
  if (opts.cat) params.set("cat", opts.cat);
  if (opts.activeOnly === false) params.set("activeOnly", "false");
  if (opts.limit !== undefined) params.set("limit", String(opts.limit));
  if (opts.offset !== undefined) params.set("offset", String(opts.offset));
  const qs = params.toString();
  const res = await fetch(`/api/products${qs ? `?${qs}` : ""}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  const data = (await res.json()) as { products: Product[] };
  return data.products ?? [];
}

export async function fetchProductById(id: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    return getMockProduct(id) ?? null;
  }
  const res = await fetch(`/api/products/${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  const data = (await res.json()) as { product: Product };
  return data.product ?? null;
}

export async function searchProductsClient(q: string): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    if (!q.trim()) return MOCK_PRODUCTS.filter((p) => p.active !== false);
    const lower = q.toLowerCase();
    return MOCK_PRODUCTS.filter(
      (p) =>
        p.active !== false &&
        (p.name.toLowerCase().includes(lower) ||
          p.tagline.toLowerCase().includes(lower) ||
          p.cat.includes(lower))
    );
  }
  const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  const data = (await res.json()) as { products: Product[] };
  return data.products ?? [];
}

// ─── Mutations (admin) ───────────────────────────────────────────────────

export async function createProductClient(input: Omit<Product, "id"> & { id?: string }): Promise<Product> {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data.product as Product;
}

export async function updateProductClient(id: string, patch: Partial<Product>): Promise<Product> {
  const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data.product as Product;
}

export async function deleteProductClient(id: string): Promise<void> {
  const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
}
