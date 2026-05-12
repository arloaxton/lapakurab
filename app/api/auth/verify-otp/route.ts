import { NextResponse } from "next/server";
import { verifyOtpSchema } from "@/backend/schemas/auth";
import { verifyOtp } from "@/backend/services/auth";
import { isSupabaseConfigured } from "@/backend/env";
import { enforceRateLimit } from "@/backend/services/security";
import { mapApiError } from "@/lib/api-error";

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Backend belum di-konfigurasi" },
      { status: 503 }
    );
  }
  // 10 verify attempt per 5 menit per IP — anti brute-force OTP
  const blocked = await enforceRateLimit({
    scope: "verify-otp",
    req,
    limit: 10,
    windowSec: 300,
  });
  if (blocked) return blocked;
  try {
    const body = await req.json();
    const parsed = verifyOtpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    const session = await verifyOtp(parsed.data);
    return NextResponse.json({ user: session.user, role: session.role });
  } catch (e) {
    return mapApiError(e, {
      tag: "auth-verify-otp",
      fallbackMessage: "Verifikasi gagal — periksa kode atau minta kirim ulang",
      fallbackStatus: 400,
    });
  }
}
