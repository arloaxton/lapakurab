/**
 * Security helpers untuk Route Handlers:
 *   - assertSameOrigin(req)  : CSRF protection via Origin/Referer
 *   - rateLimit(key, opts)   : Upstash Redis sliding-window. No-op kalau env kosong.
 *
 * Dipakai di POST/PATCH/DELETE endpoints yang state-changing.
 */

import { NextResponse } from "next/server";
import { env, isRateLimiterConfigured } from "../env";

// ─── CSRF: Same-Origin check ───────────────────────────────────────────

export class OriginMismatchError extends Error {
  constructor() {
    super("Forbidden — origin mismatch");
    this.name = "OriginMismatchError";
  }
}

/**
 * Throw OriginMismatchError kalau Origin/Referer header tidak match host.
 * Pakai di state-changing endpoints (POST/PATCH/DELETE). GET endpoints
 * tidak perlu — browser tidak attach Origin untuk same-origin GET.
 *
 * NB: Webhook external (Tokopay callback) JANGAN pakai ini.
 */
export function assertSameOrigin(req: Request): void {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const host = req.headers.get("host");
  if (!host) throw new OriginMismatchError();

  // Ambil host dari Origin atau Referer
  const remoteHost =
    origin?.replace(/^https?:\/\//, "").split("/")[0] ??
    referer?.replace(/^https?:\/\//, "").split("/")[0] ??
    "";

  if (!remoteHost) {
    // No origin/referer — bisa jadi server-to-server. Reject untuk safety.
    throw new OriginMismatchError();
  }
  if (remoteHost !== host) {
    throw new OriginMismatchError();
  }
}

/** Wrap response dengan CSRF check. Returns NextResponse 403 kalau gagal. */
export function csrfGuard(req: Request): NextResponse | null {
  try {
    assertSameOrigin(req);
    return null;
  } catch {
    return NextResponse.json({ error: "Forbidden — origin mismatch" }, { status: 403 });
  }
}

// ─── Rate limiting (Upstash Redis sliding-window) ──────────────────────

export interface RateLimitOptions {
  /** Bucket identifier — biasanya "scope:identifier" mis. "login:1.2.3.4" */
  key: string;
  /** Max requests dalam window. */
  limit: number;
  /** Window dalam detik. */
  windowSec: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // epoch ms
  skipped?: boolean; // true kalau Upstash belum di-konfig
}

/**
 * Sliding-window via INCR + EXPIRE. Atomic via Redis.
 * Kalau Upstash belum di-konfig, return `{ allowed: true, skipped: true }`
 * dengan warning di console.
 */
export async function rateLimit(opts: RateLimitOptions): Promise<RateLimitResult> {
  const now = Date.now();
  const resetAt = now + opts.windowSec * 1000;

  if (!isRateLimiterConfigured()) {
    return { allowed: true, remaining: opts.limit, resetAt, skipped: true };
  }

  const bucket = `rl:${opts.key}:${Math.floor(now / 1000 / opts.windowSec)}`;

  try {
    // Upstash REST: pipeline INCR + EXPIRE atomically
    const res = await fetch(`${env.UPSTASH_REDIS_REST_URL}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", bucket],
        ["EXPIRE", bucket, String(opts.windowSec)],
      ]),
    });
    if (!res.ok) {
      console.warn("[rate-limit] Upstash error", res.status);
      return { allowed: true, remaining: opts.limit, resetAt, skipped: true };
    }
    const data = (await res.json()) as Array<{ result?: number }>;
    const count = Number(data?.[0]?.result ?? 0);
    return {
      allowed: count <= opts.limit,
      remaining: Math.max(0, opts.limit - count),
      resetAt,
    };
  } catch (e) {
    console.warn("[rate-limit] fetch failed:", e instanceof Error ? e.message : e);
    return { allowed: true, remaining: opts.limit, resetAt, skipped: true };
  }
}

/** Helper: extract client IP dari request headers (Vercel/standard). */
export function getClientIP(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

/**
 * Convenience: enforce rate limit + return 429 response kalau exceeded.
 * Pakai di awal handler:
 *
 *   const blocked = await enforceRateLimit({ scope: "login", req, limit: 5, windowSec: 60 });
 *   if (blocked) return blocked;
 */
export async function enforceRateLimit(opts: {
  scope: string;
  req: Request;
  limit: number;
  windowSec: number;
}): Promise<NextResponse | null> {
  const ip = getClientIP(opts.req);
  const result = await rateLimit({
    key: `${opts.scope}:${ip}`,
    limit: opts.limit,
    windowSec: opts.windowSec,
  });
  if (!result.allowed) {
    return NextResponse.json(
      {
        error: "Terlalu banyak request — tunggu sebentar",
        resetAt: result.resetAt,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(opts.windowSec),
          "X-RateLimit-Limit": String(opts.limit),
          "X-RateLimit-Remaining": String(result.remaining),
        },
      }
    );
  }
  return null;
}
