import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/backend/env";
import { createVoucherSchema } from "@/backend/schemas/vouchers";
import { createVoucherService, listVouchersService } from "@/backend/services/vouchers";

function errorStatus(msg: string): number {
  if (msg.startsWith("Unauthorized")) return 401;
  if (msg.startsWith("Forbidden")) return 403;
  return 500;
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Backend belum di-konfigurasi" }, { status: 503 });
  }
  try {
    const vouchers = await listVouchersService();
    return NextResponse.json({ vouchers });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal ambil voucher";
    return NextResponse.json({ error: msg }, { status: errorStatus(msg) });
  }
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Backend belum di-konfigurasi" }, { status: 503 });
  }
  try {
    const body = await req.json();
    const parsed = createVoucherSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const voucher = await createVoucherService(parsed.data);
    return NextResponse.json({ voucher }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal buat voucher";
    return NextResponse.json({ error: msg }, { status: errorStatus(msg) });
  }
}
