"use client";

import Link from "next/link";
import { useState } from "react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { PageHeader } from "@/components/admin/PageHeader";
import { TableShell } from "@/components/admin/TableShell";
import { StatusPill } from "@/components/admin/StatusPill";
import { adminInputStyle, secondaryBtn, miniBtn } from "@/components/admin/ui-styles";
import { useToast } from "@/components/shared/ToastProvider";
import { useConfirm } from "@/components/shared/ConfirmDialog";
import { Pagination } from "@/components/shared/Pagination";
import { usePagination } from "@/hooks/usePagination";
import { fmtIDR, fmtDate, downloadCSV } from "@/lib/format";
import type { AdminUser } from "@/lib/types";
import { isSupabaseConfigured } from "@/backend/env";
import { updateUserClient } from "@/lib/data/users-client";

export default function AdminUsersPage() {
  const { users, updateUsers, logAudit } = useAdmin();
  const toast = useToast();
  const confirm = useConfirm();
  const [search, setSearch] = useState("");

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );
  const paged = usePagination(filtered, 10);

  const useApi = isSupabaseConfigured();

  const toggleBan = async (u: AdminUser) => {
    const next = u.status === "banned" ? "active" : "banned";
    const isBan = next === "banned";
    const ok = await confirm({
      title: isBan ? `Ban member ${u.name}?` : `Unban member ${u.name}?`,
      description: isBan
        ? `Member dengan email ${u.email} akan ditolak login. Order existing tidak terpengaruh.`
        : `Member ${u.email} akan bisa login lagi seperti normal.`,
      confirmLabel: isBan ? "Ya, ban" : "Ya, unban",
      cancelLabel: "Batal",
      danger: isBan,
    });
    if (!ok) return;

    updateUsers((list) =>
      list.map((x) => (x.id === u.id ? { ...x, status: next } : x))
    );
    if (useApi) {
      try {
        await updateUserClient(u.id, { status: next });
      } catch (e) {
        updateUsers((list) =>
          list.map((x) => (x.id === u.id ? { ...x, status: u.status } : x))
        );
        toast.error("Gagal update status", e instanceof Error ? e.message : "Coba lagi.");
        return;
      }
    }
    logAudit(
      u.status === "banned" ? "user.unban" : "user.ban",
      u.email,
      u.status === "banned" ? "Member di-unban" : "Member di-ban"
    );
    toast.warn(u.status === "banned" ? "Member di-unban" : "Member di-ban", u.email);
  };

  const exportCSV = () => {
    const rows: (string | number)[][] = [
      ["Nama", "Email", "Bergabung", "Total order", "Total belanja", "Status"],
    ];
    filtered.forEach((u) =>
      rows.push([u.name, u.email, u.joined, u.orders, u.spent, u.status])
    );
    downloadCSV("members-" + new Date().toISOString().slice(0, 10) + ".csv", rows);
    logAudit("users.export", `${filtered.length} rows`, "Export CSV member");
  };

  return (
    <div>
      <PageHeader
        title="Member"
        subtitle={`${users.length} member terdaftar`}
        action={
          <button onClick={exportCSV} style={secondaryBtn}>
            ↓ Export CSV
          </button>
        }
      />

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama atau email..."
          style={{ ...adminInputStyle, maxWidth: 320 }}
        />
      </div>

      <TableShell
        columns={[
          "Nama",
          "Email",
          "Bergabung",
          "Order",
          "Total belanja",
          "Status",
          "",
        ]}
        rows={paged.items.map((u) => [
          <Link
            key="n"
            href={`/rabsodi/users/${u.id}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: `oklch(0.78 0.12 ${(u.id.charCodeAt(1) * 47) % 360})`,
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {u.name[0]}
            </div>
            <span style={{ fontWeight: 500, fontSize: 13, color: "var(--ink)" }}>
              {u.name}
            </span>
          </Link>,
          <span key="e" style={{ fontSize: 12, color: "var(--ink-soft)" }}>
            {u.email}
          </span>,
          <span key="j" style={{ fontSize: 12, color: "var(--ink)" }}>
            {fmtDate(u.joined)}
          </span>,
          <span
            key="o"
            style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums", color: "var(--ink)" }}
          >
            {u.orders}
          </span>,
          <span
            key="s"
            style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums", color: "var(--ink)" }}
          >
            {fmtIDR(u.spent)}
          </span>,
          <StatusPill key="st" status={u.status} />,
          <div key="a" style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
            <Link
              href={`/rabsodi/users/${u.id}`}
              style={{ ...miniBtn, textDecoration: "none" }}
            >
              Detail
            </Link>
            <button
              onClick={() => toggleBan(u)}
              style={{
                ...miniBtn,
                color: u.status === "banned" ? "var(--success)" : "var(--danger)",
              }}
            >
              {u.status === "banned" ? "Unban" : "Ban"}
            </button>
          </div>,
        ])}
        empty="Belum ada pelanggan"
        emptyIcon="👥"
        emptyDesc="Saat ada user yang daftar atau checkout, mereka akan muncul di sini."
      />

      <Pagination api={paged} />
    </div>
  );
}
