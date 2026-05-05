import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/backend/env";
import { updateSettingsSchema } from "@/backend/schemas/settings";
import { getSettingsService, updateSettingsService } from "@/backend/services/settings";
import { SEED_SETTINGS } from "@/lib/mock/settings";

function errorStatus(msg: string): number {
  if (msg.startsWith("Unauthorized")) return 401;
  if (msg.startsWith("Forbidden")) return 403;
  return 500;
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ settings: SEED_SETTINGS });
  }
  try {
    const settings = await getSettingsService();
    return NextResponse.json({ settings });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal ambil settings";
    return NextResponse.json({ error: msg }, { status: errorStatus(msg) });
  }
}

export async function PATCH(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Backend belum di-konfigurasi" }, { status: 503 });
  }
  try {
    const body = await req.json();
    const parsed = updateSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const settings = await updateSettingsService(parsed.data);
    return NextResponse.json({ settings });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal update settings";
    return NextResponse.json({ error: msg }, { status: errorStatus(msg) });
  }
}
