"use client";

import { useMemo, useState } from "react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { PageHeader } from "@/components/admin/PageHeader";
import { chipStyle } from "@/components/admin/ui-styles";
import { Pagination } from "@/components/shared/Pagination";
import { usePagination } from "@/hooks/usePagination";
import { fmtDate } from "@/lib/format";

const ICON_MAP: Record<string, string> = {
  product: "📦",
  order: "🧾",
  user: "👤",
  voucher: "🎟",
  gateway: "💳",
  stock: "🔑",
  settings: "⚙",
  note: "📝",
  orders: "↓",
  users: "↓",
};

function iconForAction(action: string): string {
  const t = action.split(".")[0];
  return ICON_MAP[t] || "•";
}

function colorForAction(action: string): string {
  if (action.endsWith(".delete") || action.endsWith(".ban") || action.endsWith(".refunded"))
    return "var(--danger)";
  if (action.endsWith(".create") || action.endsWith(".unban") || action.endsWith(".delivered"))
    return "var(--success)";
  if (action.endsWith(".update") || action.endsWith(".toggle") || action.endsWith(".export"))
    return "var(--primary)";
  return "var(--ink-soft)";
}

export default function AdminAuditPage() {
  const { audit } = useAdmin();
  const [filter, setFilter] = useState("all");

  const groups = useMemo(() => {
    const all = ["all", ...new Set(audit.map((a) => a.action.split(".")[0]))];
    return all;
  }, [audit]);

  const filtered =
    filter === "all" ? audit : audit.filter((a) => a.action.startsWith(filter));

  // Paginate flat list (sorted desc by date), then re-group by day
  const paged = usePagination(filtered, 20);

  const byDay: Record<string, typeof audit> = {};
  paged.items.forEach((a) => {
    const day = a.at.slice(0, 10);
    (byDay[day] = byDay[day] || []).push(a);
  });
  const days = Object.keys(byDay).sort().reverse();

  return (
    <div>
      <PageHeader
        title="Activity log"
        subtitle={`${audit.length} aksi tercatat · audit trail siapa edit apa kapan`}
      />

      <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
        {groups.map((g) => (
          <button key={g} onClick={() => setFilter(g)} style={chipStyle(filter === g)}>
            {g === "all" ? "Semua" : g}
          </button>
        ))}
      </div>

      {days.length === 0 && (
        <div
          style={{
            padding: 40,
            textAlign: "center",
            color: "var(--ink-soft)",
            fontSize: 13,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
          }}
        >
          Belum ada aktivitas.
        </div>
      )}

      {days.map((day) => (
        <div key={day} style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--ink-soft)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 10,
            }}
          >
            {fmtDate(day)}
          </div>
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            {byDay[day].map((a, i) => (
              <div
                key={a.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "14px 16px",
                  borderBottom: i < byDay[day].length - 1 ? "1px solid var(--border)" : 0,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    flexShrink: 0,
                    background: "var(--surface-2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    border: "1px solid var(--border)",
                  }}
                >
                  {iconForAction(a.action)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, marginBottom: 2, color: "var(--ink)" }}>
                    <span style={{ fontWeight: 600 }}>{a.actor}</span>{" "}
                    <span style={{ color: "var(--ink-soft)" }}>—</span>{" "}
                    <code
                      style={{
                        fontFamily: "var(--font-mono), ui-monospace, monospace",
                        fontSize: 11,
                        fontWeight: 600,
                        color: colorForAction(a.action),
                        padding: "1px 6px",
                        borderRadius: 4,
                        background: "var(--surface-2)",
                      }}
                    >
                      {a.action}
                    </code>{" "}
                    <span style={{ fontWeight: 500 }}>{a.target}</span>
                  </div>
                  {a.detail && (
                    <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                      {a.detail}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--ink-soft)",
                    flexShrink: 0,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {new Date(a.at).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <Pagination api={paged} />
    </div>
  );
}
