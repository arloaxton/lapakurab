import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/backend/env";
import { redeemVoucherSchema } from "@/backend/schemas/vouchers";
import { redeemVoucherService } from "@/backend/services/vouchers";
import { enforceRateLimit } from "@/backend/services/security";

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true });
  }
  // Anti brute-force voucher codes — 10 redeem per 5 menit per IP
  const blocked = await enforceRateLimit({
    scope: "voucher-redeem",
    req,
    limit: 10,
    windowSec: 300,
  });
  if (blocked) return blocked;
  try {
    const body = await req.json();
    const parsed = redeemVoucherSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    const ok = await redeemVoucherService(parsed.data.code);
    return NextResponse.json({ ok });
  } catch (e) {
    // Internal error → log, return generic message
    console.error("[voucher-redeem] internal error:", e);
    const msg = e instanceof Error ? e.message : "";
    if (msg.startsWith("Unauthorized")) {
      return NextResponse.json({ error: "Login dulu untuk redeem" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Gagal redeem voucher — coba lagi sebentar" },
      { status: 500 }
    );
  }
}
