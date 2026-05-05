/**
 * Orders client-side helpers — fetch via API untuk client components.
 *
 * Mock fallback: kembalikan data dari `lib/mock/customer-orders` atau
 * `lib/mock/admin-orders` tergantung scope.
 */

import type { AdminOrder, CustomerOrder } from "@/lib/types";
import { CUSTOMER_ORDERS as MOCK_CUSTOMER_ORDERS } from "@/lib/mock/customer-orders";
import { SEED_ADMIN_ORDERS } from "@/lib/mock/admin-orders";
import { isSupabaseConfigured } from "@/backend/env";
import type { CreateOrderInput, OrderStatus, UpdateOrderInput } from "@/backend/schemas/orders";

export async function fetchMyOrders(): Promise<CustomerOrder[]> {
  if (!isSupabaseConfigured()) {
    return MOCK_CUSTOMER_ORDERS.slice();
  }
  const res = await fetch("/api/orders?scope=me");
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  const data = (await res.json()) as { orders: CustomerOrder[] };
  return data.orders ?? [];
}

export interface FetchAdminOrdersOpts {
  status?: OrderStatus;
  limit?: number;
  offset?: number;
}

export async function fetchAdminOrders(opts: FetchAdminOrdersOpts = {}): Promise<AdminOrder[]> {
  if (!isSupabaseConfigured()) {
    let list = SEED_ADMIN_ORDERS.slice();
    if (opts.status) list = list.filter((o) => o.status === opts.status);
    return list;
  }
  const params = new URLSearchParams({ scope: "all" });
  if (opts.status) params.set("status", opts.status);
  if (opts.limit !== undefined) params.set("limit", String(opts.limit));
  if (opts.offset !== undefined) params.set("offset", String(opts.offset));
  const res = await fetch(`/api/orders?${params.toString()}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  const data = (await res.json()) as { orders: AdminOrder[] };
  return data.orders ?? [];
}

export async function createOrderClient(input: CreateOrderInput): Promise<AdminOrder> {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data.order as AdminOrder;
}

export async function updateOrderClient(
  id: string,
  patch: UpdateOrderInput
): Promise<AdminOrder> {
  const res = await fetch(`/api/orders/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data.order as AdminOrder;
}

export async function deleteOrderClient(id: string): Promise<void> {
  const res = await fetch(`/api/orders/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
}
