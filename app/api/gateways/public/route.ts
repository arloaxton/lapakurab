/**
 * Public-facing gateway list — pakai service role di server, return hanya
 * field aman (id, name, enabled, fee). API key NEVER di-return.
 *
 * Dipakai oleh checkout page untuk render daftar metode pembayaran sesuai
 * konfigurasi admin (yang enabled saja).
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env, hasServiceRole, isSupabaseConfigured } from "@/backend/env";
import { SEED_GATEWAYS } from "@/lib/mock/gateways";

interface PublicGateway {
  id: string;
  name: string;
  enabled: boolean;
  fee: number;
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    // Mock fallback
    return NextResponse.json({
      gateways: SEED_GATEWAYS.filter((g) => g.enabled).map((g) => ({
        id: g.id,
        name: g.name,
        enabled: g.enabled,
        fee: g.fee,
      })),
    });
  }
  if (!hasServiceRole()) {
    // Tanpa service role, kita tidak bisa baca gateways (RLS admin-only).
    return NextResponse.json({ gateways: [] });
  }
  const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE);
  const { data, error } = await sb
    .from("gateways")
    .select("id, name, enabled, fee")
    .eq("enabled", true)
    .order("created_at", { ascending: true });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const gateways = ((data as PublicGateway[] | null) ?? []).map((g) => ({
    ...g,
    fee: Number(g.fee),
  }));
  return NextResponse.json({ gateways });
}
