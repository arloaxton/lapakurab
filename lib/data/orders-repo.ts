/**
 * Orders repository — server-side query layer.
 *
 * Pola: kalau Supabase di-konfig, query DB. Kalau tidak, fallback ke mock.
 *
 * Pemakaian:
 *   - Server Components / Route Handlers: panggil langsung
 *   - Client Components: fetch ke /api/orders/* (lihat orders-client.ts)
 */

import type { AdminOrder, CustomerOrder } from "@/lib/types";
import { SEED_ADMIN_ORDERS } from "@/lib/mock/admin-orders";
import { CUSTOMER_ORDERS as MOCK_CUSTOMER_ORDERS } from "@/lib/mock/customer-orders";
import { isSupabaseConfigured } from "@/backend/env";
import type { CreateOrderInput, OrderStatus, UpdateOrderInput } from "@/backend/schemas/orders";

// ─── Row ────────────────────────────────────────────────────────────────

export interface OrderRow {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  product_id: string | null;
  product_name: string;
  duration: string;
  qty: number;
  total_idr: number;
  status: OrderStatus;
  payment_method: string | null;
  payment_ref: string | null;
  payment_url: string | null;
  payment_trx_id: string | null;
  qr_string: string | null;
  notes: string | null;
  account_type: "private" | "sharing";
  delivered_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Mappers ────────────────────────────────────────────────────────────

function rowToAdminOrder(r: OrderRow): AdminOrder {
  return {
    id: r.id,
    date: r.created_at.slice(0, 10),
    customer: r.customer_name,
    email: r.customer_email,
    product: r.product_name,
    duration: r.duration,
    total: r.total_idr,
    status: r.status,
    payment: r.payment_method ?? "—",
  };
}

function rowToCustomerOrder(r: OrderRow & { products?: { old_idr: number | null } | { old_idr: number | null }[] | null }): CustomerOrder {
  let status: CustomerOrder["status"];
  if (r.status === "refunded" || r.status === "failed") status = "Dibatalkan";
  else if (r.status === "delivered" && r.expires_at && new Date(r.expires_at) < new Date())
    status = "Selesai";
  else if (r.status === "delivered" || r.status === "paid") status = "Aktif";
  else status = "Dibatalkan"; // pending falls here — defensif, listMyOrders filter sudah hide

  let daysLeft = 0;
  if (r.expires_at) {
    const ms = new Date(r.expires_at).getTime() - Date.now();
    daysLeft = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  }

  // Retail price dari JOIN products.old_idr (Supabase bisa return single
  // object atau array tergantung relation cardinality).
  const rel = r.products;
  const productObj = Array.isArray(rel) ? rel[0] : rel;
  const retailIDR = productObj?.old_idr ?? undefined;

  return {
    id: r.id,
    date: r.created_at.slice(0, 10),
    product: r.product_name,
    duration: r.duration,
    total: r.total_idr,
    retailIDR: retailIDR ?? undefined,
    accountType: r.account_type ?? "private",
    status,
    daysLeft,
  };
}

// ─── Public ID generator ────────────────────────────────────────────────

export function generateOrderId(): string {
  // Format: LP-{YYMMDD}-{6 chars random}
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `LP-${yy}${mm}${dd}-${rand}`;
}

// ─── List (admin) ───────────────────────────────────────────────────────

export interface ListOrdersOpts {
  status?: OrderStatus;
  limit?: number;
  offset?: number;
}

export async function listAdminOrders(opts: ListOrdersOpts = {}): Promise<AdminOrder[]> {
  if (!isSupabaseConfigured()) {
    let list = SEED_ADMIN_ORDERS.slice();
    if (opts.status) list = list.filter((o) => o.status === opts.status);
    if (opts.offset) list = list.slice(opts.offset);
    if (opts.limit) list = list.slice(0, opts.limit);
    return list;
  }
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  let q = sb.from("orders").select("*").order("created_at", { ascending: false });
  if (opts.status) q = q.eq("status", opts.status);
  if (opts.limit) q = q.range(opts.offset ?? 0, (opts.offset ?? 0) + opts.limit - 1);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return ((data as OrderRow[] | null) ?? []).map(rowToAdminOrder);
}

// ─── List own (customer) ────────────────────────────────────────────────

export async function listMyOrders(opts: ListOrdersOpts = {}): Promise<CustomerOrder[]> {
  if (!isSupabaseConfigured()) {
    let list = MOCK_CUSTOMER_ORDERS.slice();
    if (opts.offset) list = list.slice(opts.offset);
    if (opts.limit) list = list.slice(0, opts.limit);
    return list;
  }
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  // RLS otomatis filter user_id = auth.uid().
  // Default: HIDE 'pending' (belum dibayar — user masih di checkout flow,
  // jangan tampil seakan order valid) + 'failed' (gateway gagal).
  // Kalau opts.status di-set, override.
  // JOIN products(old_idr) untuk hitung "Total hemat" di dashboard customer.
  let q = sb
    .from("orders")
    .select("*, products:product_id(old_idr)")
    .order("created_at", { ascending: false });
  if (opts.status) {
    q = q.eq("status", opts.status);
  } else {
    q = q.in("status", ["paid", "delivered", "refunded"]);
  }
  if (opts.limit) q = q.range(opts.offset ?? 0, (opts.offset ?? 0) + opts.limit - 1);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return ((data as unknown as (OrderRow & { products?: { old_idr: number | null } | { old_idr: number | null }[] | null })[] | null) ?? []).map(
    rowToCustomerOrder
  );
}

// ─── Get by id (admin sees any, user sees own via RLS) ──────────────────

export async function getOrderById(id: string): Promise<AdminOrder | null> {
  if (!isSupabaseConfigured()) {
    return SEED_ADMIN_ORDERS.find((o) => o.id === id) ?? null;
  }
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const { data, error } = await sb.from("orders").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? rowToAdminOrder(data as OrderRow) : null;
}

// ─── Create ─────────────────────────────────────────────────────────────

export async function createOrder(
  input: CreateOrderInput,
  userId: string
): Promise<AdminOrder> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase belum di-konfig — createOrder tidak tersedia di mode mock.");
  }
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const id = generateOrderId();
  // Default: paid status simulasi (Phase 4 akan ganti via gateway webhook)
  const insertRow: Record<string, unknown> = {
    id,
    user_id: userId,
    customer_name: input.customerName,
    customer_email: input.customerEmail,
    customer_phone: input.customerPhone ?? null,
    product_id: input.productId,
    product_name: input.productName,
    duration: input.duration,
    qty: input.qty,
    total_idr: input.totalIDR,
    account_type: input.accountType ?? "private",
    status: "paid",
    payment_method: input.paymentMethod ?? null,
    notes: input.notes ?? null,
  };
  const { data, error } = await sb.from("orders").insert(insertRow).select().single();
  if (error) throw new Error(error.message);

  // Auto-deliver: coba claim 1 stock available. Kalau habis, order tetap 'paid'.
  try {
    const { claimStockForOrder } = await import("@/lib/data/stock-repo");
    const claimed = await claimStockForOrder(
      id,
      input.productId,
      input.accountType ?? "private"
    );
    if (claimed) {
      // Set expires_at = sekarang + durasi langganan (mis. "1 Bulan" = 30 hari)
      // Pakai admin client — orders RLS hanya allow UPDATE oleh admin.
      const { durationToDays } = await import("@/lib/duration");
      const { getAdminClient } = await import("@/backend/db/server-client");
      const days = durationToDays(input.duration);
      const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
      const sbAdmin = getAdminClient();
      await sbAdmin.from("orders").update({ expires_at: expiresAt }).eq("id", id);
    }
    // Re-fetch order (status bisa berubah ke 'delivered' kalau stock ke-claim)
    const { data: refreshed } = await sb
      .from("orders")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (refreshed) return rowToAdminOrder(refreshed as OrderRow);
  } catch {
    // Silent — order tetap dibuat, admin bisa manual deliver.
  }
  return rowToAdminOrder(data as OrderRow);
}

