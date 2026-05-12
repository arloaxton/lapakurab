/**
 * Stock client-side helpers — fetch via API untuk admin pages dan
 * customer credentials.
 */

import type { StockItem } from "@/lib/types";
import { SEED_STOCK } from "@/lib/mock/stock";
import { isSupabaseConfigured } from "@/backend/env";
import type {
  BulkCreateStockInput,
  CreateStockItemInput,
  StockStatus,
  UpdateStockItemInput,
} from "@/backend/schemas/stock";

export interface FetchStockOpts {
  productId?: string;
  status?: StockStatus;
}

export async function fetchStock(opts: FetchStockOpts = {}): Promise<StockItem[]> {
  if (!isSupabaseConfigured()) {
    let list = SEED_STOCK.slice();
    if (opts.productId) list = list.filter((s) => s.productId === opts.productId);
    if (opts.status) list = list.filter((s) => s.status === opts.status);
    return list;
  }
  const params = new URLSearchParams();
  if (opts.productId) params.set("productId", opts.productId);
  if (opts.status) params.set("status", opts.status);
  const qs = params.toString();
  const res = await fetch(`/api/stock${qs ? `?${qs}` : ""}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  const data = (await res.json()) as { stock: StockItem[] };
  return data.stock ?? [];
}

export async function createStockClient(input: CreateStockItemInput): Promise<StockItem> {
  const res = await fetch("/api/stock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data.item as StockItem;
}

export async function bulkCreateStockClient(
  input: BulkCreateStockInput
): Promise<StockItem[]> {
  const res = await fetch("/api/stock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return (data.stock ?? []) as StockItem[];
}

export async function updateStockClient(
  id: string,
  patch: UpdateStockItemInput
): Promise<StockItem> {
  const res = await fetch(`/api/stock/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data.item as StockItem;
}

export async function deleteStockClient(id: string): Promise<void> {
  const res = await fetch(`/api/stock/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
}

// ─── Customer-facing ────────────────────────────────────────────────────

export interface MyCredential {
  orderId: string;
  productId: string | null;
  field1: string;
  field2: string;
  field3: string;
  notes: string;
}

export async function fetchMyCredentials(): Promise<MyCredential[]> {
  if (!isSupabaseConfigured()) return [];
  const res = await fetch("/api/me/credentials");
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  const data = (await res.json()) as { credentials: MyCredential[] };
  return data.credentials ?? [];
}
