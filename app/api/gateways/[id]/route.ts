import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/backend/env";
import { updateGatewaySchema } from "@/backend/schemas/gateways";
import { deleteGatewayService, updateGatewayService } from "@/backend/services/gateways";

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
    return NextResponse.json({ error: "Backend belum di-konfigurasi" }, { status: 503 });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateGatewaySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const gateway = await updateGatewayService(id, parsed.data);
    return NextResponse.json({ gateway });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal update gateway";
    return NextResponse.json({ error: msg }, { status: errorStatus(msg) });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Backend belum di-konfigurasi" }, { status: 503 });
  }
  try {
    const { id } = await params;
    await deleteGatewayService(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal hapus gateway";
    return NextResponse.json({ error: msg }, { status: errorStatus(msg) });
  }
}
