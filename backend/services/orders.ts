/**
 * Orders services — auth-gated wrappers around lib/data/orders-repo.
 */

import {
  createOrder as repoCreate,
  deleteOrder as repoDelete,
  getOrderById as repoGet,
  listAdminOrders as repoListAdmin,
  listMyOrders as repoListMine,
  updateOrder as repoUpdate,
  type ListOrdersOpts,
} from "@/lib/data/orders-repo";
import type { AdminOrder, CustomerOrder } from "@/lib/types";
import type { CreateOrderInput, UpdateOrderInput } from "../schemas/orders";
import { getCurrentSession, requireAdmin } from "./auth";

export async function listAdminOrdersService(opts: ListOrdersOpts = {}): Promise<AdminOrder[]> {
  await requireAdmin();
  return repoListAdmin(opts);
}

export async function listMyOrdersService(opts: ListOrdersOpts = {}): Promise<CustomerOrder[]> {
  const sess = await getCurrentSession();
  if (!sess) throw new Error("Unauthorized");
  return repoListMine(opts);
}

export async function getOrderService(id: string): Promise<AdminOrder | null> {
  const sess = await getCurrentSession();
  if (!sess) throw new Error("Unauthorized");
  // RLS: user only sees own, admin sees all. Repo query already RLS-aware.
  return repoGet(id);
}

export async function createOrderService(input: CreateOrderInput): Promise<AdminOrder> {
  const sess = await getCurrentSession();
  if (!sess) throw new Error("Unauthorized");
  return repoCreate(input, sess.user.id);
}

export async function updateOrderService(
  id: string,
  patch: UpdateOrderInput
): Promise<AdminOrder> {
  await requireAdmin();
  return repoUpdate(id, patch);
}

export async function deleteOrderService(id: string): Promise<void> {
  await requireAdmin();
  await repoDelete(id);
}
