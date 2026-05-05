/**
 * Users repository (admin view) — list profiles + aggregate dari orders.
 */

import type { AdminUser, MemberNote } from "@/lib/types";
import { SEED_USERS } from "@/lib/mock/users";
import { isSupabaseConfigured } from "@/backend/env";
import type { UpdateUserInput } from "@/backend/schemas/users";

interface ProfileRow {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: "user" | "admin";
  status: "active" | "banned";
  created_at: string;
}

// ─── List with aggregates ───────────────────────────────────────────────

export async function listUsersWithAggregates(): Promise<AdminUser[]> {
  if (!isSupabaseConfigured()) return SEED_USERS.slice();
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();

  const { data: profiles, error } = await sb
    .from("profiles")
    .select("id, name, email, phone, role, status, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const profs = (profiles as ProfileRow[] | null) ?? [];
  if (profs.length === 0) return [];

  // Aggregate orders per user
  const ids = profs.map((p) => p.id);
  const { data: orders, error: ordersErr } = await sb
    .from("orders")
    .select("user_id, total_idr, status")
    .in("user_id", ids);
  if (ordersErr) throw new Error(ordersErr.message);
  const orderRows =
    (orders as { user_id: string; total_idr: number; status: string }[] | null) ?? [];

  const aggMap = new Map<string, { count: number; spent: number }>();
  for (const r of orderRows) {
    const eligible = r.status === "paid" || r.status === "delivered";
    if (!eligible) continue;
    const cur = aggMap.get(r.user_id) ?? { count: 0, spent: 0 };
    cur.count += 1;
    cur.spent += r.total_idr;
    aggMap.set(r.user_id, cur);
  }

  return profs.map((p) => {
    const agg = aggMap.get(p.id) ?? { count: 0, spent: 0 };
    return {
      id: p.id,
      name: p.name ?? p.email.split("@")[0] ?? "Member",
      email: p.email,
      joined: p.created_at.slice(0, 10),
      orders: agg.count,
      spent: agg.spent,
      status: p.status,
    };
  });
}

// ─── Get one with aggregates ────────────────────────────────────────────

export async function getUserWithAggregates(id: string): Promise<AdminUser | null> {
  if (!isSupabaseConfigured()) return SEED_USERS.find((u) => u.id === id) ?? null;
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const { data, error } = await sb
    .from("profiles")
    .select("id, name, email, phone, role, status, created_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const p = data as ProfileRow;
  const { data: orders } = await sb
    .from("orders")
    .select("total_idr, status")
    .eq("user_id", id);
  const rows = (orders as { total_idr: number; status: string }[] | null) ?? [];
  const eligible = rows.filter((r) => r.status === "paid" || r.status === "delivered");
  return {
    id: p.id,
    name: p.name ?? p.email.split("@")[0] ?? "Member",
    email: p.email,
    joined: p.created_at.slice(0, 10),
    orders: eligible.length,
    spent: eligible.reduce((s, r) => s + r.total_idr, 0),
    status: p.status,
  };
}

// ─── Update ─────────────────────────────────────────────────────────────

export async function updateUserAdmin(id: string, patch: UpdateUserInput): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase belum di-konfig — updateUserAdmin tidak tersedia.");
  }
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const dbPatch: Record<string, unknown> = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.phone !== undefined) dbPatch.phone = patch.phone;
  if (patch.role !== undefined) dbPatch.role = patch.role;
  if (patch.status !== undefined) dbPatch.status = patch.status;
  const { error } = await sb.from("profiles").update(dbPatch).eq("id", id);
  if (error) throw new Error(error.message);
}

// ─── Member notes ───────────────────────────────────────────────────────

interface NoteRow {
  id: number;
  user_id: string;
  at: string;
  actor: string | null;
  actor_email: string | null;
  text: string;
}

export async function listNotesForUser(userId: string): Promise<MemberNote[]> {
  if (!isSupabaseConfigured()) return [];
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const { data, error } = await sb
    .from("member_notes")
    .select("*")
    .eq("user_id", userId)
    .order("at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data as NoteRow[] | null) ?? []).map((r) => ({
    userId: r.user_id,
    at: r.at,
    actor: r.actor_email ?? "admin",
    text: r.text,
  }));
}

export async function createNote(
  userId: string,
  actorId: string,
  actorEmail: string,
  text: string
): Promise<MemberNote> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase belum di-konfig — createNote tidak tersedia.");
  }
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const { data, error } = await sb
    .from("member_notes")
    .insert({
      user_id: userId,
      actor: actorId,
      actor_email: actorEmail,
      text,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  const r = data as NoteRow;
  return {
    userId: r.user_id,
    at: r.at,
    actor: r.actor_email ?? "admin",
    text: r.text,
  };
}
