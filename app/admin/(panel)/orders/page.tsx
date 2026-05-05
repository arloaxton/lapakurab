"use client";

import { useState } from "react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { PageHeader } from "@/components/admin/PageHeader";
import { TableShell } from "@/components/admin/TableShell";
import { BulkBar } from "@/components/admin/BulkBar";
import { StatusPill } from "@/components/admin/StatusPill";
import { OrderDetailModal } from "@/components/admin/modals/OrderDetailModal";
import {
  adminInputStyle,
  secondaryBtn,
  miniBtn,
  dangerMiniBtn,
} from "@/components/admin/ui-styles";
import { useToast } from "@/components/shared/ToastProvider";
import { useConfirm } from "@/components/shared/ConfirmDialog";
import { Pagination } from "@/components/shared/Pagination";
import { useSelection } from "@/hooks/useSelection";
import { usePersistedFilter } from "@/hooks/usePersistedFilter";
import { usePagination } from "@/hooks/usePagination";
import { fmtIDR, fmtDate, downloadCSV } from "@/lib/format";
import type { AdminOrder, AdminOrderStatus } from "@/lib/types";
import { isSupabaseConfigured } from "@/backend/env";
import { updateOrderClient } from "@/lib/data/orders-client";

const STATUS_TABS = [
  { id: "all", l: "Semua" },
  { id: "pending", l: "Menunggu bayar" },
  { id: "paid", l: "Dibayar" },
  { id: "delivered", l: "Terkirim" },
  { id: "refunded", l: "Refund" },
] as const;

