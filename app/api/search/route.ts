import { NextResponse } from "next/server";
import { searchQuerySchema } from "@/backend/schemas/products";
import { searchProductsService } from "@/backend/services/products";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const parsed = searchQuerySchema.safeParse({
      q: url.searchParams.get("q") ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const products = await searchProductsService(parsed.data.q ?? "");
    return NextResponse.json({ products });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Pencarian gagal" },
      { status: 500 }
    );
  }
}
