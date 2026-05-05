import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/backend/env";
import { updateNotifSchema } from "@/backend/schemas/notifications";
import { markReadService } from "@/backend/services/notifications";

interface Ctx {
  params: Promise<{ id: string }>;
}

function errorStatus(msg: string): number {
  if (msg.startsWith("Unauthorized")) return 401;
  if (msg.startsWith("Forbidden")) return 403;
  return 500;
}

export async function PATCH(req: Request, { params }: Ctx) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateNotifSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    if (parsed.data.read !== undefined) {
      await markReadService(id, parsed.data.read);
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal update notifikasi";
    return NextResponse.json({ error: msg }, { status: errorStatus(msg) });
  }
}
