/**
 * Users (admin view) services — listing + ban + member notes.
 */

import {
  createNote as repoCreateNote,
  getUserWithAggregates,
  listNotesForUser,
  listUsersWithAggregates,
  updateUserAdmin,
} from "@/lib/data/users-repo";
import type { AdminUser, MemberNote } from "@/lib/types";
import type { UpdateUserInput } from "../schemas/users";
import { requireAdmin } from "./auth";

export async function listUsersService(): Promise<AdminUser[]> {
  await requireAdmin();
  return listUsersWithAggregates();
}

export async function getUserService(id: string): Promise<AdminUser | null> {
  await requireAdmin();
  return getUserWithAggregates(id);
}

export async function updateUserService(id: string, patch: UpdateUserInput): Promise<void> {
  await requireAdmin();
  await updateUserAdmin(id, patch);
}

export async function listNotesService(userId: string): Promise<MemberNote[]> {
  await requireAdmin();
  return listNotesForUser(userId);
}

export async function createNoteService(userId: string, text: string): Promise<MemberNote> {
  const sess = await requireAdmin();
  return repoCreateNote(userId, sess.user.id, sess.user.email, text);
}
