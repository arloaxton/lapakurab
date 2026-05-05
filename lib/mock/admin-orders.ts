import type { AdminOrder } from "../types";

export const SEED_ADMIN_ORDERS: AdminOrder[] = [
  { id: "TKA-2841", date: "2026-05-02", customer: "Rina Adhianti", email: "rina@mail.com", product: "Streamflix Premium", duration: "3 Bulan", total: 75000, status: "paid", payment: "QRIS" },
  { id: "TKA-2840", date: "2026-05-02", customer: "Dimas Pratama", email: "dimas.p@mail.com", product: "CloudVPN Pro", duration: "1 Tahun", total: 180000, status: "paid", payment: "GoPay" },
  { id: "TKA-2839", date: "2026-05-01", customer: "Anita K.", email: "anita.k@mail.com", product: "Tunify Family", duration: "1 Bulan", total: 18000, status: "pending", payment: "OVO" },
  { id: "TKA-2838", date: "2026-05-01", customer: "Bagas W.", email: "bagas@mail.com", product: "YouTune Premium", duration: "6 Bulan", total: 72000, status: "delivered", payment: "DANA" },
  { id: "TKA-2837", date: "2026-04-30", customer: "Sari M.", email: "sari@mail.com", product: "Disnia+ Hotstart", duration: "3 Bulan", total: 66000, status: "paid", payment: "QRIS" },
  { id: "TKA-2836", date: "2026-04-30", customer: "Yoga T.", email: "yoga@mail.com", product: "HBO Mix", duration: "1 Bulan", total: 28000, status: "refunded", payment: "GoPay" },
  { id: "TKA-2835", date: "2026-04-29", customer: "Mira F.", email: "mira@mail.com", product: "NordSecure VPN", duration: "1 Tahun", total: 240000, status: "delivered", payment: "ShopeePay" },
  { id: "TKA-2834", date: "2026-04-29", customer: "Adit S.", email: "adit@mail.com", product: "Streamflix Premium", duration: "1 Tahun", total: 300000, status: "paid", payment: "QRIS" },
];
