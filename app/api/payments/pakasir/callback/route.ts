/**
 * Pakasir webhook callback handler.
 *
 * Pakasir TIDAK kirim HMAC signature di webhook. Untuk security:
 *   - Dedup via webhook_log (anti-replay)
 *   - Re-verify status via /api/transactiondetail (anti-spoof)
 *   - Pastikan amount + order_id match dengan record kita
 *
 * Payload yang Pakasir kirim (per docs):
 *   {
 *     amount: number,
 *     order_id: string,
 *     project: string,
 *     status: "completed",
 *     payment_method: string,
 *     completed_at: string
 *   }
 *
 * Defense layers:
 *   1. Rate limit per IP
 *   2. Dedup via (source=pakasir, order_id+status) (anti replay)
 *   3. Re-verify via checkPakasirStatus (anti spoof)
 *   4. settlePaymentRef → mark orders paid + auto-deliver
 */

import { NextResponse } from "next/server";
import { isSupabaseConfigured, isPakasirConfigured, env } from "@/backend/env";
import { settlePaymentRef } from "@/lib/data/orders-repo";
import { checkPakasirStatus } from "@/backend/services/payments/pakasir";
import { recordWebhookOnce } from "@/backend/services/webhook-dedup";
import { enforceRateLimit } from "@/backend/services/security";

interface PakasirCallbackPayload {
  amount?: number;
  order_id?: string;
  project?: string;
  status?: string;
  payment_method?: string;
  completed_at?: string;
}

export async function POST(req: Request) {
  // Rate limit (defense vs webhook spam)
  const blocked = await enforceRateLimit({
    scope: "pakasir-cb",
    req,
    limit: 30,
    windowSec: 60,
  });
  if (blocked) return blocked;

  if (!isSupabaseConfigured() || !isPakasirConfigured()) {
    return NextResponse.json(
      { status: false, error: "Backend not configured" },
      { status: 503 }
    );
  }

  let body: PakasirCallbackPayload;
  try {
    body = (await req.json()) as PakasirCallbackPayload;
  } catch {
    return NextResponse.json(
      { status: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const orderId = body.order_id?.trim();
  const amount = typeof body.amount === "number" ? body.amount : null;
  const status = body.status?.toLowerCase();
  if (!orderId || amount === null) {
    return NextResponse.json(
      { status: false, error: "Missing order_id/amount" },
      { status: 400 }
    );
  }

  // Project check (anti webhook dari project pakasir orang lain yang
  // entah gimana kena server kita)
  if (body.project && body.project !== env.PAKASIR_PROJECT) {
    return NextResponse.json(
      { status: false, error: "Project mismatch" },
      { status: 403 }
    );
  }

  // Dedup pakai composite "orderId:status" — kalau status sama datang
  // dua kali, skip processing kedua. Pakasir bisa retry kalau response
  // tidak 200.
  const dedupKey = `${orderId}:${status ?? "unknown"}`;
  const dedup = await recordWebhookOnce("pakasir", orderId, dedupKey, body);
  if (!dedup.fresh) {
    return NextResponse.json({ status: true, replay: true });
  }

  // Hanya proses "completed". Status lain (pending, expired, canceled)
  // ack tanpa side-effect.
  if (status !== "completed") {
    return NextResponse.json({ status: true });
  }

  // Anti-spoof: re-verify status langsung ke Pakasir API. Kalau spoof,
  // status di sumber tidak akan "completed".
  try {
    const detail = await checkPakasirStatus(orderId, amount);
    if (detail.status?.toLowerCase() !== "completed") {
      console.warn(
        `[pakasir-callback] re-verify mismatch for order=${orderId} status=${detail.status}`
      );
      return NextResponse.json(
        { status: false, error: "Status mismatch on re-verify" },
        { status: 400 }
      );
    }
  } catch (e) {
    console.error("[pakasir-callback] re-verify error:", e);
    // Return 500 supaya Pakasir retry — jangan langsung mark paid.
    return NextResponse.json(
      { status: false, error: "Re-verify failed" },
      { status: 500 }
    );
  }

  // Settle (idempotent) — orderId di Pakasir = payment_ref di sisi kita.
  try {
    await settlePaymentRef(orderId);
  } catch (e) {
    console.error("[pakasir-callback] settle failed:", e);
    return NextResponse.json(
      { status: false, error: "Settlement failed" },
      { status: 500 }
    );
  }
  return NextResponse.json({ status: true });
}
