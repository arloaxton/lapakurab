/**
 * Gateways repository — payment gateway config (admin only).
 */

import type { Gateway } from "@/lib/types";
import { SEED_GATEWAYS } from "@/lib/mock/gateways";
import { isSupabaseConfigured } from "@/backend/env";
import type {
  CreateGatewayInput,
  UpdateGatewayInput,
} from "@/backend/schemas/gateways";

interface GatewayRow {
  id: string;
  name: string;
  enabled: boolean;
  fee: number | string;
  api_key: string | null;
  created_at: string;
  updated_at: string;
}

function rowToGateway(r: GatewayRow): Gateway {
  return {
    id: r.id,
    name: r.name,
    enabled: r.enabled,
    fee: Number(r.fee),
    key: r.api_key ?? "",
  };
}

export async function listGateways(): Promise<Gateway[]> {
  if (!isSupabaseConfigured()) return SEED_GATEWAYS.slice();
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const { data, error } = await sb
    .from("gateways")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data as GatewayRow[] | null) ?? []).map(rowToGateway);
}

export async function createGateway(input: CreateGatewayInput): Promise<Gateway> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase belum di-konfig — createGateway tidak tersedia.");
  }
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const { data, error } = await sb
    .from("gateways")
    .insert({
      id: input.id,
      name: input.name,
      enabled: input.enabled ?? false,
      fee: input.fee ?? 0,
      api_key: input.key ?? "",
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return rowToGateway(data as GatewayRow);
}

export async function updateGateway(id: string, patch: UpdateGatewayInput): Promise<Gateway> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase belum di-konfig — updateGateway tidak tersedia.");
  }
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const dbPatch: Record<string, unknown> = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.enabled !== undefined) dbPatch.enabled = patch.enabled;
  if (patch.fee !== undefined) dbPatch.fee = patch.fee;
  if (patch.key !== undefined) dbPatch.api_key = patch.key;
  const { data, error } = await sb
    .from("gateways")
    .update(dbPatch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return rowToGateway(data as GatewayRow);
}

export async function deleteGateway(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase belum di-konfig — deleteGateway tidak tersedia.");
  }
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const { error } = await sb.from("gateways").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
