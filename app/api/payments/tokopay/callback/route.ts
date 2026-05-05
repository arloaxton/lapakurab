/**
 * Tokopay webhook callback handler.
 *
 * Defense layers:
 *   1. IP whitelist (TOKOPAY_IP_WHITELIST) — kalau di-set, reject non-whitelisted IP
 *   2. Rate limit per IP (anti webhook flood)
 *   3. Verifikasi MD5 signature (anti tamper)
 *   4. Dedup via webhook_log unique(source, signature) (anti replay)
 *   5. settlePaymentRef → mark orders paid + auto-deliver
 *
 * Tokopay retry 3x dengan jeda 2 menit kalau response bukan
 * `{ status: true }`. Replay attempts → ack tapi skip processing.
 */

import { NextResponse } from "next/server";
import {
  isSupabaseConfigured,
  isTokopayConfigured,
  isTokopayIpWhitelistEnforced,
  env,
} from "@/backend/env";
import { settlePaymentRef } from "@/lib/data/orders-repo";
import { verifySignature } from "@/backend/services/payments/tokopay";
import { recordWebhookOnce } from "@/backend/services/webhook-dedup";
import { enforceRateLimit, getClientIP } from "@/backend/services/security";

interface TokopayCallbackPayload {
  reference?: string;
  reff_id?: string;
  signature?: string;
  status?: string;
  data?: Record<string, unknown>;
}

function ipAllowed(req: Request): boolean {
  if (!isTokopayIpWhitelistEnforced()) return true; // dev / not configured
  const ip = getClientIP(req);
  return env.TOKOPAY_IP_WHITELIST.includes(ip);
}

async function handleCallback(
  req: Request,
  reffId: string,
  sig: string,
  status: string | undefined,
  rawPayload: unknown
): Promise<NextResponse> {
  // 1. IP whitelist (kalau di-enforce)
  if (!ipAllowed(req)) {
    console.warn(
      "[tokopay-callback] rejected non-whitelisted IP:",
      getClientIP(req)
    );
    return NextResponse.json(
      { status: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  // 2. Rate limit (defense vs webhook spam, even from whitelisted IP)
  const blocked = await enforceRateLimit({
    scope: "tokopay-cb",
    req,
    limit: 30, // 30 callbacks per menit per IP — generous tapi tidak DOS
    windowSec: 60,
  });
  if (blocked) return blocked;

  if (!isSupabaseConfigured() || !isTokopayConfigured()) {
    return NextResponse.json(
      { status: false, error: "Backend not configured" },
      { status: 503 }
    );
  }
  // 3. Signature
  if (!verifySignature(reffId, sig)) {
    return NextResponse.json(
      { status: false, error: "Invalid signature" },
      { status: 401 }
    );
  }

  // 4. Dedup: kalau signature sudah pernah masuk → replay → ack tapi skip processing.
  const dedup = await recordWebhookOnce("tokopay", reffId, sig, rawPayload);
  if (!dedup.fresh) {
    return NextResponse.json({ status: true, replay: true });
  }

  const ok = status === "Success" || status === "Completed";
  if (!ok) {
    return NextResponse.json({ status: true });
  }

  // 5. Settle (idempotent)
  try {
    await settlePaymentRef(reffId);
  } catch (e) {
    // Log internal, return generic message. Return false supaya Tokopay retry.
    console.error("[tokopay-callback] settle failed:", e);
    return NextResponse.json(
      { status: false, error: "Settlement failed" },
      { status: 500 }
    );
  }
  return NextResponse.json({ status: true });
}

export async function POST(req: Request) {
  let body: TokopayCallbackPayload;
  try {
    body = (await req.json()) as TokopayCallbackPayload;
  } catch {
    return NextResponse.json(
      { status: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }
  const reffId = body.reff_id ?? body.reference;
  const sig = body.signature;
  if (!reffId || !sig) {
    return NextResponse.json(
      { status: false, error: "Missing reff_id/signature" },
      { status: 400 }
    );
  }
  return handleCallback(req, reffId, sig, body.status, body);
}

// Tokopay docs tidak eksplisit POST/GET — terima keduanya untuk safety.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const reffId =
    url.searchParams.get("reff_id") ?? url.searchParams.get("reference");
  const sig = url.searchParams.get("signature");
  const status = url.searchParams.get("status");
  if (!reffId || !sig) {
    return NextResponse.json(
      { status: false, error: "Missing params" },
      { status: 400 }
    );
  }
  return handleCallback(
    req,
    reffId,
    sig,
    status ?? undefined,
    Object.fromEntries(url.searchParams)
  );
}
