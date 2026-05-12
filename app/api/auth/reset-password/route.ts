import { NextResponse } from "next/server";
import { z } from "zod";
import { isSupabaseConfigured } from "@/backend/env";
import { getServerClient } from "@/backend/db/server-client";
import { enforceRateLimit } from "@/backend/services/security";
import { mapApiError } from "@/lib/api-error";

const schema = z.object({
  newPassword: z
    .string()
    .min(8, "Password baru minimal 8 karakter")
    .max(72, "Password baru terlalu panjang"),
});

/**
 * Reset password endpoint: dipanggil dari /reset-password page setelah
 * user klik link reset di email. Session sudah aktif dari /auth/callback,
 * jadi cukup auth.updateUser({ password }).
 */
export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Backend belum di-konfigurasi" },
      { status: 503 }
    );
  }
  const blocked = await enforceRateLimit({
    scope: "reset-password",
    req,
    limit: 5,
    windowSec: 300,
  });
  if (blocked) return blocked;

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const sb = await getServerClient();
    const { data: userData, error: getUserErr } = await sb.auth.getUser();
    if (getUserErr || !userData.user) {
      return NextResponse.json(
        { error: "Link reset sudah kadaluarsa. Minta link baru di /forgot-password." },
        { status: 401 }
      );
    }

    const { error: updErr } = await sb.auth.updateUser({
      password: parsed.data.newPassword,
    });
    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return mapApiError(e, {
      tag: "reset-password",
      fallbackMessage: "Gagal reset password",
    });
  }
}
