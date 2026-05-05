import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/backend/env";
import { updateVoucherSchema } from "@/backend/schemas/vouchers";
import { deleteVoucherService, updateVoucherService } from "@/backend/services/vouchers";

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
    const parsed = updateVoucherSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const voucher = await updateVoucherService(id, parsed.data);
    return NextResponse.json({ voucher });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal update voucher";
    return NextResponse.json({ error: msg }, { status: errorStatus(msg) });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Backend belum di-konfigurasi" }, { status: 503 });
  }
  try {
    const { id } = await params;
    await deleteVoucherService(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal hapus voucher";
    return NextResponse.json({ error: msg }, { status: errorStatus(msg) });
  }
}
