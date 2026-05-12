/**
 * Auth repository — abstraksi untuk login/register/logout/getCurrentUser.
 *
 * Pola: kalau Supabase di-konfig, panggil API ke `/api/auth/*` (yang
 * di belakang panggil Supabase auth). Kalau tidak, fallback ke mock —
 * setUser di Context StoreProvider seperti yang dulu.
 *
 * Frontend pakai functions ini, tidak peduli implementasinya.
 */

import type { StoreUser } from "@/lib/types";
import { isSupabaseConfigured } from "@/backend/env";

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
}

export interface AuthResult {
  user: StoreUser | null;
  error?: string;
  /** Kalau true, user perlu confirm email dulu sebelum login. */
  needsConfirmation?: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data as T;
}

// ─── signIn ─────────────────────────────────────────────────────────────

export async function signIn(input: SignInInput): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    // Mock mode — return stub user, frontend StoreProvider akan setUser
    return {
      user: {
        id: "u-self",
        name: input.email.split("@")[0] || "Member",
        email: input.email,
      },
    };
  }
  try {
    const data = await postJSON<{ user: StoreUser }>("/api/auth/login", input);
    return { user: data.user };
  } catch (e: unknown) {
    return { user: null, error: e instanceof Error ? e.message : "Login gagal" };
  }
}

// ─── signUp ─────────────────────────────────────────────────────────────

export async function signUp(input: SignUpInput): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return {
      user: {
        id: "u-self",
        name: input.name,
        email: input.email,
      },
    };
  }
  try {
    const data = await postJSON<{ user: StoreUser | null; needsConfirmation: boolean }>(
      "/api/auth/register",
      input
    );
    return { user: data.user, needsConfirmation: data.needsConfirmation };
  } catch (e: unknown) {
    return { user: null, error: e instanceof Error ? e.message : "Pendaftaran gagal" };
  }
}

// ─── verifyOtp ──────────────────────────────────────────────────────────

export async function verifyOtp(
  email: string,
  token: string
): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    // Mock mode — terima kode apapun kecuali "000000" untuk test invalid
    if (token === "000000") {
      return { user: null, error: "Kode tidak valid" };
    }
    return {
      user: {
        id: "u-self",
        name: email.split("@")[0] || "Member",
        email,
      },
    };
  }
  try {
    const data = await postJSON<{ user: StoreUser }>(
      "/api/auth/verify-otp",
      { email, token }
    );
    return { user: data.user };
  } catch (e) {
    return {
      user: null,
      error: e instanceof Error ? e.message : "Verifikasi gagal",
    };
  }
}

// ─── signOut ────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // Best-effort — frontend tetap clear local state
  }
}

// ─── getCurrentUser (client-side) ───────────────────────────────────────

export async function getCurrentUser(): Promise<StoreUser | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const res = await fetch("/api/auth/session", { credentials: "include" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user ?? null;
  } catch {
    return null;
  }
}

// ─── resetPassword ──────────────────────────────────────────────────────

export async function requestPasswordReset(email: string): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: true }; // Mock: pretend sent
  }
  try {
    await postJSON("/api/auth/reset", { email });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal kirim reset link" };
  }
}
