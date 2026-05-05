/**
 * Cron: cleanup pending orders > 30 menit umur.
 *
 * Vercel Cron otomatis kirim `Authorization: Bearer ${CRON_SECRET}`.
 * Kalau CRON_SECRET di-set, kita verify; kalau tidak, endpoint terbuka
 * (ok untuk self-hosted/dev).
 *
 * Jadwal: lihat vercel.json (default: tiap 10 menit).
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env, hasServiceRole, isSupabaseConfigured } from "@/backend/env";

const STALE_MINUTES = 30;

function authorized(req: Request): boolean {
  if (!env.CRON_SECRET) return true; // no secret set → terbuka
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${env.CRON_SECRET}`;
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured() || !hasServiceRole()) {
    return NextResponse.json({ error: "Backend not configured" }, { status: 503 });
  }

  const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE);
  const cutoff = new Date(Date.now() - STALE_MINUTES * 60 * 1000).toISOString();

  // Mark stale pending → failed
  const { data, error } = await sb
    .from("orders")
    .update({ status: "failed" })
    .eq("status", "pending")
    .lt("created_at", cutoff)
    .select("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const failedIds = (data as Array<{ id: string }> | null) ?? [];

  // Optional: cleanup webhook_log entries > 30 hari (avoid bloat)
  await sb
    .from("webhook_log")
    .delete()
    .lt(
      "received_at",
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    );

  return NextResponse.json({
    ok: true,
    expiredOrders: failedIds.length,
    cutoff,
  });
}

// POST as alias (Vercel Cron uses GET, but allow both)
export const POST = GET;
