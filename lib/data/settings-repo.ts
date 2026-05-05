/**
 * Settings repository — single-row config toko.
 */

import type { AdminSettings } from "@/lib/types";
import { SEED_SETTINGS } from "@/lib/mock/settings";
import { isSupabaseConfigured } from "@/backend/env";
import type { UpdateSettingsInput } from "@/backend/schemas/settings";

interface SettingsRow {
  id: string;
  store_name: string;
  store_tagline: string;
  logo: string | null;
  cs_wa: string | null;
  cs_email: string | null;
  notif_email: string | null;
  notify_on_order: boolean;
  notify_on_low_stock: boolean;
  notify_on_refund: boolean;
  auto_delivery: boolean;
  auto_pause_out_of_stock: boolean;
  low_stock_threshold: number;
  invoice_prefix: string;
  tax_percent: number | string;
  admin_fee_idr: number;
}

function rowToSettings(r: SettingsRow): AdminSettings {
  return {
    storeName: r.store_name,
    storeTagline: r.store_tagline,
    logo: r.logo ?? "",
    csWA: r.cs_wa ?? "",
    csEmail: r.cs_email ?? "",
    notifEmail: r.notif_email ?? "",
    notifyOnOrder: r.notify_on_order,
    notifyOnLowStock: r.notify_on_low_stock,
    notifyOnRefund: r.notify_on_refund,
    autoDelivery: r.auto_delivery,
    autoPauseOutOfStock: r.auto_pause_out_of_stock,
    lowStockThreshold: r.low_stock_threshold,
    invoicePrefix: r.invoice_prefix,
    taxPercent: Number(r.tax_percent),
    adminFeeIDR: r.admin_fee_idr,
  };
}

export async function getSettings(): Promise<AdminSettings> {
  if (!isSupabaseConfigured()) return { ...SEED_SETTINGS };
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const { data, error } = await sb
    .from("settings")
    .select("*")
    .eq("id", "singleton")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return { ...SEED_SETTINGS };
  return rowToSettings(data as SettingsRow);
}

export async function updateSettings(patch: UpdateSettingsInput): Promise<AdminSettings> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase belum di-konfig — updateSettings tidak tersedia.");
  }
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const dbPatch: Record<string, unknown> = {};
  if (patch.storeName !== undefined) dbPatch.store_name = patch.storeName;
  if (patch.storeTagline !== undefined) dbPatch.store_tagline = patch.storeTagline;
  if (patch.logo !== undefined) dbPatch.logo = patch.logo;
  if (patch.csWA !== undefined) dbPatch.cs_wa = patch.csWA;
  if (patch.csEmail !== undefined) dbPatch.cs_email = patch.csEmail;
  if (patch.notifEmail !== undefined) dbPatch.notif_email = patch.notifEmail;
  if (patch.notifyOnOrder !== undefined) dbPatch.notify_on_order = patch.notifyOnOrder;
  if (patch.notifyOnLowStock !== undefined) dbPatch.notify_on_low_stock = patch.notifyOnLowStock;
  if (patch.notifyOnRefund !== undefined) dbPatch.notify_on_refund = patch.notifyOnRefund;
  if (patch.autoDelivery !== undefined) dbPatch.auto_delivery = patch.autoDelivery;
  if (patch.autoPauseOutOfStock !== undefined)
    dbPatch.auto_pause_out_of_stock = patch.autoPauseOutOfStock;
  if (patch.lowStockThreshold !== undefined)
    dbPatch.low_stock_threshold = patch.lowStockThreshold;
  if (patch.invoicePrefix !== undefined) dbPatch.invoice_prefix = patch.invoicePrefix;
  if (patch.taxPercent !== undefined) dbPatch.tax_percent = patch.taxPercent;
  if (patch.adminFeeIDR !== undefined) dbPatch.admin_fee_idr = patch.adminFeeIDR;

  const { data, error } = await sb
    .from("settings")
    .update(dbPatch)
    .eq("id", "singleton")
    .select()
    .single();
  if (error) throw new Error(error.message);
  return rowToSettings(data as SettingsRow);
}
