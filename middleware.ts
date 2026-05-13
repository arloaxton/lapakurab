/**
 * Next.js middleware:
 *   1. CSRF protection — block state-changing requests yang Origin/Referer
 *      tidak match host, kecuali webhook external (path di CSRF_EXEMPT).
 *   2. Refresh Supabase session cookie tiap request.
 *
 * Tanpa ini, session yang expired di server-side akan stuck (cookie gak
 * di-update). Middleware ini run sebelum route handler / RSC, jadi cookie
 * selalu fresh.
 *
 * Kalau Supabase belum di-konfig (.env kosong), session refresh skip —
 * tapi CSRF tetap jalan.
 */

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Path yang TIDAK dilindungi CSRF (webhook external, cron protected via
// CRON_SECRET header — bukan CSRF concern).
const CSRF_EXEMPT_PREFIXES = [
  "/api/payments/tokopay/callback",
  "/api/cron/",
];

const STATE_CHANGING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function csrfBlocked(request: NextRequest): boolean {
  if (!STATE_CHANGING_METHODS.has(request.method)) return false;
  const path = request.nextUrl.pathname;
  if (CSRF_EXEMPT_PREFIXES.some((p) => path.startsWith(p))) return false;

  const host = request.headers.get("host");
  if (!host) return true;

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const remote =
    origin?.replace(/^https?:\/\//, "").split("/")[0] ??
    referer?.replace(/^https?:\/\//, "").split("/")[0] ??
    "";

  if (!remote) return true; // missing both → reject
  return remote !== host;
}

export async function middleware(request: NextRequest) {
  // 1. CSRF guard
  if (csrfBlocked(request)) {
    return NextResponse.json(
      { error: "Forbidden — origin mismatch" },
      { status: 403 }
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  // No-op session refresh kalau env belum di-set
  if (!url || !anonKey) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Trigger session refresh — internally Supabase akan refresh kalau perlu
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Auth-aware redirect: user sudah login → /login atau /register akan
  // redirect ke /dashboard (atau ?next=... kalau ada query).
  const path = request.nextUrl.pathname;
  const isAuthOnlyPage = path === "/login" || path === "/register";
  if (user && isAuthOnlyPage) {
    const nextParam = request.nextUrl.searchParams.get("next");
    const target =
      nextParam && nextParam.startsWith("/") ? nextParam : "/dashboard";
    // Build redirect URL pakai forwarded host (di belakang Caddy/nginx,
    // `request.url` bisa jadi internal http://localhost:3000 — pakai
    // x-forwarded-host + x-forwarded-proto biar URL eksternal benar).
    const forwardedHost =
      request.headers.get("x-forwarded-host") ||
      request.headers.get("host") ||
      request.nextUrl.host;
    const forwardedProto =
      request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(/:$/, "") || "https";
    const redirectUrl = new URL(target, `${forwardedProto}://${forwardedHost}`);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match semua request kecuali:
     * - _next/static (static assets)
     * - _next/image (image optimization)
     * - favicon.ico, robots.txt, sitemap.xml
     * - file dengan ekstensi (.png, .svg, dll)
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)$).*)",
  ],
};
