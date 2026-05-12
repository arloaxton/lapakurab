/**
 * Wrapper untuk API tempmail (project terpisah, base URL via env).
 *
 * 5 endpoint dipakai:
 *   - GET  /api/v1/inboxes?email=...           → cari inbox by email
 *   - POST /api/v1/inbox/create                → (admin) bikin inbox baru
 *   - GET  /api/v1/inbox/:id/messages          → list pesan
 *   - GET  /api/v1/messages/:id?format=text    → detail pesan (body text)
 *   - DELETE /api/v1/inbox/:id                 → hapus inbox
 *
 * Server-side only. Tidak boleh di-import di client (api key di env).
 */

import { env, isTempmailConfigured } from "@/backend/env";

const DEFAULT_TIMEOUT_MS = 5000;

export interface TempmailInbox {
  id: string;
  email: string;
}

export interface TempmailMessageSummary {
  id: string;
  from: string;
  subject: string;
  received_at: string;
}

export interface TempmailMessageDetail {
  id: string;
  from: string;
  subject: string;
  received_at: string;
  text?: string;
  html?: string;
  body?: string;
}

class TempmailError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function tmFetch(path: string, init: RequestInit = {}): Promise<Response> {
  if (!isTempmailConfigured()) {
    throw new TempmailError(503, "Tempmail belum di-konfigurasi");
  }
  const url = `${env.TEMPMAIL_BASE_URL}${path}`;
  const headers = new Headers(init.headers || {});
  headers.set("Authorization", `Bearer ${env.TEMPMAIL_API_KEY}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...init, headers, signal: ctrl.signal });
    return res;
  } finally {
    clearTimeout(t);
  }
}

/** Cari inbox by email address. Return null kalau belum dibikin. */
export async function findInboxByEmail(email: string): Promise<TempmailInbox | null> {
  const res = await tmFetch(`/api/v1/inboxes?email=${encodeURIComponent(email)}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new TempmailError(res.status, `findInboxByEmail HTTP ${res.status}`);
  }
  const data = await res.json();
  // Response bisa [] atau [{id, email}] atau {id, email}
  if (Array.isArray(data)) {
    if (data.length === 0) return null;
    const first = data[0];
    return { id: String(first.id), email: String(first.email) };
  }
  if (data && typeof data === "object" && "id" in data) {
    return { id: String(data.id), email: String(data.email) };
  }
  return null;
}

/** Ambil daftar pesan dari inbox. `since` filter (ISO datetime). */
export async function listMessages(
  inboxId: string,
  opts: { since?: string; limit?: number } = {}
): Promise<TempmailMessageSummary[]> {
  const qs = new URLSearchParams();
  if (opts.since) qs.set("since", opts.since);
  if (opts.limit) qs.set("limit", String(opts.limit));
  const qstr = qs.toString();
  const path = `/api/v1/inbox/${encodeURIComponent(inboxId)}/messages${qstr ? "?" + qstr : ""}`;
  const res = await tmFetch(path);
  if (!res.ok) {
    throw new TempmailError(res.status, `listMessages HTTP ${res.status}`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((m: Record<string, unknown>) => ({
    id: String(m.id),
    from: String(m.from ?? ""),
    subject: String(m.subject ?? ""),
    received_at: String(m.received_at ?? ""),
  }));
}

/** Detail satu pesan — pakai format=text supaya gampang regex. */
export async function getMessageText(messageId: string): Promise<TempmailMessageDetail> {
  const res = await tmFetch(
    `/api/v1/messages/${encodeURIComponent(messageId)}?format=text`
  );
  if (!res.ok) {
    throw new TempmailError(res.status, `getMessageText HTTP ${res.status}`);
  }
  // format=text → server kemungkinan kirim plain text di body atau tetap JSON.
  // Coba parse JSON dulu, fallback ke text.
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const data = await res.json();
    return {
      id: String(data.id ?? messageId),
      from: String(data.from ?? ""),
      subject: String(data.subject ?? ""),
      received_at: String(data.received_at ?? ""),
      text: typeof data.text === "string" ? data.text : undefined,
      body: typeof data.body === "string" ? data.body : undefined,
    };
  }
  const raw = await res.text();
  return {
    id: messageId,
    from: "",
    subject: "",
    received_at: "",
    text: raw,
  };
}

export { TempmailError };
