import { NextResponse } from "next/server";
import { logout } from "@/backend/services/auth";
import { isSupabaseConfigured } from "@/backend/env";

export async function POST() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true });
  }
  await logout();
  return NextResponse.json({ ok: true });
}
