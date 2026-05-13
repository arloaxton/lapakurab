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

  // Build base eksternal dari forwarded headers — di belakang Caddy/nginx,
  // req.url bisa jadi http://localhost:3000. Pakai x-forwarded-host +
  // x-forwarded-proto biar redirect arah ke domain user, bukan internal.
  const forwardedHost =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    url.host;
  const forwardedProto =
    req.headers.get("x-forwarded-proto") || url.protocol.replace(/:$/, "") || "https";
  const externalBase = `${forwardedProto}://${forwardedHost}`;

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", externalBase));
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(
      new URL("/login?error=backend_not_configured", externalBase)
    );
  }

  const sb = await getServerClient();
  const { error } = await sb.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, externalBase)
    );
  }

  return NextResponse.redirect(new URL(next, externalBase));
}
