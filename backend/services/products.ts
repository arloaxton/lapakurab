/**
 * Product services — wraps lib/data/products-repo.ts dengan auth gate untuk
 * write operations. Dipanggil dari API route handlers.
 */

import {
  listProducts as repoList,
  getProductById as repoGet,
  searchProducts as repoSearch,
  createProduct as repoCreate,
  updateProduct as repoUpdate,
  deleteProduct as repoDelete,
  type ListProductsOpts,
} from "@/lib/data/products-repo";
import type { Product } from "@/lib/types";
import type { CreateProductInput, UpdateProductInput } from "../schemas/products";
import { requireAdmin } from "./auth";

// ─── Read (public) ──────────────────────────────────────────────────────

export async function listProductsService(opts: ListProductsOpts = {}): Promise<Product[]> {
  return repoList(opts);
}

export async function getProductService(id: string): Promise<Product | null> {
  return repoGet(id);
}

export async function searchProductsService(q: string): Promise<Product[]> {
  return repoSearch(q);
}

// ─── Write (admin only) ─────────────────────────────────────────────────

export async function createProductService(input: CreateProductInput): Promise<Product> {
  await requireAdmin();
  const { id, ...rest } = input;
  return repoCreate({
    id,
    name: rest.name,
    cat: rest.cat,
    tagline: rest.tagline,
    priceIDR: rest.priceIDR,
    oldIDR: rest.oldIDR,
    stock: rest.stock,
    rating: rest.rating ?? 5.0,
    reviews: rest.reviews ?? 0,
    durations: rest.durations,
    hue: rest.hue,
    emoji: rest.emoji ?? "✦",
    active: rest.active ?? true,
    imageUrl: rest.imageUrl ?? undefined,
  });
}

export async function updateProductService(
  id: string,
  patch: UpdateProductInput
): Promise<Product> {
  await requireAdmin();
  return repoUpdate(id, patch as Partial<Product>);
}

export async function deleteProductService(id: string): Promise<void> {
  await requireAdmin();
  await repoDelete(id);
}
