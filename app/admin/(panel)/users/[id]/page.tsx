"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { StatusPill } from "@/components/admin/StatusPill";
import { TableShell } from "@/components/admin/TableShell";
import {
  adminInputStyle,
  primaryBtn,
  secondaryBtn,
} from "@/components/admin/ui-styles";
import { fmtIDR, fmtDate, relTime } from "@/lib/format";
import { isSupabaseConfigured } from "@/backend/env";
import { createUserNote, fetchUserNotes, updateUserClient } from "@/lib/data/users-client";
import { useConfirm } from "@/components/shared/ConfirmDialog";

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { users, orders, notes, updateNotes, updateUsers, logAudit } = useAdmin();
  const [noteText, setNoteText] = useState("");
  const useApi = isSupabaseConfigured();
  const confirm = useConfirm();

  // Hydrate notes for this user from API (Supabase mode)
  useEffect(() => {
    if (!useApi) return;
    let alive = true;
    fetchUserNotes(id)
      .then((list) => {
        if (!alive) return;
        // Replace notes for this user only (preserve others in case ada di context)
        updateNotes((existing) => [
          ...existing.filter((n) => n.userId !== id),
          ...list,
        ]);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [id, useApi, updateNotes]);

  const user = users.find((u) => u.id === id);

  if (!user) {
    return (
      <div>
        <PageHeader title="Member tidak ditemukan" />
        <Link href="/admin/users" style={{ ...primaryBtn, textDecoration: "none" }}>
          ← Kembali
        </Link>
      </div>
    );
  }

  const userOrders = orders.filter((o) => o.email === user.email);
  const userNotes = notes
    .filter((n) => n.userId === user.id)
    .sort((a, b) => b.at.localeCompare(a.at));
  const ltv = userOrders
    .filter((o) => o.status === "paid" || o.status === "delivered")
    .reduce((s, o) => s + o.total, 0);
  const avgOrder = userOrders.length > 0 ? Math.round(ltv / userOrders.length) : 0;

  const addNote = async () => {
    const text = noteText.trim();
    if (!text) return;
    if (useApi) {
      try {
        const note = await createUserNote(user.id, text);
        updateNotes((list) => [...list, note]);
      } catch {
        return;
      }
    } else {
      updateNotes((list) => [
        ...list,
        {
          userId: user.id,
          at: new Date().toISOString(),
          actor: "admin@lapakurab.id",
          text,
        },
      ]);
    }
    logAudit("note.create", user.email, "Notes admin ditambahkan");
    setNoteText("");
  };

  const toggleBan = async () => {
    const next = user.status === "banned" ? "active" : "banned";
    const isBan = next === "banned";
    const ok = await confirm({
      title: isBan ? `Ban member ${user.name}?` : `Unban member ${user.name}?`,
      description: isBan
        ? `Member dengan email ${user.email} akan ditolak login. Order existing tidak terpengaruh.`
        : `Member ${user.email} akan bisa login lagi seperti normal.`,
      confirmLabel: isBan ? "Ya, ban" : "Ya, unban",
      cancelLabel: "Batal",
      danger: isBan,
    });
    if (!ok) return;

    updateUsers((list) =>
      list.map((x) => (x.id === user.id ? { ...x, status: next } : x))
    );
    if (useApi) {
      try {
        await updateUserClient(user.id, { status: next });
      } catch {
        updateUsers((list) =>
          list.map((x) => (x.id === user.id ? { ...x, status: user.status } : x))
        );
        return;
      }
    }
    logAudit(
      user.status === "banned" ? "user.unban" : "user.ban",
      user.email,
      ""
    );
  };

  return (
    <div>
      <Link
        href="/admin/users"
        style={{ ...secondaryBtn, marginBottom: 12, fontSize: 12, textDecoration: "none", display: "inline-block" }}
      >
        ← Kembali ke member
      </Link>

      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 24,
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}
      >
        <div
          style={{
            width: 74,
            height: 74,
            borderRadius: "50%",
            flexShrink: 0,
            background: `oklch(0.78 0.12 ${(user.id.charCodeAt(1) * 47) % 360})`,
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
            fontWeight: 700,
            fontFamily: "var(--font-display)",
          }}
        >
          {user.name[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                margin: 0,
                color: "var(--ink)",
              }}
            >
              {user.name}
            </h1>
            <StatusPill status={user.status} />
          </div>
          <div style={{ color: "var(--ink-soft)", fontSize: 13, marginBottom: 6 }}>
            {user.email}
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>
            Bergabung sejak {fmtDate(user.joined)}
          </div>
        </div>
        <div>
          <button
            onClick={toggleBan}
            style={{
              ...secondaryBtn,
              color: user.status === "banned" ? "var(--success)" : "var(--danger)",
            }}
          >
            {user.status === "banned" ? "Unban member" : "Ban member"}
          </button>
        </div>
      </div>

      <div className="lk-grid-4" style={{ gap: 12, marginBottom: 18 }}>
        <StatCard label="Lifetime value" value={fmtIDR(ltv)} accent="var(--primary)" />
        <StatCard label="Total order" value={userOrders.length} accent="var(--mint)" />
        <StatCard label="Rata-rata order" value={fmtIDR(avgOrder)} accent="var(--lilac)" />
        <StatCard
          label="Status"
          value={user.status === "active" ? "Aktif" : "Banned"}
          accent={user.status === "active" ? "var(--success)" : "var(--danger)"}
        />
      </div>

      <div
        className="lk-admin-2col-wide"
        style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}
      >
        <div>
          <div
            style={{
              fontWeight: 600,
              fontSize: 14,
              marginBottom: 10,
              color: "var(--ink)",
            }}
          >
            Riwayat order ({userOrders.length})
          </div>
          <TableShell
            columns={["Order ID", "Tanggal", "Produk", "Total", "Status"]}
            rows={userOrders.map((o) => [
              <span
                key="i"
                style={{
                  fontFamily: "var(--font-mono), ui-monospace, monospace",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--ink)",
                }}
              >
                #{o.id}
              </span>,
              <span key="d" style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                {fmtDate(o.date)}
              </span>,
              <div key="p">
                <div style={{ fontSize: 13, color: "var(--ink)" }}>{o.product}</div>
                <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>{o.duration}</div>
              </div>,
              <span
                key="t"
                style={{
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                  color: "var(--ink)",
                }}
              >
                {fmtIDR(o.total)}
              </span>,
              <StatusPill key="s" status={o.status} />,
            ])}
            empty="Member ini belum pernah order."
          />
        </div>

        <div>
          <div
            style={{
              fontWeight: 600,
              fontSize: 14,
              marginBottom: 10,
              color: "var(--ink)",
            }}
          >
            Notes admin
          </div>
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: 14,
              marginBottom: 10,
            }}
          >
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={3}
              placeholder="Tulis catatan internal soal member ini..."
              style={{ ...adminInputStyle, resize: "vertical", marginBottom: 8 }}
            />
            <button
              onClick={addNote}
              disabled={!noteText.trim()}
              style={{
                ...primaryBtn,
                width: "100%",
                opacity: noteText.trim() ? 1 : 0.5,
                justifyContent: "center",
              }}
            >
              + Tambah catatan
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {userNotes.length === 0 && (
              <div
                style={{
                  padding: 16,
                  textAlign: "center",
                  fontSize: 12,
                  color: "var(--ink-soft)",
                  background: "var(--surface)",
                  border: "1px dashed var(--border)",
                  borderRadius: 10,
                }}
              >
                Belum ada catatan. Tambahkan untuk track interaksi atau warning.
              </div>
            )}
            {userNotes.map((n, i) => (
              <div
                key={i}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    marginBottom: 5,
                    lineHeight: 1.5,
                    color: "var(--ink)",
                  }}
                >
                  {n.text}
                </div>
                <div style={{ fontSize: 10, color: "var(--ink-soft)" }}>
                  {n.actor} · {relTime(n.at)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
