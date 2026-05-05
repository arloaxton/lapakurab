import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/backend/env";
import { createAuditSchema, listAuditQuerySchema } from "@/backend/schemas/audit";
import { listAuditService, logAuditService } from "@/backend/services/audit";

function errorStatus(msg: string): number {
  if (msg.startsWith("Unauthorized")) return 401;
  if (msg.startsWith("Forbidden")) return 403;
  return 500;
}

export async function GET(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ audit: [] });
  }
  try {
    const url = new URL(req.url);
    const parsed = listAuditQuerySchema.safeParse({
      action: url.searchParams.get("action") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
      offset: url.searchParams.get("offset") ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const audit = await listAuditService(parsed.data);
    return NextResponse.json({ audit });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal ambil audit log";
    return NextResponse.json({ error: msg }, { status: errorStatus(msg) });
  }
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true });
  }
  try {
    const body = await req.json();
    const parsed = createAuditSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    await logAuditService(parsed.data.action, parsed.data.target, parsed.data.detail ?? "");
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal log audit";
    return NextResponse.json({ error: msg }, { status: errorStatus(msg) });
  }
}
