import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/backend/env";
import { createGatewaySchema } from "@/backend/schemas/gateways";
import { createGatewayService, listGatewaysService } from "@/backend/services/gateways";

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
    const gateways = await listGatewaysService();
    return NextResponse.json({ gateways });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal ambil gateway";
    return NextResponse.json({ error: msg }, { status: errorStatus(msg) });
  }
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Backend belum di-konfigurasi" }, { status: 503 });
  }
  try {
    const body = await req.json();
    const parsed = createGatewaySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const gateway = await createGatewayService(parsed.data);
    return NextResponse.json({ gateway }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal buat gateway";
    return NextResponse.json({ error: msg }, { status: errorStatus(msg) });
  }
}
