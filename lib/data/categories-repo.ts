/**
 * Categories repository — read/write tabel categories.
 *
 * Public read (storefront): semua bisa lihat kategori active.
 * Admin write (CRUD): RLS di DB layer + requireAdmin di service layer.
 */

import type { Category } from "@/lib/types";
import { CATEGORIES as MOCK_CATEGORIES } from "@/lib/mock/categories";
import { isSupabaseConfigured } from "@/backend/env";
import type { CategoryRow } from "@/backend/types/db";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/backend/schemas/categories";

function rowToCategory(r: CategoryRow): Category {
  return {
    id: r.id,
    label: r.label,
    emoji: r.emoji ?? "✦",
    description: r.description,
    sortOrder: r.sort_order,
    active: r.active,
  };
}

// ─── List ───────────────────────────────────────────────────────────────

export interface ListCategoriesOpts {
  /** Filter active only (default true). Admin pakai `false` untuk lihat inactive. */
  activeOnly?: boolean;
}

export async function listCategories(
  opts: ListCategoriesOpts = {}
): Promise<Category[]> {
  if (!isSupabaseConfigured()) {
    // Mock fallback — skip "all" pseudo-category karena DB tidak punya
    return MOCK_CATEGORIES.filter((c) => c.id !== "all").map((c) => ({
      ...c,
      sortOrder: c.sortOrder ?? 100,
      active: c.active !== false,
    }));
  }
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  let query = sb
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (opts.activeOnly !== false) query = query.eq("active", true);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return ((data as CategoryRow[] | null) ?? []).map(rowToCategory);
}

// ─── Get by id ──────────────────────────────────────────────────────────

export async function getCategoryById(id: string): Promise<Category | null> {
  if (!isSupabaseConfigured()) {
    const found = MOCK_CATEGORIES.find((c) => c.id === id);
    return found ?? null;
  }
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const { data, error } = await sb
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? rowToCategory(data as CategoryRow) : null;
}

// ─── Create ─────────────────────────────────────────────────────────────

export async function createCategory(
  input: CreateCategoryInput
): Promise<Category> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase belum di-konfig — createCategory tidak tersedia.");
  }
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const { data, error } = await sb
    .from("categories")
    .insert({
      id: input.id,
      label: input.label,
      emoji: input.emoji,
      description: input.description ?? null,
      sort_order: input.sortOrder,
      active: input.active,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return rowToCategory(data as CategoryRow);
}

// ─── Update ─────────────────────────────────────────────────────────────

export async function updateCategory(
  id: string,
  patch: UpdateCategoryInput
): Promise<Category> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase belum di-konfig — updateCategory tidak tersedia.");
  }
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const dbPatch: Record<string, unknown> = {};
  if (patch.label !== undefined) dbPatch.label = patch.label;
  if (patch.emoji !== undefined) dbPatch.emoji = patch.emoji;
  if (patch.description !== undefined) dbPatch.description = patch.description;
  if (patch.sortOrder !== undefined) dbPatch.sort_order = patch.sortOrder;
  if (patch.active !== undefined) dbPatch.active = patch.active;
  const { data, error } = await sb
    .from("categories")
    .update(dbPatch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return rowToCategory(data as CategoryRow);
}

// ─── Delete ─────────────────────────────────────────────────────────────

export async function deleteCategory(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase belum di-konfig — deleteCategory tidak tersedia.");
  }
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const { error } = await sb.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
