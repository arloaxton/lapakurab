/**
 * Admin notifications repository.
 */

import type { AdminNotification, NotificationKind } from "@/lib/types";
import { SEED_NOTIFICATIONS } from "@/lib/mock/notifications";
import { isSupabaseConfigured } from "@/backend/env";

interface NotifRow {
  id: string;
  at: string;
  kind: NotificationKind;
  title: string;
  body: string;
  read: boolean;
}

function rowToNotif(r: NotifRow): AdminNotification {
  return {
    id: r.id,
    at: r.at,
    kind: r.kind,
    title: r.title,
    body: r.body,
    read: r.read,
  };
}

export async function listNotifications(): Promise<AdminNotification[]> {
  if (!isSupabaseConfigured()) return SEED_NOTIFICATIONS.slice();
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const { data, error } = await sb
    .from("admin_notifications")
    .select("*")
    .order("at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return ((data as NotifRow[] | null) ?? []).map(rowToNotif);
}

export async function createNotification(
  kind: NotificationKind,
  title: string,
  body: string
): Promise<AdminNotification> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase belum di-konfig — createNotification tidak tersedia.");
  }
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const id = "n" + Date.now() + Math.random().toString(36).slice(2, 6);
  const { data, error } = await sb
    .from("admin_notifications")
    .insert({ id, kind, title, body })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return rowToNotif(data as NotifRow);
}

export async function markNotificationRead(id: string, read: boolean): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const { error } = await sb.from("admin_notifications").update({ read }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function markAllNotificationsRead(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  const { error } = await sb
    .from("admin_notifications")
    .update({ read: true })
    .eq("read", false);
  if (error) throw new Error(error.message);
}
