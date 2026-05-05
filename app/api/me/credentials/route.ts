import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/backend/env";
import { listMyCredentialsService } from "@/backend/services/stock";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ credentials: [] });
  }
  try {
    const credentials = await listMyCredentialsService();
    return NextResponse.json({ credentials });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal ambil kredensial";
    const status = msg.startsWith("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
