import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/backend/env";
import {
  bulkCreateStockSchema,
  createStockItemSchema,
  listStockQuerySchema,
} from "@/backend/schemas/stock";
import {
  bulkCreateStockService,
  createStockService,
  listStockService,
} from "@/backend/services/stock";

function errorStatus(msg: string): number {
  if (msg.startsWith("Unauthorized")) return 401;
  if (msg.startsWith("Forbidden")) return 403;
  return 500;
}

export async function GET(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Backend belum di-konfigurasi" }, { status: 503 });
  }
  try {
    const url = new URL(req.url);
    const parsed = listStockQuerySchema.safeParse({
      productId: url.searchParams.get("productId") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
      offset: url.searchParams.get("offset") ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const stock = await listStockService(parsed.data);
    return NextResponse.json({ stock });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal ambil stok";
    return NextResponse.json({ error: msg }, { status: errorStatus(msg) });
  }
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Backend belum di-konfigurasi" }, { status: 503 });
  }
  try {
    const body = await req.json();
    // Bulk format kalau ada `items` array.
    if (Array.isArray(body?.items)) {
      const parsed = bulkCreateStockSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
      }
      const stock = await bulkCreateStockService(parsed.data);
      return NextResponse.json({ stock }, { status: 201 });
    }
    const parsed = createStockItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const item = await createStockService(parsed.data);
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal tambah stok";
    return NextResponse.json({ error: msg }, { status: errorStatus(msg) });
  }
}
