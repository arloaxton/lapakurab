/**
 * Stock services — admin-gated CRUD untuk pool kredensial.
 */

import {
  bulkCreateStock as repoBulk,
  createStockItem as repoCreate,
  deleteStockItem as repoDelete,
  listMyCredentials as repoMyCreds,
  listStock as repoList,
  updateStockItem as repoUpdate,
  type ListStockOpts,
} from "@/lib/data/stock-repo";
import type { StockItem } from "@/lib/types";
import type {
  BulkCreateStockInput,
  CreateStockItemInput,
  UpdateStockItemInput,
} from "../schemas/stock";
import { getCurrentSession, requireAdmin } from "./auth";

export async function listStockService(opts: ListStockOpts = {}): Promise<StockItem[]> {
  await requireAdmin();
  return repoList(opts);
}

export async function createStockService(input: CreateStockItemInput): Promise<StockItem> {
  await requireAdmin();
  return repoCreate(input);
}

export async function bulkCreateStockService(
  input: BulkCreateStockInput
): Promise<StockItem[]> {
  await requireAdmin();
  return repoBulk(input);
}

export async function updateStockService(
  id: string,
  patch: UpdateStockItemInput
): Promise<StockItem> {
  await requireAdmin();
  return repoUpdate(id, patch);
}

export async function deleteStockService(id: string): Promise<void> {
  await requireAdmin();
  await repoDelete(id);
}

/** User-facing: return credentials yang sudah di-deliver ke user current. */
export async function listMyCredentialsService(): Promise<
  Array<{ orderId: string; email: string; password: string }>
> {
  const sess = await getCurrentSession();
  if (!sess) throw new Error("Unauthorized");
  return repoMyCreds();
}
