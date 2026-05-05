import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/backend/env";
import { updateOrderSchema } from "@/backend/schemas/orders";
import {
  deleteOrderService,
  getOrderService,
  updateOrderService,
} from "@/backend/services/orders";

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
    return NextResponse.json({ error: "Backend belum di-konfigurasi" }, { status: 503 });
  }
  try {
    const { id } = await params;
    const order = await getOrderService(id);
    if (!order) {
      return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal ambil order";
    return NextResponse.json({ error: msg }, { status: errorStatus(msg) });
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Backend belum di-konfigurasi" }, { status: 503 });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const order = await updateOrderService(id, parsed.data);
    return NextResponse.json({ order });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal update order";
    return NextResponse.json({ error: msg }, { status: errorStatus(msg) });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Backend belum di-konfigurasi" }, { status: 503 });
  }
  try {
    const { id } = await params;
    await deleteOrderService(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal hapus order";
    return NextResponse.json({ error: msg }, { status: errorStatus(msg) });
  }
}