// ─── Update (admin) ─────────────────────────────────────────────────────

export async function updateOrder(id: string, patch: UpdateOrderInput): Promise<AdminOrder> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase belum di-konfig — updateOrder tidak tersedia di mode mock.");
  }
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const dbPatch: Record<string, unknown> = {};
  if (patch.status !== undefined) dbPatch.status = patch.status;
  if (patch.paymentMethod !== undefined) dbPatch.payment_method = patch.paymentMethod;
  if (patch.notes !== undefined) dbPatch.notes = patch.notes;
  if (patch.deliveredAt !== undefined) dbPatch.delivered_at = patch.deliveredAt;
  if (patch.expiresAt !== undefined) dbPatch.expires_at = patch.expiresAt;

  const { data, error } = await sb.from("orders").update(dbPatch).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return rowToAdminOrder(data as OrderRow);
}

// ─── Delete ─────────────────────────────────────────────────────────────

// ─── Pending-create (Phase 4 — Pakasir) ─────────────────────────────────

/**
 * Create order dengan status='pending' tanpa auto-deliver. Stock akan
 * di-claim setelah webhook callback PAID.
 */
export async function createPendingOrder(
  input: CreateOrderInput,
  userId: string
): Promise<{ id: string }> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase belum di-konfig — createPendingOrder tidak tersedia.");
  }
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const id = generateOrderId();
  const insertRow: Record<string, unknown> = {
    id,
    user_id: userId,
    customer_name: input.customerName,
    customer_email: input.customerEmail,
    customer_phone: input.customerPhone ?? null,
    product_id: input.productId,
    product_name: input.productName,
    duration: input.duration,
    qty: input.qty,
    total_idr: input.totalIDR,
    account_type: input.accountType ?? "private",
    status: "pending",
    payment_method: input.paymentMethod ?? null,
    notes: input.notes ?? null,
  };
  const { error } = await sb.from("orders").insert(insertRow);
  if (error) throw new Error(error.message);
  return { id };
}

