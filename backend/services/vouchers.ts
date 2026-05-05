/**
 * Voucher services — admin CRUD + customer validate/redeem.
 */

import {
  createVoucher as repoCreate,
  deleteVoucher as repoDelete,
  findVoucherByCode,
  listVouchers as repoList,
  redeemVoucher as repoRedeem,
  updateVoucher as repoUpdate,
} from "@/lib/data/vouchers-repo";
import type { Voucher } from "@/lib/types";
import type {
  CreateVoucherInput,
  UpdateVoucherInput,
} from "../schemas/vouchers";
import { getCurrentSession, requireAdmin } from "./auth";

export async function listVouchersService(): Promise<Voucher[]> {
  await requireAdmin();
  return repoList();
}

export async function createVoucherService(input: CreateVoucherInput): Promise<Voucher> {
  await requireAdmin();
  return repoCreate(input);
}

export async function updateVoucherService(
  id: string,
  patch: UpdateVoucherInput
): Promise<Voucher> {
  await requireAdmin();
  return repoUpdate(id, patch);
}

export async function deleteVoucherService(id: string): Promise<void> {
  await requireAdmin();
  await repoDelete(id);
}

export interface ValidateResult {
  ok: boolean;
  voucher?: Voucher;
  error?: string;
}

/** Validate kode voucher (no DB write). User-facing. */
export async function validateVoucherService(
  code: string,
  cartTotal: number
): Promise<ValidateResult> {
  const sess = await getCurrentSession();
  if (!sess) return { ok: false, error: "Login dulu untuk pakai voucher" };
  const v = await findVoucherByCode(code);
  if (!v) return { ok: false, error: "Kode voucher tidak ditemukan" };
  if (!v.active) return { ok: false, error: "Voucher sudah tidak aktif" };
  if (v.expires && new Date(v.expires) < new Date())
    return { ok: false, error: "Voucher sudah kadaluwarsa" };
  if (v.limit > 0 && v.used >= v.limit)
    return { ok: false, error: "Voucher sudah habis dipakai" };
  if (cartTotal < v.minOrder)
    return {
      ok: false,
      error: `Min. order Rp${v.minOrder.toLocaleString("id-ID")} untuk voucher ini`,
    };
  return { ok: true, voucher: v };
}

/** Redeem (increment used count). Dipanggil setelah checkout success. */
export async function redeemVoucherService(code: string): Promise<boolean> {
  const sess = await getCurrentSession();
  if (!sess) throw new Error("Unauthorized");
  return repoRedeem(code);
}
