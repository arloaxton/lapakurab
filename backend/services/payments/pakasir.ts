/**
 * Pakasir payment gateway client.
 *
 * Docs: https://pakasir.com/p/docs
 *
 * Cuma 1 channel yang dipakai: QRIS (covers GoPay/DANA/OVO/ShopeePay
 * via QRIS interop — user scan dari app apapun).
 *
 * Auth: api_key + project slug (kedua-duanya di body/query). TIDAK ada
 * HMAC signature di request maupun webhook. Untuk security webhook,
 * kita re-verify via checkPakasirStatus() di handler callback.
 */

import { env, isPakasirConfigured } from "@/backend/env";

const DEFAULT_TIMEOUT_MS = 8000;

export interface CreatePakasirTransactionInput {
  /** Reference unique dari sisi kita (mis. payment_ref kita generate). */
  orderId: string;
  /** IDR integer (no decimal). */
  amount: number;
  /** Optional: redirect customer setelah bayar. */
  redirectUrl?: string;
}

export interface PakasirPayment {
  project: string;
  order_id: string;
  amount: number;
  fee: number;
  total_payment: number;
  payment_method: string;
  /** QR string raw — render jadi QR code di client. */
  payment_number: string;
  expired_at: string;
}

export interface PakasirCreateResponse {
  payment?: PakasirPayment;
  message?: string;
  error?: string;
}

export interface PakasirTransactionDetail {
  project?: string;
  order_id?: string;
  amount?: number;
  /** "completed" | "pending" | "expired" | "canceled" */
  status?: string;
  payment_method?: string;
  completed_at?: string | null;
  expired_at?: string | null;
}

async function pakasirFetch(path: string, init: RequestInit = {}): Promise<Response> {
  if (!isPakasirConfigured()) {
    throw new Error("Pakasir belum di-konfigurasi (PAKASIR_API_KEY/PAKASIR_PROJECT).");
  }
  const url = `${env.PAKASIR_BASE_URL}${path}`;
  const headers = new Headers(init.headers || {});
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), DEFAULT_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, headers, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

/**
 * Create QRIS transaction via API. Return data berisi QR string
 * (payment_number) yang harus di-render jadi QR code di client.
 */
export async function createPakasirTransaction(
  input: CreatePakasirTransactionInput
): Promise<PakasirPayment> {
  const body = {
    project: env.PAKASIR_PROJECT,
    order_id: input.orderId,
    amount: input.amount,
    api_key: env.PAKASIR_API_KEY,
    ...(input.redirectUrl ? { redirect: input.redirectUrl } : {}),
  };
  const res = await pakasirFetch("/api/transactioncreate/qris", {
    method: "POST",
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as PakasirCreateResponse;
  if (!res.ok || !json.payment) {
    throw new Error(
      json?.message || json?.error || `Pakasir error (HTTP ${res.status})`
    );
  }
  return json.payment;
}

/**
 * Cek status transaksi langsung ke Pakasir.
 * Dipakai webhook handler untuk re-verify (anti-spoof callback yang
 * tidak ada HMAC signature).
 */
export async function checkPakasirStatus(
  orderId: string,
  amount: number
): Promise<PakasirTransactionDetail> {
  const url = new URL(`${env.PAKASIR_BASE_URL}/api/transactiondetail`);
  url.searchParams.set("project", env.PAKASIR_PROJECT);
  url.searchParams.set("order_id", orderId);
  url.searchParams.set("amount", String(amount));
  url.searchParams.set("api_key", env.PAKASIR_API_KEY);
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const res = await fetch(url.toString(), { method: "GET", signal: ctrl.signal });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(`Pakasir status error (HTTP ${res.status})`);
    }
    // Response shape: kemungkinan { transaction: {...} } atau langsung field.
    // Handle keduanya.
    const tx = (json as Record<string, unknown>).transaction ?? json;
    return tx as PakasirTransactionDetail;
  } finally {
    clearTimeout(t);
  }
}

/** Cancel transaksi yang masih pending (belum dibayar). */
export async function cancelPakasirTransaction(
  orderId: string,
  amount: number
): Promise<boolean> {
  const body = {
    project: env.PAKASIR_PROJECT,
    order_id: orderId,
    amount,
    api_key: env.PAKASIR_API_KEY,
  };
  const res = await pakasirFetch("/api/transactioncancel", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return res.ok;
}
