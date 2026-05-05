import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/backend/env";
import { validateVoucherSchema } from "@/backend/schemas/vouchers";
import { validateVoucherService } from "@/backend/services/vouchers";

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Backend belum di-konfigurasi" }, { status: 503 });
  }
  try {
    const body = await req.json();
    const parsed = validateVoucherSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const result = await validateVoucherService(parsed.data.code, parsed.data.cartTotal ?? 0);
    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal validasi voucher";
    const status = msg.startsWith("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
