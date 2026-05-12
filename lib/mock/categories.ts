import type { Category } from "../types";

// Mock fallback dipakai saat Supabase belum di-konfig (dev mode).
// "all" adalah filter pseudo-category yang muncul di catalog sidebar.
export const CATEGORIES: Category[] = [
  { id: "all", label: "Semua", emoji: "✦", sortOrder: 0, active: true },
  { id: "streaming", label: "Streaming", emoji: "▶", sortOrder: 10, active: true },
  { id: "vpn", label: "VPN", emoji: "◈", sortOrder: 20, active: true },
];
