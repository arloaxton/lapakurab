/**
 * Storage services — upload ke Supabase Storage bucket.
 */

import { getServerClient } from "../db/server-client";
import { isSupabaseConfigured } from "../env";
import { requireAdmin } from "./auth";

const BUCKET = "product-images";
const MAX_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export interface UploadResult {
  url: string;
  path: string;
}

export async function uploadProductImage(file: File): Promise<UploadResult> {
  await requireAdmin();
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase belum di-konfigurasi");
  }
  if (!ALLOWED_MIME.includes(file.type)) {
    throw new Error("Format file tidak didukung. Pakai JPG/PNG/WebP/GIF.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Ukuran file > 2MB");
  }
  const sb = await getServerClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;

  const arrayBuf = await file.arrayBuffer();
  const { error } = await sb.storage.from(BUCKET).upload(path, arrayBuf, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(error.message);

  const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export async function deleteProductImage(path: string): Promise<void> {
  await requireAdmin();
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase belum di-konfigurasi");
  }
  const sb = await getServerClient();
  const { error } = await sb.storage.from(BUCKET).remove([path]);
  if (error) throw new Error(error.message);
}
