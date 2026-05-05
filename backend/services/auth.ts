/**
 * Auth services — wraps Supabase auth API. Dipanggil dari API route handlers.
 */

import { getServerClient } from "../db/server-client";
import { env } from "../env";
import type { LoginInput, RegisterInput, ResetInput } from "../schemas/auth";
import type { StoreUser } from "@/lib/types";

export interface AuthSession {
  user: StoreUser;
  role: "user" | "admin";
}

/** Login with email + password. Sets session cookie via @supabase/ssr. */
export async function login(input: LoginInput): Promise<AuthSession> {
  const sb = await getServerClient();
  const { data, error } = await sb.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });
  if (error) {
    throw new Error(error.message === "Invalid login credentials" ? "Email atau password salah" : error.message);
  }
  if (!data.user) throw new Error("Login gagal — user tidak ditemukan");
  return await readProfile(data.user.id);
}

/**
 * Register. Supabase mengirim email confirm — user harus klik link dulu
 * sebelum bisa login. Return needsConfirmation=true kalau email confirm aktif.
 */
export async function register(
  input: RegisterInput
): Promise<{ user: StoreUser | null; needsConfirmation: boolean }> {
  const sb = await getServerClient();
  const { data, error } = await sb.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { name: input.name },
      emailRedirectTo: env.SITE_URL ? `${env.SITE_URL}/login` : undefined,
    },
  });
  if (error) {
    throw new Error(error.message);
  }
  // Kalau session ada, berarti email confirm di-disable di Supabase project
  // (instant-login). Kalau session null tapi user ada → menunggu confirm.
  if (data.session && data.user) {
    const sess = await readProfile(data.user.id);
    return { user: sess.user, needsConfirmation: false };
  }
  return { user: null, needsConfirmation: true };
}

export async function logout(): Promise<void> {
  const sb = await getServerClient();
  await sb.auth.signOut();
}

/** Get current logged-in user from session cookie. Returns null if anon. */
export async function getCurrentSession(): Promise<AuthSession | null> {
  const sb = await getServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;
  try {
    return await readProfile(user.id);
  } catch {
    return null;
  }
}

/** Send password reset email. */
export async function requestReset(input: ResetInput): Promise<void> {
  const sb = await getServerClient();
  const { error } = await sb.auth.resetPasswordForEmail(input.email, {
    redirectTo: env.SITE_URL ? `${env.SITE_URL}/login` : undefined,
  });
  if (error) throw new Error(error.message);
}

// ─── Internal helpers ───────────────────────────────────────────────────

interface ProfileSlim {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: "user" | "admin";
}

async function readProfile(userId: string): Promise<AuthSession> {
  const sb = await getServerClient();
  const { data, error } = await sb
    .from("profiles")
    .select("id, name, email, phone, role")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Profile tidak ditemukan");
  const row = data as ProfileSlim;
  return {
    user: {
      id: row.id,
      name: row.name ?? row.email.split("@")[0] ?? "Member",
      email: row.email,
      phone: row.phone ?? undefined,
    },
    role: row.role,
  };
}

/** Throw kalau bukan admin. Dipakai sebagai gate di API admin endpoints. */
export async function requireAdmin(): Promise<AuthSession> {
  const sess = await getCurrentSession();
  if (!sess) throw new Error("Unauthorized");
  if (sess.role !== "admin") throw new Error("Forbidden — admin only");
  return sess;
}
