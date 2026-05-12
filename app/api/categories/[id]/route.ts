import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/backend/env";
import { updateCategorySchema } from "@/backend/schemas/categories";
import {
  deleteCategoryService,
  getCategoryService,
  updateCategoryService,
} from "@/backend/services/categories";
import { mapApiError } from "@/lib/api-error";

interface Params {
  params: Promise<{ id: string }>;
}

/** GET /api/categories/[id] — public. */
export async function GET(_req: Request, { params }: Params) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Backend belum di-konfigurasi" }, { status: 503 });
  }
  try {
    const { id } = await params;
    const cat = await getCategoryService(id);
    if (!cat) {
      return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(cat);
  } catch (e) {
    return mapApiError(e, { tag: "categories-get", fallbackMessage: "Gagal load kategori" });
  }
}

/** PATCH /api/categories/[id] — admin update (tidak boleh ubah id). */
export async function PATCH(req: Request, { params }: Params) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Backend belum di-konfigurasi" }, { status: 503 });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    const cat = await updateCategoryService(id, parsed.data);
    return NextResponse.json(cat);
  } catch (e) {
    return mapApiError(e, { tag: "categories-update", fallbackMessage: "Gagal update kategori" });
  }
}

/** DELETE /api/categories/[id] — admin delete. Produk yang refer akan jadi NULL (FK on delete set null). */
export async function DELETE(_req: Request, { params }: Params) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Backend belum di-konfigurasi" }, { status: 503 });
  }
  try {
    const { id } = await params;
    await deleteCategoryService(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return mapApiError(e, { tag: "categories-delete", fallbackMessage: "Gagal hapus kategori" });
  }
}
