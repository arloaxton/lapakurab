import type { AdminUser } from "../types";

export const SEED_USERS: AdminUser[] = [
  { id: "u1", name: "Rina Adhianti", email: "rina@mail.com", joined: "2026-02-14", orders: 3, spent: 225000, status: "active" },
  { id: "u2", name: "Dimas Pratama", email: "dimas.p@mail.com", joined: "2026-01-22", orders: 5, spent: 540000, status: "active" },
  { id: "u3", name: "Anita K.", email: "anita.k@mail.com", joined: "2026-03-08", orders: 1, spent: 18000, status: "active" },
  { id: "u4", name: "Bagas W.", email: "bagas@mail.com", joined: "2026-03-15", orders: 2, spent: 120000, status: "active" },
  { id: "u5", name: "Sari M.", email: "sari@mail.com", joined: "2026-04-01", orders: 2, spent: 138000, status: "active" },
  { id: "u6", name: "Yoga T.", email: "yoga@mail.com", joined: "2026-04-12", orders: 1, spent: 28000, status: "banned" },
];
