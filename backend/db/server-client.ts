/**
 * Server-side Supabase clients.
 *
 * Dua varian:
 *   1. `getServerClient()` — pakai cookie session user. Operasi tunduk RLS.
 *      Dipakai di Server Components, Route Handlers, dan Server Actions
 *      untuk query "atas nama user yang login".
 *
 *   2. `getAdminClient()` — pakai service_role key. **Bypass RLS.** Hanya
 *      dipanggil oleh Route Handlers / services yang sudah mem-validasi
 *      caller adalah admin (e.g. setelah cek `profile.role === 'admin'`).
 *      Jangan pernah ekspor balik ke client/browser.
 *
 * Untyped — row types di-cast manual di service layer.
 */

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  env,
  assertSupabaseConfigured,
  assertServiceRole,
} from "../env";

/**
 * Client server-side dengan session cookie. Dipakai di Server Components,
 * Route Handlers, Server Actions.
 */
export async function getServerClient(): Promise<SupabaseClient> {
  assertSupabaseConfigured();
  const cookieStore = await cookies();
  return createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // setAll dipanggil dari Server Component — silently ignore,
          // session refresh tetap akan jalan via middleware.ts.
        }
      },
    },
  });
}

/**
 * Admin client (service_role) — bypass RLS. Hanya dipakai di server,
 * sesudah verifikasi role caller. Jangan pernah expose ke browser.
 */
let _admin: SupabaseClient | null = null;
export function getAdminClient(): SupabaseClient {
  assertSupabaseConfigured();
  assertServiceRole();
  if (_admin) return _admin;
  _admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return _admin;
}
