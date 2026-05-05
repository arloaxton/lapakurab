"use client";

import { useState } from "react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { PageHeader } from "@/components/admin/PageHeader";
import { TableShell } from "@/components/admin/TableShell";
import { BulkBar } from "@/components/admin/BulkBar";
import { StatusPill } from "@/components/admin/StatusPill";
import { AddStockModal } from "@/components/admin/modals/AddStockModal";
import type { AddStockForm } from "@/components/admin/modals/AddStockModal";
import { primaryBtn, dangerMiniBtn, chipStyle } from "@/components/admin/ui-styles";
import { CredentialReveal } from "@/components/shared/CredentialReveal";
import { useToast } from "@/components/shared/ToastProvider";
import { useConfirm } from "@/components/shared/ConfirmDialog";
import { Pagination } from "@/components/shared/Pagination";
import { useSelection } from "@/hooks/useSelection";
import { usePersistedFilter } from "@/hooks/usePersistedFilter";
import { usePagination } from "@/hooks/usePagination";
import { fmtDate } from "@/lib/format";
import type { StockItem } from "@/lib/types";
import { isSupabaseConfigured } from "@/backend/env";
import {
  bulkCreateStockClient,
  deleteStockClient,
} from "@/lib/data/stock-client";

export default function AdminStockPage() {
  const { stock, products, updateStock } = useAdmin();
  const toast = useToast();
  const confirm = useConfirm();
  const [filter, setFilter] = usePersistedFilter<string>("filter", "all");
  const [adding, setAdding] = useState(false);

  const filtered =
    filter === "all" ? stock : stock.filter((s) => s.productId === filter);

  const useApi = isSupabaseConfigured();

  const addStock = async (form: AddStockForm) => {
    const parsed = form.lines
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const [email, password] = l.split("|").map((s) => s.trim());
        return { email, password };
      })
      .filter((it) => it.email && it.password);

    if (parsed.length === 0) {
      toast.error("Format salah", "Gunakan format `email|password` per baris.");
      return;
    }

    // Errors propagate ke modal (modal show inline + stays open).
    if (useApi) {
      const saved = await bulkCreateStockClient({
        productId: form.productId,
        items: parsed,
      });
      updateStock((list) => [...saved, ...list]);
      toast.success(`${saved.length} stok ditambahkan`);
    } else {
      const newItems: StockItem[] = parsed.map((it, i) => ({
        id: "s" + Date.now() + i,
        productId: form.productId,
        email: it.email,
        password: it.password,
        status: "available",
        addedAt: new Date().toISOString().slice(0, 10),
      }));
      updateStock((list) => [...newItems, ...list]);
      toast.success(`${newItems.length} stok ditambahkan`);
    }
    setAdding(false);
  };

  const removeItem = async (id: string) => {
    const target = stock.find((s) => s.id === id);
    const ok = await confirm({
      title: "Hapus stok akun?",
      description: target
        ? `Kredensial ${target.email} akan dihapus permanen. Pastikan akun ini belum di-claim oleh order.`
        : "Stok akun akan dihapus permanen.",
      confirmLabel: "Ya, hapus",
      cancelLabel: "Batal",
      danger: true,
    });
    if (!ok) return;

    let snapshot: StockItem[] | null = null;
    updateStock((list) => {
      snapshot = list;
      return list.filter((s) => s.id !== id);
    });
    if (useApi) {
      try {
        await deleteStockClient(id);
      } catch (e) {
        if (snapshot) updateStock(() => snapshot!);
        toast.error("Gagal hapus", e instanceof Error ? e.message : "Coba lagi.");
        return;
      }
      toast.success("Stok akun dihapus");
      return;
    }
    toast.undo("Stok akun dihapus", () => {
      if (snapshot) updateStock(() => snapshot!);
      toast.success("Dipulihkan");
    });
  };

  const paged = usePagination(filtered, 10);
  const stockSel = useSelection<StockItem>(paged.items);
  const stockBulkActions = [
    {
      label: "Hapus",
      danger: true,
      onRun: async (items: StockItem[]) => {
        const ok = await confirm({
          title: `Hapus ${items.length} stok akun?`,
          description: `${items.length} kredensial akan dihapus permanen. Pastikan akun-akun ini belum di-claim oleh order.`,
          confirmLabel: "Ya, hapus semua",
          cancelLabel: "Batal",
          danger: true,
        });
        if (!ok) return;

        let snapshot: StockItem[] | null = null;
        const ids = new Set(items.map((x) => x.id));
        updateStock((list) => {
          snapshot = list;
          return list.filter((s) => !ids.has(s.id));
        });
        if (useApi) {
          try {
            await Promise.all(items.map((it) => deleteStockClient(it.id)));
          } catch (e) {
            if (snapshot) updateStock(() => snapshot!);
            toast.error("Gagal hapus", e instanceof Error ? e.message : "Coba lagi.");
            return;
          }
          toast.success(`${items.length} stok dihapus`);
          return;
        }
        toast.undo(`${items.length} stok dihapus`, () => {
          if (snapshot) updateStock(() => snapshot!);
        });
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Stok akun"
        subtitle={`Pool kredensial siap kirim · ${stock.filter((s) => s.status === "available").length} tersedia, ${stock.filter((s) => s.status === "sold").length} terjual`}
        action={
          <button data-cmd="add-stock" onClick={() => setAdding(true)} style={primaryBtn}>
            + Tambah stok
          </button>
        }
      />

      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        <button onClick={() => setFilter("all")} style={chipStyle(filter === "all")}>
          Semua produk
        </button>
        {products
          .filter((p) => p.active)
          .map((p) => (
            <button
              key={p.id}
              onClick={() => setFilter(p.id)}
              style={chipStyle(filter === p.id)}
            >
              {p.name}
            </button>
          ))}
      </div>

      <BulkBar selection={stockSel} actions={stockBulkActions} />

      <TableShell
        columns={["Produk", "Email", "Password", "Status", "Ditambahkan", ""]}
        ids={paged.items.map((s) => s.id)}
        selection={stockSel}
        rows={paged.items.map((s) => {
          const prod = products.find((p) => p.id === s.productId);
          return [
            <span key="p" style={{ fontWeight: 500, fontSize: 13, color: "var(--ink)" }}>
              {prod?.name || "—"}
            </span>,
            <CredentialReveal key="e" value={s.email} masked={false} />,
            <CredentialReveal key="pw" value={s.password} masked />,
            <StatusPill key="s" status={s.status} />,
            <span key="a" style={{ fontSize: 12, color: "var(--ink-soft)" }}>
              {fmtDate(s.addedAt)}
            </span>,
            <button key="del" onClick={() => removeItem(s.id)} style={dangerMiniBtn}>
              Hapus
            </button>,
          ];
        })}
        empty="Belum ada stok kredensial"
        emptyIcon="🔐"
        emptyDesc="Tambahkan email + password akun yang siap dikirim ke pelanggan saat checkout."
        emptyCta={
          <button onClick={() => setAdding(true)} style={primaryBtn}>
            + Tambah stok
          </button>
        }
      />

      <Pagination api={paged} />

      {adding && (
        <AddStockModal
          products={products}
          onClose={() => setAdding(false)}
          onSave={addStock}
        />
      )}
    </div>
  );
}
