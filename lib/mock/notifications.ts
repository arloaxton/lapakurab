import type { AdminNotification } from "../types";

export const SEED_NOTIFICATIONS: AdminNotification[] = [
  { id: "n1", at: "2026-05-02T10:30:00", kind: "order", title: "Pesanan baru #TKA-2841", body: "Streamflix Premium · Rp75.000", read: false },
  { id: "n2", at: "2026-05-02T09:18:00", kind: "success", title: "Auto-delivery sukses", body: "Kredensial dikirim ke rina@mail.com", read: false },
  { id: "n3", at: "2026-05-01T22:12:00", kind: "warn", title: "Stok HBO Mix menipis", body: "Tersisa 3 akun · threshold 5", read: false },
  { id: "n4", at: "2026-05-01T18:00:00", kind: "order", title: "Pesanan baru #TKA-2839", body: "Tunify Family · menunggu pembayaran", read: true },
  { id: "n5", at: "2026-04-30T11:30:00", kind: "danger", title: "Refund diproses", body: "#TKA-2836 · Rp28.000 dikembalikan", read: true },
];
