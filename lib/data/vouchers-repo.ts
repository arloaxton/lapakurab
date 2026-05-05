/**
 * Vouchers repository — server-side query layer.
 */

import type { Voucher } from "@/lib/types";
import { SEED_VOUCHERS } from "@/lib/mock/vouchers";
import { isSupabaseConfigured } from "@/backend/env";
import type {
  CreateVoucherInput,
  UpdateVoucherInput,
} from "@/backend/schemas/vouchers";

export interface VoucherRow {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  min_order: number;
  used: number;
  limit_total: number;
  expires: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

function rowToVoucher(r: VoucherRow): Voucher {
  return {
    id: r.id,
    code: r.code,
    type: r.type,
    value: r.value,
    minOrder: r.min_order,
    used: r.used,
    limit: r.limit_total,
    expires: r.expires ?? "",
    active: r.active,
  };
}

// ─── List ───────────────────────────────────────────────────────────────

export async function listVouchers(): Promise<Voucher[]> {
  if (!isSupabaseConfigured()) {
    return SEED_VOUCHERS.slice();
  }
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const { data, error } = await sb
    .from("vouchers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data as VoucherRow[] | null) ?? []).map(rowToVoucher);
}

// ─── Find by code ───────────────────────────────────────────────────────

export async function findVoucherByCode(code: string): Promise<Voucher | null> {
  if (!isSupabaseConfigured()) {
    const v = SEED_VOUCHERS.find((x) => x.code.toUpperCase() === code.toUpperCase());
    return v ?? null;
  }
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const { data, error } = await sb
    .from("vouchers")
    .select("*")
    .eq("code", code)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? rowToVoucher(data as VoucherRow) : null;
}

// ─── Create ─────────────────────────────────────────────────────────────

export async function createVoucher(input: CreateVoucherInput): Promise<Voucher> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase belum di-konfig — createVoucher tidak tersedia.");
  }
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const id = input.id ?? "v" + Date.now();
  const insertRow: Record<string, unknown> = {
    id,
    code: input.code,
    type: input.type,
    value: input.value,
    min_order: input.minOrder ?? 0,
    limit_total: input.limit ?? 0,
    expires: input.expires ?? null,
    active: input.active ?? true,
  };
  const { data, error } = await sb.from("vouchers").insert(insertRow).select().single();
  if (error) throw new Error(error.message);
  return rowToVoucher(data as VoucherRow);
}

// ─── Update ─────────────────────────────────────────────────────────────

export async function updateVoucher(id: string, patch: UpdateVoucherInput): Promise<Voucher> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase belum di-konfig — updateVoucher tidak tersedia.");
  }
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const dbPatch: Record<string, unknown> = {};
  if (patch.code !== undefined) dbPatch.code = patch.code;
  if (patch.type !== undefined) dbPatch.type = patch.type;
  if (patch.value !== undefined) dbPatch.value = patch.value;
  if (patch.minOrder !== undefined) dbPatch.min_order = patch.minOrder;
  if (patch.limit !== undefined) dbPatch.limit_total = patch.limit;
  if (patch.expires !== undefined) dbPatch.expires = patch.expires;
  if (patch.active !== undefined) dbPatch.active = patch.active;
  const { data, error } = await sb
    .from("vouchers")
    .update(dbPatch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return rowToVoucher(data as VoucherRow);
}

// ─── Delete ─────────────────────────────────────────────────────────────

export async function deleteVoucher(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase belum di-konfig — deleteVoucher tidak tersedia.");
  }
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const { error } = await sb.from("vouchers").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ─── Redeem (atomic via RPC) ────────────────────────────────────────────

export async function redeemVoucher(code: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return true; // mock: pretend ok
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const { data, error } = await sb.rpc("redeem_voucher", { p_code: code });
  if (error) throw new Error(error.message);
  return Boolean(data);
}
