import {
  createCategory as repoCreate,
  deleteCategory as repoDelete,
  getCategoryById as repoGet,
  listCategories as repoList,
  updateCategory as repoUpdate,
} from "@/lib/data/categories-repo";
import type { Category } from "@/lib/types";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../schemas/categories";
import { requireAdmin } from "./auth";

/** Public — siapa saja bisa baca kategori aktif (untuk storefront filter). */
export async function listCategoriesPublic(): Promise<Category[]> {
  return repoList({ activeOnly: true });
}

/** Admin — termasuk yang inactive. */
export async function listCategoriesAdmin(): Promise<Category[]> {
  await requireAdmin();
  return repoList({ activeOnly: false });
}

export async function getCategoryService(id: string): Promise<Category | null> {
  return repoGet(id);
}

export async function createCategoryService(
  input: CreateCategoryInput
): Promise<Category> {
  await requireAdmin();
  return repoCreate(input);
}

export async function updateCategoryService(
  id: string,
  patch: UpdateCategoryInput
): Promise<Category> {
  await requireAdmin();
  return repoUpdate(id, patch);
}

export async function deleteCategoryService(id: string): Promise<void> {
  await requireAdmin();
  await repoDelete(id);
}
