import { NextResponse } from "next/server";
import { loginSchema } from "@/backend/schemas/auth";
import { login } from "@/backend/services/auth";
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
  // 10 attempt per 5 menit per IP — anti credential stuffing
  const blocked = await enforceRateLimit({
    scope: "login",
    req,
    limit: 10,
    windowSec: 300,
  });
  if (blocked) return blocked;
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return NextResponse.json({ error: first.message }, { status: 400 });
    }
    const session = await login(parsed.data);
    return NextResponse.json({ user: session.user, role: session.role });
  } catch (e) {
    return mapApiError(e, {
      tag: "auth-login",
      fallbackMessage: "Login gagal — periksa email/password",
      fallbackStatus: 401,
    });
  }
}
