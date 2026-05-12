import { NextResponse, type NextRequest } from "next/server";
import { getServerClient } from "@/backend/db/server-client";
import { isSupabaseConfigured } from "@/backend/env";

/**
 * Supabase auth callback: receive ?code dari email link (recovery,
 * signup confirm), exchange ke session cookie, lalu redirect ke `next`
 * path (default /).
 *
 * Anti open-redirect: `next` HARUS dimulai dengan "/" (internal path).
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next");
  const next = nextParam && nextParam.startsWith("/") ? nextParam : "/";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", req.url));
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(
      new URL("/login?error=backend_not_configured", req.url)
    );
  }

  const sb = await getServerClient();
  const { error } = await sb.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, req.url)
    );
  }

  return NextResponse.redirect(new URL(next, req.url));
}