export default function AdminOrdersPage() {
  const { orders, updateOrders, logAudit, pushNotif } = useAdmin();
  const confirm = useConfirm();
  const toast = useToast();
  const [filter, setFilter] = usePersistedFilter<"all" | AdminOrderStatus>("status", "all");
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState<AdminOrder | null>(null);

  let filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  if (search)
    filtered = filtered.filter((o) =>
      (o.id + o.customer + o.email + o.product).toLowerCase().includes(search.toLowerCase())
    );

  const counts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    paid: orders.filter((o) => o.status === "paid").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    refunded: orders.filter((o) => o.status === "refunded").length,
  };

  const useApi = isSupabaseConfigured();

  const setStatus = async (id: string, status: AdminOrderStatus) => {
    const prev = orders.find((o) => o.id === id);
    updateOrders((list) =>
      list.map((o) => (o.id === id ? { ...o, status } : o))
    );
    if (useApi) {
      try {
        await updateOrderClient(id, { status });
      } catch (e) {
        if (prev) {
          updateOrders((list) => list.map((o) => (o.id === id ? prev : o)));
        }
        toast.error("Gagal update status", e instanceof Error ? e.message : "Coba lagi.");
        return;
      }
    }
    logAudit("order." + status, "#" + id, `Status diubah ke ${status}`);
    // Notif refund di-fire oleh DB trigger (notify_order_status).
    // Toast lokal saja:
    if (status === "refunded") {
      toast.warn("Refund diproses", `#${id} dikembalikan ke pelanggan.`);
    }
  };

  const refundOrder = async (id: string) => {
    const target = orders.find((o) => o.id === id);
    const ok = await confirm({
      title: "Refund pesanan?",
      description: target
        ? `Refund order #${id} (${target.product}, ${fmtIDR(target.total)}) ke pelanggan ${target.customer}? Tindakan ini akan ditandai di audit log dan tidak bisa dibatalkan via UI.`
        : `Refund order #${id}?`,
      confirmLabel: "Ya, refund",
      cancelLabel: "Batal",
      danger: true,
    });
    if (!ok) return;

    let snapshot: AdminOrder[] | null = null;
    updateOrders((list) => {
      snapshot = list;
      return list.map((o) => (o.id === id ? { ...o, status: "refunded" } : o));
    });
    if (useApi) {
      try {
        await updateOrderClient(id, { status: "refunded" });
      } catch (e) {
        if (snapshot) updateOrders(() => snapshot!);
        toast.error("Gagal refund", e instanceof Error ? e.message : "Coba lagi.");
        return;
      }
      logAudit("order.refunded", "#" + id, "Status diubah ke refunded");
      // Notif refund auto-fire dari DB trigger
      toast.success("Refund #" + id);
      return;
    }
    logAudit("order.refunded", "#" + id, "Status diubah ke refunded");
    pushNotif("danger", "Refund diproses", `#${id} dikembalikan ke pelanggan.`);
    toast.undo("Refund #" + id, () => {
      if (snapshot) updateOrders(() => snapshot!);
      toast.success("Refund dibatalkan");
    });
  };

  const paged = usePagination(filtered, 10);
  const orderSel = useSelection<AdminOrder>(paged.items);
  const orderBulkActions = [
    {
      label: "Refund",
      danger: true,
      onRun: async (items: AdminOrder[]) => {
        const totalAmount = items.reduce((s, o) => s + o.total, 0);
        const ok = await confirm({
          title: `Refund ${items.length} pesanan?`,
          description: `Total ${fmtIDR(totalAmount)} akan dikembalikan ke ${items.length} pelanggan. Tindakan ini ditandai di audit log.`,
          confirmLabel: "Ya, refund semua",
          cancelLabel: "Batal",
          danger: true,
        });
        if (!ok) return;

        let snapshot: AdminOrder[] | null = null;
        const ids = new Set(items.map((x) => x.id));
        updateOrders((list) => {
          snapshot = list;
          return list.map((o) => (ids.has(o.id) ? { ...o, status: "refunded" } : o));
        });
        if (useApi) {
          try {
            await Promise.all(
              items.map((it) => updateOrderClient(it.id, { status: "refunded" }))
            );
          } catch (e) {
            if (snapshot) updateOrders(() => snapshot!);
            toast.error("Gagal refund", e instanceof Error ? e.message : "Coba lagi.");
            return;
          }
          toast.success(`${items.length} pesanan di-refund`);
          return;
        }
        toast.undo(`${items.length} pesanan di-refund`, () => {
          if (snapshot) updateOrders(() => snapshot!);
        });
      },
    },
    {
      label: "Export CSV",
      onRun: (items: AdminOrder[]) => {
        const rows: (string | number)[][] = [
          ["Order ID", "Tanggal", "Pelanggan", "Email", "Produk", "Total", "Status"],
        ];
        items.forEach((o) =>
          rows.push([o.id, o.date, o.customer, o.email, o.product, o.total, o.status])
        );
        downloadCSV("orders-selected.csv", rows);
        toast.success(`${items.length} pesanan di-export`);
      },
    },
  ];

  const exportCSV = () => {
    const rows: (string | number)[][] = [
      [
        "Order ID",
        "Tanggal",
        "Pelanggan",
        "Email",
        "Produk",
        "Durasi",
        "Total",
        "Status",
        "Pembayaran",
      ],
    ];
    filtered.forEach((o) =>
      rows.push([
        o.id,
        o.date,
        o.customer,
        o.email,
        o.product,
        o.duration,
        o.total,
        o.status,
        o.payment,
      ])
    );
    downloadCSV("orders-" + new Date().toISOString().slice(0, 10) + ".csv", rows);
    logAudit("orders.export", `${filtered.length} rows`, "Export CSV pesanan");
  };

  return (
    <div>
      <PageHeader
        title="Pesanan"
        subtitle="Auto-delivery aktif · sistem otomatis kirim kredensial setelah pembayaran terverifikasi."
        action={
          <button onClick={exportCSV} style={secondaryBtn}>
            ↓ Export CSV
          </button>
        }
      />

      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 14,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {STATUS_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            style={{
              padding: "7px 12px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              cursor: "pointer",
              background: filter === t.id ? "var(--ink)" : "var(--surface)",
              color: filter === t.id ? "white" : "var(--ink)",
              fontSize: 12,
              fontWeight: 500,
              fontFamily: "inherit",
            }}
          >
            {t.l}{" "}
            <span style={{ opacity: 0.6, marginLeft: 4 }}>
              {counts[t.id as keyof typeof counts]}
            </span>
          </button>
        ))}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari order ID, customer, atau produk..."
          style={{ ...adminInputStyle, marginLeft: "auto", maxWidth: 280 }}
        />
      </div>

      <div
        style={{
          marginBottom: 12,
          padding: "10px 14px",
          background: "rgba(15,139,92,0.06)",
          borderRadius: 8,
          border: "1px solid rgba(15,139,92,0.2)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 12,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--success)",
            boxShadow: "0 0 0 4px rgba(15,139,92,0.15)",
          }}
        />
        <span style={{ color: "var(--ink)" }}>
          <strong>Auto-delivery aktif.</strong> Setelah pembayaran terverifikasi,
          sistem otomatis ambil kredensial dari pool stok dan kirim ke pembeli.
        </span>
      </div>

      <BulkBar selection={orderSel} actions={orderBulkActions} />

      <TableShell
        columns={["Order ID", "Tanggal", "Pelanggan", "Produk", "Total", "Status", ""]}
        ids={paged.items.map((o) => o.id)}
        selection={orderSel}
        rows={paged.items.map((o) => [
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
          <div key="c">
            <div style={{ fontWeight: 500, fontSize: 13, color: "var(--ink)" }}>
              {o.customer}
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>{o.email}</div>
          </div>,
          <div key="p">
            <div style={{ fontSize: 13, color: "var(--ink)" }}>{o.product}</div>
            <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>
              {o.duration} · {o.payment}
            </div>
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
          <div key="a" style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
            <button onClick={() => setViewing(o)} style={miniBtn}>
              Detail
            </button>
            {(o.status === "paid" || o.status === "delivered") && (
              <button onClick={() => refundOrder(o.id)} style={dangerMiniBtn}>
                Refund
              </button>
            )}
          </div>,
        ])}
        empty="Belum ada pesanan"
        emptyIcon="🧾"
        emptyDesc={
          search
            ? "Tidak ada pesanan yang cocok dengan pencarian."
            : "Pesanan masuk akan muncul di sini secara real-time."
        }
      />

      <Pagination api={paged} />

      {viewing && (
        <OrderDetailModal
          order={viewing}
          onClose={() => setViewing(null)}
          setStatus={setStatus}
        />
      )}
    </div>
  );
}
