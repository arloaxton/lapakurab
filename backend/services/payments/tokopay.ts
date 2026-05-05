/**
 * Tokopay payment gateway client.
 *
 * Docs: https://docs.tokopay.id/
 *
 * Channel codes yang dipakai (QRIS realtime + e-wallet only):
 *   - QRISREALTIME (preferred)
 *   - QRIS_REALTIME_NOBU
 *   - GOPAY
 *   - DANA
 *   - SHOPEEPAY
 *   - LINKAJA
 *
 * Catatan: OVO TIDAK didukung Tokopay.
 *
 * Signature: MD5(merchant_id:secret:reff_id) — dipakai untuk request DAN
 * verifikasi webhook callback.
 */

import { createHash } from "crypto";
import { env, isTokopayConfigured } from "@/backend/env";

export const TOKOPAY_CHANNELS = {
  QRISREALTIME: "QRISREALTIME",
  QRIS_REALTIME_NOBU: "QRIS_REALTIME_NOBU",
  GOPAY: "GOPAY",
  DANA: "DANA",
  SHOPEEPAY: "SHOPEEPAY",
  LINKAJA: "LINKAJA",
} as const;

export type TokopayChannel = (typeof TOKOPAY_CHANNELS)[keyof typeof TOKOPAY_CHANNELS];

export function generateSignature(reffId: string): string {
  if (!isTokopayConfigured()) {
    throw new Error("Tokopay belum di-konfigurasi (TOKOPAY_MERCHANT_ID/TOKOPAY_SECRET).");
  }
  const raw = `${env.TOKOPAY_MERCHANT_ID}:${env.TOKOPAY_SECRET}:${reffId}`;
  return createHash("md5").update(raw).digest("hex");
}

/** Verify signature dari webhook callback. Constant-time compare. */
export function verifySignature(reffId: string, providedSig: string): boolean {
  if (!isTokopayConfigured()) return false;
  const expected = generateSignature(reffId);
  if (expected.length !== providedSig.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ providedSig.charCodeAt(i);
  }
  return mismatch === 0;
}

export interface CreateTokopayOrderInput {
  channel: TokopayChannel;
  reffId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  redirectUrl?: string;
  expiredSeconds?: number; // 0 = default 24 jam
  items?: Array<{ product_code: string; name: string; price: number; qty?: number }>;
}

export interface TokopayOrderData {
  pay_url?: string;
  total_bayar?: number;
  total_diterima?: number;
  trx_id?: string;
  qr_link?: string;
  qr_string?: string;
  nomor_va?: string;
  checkout_url?: string;
}

export interface TokopayOrderResponse {
  status: string;
  data?: TokopayOrderData;
  message?: string;
}

/**
 * Create order via endpoint advanced (POST /v1/order). Return data
 * pay_url / qr_string / trx_id sesuai channel.
 */
export async function createTokopayOrder(
  input: CreateTokopayOrderInput
): Promise<TokopayOrderData> {
  if (!isTokopayConfigured()) {
    throw new Error("Tokopay belum di-konfigurasi");
  }
  const signature = generateSignature(input.reffId);
  const body = {
    merchant_id: env.TOKOPAY_MERCHANT_ID,
    kode_channel: input.channel,
    reff_id: input.reffId,
    amount: input.amount,
    customer_name: input.customerName,
    customer_email: input.customerEmail,
    customer_phone: input.customerPhone,
    redirect_url: input.redirectUrl ?? "",
    expired_ts: input.expiredSeconds ?? 0,
    signature,
    items: input.items ?? [],
  };

  const res = await fetch(`${env.TOKOPAY_BASE_URL}/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as TokopayOrderResponse;
  if (!res.ok || json.status !== "Success") {
    throw new Error(json?.message || `Tokopay error (HTTP ${res.status})`);
  }
  return json.data ?? {};
}

/** Cek status transaksi via endpoint simple (GET /v1/order). */
export async function checkTokopayStatus(reffId: string): Promise<TokopayOrderData & { status?: string }> {
  if (!isTokopayConfigured()) {
    throw new Error("Tokopay belum di-konfigurasi");
  }
  const url = new URL(`${env.TOKOPAY_BASE_URL}/order`);
  url.searchParams.set("merchant", env.TOKOPAY_MERCHANT_ID);
  url.searchParams.set("secret", env.TOKOPAY_SECRET);
  url.searchParams.set("ref_id", reffId);
  const res = await fetch(url.toString(), { method: "GET" });
  const json = (await res.json().catch(() => ({}))) as TokopayOrderResponse & { data?: TokopayOrderData & { status?: string } };
  if (!res.ok) {
    throw new Error(json?.message || `Tokopay error (HTTP ${res.status})`);
  }
  return { ...(json.data ?? {}), status: json.status };
}
