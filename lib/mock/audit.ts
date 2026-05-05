import type { AuditEntry } from "../types";

export const SEED_AUDIT: AuditEntry[] = [
  { id: "a1", at: "2026-05-02T10:24:00", actor: "admin@lapakurab.id", action: "product.update", target: "Streamflix Premium", detail: "Stok diubah 10 → 12" },
  { id: "a2", at: "2026-05-02T09:18:00", actor: "admin@lapakurab.id", action: "order.delivered", target: "#TKA-2841", detail: "Auto-delivery: kredensial dikirim ke rina@mail.com" },
  { id: "a3", at: "2026-05-01T16:42:00", actor: "admin@lapakurab.id", action: "voucher.create", target: "GAJIAN50K", detail: "Diskon Rp50.000, min order Rp200.000" },
  { id: "a4", at: "2026-05-01T14:05:00", actor: "admin@lapakurab.id", action: "gateway.update", target: "GoPay", detail: "API key diperbarui" },
  { id: "a5", at: "2026-04-30T11:30:00", actor: "admin@lapakurab.id", action: "user.ban", target: "yoga@mail.com", detail: "Indikasi fraud — chargeback berulang" },
];
