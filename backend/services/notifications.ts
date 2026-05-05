import {
  createNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/data/notifications-repo";
import type { AdminNotification, NotificationKind } from "@/lib/types";
import { requireAdmin } from "./auth";

export async function listNotificationsService(): Promise<AdminNotification[]> {
  await requireAdmin();
  return listNotifications();
}

export async function createNotificationService(
  kind: NotificationKind,
  title: string,
  body: string
): Promise<AdminNotification> {
  await requireAdmin();
  return createNotification(kind, title, body);
}

export async function markReadService(id: string, read: boolean): Promise<void> {
  await requireAdmin();
  await markNotificationRead(id, read);
}

export async function markAllReadService(): Promise<void> {
  await requireAdmin();
  await markAllNotificationsRead();
}
