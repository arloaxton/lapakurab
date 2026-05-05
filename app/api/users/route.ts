import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/backend/env";
import { listUsersService } from "@/backend/services/users";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Backend belum di-konfigurasi" }, { status: 503 });
  }
  try {
    const users = await listUsersService();
    return NextResponse.json({ users });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal ambil member";
    const status = msg.startsWith("Unauthorized")
      ? 401
      : msg.startsWith("Forbidden")
        ? 403
        : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
