import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/backend/env";
import { createNotifSchema } from "@/backend/schemas/notifications";
import {
  createNotificationService,
  listNotificationsService,
  markAllReadService,
} from "@/backend/services/notifications";

function errorStatus(msg: string): number {
  if (msg.startsWith("Unauthorized")) return 401;
  if (msg.startsWith("Forbidden")) return 403;
  return 500;
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ notifications: [] });
  }
  try {
    const notifications = await listNotificationsService();
    return NextResponse.json({ notifications });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal ambil notifikasi";
    return NextResponse.json({ error: msg }, { status: errorStatus(msg) });
  }
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Backend belum di-konfigurasi" }, { status: 503 });
  }
  try {
    const body = await req.json();
    const parsed = createNotifSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const notification = await createNotificationService(
      parsed.data.kind,
      parsed.data.title,
      parsed.data.body
    );
    return NextResponse.json({ notification }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal buat notifikasi";
    return NextResponse.json({ error: msg }, { status: errorStatus(msg) });
  }
}

export async function PATCH() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true });
  }
  try {
    await markAllReadService();
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal mark all read";
    return NextResponse.json({ error: msg }, { status: errorStatus(msg) });
  }
}
