import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/backend/env";
import { uploadProductImage } from "@/backend/services/storage";
import { enforceRateLimit } from "@/backend/services/security";

export const runtime = "nodejs";

// 5 MB hard cap — Supabase storage default 50MB tapi product image
// gak boleh segede itu (banner-nya 16:9 webp <500kb biasanya).
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function errorStatus(msg: string): number {
  if (msg.startsWith("Unauthorized")) return 401;
  if (msg.startsWith("Forbidden")) return 403;
  if (msg.startsWith("File ") || msg.startsWith("Mime")) return 400;
  return 500;
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Backend belum di-konfigurasi" }, { status: 503 });
  }
  // 20 upload per menit per IP — admin work tapi tetap ada batas
  const blocked = await enforceRateLimit({
    scope: "upload-img",
    req,
    limit: 20,
    windowSec: 60,
  });
  if (blocked) return blocked;
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Field 'file' wajib (multipart)" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File terlalu besar. Maksimal ${MAX_FILE_SIZE / 1024 / 1024} MB.` },
        { status: 400 }
      );
    }
    if (!ALLOWED_MIME.includes(file.type)) {
      return NextResponse.json(
        { error: `Mime tidak diizinkan. Gunakan: ${ALLOWED_MIME.join(", ")}` },
        { status: 400 }
      );
    }
    const result = await uploadProductImage(file);
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    console.error("[upload-product-image] internal error:", e);
    const msg = e instanceof Error ? e.message : "Gagal upload";
    return NextResponse.json({ error: msg }, { status: errorStatus(msg) });
  }
}
