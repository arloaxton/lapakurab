/**
 * Stock repository — server-side query layer untuk pool kredensial.
 *
 * Schema generic: field1/field2/field3/notes. Label resolved di UI berdasarkan
 * product.credentialFormat (email_password, email_pin, key_only, dll).
 *
 * Mock fallback aktif kalau Supabase belum di-konfig.
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

export interface StockRow {
  id: string;
  product_id: string;
  field1: string;
  field2: string | null;
  field3: string | null;
  notes: string | null;
  account_type: "private" | "sharing";
  status: StockStatus;
  order_id: string | null;
  added_at: string;
  sold_at: string | null;
}

function rowToStock(r: StockRow): StockItem {
  return {
    id: r.id,
    productId: r.product_id,
    field1: r.field1,
    field2: r.field2 ?? "",
    field3: r.field3 ?? "",
    notes: r.notes ?? "",
    accountType: r.account_type ?? "private",
    status: r.status,
    addedAt: r.added_at.slice(0, 10),
  };
}

export interface ClaimedCredential {
  id: string;
  field1: string;
  field2: string | null;
  field3: string | null;
  notes: string | null;
  credential_format: string;
  account_type: "private" | "sharing";
}

// ─── List ───────────────────────────────────────────────────────────────

export interface ListStockOpts {
  productId?: string;
  status?: StockStatus;
  accountType?: "private" | "sharing";
  limit?: number;
  offset?: number;
}

export async function listStock(opts: ListStockOpts = {}): Promise<StockItem[]> {
  if (!isSupabaseConfigured()) {
    let list = SEED_STOCK.slice();
    if (opts.productId) list = list.filter((s) => s.productId === opts.productId);
    if (opts.status) list = list.filter((s) => s.status === opts.status);
    if (opts.accountType)
      list = list.filter((s) => s.accountType === opts.accountType);
    if (opts.offset) list = list.slice(opts.offset);
    if (opts.limit) list = list.slice(0, opts.limit);
    return list;
  }
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  let q = sb.from("stock_items").select("*").order("added_at", { ascending: false });
  if (opts.productId) q = q.eq("product_id", opts.productId);
  if (opts.status) q = q.eq("status", opts.status);
  if (opts.accountType) q = q.eq("account_type", opts.accountType);
  if (opts.limit) q = q.range(opts.offset ?? 0, (opts.offset ?? 0) + opts.limit - 1);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return ((data as StockRow[] | null) ?? []).map(rowToStock);
}

// ─── Create (single) ────────────────────────────────────────────────────

export async function createStockItem(input: CreateStockItemInput): Promise<StockItem> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase belum di-konfig — createStockItem tidak tersedia di mode mock.");
  }
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const id = "s" + Date.now() + Math.random().toString(36).slice(2, 6);
  const insertRow: Record<string, unknown> = {
    id,
    product_id: input.productId,
    field1: input.field1,
    field2: input.field2 ?? "",
    field3: input.field3 ?? "",
    notes: input.notes ?? "",
    account_type: input.accountType ?? "private",
    status: input.status ?? "available",
  };
  const { data, error } = await sb.from("stock_items").insert(insertRow).select().single();
  if (error) throw new Error(error.message);
  return rowToStock(data as StockRow);
}

// ─── Bulk create ────────────────────────────────────────────────────────

export async function bulkCreateStock(input: BulkCreateStockInput): Promise<StockItem[]> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase belum di-konfig — bulkCreateStock tidak tersedia di mode mock.");
  }
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const baseTs = Date.now();
  const rows = input.items.map((it, i) => ({
    id: "s" + baseTs + i + Math.random().toString(36).slice(2, 4),
    product_id: input.productId,
    field1: it.field1,
    field2: it.field2 ?? "",
    field3: it.field3 ?? "",
    notes: it.notes ?? "",
    account_type: input.accountType ?? "private",
    status: "available" as StockStatus,
  }));
  const { data, error } = await sb.from("stock_items").insert(rows).select();
  if (error) throw new Error(error.message);
  return ((data as StockRow[] | null) ?? []).map(rowToStock);
}

// ─── Update ─────────────────────────────────────────────────────────────

export async function updateStockItem(
  id: string,
  patch: UpdateStockItemInput
): Promise<StockItem> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase belum di-konfig — updateStockItem tidak tersedia di mode mock.");
  }
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const dbPatch: Record<string, unknown> = {};
  if (patch.status !== undefined) dbPatch.status = patch.status;
  if (patch.field1 !== undefined) dbPatch.field1 = patch.field1;
  if (patch.field2 !== undefined) dbPatch.field2 = patch.field2;
  if (patch.field3 !== undefined) dbPatch.field3 = patch.field3;
  if (patch.notes !== undefined) dbPatch.notes = patch.notes;
  const { data, error } = await sb
    .from("stock_items")
    .update(dbPatch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return rowToStock(data as StockRow);
}

// ─── Delete ─────────────────────────────────────────────────────────────

export async function deleteStockItem(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase belum di-konfig — deleteStockItem tidak tersedia di mode mock.");
  }
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const { error } = await sb.from("stock_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ─── Claim stock for an order (atomic via RPC) ──────────────────────────

export async function claimStockForOrder(
  orderId: string,
  productId: string,
  accountType: "private" | "sharing" = "private"
): Promise<ClaimedCredential | null> {
  if (!isSupabaseConfigured()) return null;
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const { data, error } = await sb.rpc("claim_stock", {
    p_order_id: orderId,
    p_product_id: productId,
    p_account_type: accountType,
  });
  if (error) throw new Error(error.message);
  if (!data || (Array.isArray(data) && data.length === 0)) return null;
  const row = (Array.isArray(data) ? data[0] : data) as ClaimedCredential;
  return row;
}

// ─── Read credentials linked to user's own orders (RLS-protected) ───────

export interface MyCredentialRow {
  orderId: string;
  productId: string | null;
  field1: string;
  field2: string;
  field3: string;
  notes: string;
  credentialFormat: string;
}

export async function listMyCredentials(): Promise<MyCredentialRow[]> {
  if (!isSupabaseConfigured()) return [];
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  // JOIN products supaya tau credential_format-nya — UI render label
  // field dinamis (email|password vs email|profile|pin vs key_only, dll).
  const { data, error } = await sb
    .from("stock_items")
    .select(
      "field1, field2, field3, notes, order_id, product_id, products:product_id(credential_format)"
    )
    .not("order_id", "is", null);
  if (error) throw new Error(error.message);
  type Row = {
    field1: string;
    field2: string | null;
    field3: string | null;
    notes: string | null;
    order_id: string;
    product_id: string | null;
    products: { credential_format: string | null } | null;
  };
  return ((data as Row[] | null) ?? []).map((r) => ({
    orderId: r.order_id,
    productId: r.product_id,
    field1: r.field1,
    field2: r.field2 ?? "",
    field3: r.field3 ?? "",
    notes: r.notes ?? "",
    credentialFormat: r.products?.credential_format ?? "email_password",
  }));
}
