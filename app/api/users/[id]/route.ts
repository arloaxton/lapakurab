import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/backend/env";
import { updateUserSchema } from "@/backend/schemas/users";
import { getUserService, updateUserService } from "@/backend/services/users";

interface Ctx {
  params: Promise<{ id: string }>;
}

function errorStatus(msg: string): number {
  if (msg.startsWith("Unauthorized")) return 401;
  if (msg.startsWith("Forbidden")) return 403;
  return 500;
}

export async function GET(_req: Request, { params }: Ctx) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Backend belum di-konfigurasi" }, { status: 503 });
  }
  try {
    const { id } = await params;
    const user = await getUserService(id);
    if (!user) {
      return NextResponse.json({ error: "Member tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal ambil member";
    return NextResponse.json({ error: msg }, { status: errorStatus(msg) });
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Backend belum di-konfigurasi" }, { status: 503 });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    await updateUserService(id, parsed.data);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal update member";
    return NextResponse.json({ error: msg }, { status: errorStatus(msg) });
  }
}
