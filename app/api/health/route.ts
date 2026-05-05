/**
 * Health check endpoint untuk uptime monitoring (UptimeRobot, Better Uptime,
 * Pingdom, dll). Return 200 + JSON body kalau:
 *   - Server berjalan normal
 *   - Supabase reachable (cek 1 SELECT cepat ke `settings` singleton)
 *
 * Return 503 kalau Supabase down atau env tidak lengkap. Monitor service
 * akan trigger alert kalau status code != 200.
 *
 * Hindari heavy queries di sini — endpoint ini di-poll sering.
 */

import { NextResponse } from "next/server";
import {
  isSupabaseConfigured,
  isTokopayConfigured,
  isRateLimiterConfigured,
  isEmailConfigured,
  isSentryConfigured,
  isTokopayIpWhitelistEnforced,
} from "@/backend/env";
import { getAdminClient } from "@/backend/db/server-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface HealthStatus {
  status: "ok" | "degraded" | "down";
  timestamp: string;
  uptime: number;
  checks: {
    server: "ok";
    supabase: "ok" | "down" | "skipped";
    tokopay: "configured" | "skipped";
    rateLimit: "configured" | "skipped";
    email: "configured" | "skipped";
    sentry: "configured" | "skipped";
    tokopayIpWhitelist: "enforced" | "skipped";
  };
  version?: string;
}

const startedAt = Date.now();

export async function GET() {
  const checks: HealthStatus["checks"] = {
    server: "ok",
    supabase: "skipped",
    tokopay: isTokopayConfigured() ? "configured" : "skipped",
    rateLimit: isRateLimiterConfigured() ? "configured" : "skipped",
    email: isEmailConfigured() ? "configured" : "skipped",
    sentry: isSentryConfigured() ? "configured" : "skipped",
    tokopayIpWhitelist: isTokopayIpWhitelistEnforced() ? "enforced" : "skipped",
  };

  let status: HealthStatus["status"] = "ok";

  if (isSupabaseConfigured()) {
    try {
      // Pakai admin client (bypass RLS) — health check perlu verifikasi
      // konektivitas DB, bukan auth. Lightweight HEAD count.
      const sb = getAdminClient();
      const { error } = await sb
        .from("settings")
        .select("id", { count: "exact", head: true })
        .eq("id", "singleton");
      checks.supabase = error ? "down" : "ok";
      if (error) status = "down";
    } catch {
      checks.supabase = "down";
      status = "down";
    }
  } else {
    status = "degraded";
  }

  const body: HealthStatus = {
    status,
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startedAt) / 1000),
    checks,
    version: process.env.NEXT_PUBLIC_APP_VERSION || undefined,
  };

  return NextResponse.json(body, {
    status: status === "down" ? 503 : 200,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
