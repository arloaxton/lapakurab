import { NextResponse } from "next/server";
import { isSupabaseConfigured, isTokopayConfigured } from "@/backend/env";
import { checkoutSchema } from "@/backend/schemas/checkout";
import { checkoutService } from "@/backend/services/checkout";
import { enforceRateLimit } from "@/backend/services/security";
import { mapApiError } from "@/lib/api-error";

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Backend belum di-konfigurasi" }, { status: 503 });
  }
  if (!isTokopayConfigured()) {
    return NextResponse.json(
      { error: "Payment gateway belum di-konfigurasi (TOKOPAY_*)." },
      { status: 503 }
    );
  }
  // 5 checkout per menit per IP — anti payment-flood / abuse
  const blocked = await enforceRateLimit({
    scope: "checkout",
    req,
    limit: 5,
    windowSec: 60,
  });
  if (blocked) return blocked;
  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const result = await checkoutService(parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    return mapApiError(e, {
      tag: "checkout",
      fallbackMessage: "Checkout gagal — coba lagi sebentar",
    });
  }
}
