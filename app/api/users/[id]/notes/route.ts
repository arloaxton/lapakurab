import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/backend/env";
import { createNoteSchema } from "@/backend/schemas/users";
import { createNoteService, listNotesService } from "@/backend/services/users";

interface Ctx {
  params: Promise<{ id: string }>;
}

function errorStatus(msg: string): number {
  if (msg.startsWith("Unauthorized")) return 401;
  if (msg.startsWith("Forbidden")) return 403;
  return 500;
}

export async function GET(_req: Request, { params }: Ctx) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ notes: [] });
  }
  try {
    const { id } = await params;
    const notes = await listNotesService(id);
    return NextResponse.json({ notes });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal ambil catatan";
    return NextResponse.json({ error: msg }, { status: errorStatus(msg) });
  }
}

export async function POST(req: Request, { params }: Ctx) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Backend belum di-konfigurasi" }, { status: 503 });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = createNoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const note = await createNoteService(id, parsed.data.text);
    return NextResponse.json({ note }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal tambah catatan";
    return NextResponse.json({ error: msg }, { status: errorStatus(msg) });
  }
}
