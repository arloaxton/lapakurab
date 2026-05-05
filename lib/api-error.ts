/**
 * Centralized API error mapper.
 *
 * Tujuan: log error asli (server-side, untuk debugging) tapi return
 * pesan generic ke client. Ini cegah leak DB schema, internal logic,
 * dan stack trace ke user.
 *
 * Pakai di setiap catch block API route:
 *
 *   } catch (e) {
 *     return mapApiError(e, "checkout");
 *   }
 *
 * Tag jadi prefix log untuk identifikasi cepat di Vercel/Sentry.
 */

import { NextResponse } from "next/server";

interface ErrorMapping {
  /** Pattern di error.message yang trigger mapping ini. Case-insensitive. */
  pattern: RegExp | string;
  /** HTTP status to return. */
  status: number;
  /** User-friendly message yang aman di-show. */
  userMessage: string;
}

/**
 * Mapping default — boleh customized per route via `extraMappings`.
 * Order matter: check from top to bottom.
 */
const DEFAULT_MAPPINGS: ErrorMapping[] = [
  // Auth-related
  { pattern: /^Unauthorized/i, status: 401, userMessage: "Login dulu" },
  { pattern: /^Forbidden/i, status: 403, userMessage: "Akses ditolak" },
  { pattern: /not authenticated/i, status: 401, userMessage: "Login dulu" },
  { pattern: /invalid login credentials/i, status: 401, userMessage: "Email atau password salah" },
  { pattern: /email not confirmed/i, status: 401, userMessage: "Konfirmasi email dulu — cek inbox" },
  { pattern: /user already registered/i, status: 409, userMessage: "Email ini sudah terdaftar" },
  { pattern: /password should be at least/i, status: 400, userMessage: "Password minimal 6 karakter" },

  // DB-related (jangan leak detail)
  { pattern: /duplicate key/i, status: 409, userMessage: "Data sudah ada" },
  { pattern: /violates foreign key/i, status: 400, userMessage: "Referensi data invalid" },
  { pattern: /violates check constraint/i, status: 400, userMessage: "Data tidak valid" },
  { pattern: /violates not-null/i, status: 400, userMessage: "Field wajib kosong" },
  { pattern: /^column .* does not exist/i, status: 500, userMessage: "Server error" },
  { pattern: /^relation .* does not exist/i, status: 500, userMessage: "Server error" },

  // Network / external
  { pattern: /fetch failed/i, status: 502, userMessage: "Layanan eksternal sedang bermasalah" },
  { pattern: /timeout/i, status: 504, userMessage: "Request timeout — coba lagi" },

  // Stock / business logic
  { pattern: /stock habis|out of stock/i, status: 409, userMessage: "Stok habis" },
  { pattern: /voucher .* tidak/i, status: 400, userMessage: "Voucher tidak valid" },
];

interface MapApiErrorOpts {
  /** Tag untuk identifikasi log (mis. "checkout", "auth-login"). */
  tag: string;
  /** Default user message kalau tidak match pattern apapun. */
  fallbackMessage?: string;
  /** Default status kalau tidak match. */
  fallbackStatus?: number;
  /** Extra mappings yang di-merge sebelum DEFAULT_MAPPINGS. */
  extraMappings?: ErrorMapping[];
  /** Bypass mapping — return error.message apa adanya (untuk error
   *  yang memang aman & business-relevant, mis. validation result). */
  passthrough?: boolean;
}

export function mapApiError(error: unknown, opts: MapApiErrorOpts | string): NextResponse {
  const config: MapApiErrorOpts =
    typeof opts === "string" ? { tag: opts } : opts;

  const tag = config.tag;
  const fallbackMessage =
    config.fallbackMessage ?? "Terjadi kesalahan — coba lagi sebentar";
  const fallbackStatus = config.fallbackStatus ?? 500;

  const errMessage =
    error instanceof Error ? error.message : String(error ?? "");

  // Always log full error server-side (Vercel logs / Sentry)
  console.error(`[${tag}]`, error);

  if (config.passthrough && errMessage) {
    // Trust the message — used for validation errors that are safe
    return NextResponse.json(
      { error: errMessage },
      { status: fallbackStatus }
    );
  }

  // Match pattern
  const allMappings = [...(config.extraMappings ?? []), ...DEFAULT_MAPPINGS];
  for (const m of allMappings) {
    const matches =
      m.pattern instanceof RegExp
        ? m.pattern.test(errMessage)
        : errMessage.toLowerCase().includes(m.pattern.toLowerCase());
    if (matches) {
      return NextResponse.json(
        { error: m.userMessage },
        { status: m.status }
      );
    }
  }

  // No match — return generic
  return NextResponse.json(
    { error: fallbackMessage },
    { status: fallbackStatus }
  );
}
