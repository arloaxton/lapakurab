import { NextResponse } from "next/server";
import { getCurrentSession } from "@/backend/services/auth";
import { isSupabaseConfigured } from "@/backend/env";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ user: null });
  }
  try {
    const sess = await getCurrentSession();
    if (!sess) return NextResponse.json({ user: null });
    return NextResponse.json({ user: sess.user, role: sess.role });
  } catch {
    return NextResponse.json({ user: null });
  }
}
