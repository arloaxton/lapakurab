import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/backend/env";
import { createCategorySchema } from "@/backend/schemas/categories";
import {
  createCategoryService,
  listCategoriesAdmin,
  listCategoriesPublic,
} from "@/backend/services/categories";
import { mapApiError } from "@/lib/api-error";

/** GET /api/categories — list. Query `?admin=1` untuk include inactive. */
export async function GET(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ categories: [] });
  }
  try {
    const url = new URL(req.url);
    const adminMode = url.searchParams.get("admin") === "1";
    const categories = adminMode
      ? await listCategoriesAdmin()
      : await listCategoriesPublic();
    return NextResponse.json({ categories });
  } catch (e) {
    return mapApiError(e, {
      tag: "categories-list",
      fallbackMessage: "Gagal load kategori",
    });
  }
}

/** POST /api/categories — admin create. */
export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Backend belum di-konfigurasi" },
      { status: 503 }
    );
  }
  try {
    const body = await req.json();
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    const category = await createCategoryService(parsed.data);
    return NextResponse.json(category, { status: 201 });
  } catch (e) {
    return mapApiError(e, {
      tag: "categories-create",
      fallbackMessage: "Gagal bikin kategori",
    });
  }
}
