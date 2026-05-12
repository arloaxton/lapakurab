import { NextResponse } from "next/server";
import { z } from "zod";
import { isSupabaseConfigured } from "@/backend/env";
import { getServerClient } from "@/backend/db/server-client";
import { enforceRateLimit } from "@/backend/services/security";
import { mapApiError } from "@/lib/api-error";

const schema = z.object({
  currentPassword: z.string().min(6, "Password lama minimal 6 karakter"),
  newPassword: z
    .string()
    .min(8, "Password baru minimal 8 karakter")
    .max(72, "Password baru terlalu panjang"),
});

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Backend belum di-konfigurasi" },
      { status: 503 }
    );
  }
  const blocked = await enforceRateLimit({
    scope: "change-password",
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
        { error: "Tidak ada sesi aktif. Login dulu." },
        { status: 401 }
      );
    }

    // Verify currentPassword dengan sign-in attempt (anti unauthorized change)
    const { error: verifyErr } = await sb.auth.signInWithPassword({
      email: userData.user.email!,
      password: parsed.data.currentPassword,
    });
    if (verifyErr) {
      return NextResponse.json(
        { error: "Password lama salah" },
        { status: 400 }
      );
    }

    // Update password
    const { error: updErr } = await sb.auth.updateUser({
      password: parsed.data.newPassword,
    });
    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return mapApiError(e, {
      tag: "change-password",
      fallbackMessage: "Gagal ubah password",
    });
  }
}
