import { NextResponse } from "next/server";
import { registerSchema } from "@/backend/schemas/auth";
import { register } from "@/backend/services/auth";
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
  // 5 signup per jam per IP — anti spam akun
  const blocked = await enforceRateLimit({
    scope: "register",
    req,
    limit: 5,
    windowSec: 3600,
  });
  if (blocked) return blocked;
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return NextResponse.json({ error: first.message }, { status: 400 });
    }
    const result = await register(parsed.data);
    return NextResponse.json(result);
  } catch (e) {
    return mapApiError(e, {
      tag: "auth-register",
      fallbackMessage: "Pendaftaran gagal — coba lagi sebentar",
      fallbackStatus: 400,
    });
  }
}
