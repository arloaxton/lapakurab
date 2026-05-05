import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/backend/env";
import { createProductSchema, listProductsQuerySchema } from "@/backend/schemas/products";
import { createProductService, listProductsService } from "@/backend/services/products";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const parsed = listProductsQuerySchema.safeParse({
      cat: url.searchParams.get("cat") ?? undefined,
      activeOnly: url.searchParams.get("activeOnly") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
      offset: url.searchParams.get("offset") ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const products = await listProductsService(parsed.data);
    return NextResponse.json({ products });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Gagal ambil produk" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Backend belum di-konfigurasi" }, { status: 503 });
  }
  try {
    const body = await req.json();
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const product = await createProductService(parsed.data);
    return NextResponse.json({ product }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal buat produk";
    const status = msg.startsWith("Unauthorized")
      ? 401
      : msg.startsWith("Forbidden")
        ? 403
        : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
