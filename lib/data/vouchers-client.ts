/**
 * Vouchers client-side helpers.
 */

import type { Voucher } from "@/lib/types";
import { SEED_VOUCHERS } from "@/lib/mock/vouchers";
import { isSupabaseConfigured } from "@/backend/env";
import type {
  CreateVoucherInput,
  UpdateVoucherInput,
} from "@/backend/schemas/vouchers";

export interface ValidateResult {
  ok: boolean;
  voucher?: Voucher;
  error?: string;
}

// ─── Customer-facing ────────────────────────────────────────────────────

export async function validateVoucherCode(
  code: string,
  cartTotal: number
): Promise<ValidateResult> {
  if (!isSupabaseConfigured()) {
    const cleaned = code.trim().toUpperCase();
    const v = SEED_VOUCHERS.find((x) => x.code.toUpperCase() === cleaned);
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
  const res = await fetch("/api/vouchers/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, cartTotal }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data?.error || `HTTP ${res.status}` };
  return data as ValidateResult;
}

export async function redeemVoucherCode(code: string): Promise<{ ok: boolean }> {
  if (!isSupabaseConfigured()) return { ok: true };
  const res = await fetch("/api/vouchers/redeem", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) return { ok: false };
  const data = (await res.json()) as { ok: boolean };
  return data;
}

// ─── Admin ──────────────────────────────────────────────────────────────

export async function fetchVouchers(): Promise<Voucher[]> {
  if (!isSupabaseConfigured()) return SEED_VOUCHERS.slice();
  const res = await fetch("/api/vouchers");
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  const data = (await res.json()) as { vouchers: Voucher[] };
  return data.vouchers ?? [];
}

export async function createVoucherClient(input: CreateVoucherInput): Promise<Voucher> {
  const res = await fetch("/api/vouchers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data.voucher as Voucher;
}

export async function updateVoucherClient(
  id: string,
  patch: UpdateVoucherInput
): Promise<Voucher> {
  const res = await fetch(`/api/vouchers/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data.voucher as Voucher;
}

export async function deleteVoucherClient(id: string): Promise<void> {
  const res = await fetch(`/api/vouchers/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
}
