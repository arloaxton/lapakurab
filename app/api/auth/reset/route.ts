import { NextResponse } from "next/server";
import { resetSchema } from "@/backend/schemas/auth";
import { requestReset } from "@/backend/services/auth";
import { isSupabaseConfigured } from "@/backend/env";

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true }); // pretend ok
  }
  try {
    const body = await req.json();
    const parsed = resetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    await requestReset(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Gagal kirim reset link" },
      { status: 500 }
    );
  }
}
