/**
 * GET /api/me/netflix-otp?orderId=ORD-123
 *
 * Customer-facing: ambil OTP Netflix terbaru untuk credential yang
 * di-link ke order tertentu. Ownership ter-enforce via RLS Supabase
 * (stock_items.order_id select hanya return baris user yang sesuai).
 *
 * Rate limit: 12 req/menit/user — supaya polling 5-detik client OK
 * tapi gak abuse tempmail API.
 */

import { NextResponse } from "next/server";
import { isSupabaseConfigured, isTempmailConfigured } from "@/backend/env";
import { getServerClient } from "@/backend/db/server-client";
import { enforceRateLimit } from "@/backend/services/security";
import { fetchLatestNetflixOtp } from "@/backend/services/netflix-otp";
import { mapApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Backend belum di-konfigurasi" },
      { status: 503 }
    );
  }
  if (!isTempmailConfigured()) {
    return NextResponse.json(
      { error: "Tempmail belum di-konfigurasi di server" },
      { status: 503 }
    );
  }

  // Rate limit per IP (polling tiap 5 detik = 12/menit max)
  const blocked = await enforceRateLimit({
    scope: "netflix-otp",
    req,
    limit: 15,
    windowSec: 60,
  });
  if (blocked) return blocked;

  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("orderId")?.trim();
    if (!orderId) {
      return NextResponse.json({ error: "orderId wajib" }, { status: 400 });
    }

    const sb = await getServerClient();

    // Verify session aktif
    const { data: userData } = await sb.auth.getUser();
    if (!userData.user) {
      return NextResponse.json(
        { error: "Tidak ada sesi aktif" },
        { status: 401 }
      );
    }

    // Query credential — RLS auto-filter: hanya stock items dari order
    // milik user ini yang lolos.
    const { data: stockRow, error: stockErr } = await sb
      .from("stock_items")
      .select("field1, order_id")
      .eq("order_id", orderId)
      .maybeSingle();
    if (stockErr) throw new Error(stockErr.message);
    if (!stockRow) {
      return NextResponse.json(
        { error: "Order tidak ditemukan atau bukan milik kamu" },
        { status: 404 }
      );
    }

    const email = (stockRow as { field1: string }).field1;
    if (!email) {
      return NextResponse.json(
        { error: "Credential tidak punya email" },
        { status: 400 }
      );
    }

    const otp = await fetchLatestNetflixOtp(email, 10);
    if (!otp) {
      return NextResponse.json({
        ok: true,
        found: false,
        message: "Belum ada email OTP Netflix dalam 10 menit terakhir",
      });
    }

    return NextResponse.json({
      ok: true,
      found: true,
      code: otp.code,
      subject: otp.subject,
      receivedAt: otp.receivedAt,
    });
  } catch (e) {
    return mapApiError(e, {
      tag: "netflix-otp",
      fallbackMessage: "Gagal ambil OTP",
    });
  }
}
