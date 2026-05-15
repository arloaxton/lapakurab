"use client";

import Link from "next/link";
import { use, useState } from "react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { StatusPill } from "@/components/admin/StatusPill";
import { TableShell } from "@/components/admin/TableShell";
import { DetailRow } from "@/components/admin/DetailRow";
import { primaryBtn, secondaryBtn } from "@/components/admin/ui-styles";
import { fmtIDR, fmtDate } from "@/lib/format";

type DetailTab = "info" | "stock" | "orders";

export default function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { products, orders, stock } = useAdmin();
  const [tab, setTab] = useState<DetailTab>("info");

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div>
        <PageHeader title="Produk tidak ditemukan" />
        <Link href="/rabsodi/products" style={{ ...primaryBtn, textDecoration: "none" }}>
          ← Kembali
        </Link>
      </div>
    );
  }

  const productOrders = orders.filter((o) => o.product === product.name);
  const productStock = stock.filter((s) => s.productId === product.id);
  const totalSold = productOrders.filter(
    (o) => o.status === "paid" || o.status === "delivered"
  ).length;
  const revenue = productOrders
    .filter((o) => o.status === "paid" || o.status === "delivered")
    .reduce((s, o) => s + o.total, 0);

  return (
    <div>
      <Link
        href="/rabsodi/products"
        style={{
          ...secondaryBtn,
          marginBottom: 12,
          fontSize: 12,
          textDecoration: "none",
          display: "inline-block",
        }}
      >
        ← Kembali ke produk
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
          gap: 20,
        }}
      >
        <div
          style={{
            width: 78,
            height: 78,
            borderRadius: 14,
            flexShrink: 0,
            background: `linear-gradient(135deg, oklch(0.5 0.2 ${product.hue}), oklch(0.32 0.14 ${product.hue}))`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 700,
            fontFamily: "var(--font-display)",
            fontSize: 34,
          }}
        >
          {product.emoji || product.name[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 24,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                margin: 0,
                color: "var(--ink)",
              }}
            >
              {product.name}
            </h1>
            <StatusPill status={product.active ? "active" : "inactive"} />
          </div>
          <div style={{ color: "var(--ink-soft)", fontSize: 13, marginBottom: 8 }}>
            {product.tagline}
          </div>
          <div
            style={{
              display: "flex",
              gap: 14,
              fontSize: 12,
              color: "var(--ink-soft)",
            }}
          >
            <span>
              <span style={{ color: "var(--ink)", fontWeight: 600 }}>
                {fmtIDR(product.priceIDR)}
              </span>{" "}
              · harga jual
            </span>
            <span style={{ color: "var(--border-strong)" }}>·</span>
            <span>
              <span style={{ color: "var(--ink)", fontWeight: 600 }}>
                {product.cat === "vpn" ? "VPN" : "Streaming"}
              </span>{" "}
              · kategori
            </span>
            <span style={{ color: "var(--border-strong)" }}>·</span>
            <span>
              ★{" "}
              <span style={{ color: "var(--ink)", fontWeight: 600 }}>{product.rating}</span>{" "}
              ({product.reviews} review)
            </span>
          </div>
        </div>
      </div>

      <div className="lk-grid-4" style={{ gap: 12, marginBottom: 18 }}>
        <StatCard
          label="Stok pool"
          value={productStock.filter((s) => s.status === "available").length}
          accent="var(--mint)"
        />
        <StatCard label="Total terjual" value={totalSold} accent="var(--primary)" />
        <StatCard label="Revenue" value={fmtIDR(revenue)} accent="var(--lilac)" />
        <StatCard
          label="Stok di field"
          value={product.stock}
          accent={product.stock <= 5 ? "var(--danger)" : "var(--peach)"}
        />
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "1px solid var(--border)",
          marginBottom: 18,
        }}
      >
        {[
          { id: "info" as const, l: "Info produk" },
          { id: "stock" as const, l: `Stok akun (${productStock.length})` },
          { id: "orders" as const, l: `Riwayat order (${productOrders.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "10px 16px",
              background: "transparent",
              border: 0,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: tab === t.id ? 600 : 500,
              color: tab === t.id ? "var(--ink)" : "var(--ink-soft)",
              borderBottom:
                tab === t.id ? "2px solid var(--ink)" : "2px solid transparent",
              marginBottom: -1,
              fontFamily: "inherit",
            }}
          >
            {t.l}
          </button>
        ))}
      </div>

      {tab === "info" && (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: 22,
            maxWidth: 600,
          }}
        >
          <DetailRow label="Nama">{product.name}</DetailRow>
          <DetailRow label="Tagline">{product.tagline}</DetailRow>
          <DetailRow label="Kategori">
            {product.cat === "vpn" ? "VPN" : "Streaming"}
          </DetailRow>
          <DetailRow label="Harga jual">{fmtIDR(product.priceIDR)}</DetailRow>
          <DetailRow label="Harga coret">{fmtIDR(product.oldIDR)}</DetailRow>
          <DetailRow label="Stok di field">{product.stock}</DetailRow>
          <DetailRow label="Durasi">{product.durations.join(", ")}</DetailRow>
          <DetailRow label="Rating">
            ★ {product.rating} ({product.reviews} review)
          </DetailRow>
          <DetailRow label="Status">
            {product.active ? "Aktif" : "Nonaktif"}
          </DetailRow>
        </div>
      )}

      {tab === "stock" && (
        <TableShell
          columns={["Email", "Password", "Status", "Ditambahkan"]}
          rows={productStock.map((s) => [
            <code
              key="e"
              style={{
                fontFamily: "var(--font-mono), ui-monospace, monospace",
                fontSize: 12,
                color: "var(--ink)",
              }}
            >
              {s.field1}
            </code>,
            <code
              key="p"
              style={{
                fontFamily: "var(--font-mono), ui-monospace, monospace",
                fontSize: 12,
                color: "var(--ink-soft)",
              }}
            >
              {s.field2 || "—"}
            </code>,
            <StatusPill key="s" status={s.status} />,
            <span key="a" style={{ fontSize: 12, color: "var(--ink-soft)" }}>
              {fmtDate(s.addedAt)}
            </span>,
          ])}
          empty="Belum ada stok untuk produk ini. Buka tab Stok akun untuk import."
        />
      )}

      {tab === "orders" && (
        <TableShell
          columns={["Order ID", "Tanggal", "Pelanggan", "Durasi", "Total", "Status"]}
          rows={productOrders.map((o) => [
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
            <span key="c" style={{ fontSize: 13, color: "var(--ink)" }}>
              {o.customer}
            </span>,
            <span key="du" style={{ fontSize: 12, color: "var(--ink)" }}>
              {o.duration}
            </span>,
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
          empty="Produk ini belum ada penjualan."
        />
      )}
    </div>
  );
}
