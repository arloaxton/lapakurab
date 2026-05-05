import { listAudit, writeAudit, type ListAuditOpts } from "@/lib/data/audit-repo";
import type { AuditEntry } from "@/lib/types";
import { getCurrentSession, requireAdmin } from "./auth";

export async function listAuditService(opts: ListAuditOpts = {}): Promise<AuditEntry[]> {
  await requireAdmin();
  return listAudit(opts);
}

export async function logAuditService(
  action: string,
  target: string,
  detail = ""
): Promise<void> {
  const sess = await getCurrentSession();
  if (!sess) return;
  if (sess.role !== "admin") return;
  await writeAudit(sess.user.id, sess.user.email, action, target, detail);
}
