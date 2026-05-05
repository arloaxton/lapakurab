/**
 * Browser Supabase client — dipakai oleh Client Components + browser-side
 * code. Pakai cookies untuk persist session sehingga server bisa baca user
 * lewat middleware.ts.
 *
 * Server Components & Route Handlers HARUS pakai `server-client.ts`.
 */

"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env, isSupabaseConfigured } from "../env";

// Untyped client — generic Database schema dilepas supaya supabase-js v2
// auto-inference tidak konflik. Row types di-cast eksplisit di service layer.
let _client: SupabaseClient | null = null;

/** Singleton browser client. Aman dipanggil berkali-kali. */
export function getBrowserClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase belum di-konfigurasi. Tidak bisa create browser client."
    );
  }
  if (_client) return _client;
  _client = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
  return _client;
}
