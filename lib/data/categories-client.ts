/**
 * Categories client wrapper — fetch dari /api/categories.
 * Dipakai client components (admin panel, product form modal).
 */

import type { Category } from "@/lib/types";

export interface CreateCategoryPayload {
  id: string;
  label: string;
  emoji?: string;
  description?: string | null;
  sortOrder?: number;
  active?: boolean;
}

export interface UpdateCategoryPayload {
  label?: string;
  emoji?: string;
  description?: string | null;
  sortOrder?: number;
  active?: boolean;
}

export async function fetchCategories(opts: { admin?: boolean } = {}): Promise<Category[]> {
  const qs = opts.admin ? "?admin=1" : "";
  const res = await fetch(`/api/categories${qs}`, { credentials: "include" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (data.categories as Category[]) ?? [];
}

export async function createCategory(payload: CreateCategoryPayload): Promise<Category> {
  const res = await fetch("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data as Category;
}

export async function updateCategoryClient(
  id: string,
  payload: UpdateCategoryPayload
): Promise<Category> {
  const res = await fetch(`/api/categories/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data as Category;
}

export async function deleteCategoryClient(id: string): Promise<void> {
  const res = await fetch(`/api/categories/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
}
