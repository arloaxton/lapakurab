/**
 * Products repository — abstraksi yang frontend pakai.
 *
 * Pola: kalau Supabase di-konfig, query DB. Kalau tidak, fallback ke
 * mock data dari lib/mock/products.ts. Frontend tidak perlu tau bedanya.
 *
 * Phase 1: read-only (list, byId, search). Write functions (create,
 * update, delete) di-stub dulu — di-implement saat Step 4 Products
 * migration setelah backend services siap.
 *
 * Pemakaian:
 *   - Server Components: panggil langsung (akan import server-client)
 *   - Client Components: fetch ke /api/products/* (yang di belakang
 *     panggil function ini di server)
 */

import type { Product } from "@/lib/types";
import { PRODUCTS as MOCK_PRODUCTS, getProduct as getMockProduct } from "@/lib/mock/products";
import { isSupabaseConfigured } from "@/backend/env";
import type { ProductRow } from "@/backend/types/db";

// ─── DB row → Product (frontend type) ───────────────────────────────────
function rowToProduct(r: ProductRow): Product {
  return {
    id: r.id,
    name: r.name,
    cat: r.cat,
    tagline: r.tagline,
    priceIDR: r.price_idr,
    oldIDR: r.old_idr,
    stock: r.stock,
    rating: Number(r.rating),
    reviews: r.reviews,
    durations: r.durations,
    hue: r.hue,
    emoji: r.emoji ?? "✦",
    active: r.active,
    imageUrl: r.image_url ?? undefined,
  };
}

// ─── List ───────────────────────────────────────────────────────────────

export interface ListProductsOpts {
  cat?: "all" | "streaming" | "vpn";
  /** Filter active only (default true). Admin pakai `false` untuk lihat semua. */
  activeOnly?: boolean;
  /** Limit + offset for pagination. */
  limit?: number;
  offset?: number;
}

export async function listProducts(opts: ListProductsOpts = {}): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    let list = MOCK_PRODUCTS.slice();
    if (opts.activeOnly !== false) list = list.filter((p) => p.active !== false);
    if (opts.cat && opts.cat !== "all") list = list.filter((p) => p.cat === opts.cat);
    if (opts.offset) list = list.slice(opts.offset);
    if (opts.limit) list = list.slice(0, opts.limit);
    return list;
  }

  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  let query = sb.from("products").select("*").order("created_at", { ascending: false });
  if (opts.activeOnly !== false) query = query.eq("active", true);
  if (opts.cat && opts.cat !== "all") query = query.eq("cat", opts.cat);
  if (opts.limit) query = query.range(opts.offset ?? 0, (opts.offset ?? 0) + opts.limit - 1);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return ((data as ProductRow[] | null) ?? []).map(rowToProduct);
}

// ─── Get by id ──────────────────────────────────────────────────────────

export async function getProductById(id: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    return getMockProduct(id) ?? null;
  }
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const { data, error } = await sb.from("products").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? rowToProduct(data as ProductRow) : null;
}

// ─── Search ─────────────────────────────────────────────────────────────

export async function searchProducts(q: string): Promise<Product[]> {
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

  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  if (!q.trim()) {
    const { data, error } = await sb
      .from("products")
      .select("*")
      .eq("active", true)
      .order("reviews", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(rowToProduct);
  }
  // Trigram search via ilike
  const pattern = `%${q.trim()}%`;
  const { data, error } = await sb
    .from("products")
    .select("*")
    .eq("active", true)
    .or(`name.ilike.${pattern},tagline.ilike.${pattern},cat.ilike.${pattern}`);
  if (error) throw new Error(error.message);
  return ((data as ProductRow[] | null) ?? []).map(rowToProduct);
}

// ─── Write (Phase 1: Supabase only — admin) ─────────────────────────────
// Note: ini panggilan server-side. Untuk pemakaian dari client, panggil
// via /api/products endpoint (Step 4).

export async function createProduct(input: Omit<Product, "id"> & { id?: string }): Promise<Product> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase belum di-konfig — createProduct tidak tersedia di mode mock.");
  }
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const id = input.id ?? "p" + Date.now();
  const insertRow: Record<string, unknown> = {
    id,
    name: input.name,
    cat: input.cat,
    tagline: input.tagline,
    price_idr: input.priceIDR,
    old_idr: input.oldIDR,
    stock: input.stock,
    rating: input.rating,
    reviews: input.reviews,
    durations: input.durations,
    hue: input.hue,
    emoji: input.emoji,
    active: input.active ?? true,
    image_url: input.imageUrl ?? null,
  };
  const { data, error } = await sb.from("products").insert(insertRow).select().single();
  if (error) throw new Error(error.message);
  return rowToProduct(data as ProductRow);
}

export async function updateProduct(id: string, patch: Partial<Product>): Promise<Product> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase belum di-konfig — updateProduct tidak tersedia di mode mock.");
  }
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const dbPatch: Record<string, unknown> = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.cat !== undefined) dbPatch.cat = patch.cat;
  if (patch.tagline !== undefined) dbPatch.tagline = patch.tagline;
  if (patch.priceIDR !== undefined) dbPatch.price_idr = patch.priceIDR;
  if (patch.oldIDR !== undefined) dbPatch.old_idr = patch.oldIDR;
  if (patch.stock !== undefined) dbPatch.stock = patch.stock;
  if (patch.rating !== undefined) dbPatch.rating = patch.rating;
  if (patch.reviews !== undefined) dbPatch.reviews = patch.reviews;
  if (patch.durations !== undefined) dbPatch.durations = patch.durations;
  if (patch.hue !== undefined) dbPatch.hue = patch.hue;
  if (patch.emoji !== undefined) dbPatch.emoji = patch.emoji;
  if (patch.active !== undefined) dbPatch.active = patch.active;
  if (patch.imageUrl !== undefined) dbPatch.image_url = patch.imageUrl;

  const { data, error } = await sb.from("products").update(dbPatch).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return rowToProduct(data as ProductRow);
}

export async function deleteProduct(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase belum di-konfig — deleteProduct tidak tersedia di mode mock.");
  }
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const { error } = await sb.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
