/**
 * Settings + Gateways client-side helpers.
 */

import type { AdminSettings, Gateway } from "@/lib/types";
import { SEED_SETTINGS } from "@/lib/mock/settings";
import { SEED_GATEWAYS } from "@/lib/mock/gateways";
import { isSupabaseConfigured } from "@/backend/env";
import type { UpdateSettingsInput } from "@/backend/schemas/settings";
import type { UpdateGatewayInput } from "@/backend/schemas/gateways";

export async function fetchSettings(): Promise<AdminSettings> {
  if (!isSupabaseConfigured()) return { ...SEED_SETTINGS };
  const res = await fetch("/api/settings");
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  const data = (await res.json()) as { settings: AdminSettings };
  return data.settings;
}

export async function updateSettingsClient(
  patch: UpdateSettingsInput
): Promise<AdminSettings> {
  const res = await fetch("/api/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data.settings as AdminSettings;
}

export interface PublicGateway {
  id: string;
  name: string;
  enabled: boolean;
  fee: number;
}

/**
 * Public list — hanya gateway enabled, tanpa api_key. Dipakai di checkout
 * page untuk render daftar pilihan pembayaran sesuai config admin.
 */
export async function fetchPublicGateways(): Promise<PublicGateway[]> {
  if (!isSupabaseConfigured()) {
    return SEED_GATEWAYS.filter((g) => g.enabled).map((g) => ({
      id: g.id,
      name: g.name,
      enabled: g.enabled,
      fee: g.fee,
    }));
  }
  const res = await fetch("/api/gateways/public");
  if (!res.ok) return [];
  const data = (await res.json()) as { gateways: PublicGateway[] };
  return data.gateways ?? [];
}

export async function fetchGateways(): Promise<Gateway[]> {
  if (!isSupabaseConfigured()) return SEED_GATEWAYS.slice();
  const res = await fetch("/api/gateways");
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  const data = (await res.json()) as { gateways: Gateway[] };
  return data.gateways ?? [];
}

export async function updateGatewayClient(
  id: string,
  patch: UpdateGatewayInput
): Promise<Gateway> {
  const res = await fetch(`/api/gateways/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data.gateway as Gateway;
}
