import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/backend/env";
import { createOrderSchema, listOrdersQuerySchema } from "@/backend/schemas/orders";
import {
  createOrderService,
  listAdminOrdersService,
  listMyOrdersService,
} from "@/backend/services/orders";

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
    const parsed = listOrdersQuerySchema.safeParse({
      scope: url.searchParams.get("scope") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
      offset: url.searchParams.get("offset") ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { scope, ...opts } = parsed.data;
    if (scope === "all") {
      const orders = await listAdminOrdersService(opts);
      return NextResponse.json({ orders });
    }
    // default: own orders
    const orders = await listMyOrdersService(opts);
    return NextResponse.json({ orders });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal ambil order";
    return NextResponse.json({ error: msg }, { status: errorStatus(msg) });
  }
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Backend belum di-konfigurasi" }, { status: 503 });
  }
  try {
    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const order = await createOrderService(parsed.data);
    return NextResponse.json({ order }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal buat order";
    return NextResponse.json({ error: msg }, { status: errorStatus(msg) });
  }
}
