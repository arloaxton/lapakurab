/**
 * Audit log repository — server-side.
 */

import type { AuditEntry } from "@/lib/types";
import { SEED_AUDIT } from "@/lib/mock/audit";
import { isSupabaseConfigured } from "@/backend/env";

interface AuditRow {
  id: number;
  at: string;
  actor: string | null;
  actor_email: string | null;
  action: string;
  target: string;
  detail: string | null;
}

function rowToEntry(r: AuditRow): AuditEntry {
  return {
    id: String(r.id),
    at: r.at,
    actor: r.actor_email ?? "system",
    action: r.action,
    target: r.target,
    detail: r.detail ?? "",
  };
}

export interface ListAuditOpts {
  action?: string;
  limit?: number;
  offset?: number;
}

export async function listAudit(opts: ListAuditOpts = {}): Promise<AuditEntry[]> {
  if (!isSupabaseConfigured()) {
    let list = SEED_AUDIT.slice();
    if (opts.action) list = list.filter((a) => a.action.startsWith(opts.action!));
    if (opts.offset) list = list.slice(opts.offset);
    if (opts.limit) list = list.slice(0, opts.limit);
    return list;
  }
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  let q = sb.from("audit_log").select("*").order("at", { ascending: false });
  if (opts.action) q = q.like("action", `${opts.action}%`);
  if (opts.limit) q = q.range(opts.offset ?? 0, (opts.offset ?? 0) + opts.limit - 1);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return ((data as AuditRow[] | null) ?? []).map(rowToEntry);
}

export async function writeAudit(
  actorId: string | null,
  actorEmail: string,
  action: string,
  target: string,
  detail: string
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const { getServerClient } = await import("@/backend/db/server-client");
  const sb = await getServerClient();
  await sb.from("audit_log").insert({
    actor: actorId,
    actor_email: actorEmail,
    action,
    target,
    detail,
  });
}
