// Twitter Card pakai gambar yang sama dengan Open Graph.
// Config field harus literal string — re-export tidak ke-detect Next.js.
// Default function di-import dari opengraph-image, config duplikat di sini.

export const runtime = "edge";
export const alt = "lapakurab — Toko Akun Digital";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export { default } from "./opengraph-image";
