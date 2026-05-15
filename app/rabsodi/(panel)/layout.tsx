"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { AdminShell } from "@/components/admin/AdminShell";
import { OnboardingChecklist } from "@/components/admin/OnboardingChecklist";
import { CommandPalette } from "@/components/shared/CommandPalette";
import { useKey } from "@/hooks/useKey";
import type { CommandItem } from "@/lib/types";

export default function AdminPanelLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { authed, hydrated, logout } = useAdmin();
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Redirect HANYA setelah hydration confirmed unauthenticated.
  // Sebelumnya: 50ms setTimeout race redirect kalau hydration > 50ms
  // (fetch session dari /api/auth/session bisa 200ms+).
  useEffect(() => {
    if (hydrated && !authed) {
      router.replace("/rabsodi/login");
    }
  }, [hydrated, authed, router]);

  // Cmd/Ctrl+K opens palette
  useKey("$mod+k", (e) => {
    if (!authed) return;
    e.preventDefault();
    setPaletteOpen((s) => !s);
  }, [authed]);

  // Loading state: tunggu hydration selesai. Kalau setelah hydration
  // ternyata !authed, useEffect di atas akan redirect — tampilkan
  // loading spinner sementara.
  if (!hydrated || !authed) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--ink-soft)",
          fontSize: 13,
        }}
      >
        {hydrated ? "Mengarahkan…" : "Memeriksa sesi…"}
      </div>
    );
  }

  const commands: CommandItem[] = [
    { icon: "📊", title: "Dashboard", section: "Halaman", onRun: () => router.push("/rabsodi"), keywords: "beranda overview" },
    { icon: "📦", title: "Produk", section: "Halaman", onRun: () => router.push("/rabsodi/products") },
    { icon: "🧾", title: "Pesanan", section: "Halaman", onRun: () => router.push("/rabsodi/orders"), keywords: "order transaksi" },
    { icon: "🔐", title: "Stok akun", section: "Halaman", onRun: () => router.push("/rabsodi/stock"), keywords: "kredensial credential" },
    { icon: "👥", title: "Member", section: "Halaman", onRun: () => router.push("/rabsodi/users"), keywords: "user pelanggan" },
    { icon: "🎟️", title: "Voucher", section: "Halaman", onRun: () => router.push("/rabsodi/vouchers"), keywords: "diskon promo" },
    { icon: "💳", title: "Payment Gateway", section: "Halaman", onRun: () => router.push("/rabsodi/gateways"), keywords: "pembayaran" },
    { icon: "📋", title: "Audit log", section: "Halaman", onRun: () => router.push("/rabsodi/audit"), keywords: "aktivitas history" },
    { icon: "⚙️", title: "Settings", section: "Halaman", onRun: () => router.push("/rabsodi/settings"), keywords: "pengaturan toko" },
    { icon: "🏠", title: "Lihat toko (frontend)", section: "Navigasi", onRun: () => router.push("/") },
    { icon: "🚪", title: "Logout", section: "Akun", onRun: () => { logout(); router.push("/rabsodi/login"); } },
  ];

  return (
    <>
      <AdminShell>{children}</AdminShell>
      <CommandPalette
        commands={commands}
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
      />
      <OnboardingChecklist />
    </>
  );
}
