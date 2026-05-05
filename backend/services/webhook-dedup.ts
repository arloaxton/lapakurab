/**
 * Webhook dedup helper. Insert (source, signature) pairs ke webhook_log
 * dengan unique constraint. Kalau duplicate → replay attempt → skip dan
 * return idempotent ack.
 *
 * Pakai service role untuk bypass RLS (webhook handler tidak punya session).
 */

import { createClient } from "@supabase/supabase-js";
import { env, hasServiceRole, isSupabaseConfigured } from "../env";

export interface DedupResult {
  fresh: boolean; // true = first time, OK to process
  reason?: string;
}

export async function recordWebhookOnce(
  source: string,
  reffId: string,
  signature: string,
  payload: unknown,
  status?: number
): Promise<DedupResult> {
  if (!isSupabaseConfigured() || !hasServiceRole()) {
    // Tanpa DB / service role, kita tidak bisa dedup. Return fresh agar
    // tidak block production accidentally; tapi log warning.
    console.warn("[webhook-dedup] Supabase service role missing — replay protection disabled");
    return { fresh: true };
  }
  const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE);
  const { error } = await sb.from("webhook_log").insert({
    source,
    reff_id: reffId,
    signature,
    payload,
    status: status ?? null,
  });
  if (error) {
    // Postgres unique violation = duplicate signature
    if (error.code === "23505") {
      return { fresh: false, reason: "duplicate signature (replay)" };
    }
    // DB error lain — log tapi treat fresh (jangan block valid webhook)
    console.warn("[webhook-dedup] insert failed:", error.message);
    return { fresh: true };
  }
  return { fresh: true };
}