/** Attach payment metadata ke beberapa order sekaligus (by id list).
 *  WAJIB pakai admin client (bypass RLS) — orders RLS hanya allow
 *  UPDATE oleh admin, sementara ini di-trigger dari checkout flow user. */
export async function attachPaymentToOrders(
  orderIds: string[],
  paymentRef: string,
  paymentUrl: string,
  paymentTrxId: string | null,
  qrString: string | null
): Promise<void> {
  if (!isSupabaseConfigured() || orderIds.length === 0) return;
  const { getAdminClient } = await import("@/backend/db/server-client");
  const sb = getAdminClient();
  const { error } = await sb
    .from("orders")
    .update({
      payment_ref: paymentRef,
      payment_url: paymentUrl,
      payment_trx_id: paymentTrxId,
      qr_string: qrString,
    })
    .in("id", orderIds);
  if (error) throw new Error(error.message);
}

/** Find orders by payment_ref. Dipakai webhook callback. */
export async function findOrdersByPaymentRef(paymentRef: string): Promise<OrderRow[]> {
  if (!isSupabaseConfigured()) return [];
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const { data, error } = await sb
    .from("orders")
    .select("*")
    .eq("payment_ref", paymentRef);
  if (error) throw new Error(error.message);
  return (data as OrderRow[] | null) ?? [];
}

/**
 * Mark group orders sebagai paid + trigger claim_stock untuk masing-masing.
 * Idempotent: kalau sudah delivered, skip claim. Service-role context.
 */
export async function settlePaymentRef(paymentRef: string): Promise<{
  updated: number;
  delivered: number;
}> {
  if (!isSupabaseConfigured()) return { updated: 0, delivered: 0 };
  // WAJIB admin client — settle dipanggil dari webhook (no user session)
  // dan dari status-check route. Orders RLS hanya allow UPDATE oleh admin.
  const { getAdminClient } = await import("@/backend/db/server-client");
  const sb = getAdminClient();
  const orders = await findOrdersByPaymentRef(paymentRef);
  const pending = orders.filter((o) => o.status === "pending");

  if (pending.length === 0) return { updated: 0, delivered: 0 };

  // Mark all pending → paid
  const { error: updErr } = await sb
    .from("orders")
    .update({ status: "paid" })
    .eq("payment_ref", paymentRef)
    .eq("status", "pending");
  if (updErr) throw new Error(updErr.message);

  // Claim stock per order (auto-deliver). claim_stock RPC akan ubah ke 'delivered'
  // kalau stock available. Setelah claim sukses, fire-and-forget email.
  let delivered = 0;
  const { claimStockForOrder } = await import("@/lib/data/stock-repo");
  const { sendCredentialEmailFor } = await import("@/backend/services/email/notify");
  for (const o of pending) {
    if (!o.product_id) continue;
    try {
      const cred = await claimStockForOrder(
        o.id,
        o.product_id,
        (o as { account_type?: "private" | "sharing" }).account_type ?? "private"
      );
      if (cred) {
        delivered += 1;
        // Set expires_at = now + durasi
        const { durationToDays } = await import("@/lib/duration");
        const days = durationToDays(o.duration);
        const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
        await sb.from("orders").update({ expires_at: expiresAt }).eq("id", o.id);
        // Best-effort email — TIDAK block webhook response.
        sendCredentialEmailFor({
          orderId: o.id,
          customerName: o.customer_name,
          customerEmail: o.customer_email,
          productName: o.product_name,
          duration: o.duration,
          credentialFormat: cred.credential_format,
          field1: cred.field1,
          field2: cred.field2 ?? undefined,
          field3: cred.field3 ?? undefined,
          notes: cred.notes ?? undefined,
        }).catch(() => {});
      }
    } catch {
      // silent — order tetap paid, admin manual deliver
    }
  }
  return { updated: pending.length, delivered };
}

export async function deleteOrder(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase belum di-konfig — deleteOrder tidak tersedia di mode mock.");
  }
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const { error } = await sb.from("orders").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
