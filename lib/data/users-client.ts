/**
 * Users client-side helpers (admin).
 */

import type { AdminUser, MemberNote } from "@/lib/types";
import { SEED_USERS } from "@/lib/mock/users";
import { isSupabaseConfigured } from "@/backend/env";
import type { UpdateUserInput } from "@/backend/schemas/users";

export async function fetchUsers(): Promise<AdminUser[]> {
  if (!isSupabaseConfigured()) return SEED_USERS.slice();
  const res = await fetch("/api/users");
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  const data = (await res.json()) as { users: AdminUser[] };
  return data.users ?? [];
}

export async function fetchUserById(id: string): Promise<AdminUser | null> {
  if (!isSupabaseConfigured()) return SEED_USERS.find((u) => u.id === id) ?? null;
  const res = await fetch(`/api/users/${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  const data = (await res.json()) as { user: AdminUser };
  return data.user ?? null;
}

export async function updateUserClient(id: string, patch: UpdateUserInput): Promise<void> {
  const res = await fetch(`/api/users/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
}

export async function fetchUserNotes(userId: string): Promise<MemberNote[]> {
  if (!isSupabaseConfigured()) return [];
  const res = await fetch(`/api/users/${encodeURIComponent(userId)}/notes`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  const data = (await res.json()) as { notes: MemberNote[] };
  return data.notes ?? [];
}

export async function createUserNote(userId: string, text: string): Promise<MemberNote> {
  const res = await fetch(`/api/users/${encodeURIComponent(userId)}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data.note as MemberNote;
}
