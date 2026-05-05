import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/backend/env";
import { updateProductSchema } from "@/backend/schemas/products";
import {
  deleteProductService,
  getProductService,
  updateProductService,
} from "@/backend/services/products";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const product = await getProductService(id);
    if (!product) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Gagal ambil produk" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Backend belum di-konfigurasi" }, { status: 503 });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const product = await updateProductService(id, parsed.data);
    return NextResponse.json({ product });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal update produk";
    const status = msg.startsWith("Unauthorized")
      ? 401
      : msg.startsWith("Forbidden")
        ? 403
        : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Backend belum di-konfigurasi" }, { status: 503 });
  }
  try {
    const { id } = await params;
    await deleteProductService(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal hapus produk";
    const status = msg.startsWith("Unauthorized")
      ? 401
      : msg.startsWith("Forbidden")
        ? 403
        : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
