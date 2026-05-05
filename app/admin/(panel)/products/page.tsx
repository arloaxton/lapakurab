"use client";

import Link from "next/link";
import { useState } from "react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { PageHeader } from "@/components/admin/PageHeader";
import { TableShell } from "@/components/admin/TableShell";
import { BulkBar } from "@/components/admin/BulkBar";
import { StatusPill } from "@/components/admin/StatusPill";
import { ProductFormModal } from "@/components/admin/modals/ProductFormModal";
import { adminInputStyle, primaryBtn, miniBtn, dangerMiniBtn } from "@/components/admin/ui-styles";
import { useToast } from "@/components/shared/ToastProvider";
import { Pagination } from "@/components/shared/Pagination";
import { useSelection } from "@/hooks/useSelection";
import { usePagination } from "@/hooks/usePagination";
import { fmtIDR } from "@/lib/format";
import type { Product } from "@/lib/types";
import { isSupabaseConfigured } from "@/backend/env";
import {
  createProductClient,
  updateProductClient,
  deleteProductClient,
} from "@/lib/data/products-client";

export default function AdminProductsPage() {
  const { products, updateProducts, logAudit } = useAdmin();
  const toast = useToast();
  const [editing, setEditing] = useState<"new" | Product | null>(null);
  const [search, setSearch] = useState("");

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );
  const paged = usePagination(filtered, 10);
  const sel = useSelection<Product>(paged.items);

  const useApi = isSupabaseConfigured();

  const bulkActions = [
    {
      label: "Aktifkan",
      onRun: async (items: Product[]) => {
        updateProducts((list) =>
          list.map((p) =>
            items.find((x) => x.id === p.id) ? { ...p, active: true } : p
          )
        );
        if (useApi) {
          try {
            await Promise.all(items.map((p) => updateProductClient(p.id, { active: true })));
          } catch (e) {
            toast.error("Gagal sinkron", e instanceof Error ? e.message : "Coba lagi.");
            return;
          }
        }
        toast.success(`${items.length} produk diaktifkan`);
      },
    },
    {
      label: "Nonaktifkan",
      onRun: async (items: Product[]) => {
        updateProducts((list) =>
          list.map((p) =>
            items.find((x) => x.id === p.id) ? { ...p, active: false } : p
          )
        );
        if (useApi) {
          try {
            await Promise.all(items.map((p) => updateProductClient(p.id, { active: false })));
          } catch (e) {
            toast.error("Gagal sinkron", e instanceof Error ? e.message : "Coba lagi.");
            return;
          }
        }
        toast.warn(`${items.length} produk dinonaktifkan`);
      },
    },
    {
      label: "Hapus",
      danger: true,
      onRun: async (items: Product[]) => {
        let snapshot: Product[] | null = null;
        const ids = new Set(items.map((x) => x.id));
        updateProducts((list) => {
          snapshot = list;
          return list.filter((p) => !ids.has(p.id));
        });
        if (useApi) {
          try {
            await Promise.all(items.map((p) => deleteProductClient(p.id)));
          } catch (e) {
            if (snapshot) updateProducts(() => snapshot!);
            toast.error("Gagal hapus", e instanceof Error ? e.message : "Coba lagi.");
            return;
          }
          toast.success(`${items.length} produk dihapus`);
          return;
        }
        toast.undo(`${items.length} produk dihapus`, () => {
          if (snapshot) updateProducts(() => snapshot!);
          toast.success("Dipulihkan");
        });
      },
    },
  ];

  const onSave = async (form: Product) => {
    // Errors propagate ke modal (modal show inline). Modal stays open kalau error.
    const isUpdate = !!form.id;
    if (isUpdate) {
      if (useApi) {
        const saved = await updateProductClient(form.id, form);
        updateProducts((list) => list.map((p) => (p.id === saved.id ? saved : p)));
      } else {
        updateProducts((list) => list.map((p) => (p.id === form.id ? form : p)));
      }
      logAudit("product.update", form.name, "Produk diperbarui");
      toast.success("Tersimpan", `Produk "${form.name}" berhasil diperbarui.`);
    } else {
      const draft: Product = { ...form, id: "p" + Date.now(), reviews: 0, rating: 5.0 };
      if (useApi) {
        const saved = await createProductClient(draft);
        updateProducts((list) => [saved, ...list]);
      } else {
        updateProducts((list) => [draft, ...list]);
      }
      logAudit("product.create", form.name, "Produk baru ditambahkan");
      toast.success("Produk ditambahkan", `"${form.name}" sekarang aktif di toko.`);
    }
    setEditing(null);
  };

  const onDelete = async (p: Product) => {
    let snapshot: Product[] | null = null;
    updateProducts((list) => {
      snapshot = list;
      return list.filter((x) => x.id !== p.id);
    });
    if (useApi) {
      try {
        await deleteProductClient(p.id);
      } catch (e) {
        if (snapshot) updateProducts(() => snapshot!);
        toast.error("Gagal hapus", e instanceof Error ? e.message : "Coba lagi.");
        return;
      }
      logAudit("product.delete", p.name, "Produk dihapus");
      toast.success(`Produk "${p.name}" dihapus`);
      return;
    }
    logAudit("product.delete", p.name, "Produk dihapus");
    toast.undo(
      `Produk "${p.name}" dihapus`,
      () => {
        if (snapshot) updateProducts(() => snapshot!);
        logAudit("product.restore", p.name, "Pembatalan hapus produk");
        toast.success("Dipulihkan", "Produk berhasil dikembalikan.");
      },
      { desc: "Klik Undo untuk membatalkan dalam 6 detik." }
    );
  };

  const onToggle = async (p: Product) => {
    const next = !p.active;
    updateProducts((list) =>
      list.map((x) => (x.id === p.id ? { ...x, active: next } : x))
    );
    if (useApi) {
      try {
        await updateProductClient(p.id, { active: next });
      } catch (e) {
        updateProducts((list) =>
          list.map((x) => (x.id === p.id ? { ...x, active: !next } : x))
        );
        toast.error("Gagal toggle", e instanceof Error ? e.message : "Coba lagi.");
        return;
      }
    }
    logAudit("product.toggle", p.name, p.active ? "Dinonaktifkan" : "Diaktifkan");
    toast.info(
      p.active ? "Produk dinonaktifkan" : "Produk diaktifkan",
      `"${p.name}" sekarang ${p.active ? "tidak terlihat" : "terlihat"} di toko.`
    );
  };

  return (
    <div>
      <PageHeader
        title="Produk"
        subtitle={`${products.length} produk · ${products.filter((p) => p.active).length} aktif di toko`}
        action={
          <button
            data-cmd="add-product"
            onClick={() => setEditing("new")}
            style={primaryBtn}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tambah produk
          </button>
        }
      />

      <BulkBar selection={sel} actions={bulkActions} />

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama produk..."
          style={{ ...adminInputStyle, maxWidth: 300 }}
        />
      </div>

      <TableShell
        columns={["Produk", "Kategori", "Harga", "Stok", "Status", ""]}
        ids={paged.items.map((p) => p.id)}
        selection={sel}
        rows={paged.items.map((p) => [
          <Link
            key="n"
            href={`/admin/products/${p.id}`}
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
                width: 36,
                height: 36,
                borderRadius: 8,
                background: `linear-gradient(135deg, oklch(0.45 0.18 ${p.hue}), oklch(0.32 0.14 ${p.hue}))`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontFamily: "var(--font-display)",
                fontSize: 14,
              }}
            >
              {p.name[0]}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>
                {p.name}
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>{p.tagline}</div>
            </div>
          </Link>,
          <span
            key="c"
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--ink-soft)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {p.cat === "vpn" ? "VPN" : "Streaming"}
          </span>,
          <div key="p">
            <div style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
              {fmtIDR(p.priceIDR)}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--ink-soft)",
                textDecoration: "line-through",
              }}
            >
              {fmtIDR(p.oldIDR)}
            </div>
          </div>,
          <span
            key="s"
            style={{
              fontVariantNumeric: "tabular-nums",
              fontWeight: 600,
              color: p.stock <= 5 ? "var(--danger)" : "var(--ink)",
            }}
          >
            {p.stock}
          </span>,
          <StatusPill key="st" status={p.active ? "active" : "inactive"} />,
          <div key="a" style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
            <Link
              href={`/admin/products/${p.id}`}
              style={{ ...miniBtn, textDecoration: "none" }}
            >
              Detail
            </Link>
            <button onClick={() => onToggle(p)} style={miniBtn}>
              {p.active ? "Off" : "On"}
            </button>
            <button onClick={() => setEditing(p)} style={miniBtn}>
              Edit
            </button>
            <button onClick={() => onDelete(p)} style={dangerMiniBtn}>
              Hapus
            </button>
          </div>,
        ])}
        empty="Belum ada produk"
        emptyIcon="📦"
        emptyDesc={
          search
            ? `Tidak ada produk yang cocok dengan "${search}".`
            : "Tambahkan produk pertama untuk mulai jualan."
        }
        emptyCta={
          !search && (
            <button onClick={() => setEditing("new")} style={primaryBtn}>
              + Tambah produk
            </button>
          )
        }
      />

      <Pagination api={paged} />

      {editing && (
        <ProductFormModal
          product={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={onSave}
        />
      )}
    </div>
  );
}
